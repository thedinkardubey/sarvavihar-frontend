import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ProductCard, SearchBar, Pagination, Loading, Button } from '../components/UI';
import { productsAPI } from '../services/api';
import { showToast } from '../utils';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, PAGINATION } from '../constants';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  // State management
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
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Sample deal products data
  const dealProducts = [
    {
      id: '1',
      name: 'Premium Headphones',
      price: 1999,
      originalPrice: 4999,
      discount: 60,
      badge: 'Limited Time',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center'
    },
    {
      id: '2', 
      name: 'Smart Watch',
      price: 2749,
      originalPrice: 4999,
      discount: 45,
      badge: 'Flash Sale',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center'
    },
    {
      id: '3',
      name: 'Wireless Speaker', 
      price: 1349,
      originalPrice: 2999,
      discount: 55,
      badge: 'Today Only',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop&crop=center'
    },
    {
      id: '4',
      name: 'Wireless Charging Pad',
      price: 39.99,
      originalPrice: 59.99,
      discount: 33,
      badge: 'Best Value',
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop&crop=center'
    }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.currentPage]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await productsAPI.getCategories();
      if (response.success) {
        setCategories(response.data.categories || []);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast(ERROR_MESSAGES.PRODUCTS.FETCH_CATEGORIES_FAILED, 'error');
    }
  }, []);

  // Fetch products with filters
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        ...filters,
        page: pagination.currentPage,
        limit: PAGINATION.DEFAULT_LIMIT
      };
      
      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response = await productsAPI.getProducts(queryParams);
      if (response.success) {
        setProducts(response.data.items || []);
        setPagination(response.data.pagination || { 
          currentPage: 1, 
          totalPages: 1, 
          totalItems: 0 
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message || ERROR_MESSAGES.PRODUCTS.FETCH_FAILED);
      showToast(ERROR_MESSAGES.PRODUCTS.FETCH_FAILED, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage]);

  // Handle filter changes
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Handle search
  const handleSearch = useCallback((searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sort: 'createdAt'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setError(null);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle add to cart
  const handleAddToCart = useCallback(async (productId) => {
    if (!isAuthenticated) {
      showToast(ERROR_MESSAGES.CART.LOGIN_REQUIRED, 'error');
      return;
    }
    
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  }, [isAuthenticated, addToCart]);

  // Handle product click
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

  // Memoized filter options
  const sortOptions = useMemo(() => [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A to Z' },
    { value: 'name_desc', label: 'Name: Z to A' },
    { value: 'rating', label: 'Highest Rated' }
  ], []);

  return (
    <div className="home-page">
      {/* SARVAVIHAR Header */}
      <header className="sarvavihar-header">
        <h1 className="sarvavihar-title">SARVAVIHAR</h1>
      </header>
      
      {isAdmin && (
        <div className="container" style={{ marginTop: 'var(--space-8)', textAlign: 'center' }}>
          <Button
            variant="primary"
            onClick={() => navigate('/add-product')}
            className="add-product-btn"
          >
            Add New Product
          </Button>
        </div>
      )}
      
      {/* Search and Filters Section */}
      <section className="filters-section">
        <div className="container">
          <div className="all-filters-row">
            <div className="search-group">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search products by name or description..."
                initialValue={filters.search}
                className="home-search-bar"
              />
            </div>
            
            <div className="form-group">
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
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="form-input"
                placeholder="Min Price"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="form-group">
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="form-input"
                placeholder="Max Price"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="form-group">
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
            
            <div className="form-group">
              <Button 
                variant="primary"
                size="medium"
                onClick={clearFilters}
                className="clear-filters-btn" 
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <div className="container">
          {/* Results Info */}
          <div className="results-info">
            {loading ? (
              <Loading text="Loading products..." />
            ) : (
              <p className="results-text">
                 Showing {products.length} of {pagination.totalItems} products
               </p>
            )}
          </div>

          {/* Products Grid */}
          <div className="products-grid">
            {loading ? (
              <div className="loading-container">
                <Loading size="large" text="Loading products..." />
              </div>
            ) : error ? (
              <div className="error-container">
                <p className="error-text">{error}</p>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    setError(null);
                    fetchProducts();
                  }}
                >
                  Try Again
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="no-products">
                <p>No products found matching your criteria.</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              products.map(product => (
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
              ))
            )}
          </div>

          {/* Pagination */}
           {pagination.totalPages > 1 && (
             <div className="pagination-container">
               <Pagination
                 currentPage={pagination.currentPage}
                 totalPages={pagination.totalPages}
                 onPageChange={handlePageChange}
                 showFirstLast={true}
                 showPrevNext={true}
                 maxVisiblePages={5}
               />
             </div>
           )}
        </div>
      </section>
    </div>
  );
};

export default Home;