import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { productsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getProducts();
      if (response.success) {
        // The API service wraps the backend response in response.data
        // Backend returns { items: [...], pagination: {...} }
        // So we need response.data.items
        setProducts(response.data.items || []);
      } else {
        toast.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (productId) => {
    navigate(`/admin/edit-product/${productId}`);
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(productId);
    try {
      const response = await productsAPI.deleteProduct(productId);
      if (response.success) {
        toast.success('Product deleted successfully!');
        setProducts(products.filter(product => product._id !== productId));
      } else {
        toast.error(response.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="container">
        <div className="error-container">
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading-container">
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1 className="page-title">Admin Dashboard</h1>
              <p className="page-subtitle">Manage your product inventory</p>
            </div>
            <button 
              onClick={() => navigate('/add-product')}
              className="btn btn-primary"
            >
              Add New Product
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          {products.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Start by adding your first product.</p>
              <button 
                onClick={() => navigate('/add-product')}
                className="btn btn-primary"
              >
                Add Product
              </button>
            </div>
          ) : (
            <div className="admin-products-grid">
              {products.map(product => (
                <div key={product._id} className="admin-product-card">
                  <div className="product-image">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-category">{product.category}</p>
                    <p className="product-price">{formatCurrency(product.price)}</p>
                    <p className="product-stock">Stock: {product.stock}</p>
                    
                    <div className="product-actions">
                      <button 
                        onClick={() => handleEdit(product._id)}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(product._id, product.name)}
                        className="btn btn-danger btn-sm"
                        disabled={deleteLoading === product._id}
                      >
                        {deleteLoading === product._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;