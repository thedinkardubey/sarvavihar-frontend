import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ProductCard, SearchBar, Pagination, Loading, Button } from '../components/UI';
import { productsAPI } from '../services/api';
import { showToast } from '../utils';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, PAGINATION } from '../constants';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sort: 'createdAt'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const fetchCategories = useCallback(async () => {
    try {
      const response = await productsAPI.getCategories();
      if (response.success) {
        setCategories(response.data.categories || []);
      } else {
        throw new Error(response.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('Failed to load categories', 'error');
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Clean up empty filter parameters
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      console.log('Fetching products with params:', {
        ...cleanFilters,
        page: currentPage,
        limit: PAGINATION.DEFAULT_LIMIT
      });

      const response = await productsAPI.getProducts({
        ...cleanFilters,
        page: currentPage,
        limit: PAGINATION.DEFAULT_LIMIT
      });
      
      console.log('API Response:', response);
      
      if (response.success) {
        console.log('Products data:', response.data);
        setProducts(response.data.items || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalProducts(response.data.pagination?.totalItems || 0);
      } else {
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sort: 'createdAt'
    });
    setCurrentPage(1);
  }, []);

  const handleAddToCart = useCallback(async (productId) => {
    if (!isAuthenticated) {
      showToast(ERROR_MESSAGES.CART.LOGIN_REQUIRED, 'error');
      return;
    }

    try {
      await addToCart(productId, 1);
    } catch (error) {
      showToast(ERROR_MESSAGES.CART.ADD_FAILED, 'error');
    }
  }, [isAuthenticated, addToCart]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleProductClick = useCallback((productId) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  const handleEditProduct = useCallback((productId) => {
    navigate(`/admin/edit-product/${productId}`);
  }, [navigate]);

  const handleDeleteProduct = useCallback(async (productId) => {
    const product = products.find(p => p._id === productId);
    const productName = product ? product.name : 'this product';
    
    if (window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      setDeleteLoading(productId);
      try {
        const response = await productsAPI.deleteProduct(productId);
        if (response.success) {
          showToast('Product deleted successfully!', 'success');
          // Refresh products after deletion
          fetchProducts();
        } else {
          showToast(response.message || 'Failed to delete product', 'error');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Failed to delete product', 'error');
      } finally {
        setDeleteLoading(null);
      }
    }
  }, [products, fetchProducts]);

  const sortOptions = useMemo(() => [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A to Z' },
    { value: 'name_desc', label: 'Name: Z to A' },
    { value: 'rating', label: 'Highest Rated' }
  ], []);

  if (loading && products.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <Loading text="Loading products..." />
        </div>
      </div>
    );
  }

  return (
    <div className="page products-page">
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1 className="page-title">Products</h1>
              <p className="page-subtitle">Browse our collection of products</p>
            </div>
            {isAdmin && (
              <Button
                variant="primary"
                onClick={() => navigate('/add-product')}
                className="add-product-btn"
              >
                Add New Product
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="filters-section">
        <div className="container">
          <div className="search-container">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search products by name or description..."
              initialValue={filters.search}
              className="home-search-bar"
              debounceMs={500}
            />
          </div>
           
           <div className="filters-container">
             <div className="filters-row">
               <div className="form-group">
                 <label className="form-label">Category</label>
                 <select
                   name="category"
                   value={filters.category}
                   onChange={handleFilterChange}
                   className="form-select"
                 >
                   <option value="">All Categories</option>
                   {categories.map(category => (
                     <option key={category} value={category}>
                       {category}
                     </option>
                   ))}
                 </select>
               </div>
               
               <div className="form-group">
                 <label className="form-label">Min Price</label>
                 <input
                   type="number"
                   name="minPrice"
                   value={filters.minPrice}
                   onChange={handleFilterChange}
                   className="form-input"
                   placeholder="0"
                   min="0"
                   step="0.01"
                 />
               </div>
               
               <div className="form-group">
                 <label className="form-label">Max Price</label>
                 <input
                   type="number"
                   name="maxPrice"
                   value={filters.maxPrice}
                   onChange={handleFilterChange}
                   className="form-input"
                   placeholder="1000"
                   min="0"
                   step="0.01"
                 />
               </div>
               
               <div className="form-group">
                 <label className="form-label">Sort By</label>
                 <select
                   name="sort"
                   value={filters.sort}
                   onChange={handleFilterChange}
                   className="form-select"
                 >
                   {sortOptions.map(option => (
                     <option key={option.value} value={option.value}>
                       {option.label}
                     </option>
                   ))}
                 </select>
               </div>
               
               <div className="filters-buttons">
                 <Button 
                   onClick={clearFilters}
                   variant="secondary"
                   className="clear-filters-btn"
                 >
                   Clear Filters
                 </Button>
               </div>
             </div>
           </div>
         </div>
       </div>

      <div className="products-section">
        <div className="container">
          <div className="results-info">
            <p className="results-text">
              Showing {products.length} of {totalProducts} products
            </p>
            {loading && <Loading size="sm" />}
          </div>

          {error ? (
            <div className="error-container">
              <p className="error-text">Failed to load products</p>
              <Button onClick={fetchProducts} variant="primary">
                Try Again
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <p>No products found matching your criteria.</p>
              <Button onClick={clearFilters} variant="primary">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onClick={handleProductClick}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  isAuthenticated={isAuthenticated}
                  deleteLoading={deleteLoading === product._id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showFirstLast={true}
            showPrevNext={true}
            maxVisiblePages={5}
          />
        </div>
      )}
    </div>
  );
};

export default Products;