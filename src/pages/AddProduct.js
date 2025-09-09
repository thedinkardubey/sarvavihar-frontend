import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { productsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { processImageUrl } from '../utils';

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image: processedImageUrl || formData.image, // Use processed URL if available
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await productsAPI.createProduct(productData);
      
      if (response.success) {
        toast.success('Product added successfully!');
        navigate('/products');
      } else {
        toast.error(response.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin (you might need to adjust this based on your auth system)
  if (!user) {
    return (
      <div className="container">
        <div className="error-container">
          <p>Please log in to add products.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Add New Product</h1>
          <p className="page-subtitle">Create a new product listing</p>
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
                    maxLength={500}
                    rows={4}
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
                  <label htmlFor="tags" className="form-label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  // className="btn btn-secondary" style={{marginTop: '12px', marginRight: '12px'}}
                  className="btn btn-secondary"
                  style={{ padding: '1rem 2rem', marginTop: '12px', marginRight: '12px'}}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary" 
                  style={{ padding: '1rem 2rem', marginTop: '12px', marginRight: '12px'}}
                  disabled={loading}
                >
                  {loading ? 'Adding Product...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;