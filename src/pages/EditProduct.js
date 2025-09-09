import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { productsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { processImageUrl } from '../utils';

const EditProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const [imageError, setImageError] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Other',
    stock: '',
    image: '',
    tags: ''
  });

  const categories = [
    'Electronics', 'Clothing', 'Books', 'Home & Garden', 
    'Sports', 'Beauty', 'Toys', 'Food', 'Other'
  ];

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Process image URL when it changes
  useEffect(() => {
    if (formData.image) {
      const processed = processImageUrl(formData.image);
      setProcessedImageUrl(processed);
      setImageError(false);
    } else {
      setProcessedImageUrl('');
      setImageError(false);
    }
  }, [formData.image]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getProductById(id);
      if (response.success) {
        const product = response.data;
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price?.toString() || '',
          category: product.category || 'Other',
          stock: product.stock?.toString() || '',
          image: product.image || '',
          tags: product.tags?.join(', ') || ''
        });
      } else {
        toast.error('Product not found');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image: processedImageUrl || formData.image, // Use processed URL if available
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await productsAPI.updateProduct(id, productData);
      
      if (response.success) {
        toast.success('Product updated successfully!');
        navigate('/admin/dashboard');
      } else {
        toast.error(response.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product. Please try again.');
    } finally {
      setSaving(false);
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
            <p>Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Edit Product</h1>
          <p className="page-subtitle">Update product information</p>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          <div className="form-container">
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Product Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    required
                    maxLength={100}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category" className="form-label">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="price" className="form-label">Price (INR) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="form-input"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock" className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="form-input"
                    required
                    min="0"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description" className="form-label">Description *</label>
                  <textarea
                    id="description"
                    style={{ padding: '10px' }}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-textarea"
                    required
                    rows={4}
                    maxLength={1000}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="image" className="form-label">Image URL</label>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://example.com/image.jpg or https://unsplash.com/photos/photo-id (optional)"
                  />
                  <small className="form-help-text">
                    Supports direct image URLs and Unsplash photo URLs (e.g., https://unsplash.com/photos/a-cell-phone-on-a-table-bt8LrhHi0fo)
                  </small>
                  {processedImageUrl && (
                    <div className="image-preview">
                      {!imageError ? (
                        <img 
                          src={processedImageUrl} 
                          alt="Product preview" 
                          className="preview-image"
                          onError={handleImageError}
                          onLoad={handleImageLoad}
                        />
                      ) : (
                        <div className="image-error">
                          <p>Failed to load image. Please check the URL.</p>
                          <small>Original URL: {formData.image}</small>
                          {processedImageUrl !== formData.image && (
                            <small>Processed URL: {processedImageUrl}</small>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="tags" className="form-label">Tags</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="tag1, tag2, tag3"
                  />
                  <small className="form-help">Separate tags with commas</small>
                </div>
              </div>

              <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-start', gap: '1rem', marginTop: '1rem'}}>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="btn btn-secondary"
                  style={{ padding: '1rem 2rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '1rem 1rem' }}
                  disabled={saving}
                >
                  {saving ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;