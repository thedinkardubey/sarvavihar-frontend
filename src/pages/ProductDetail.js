import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Loading, Button } from '../components/UI';
import { productsAPI } from '../services/api';
import { showToast, formatCurrency } from '../utils';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Hardcoded deal products for backward compatibility
  const dealProducts = {
    '1': {
      id: 1,
      name: 'Premium Wireless Headphones',
      price: 299.99,
      originalPrice: 399.99,
      discount: 25,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&crop=center',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&h=600&fit=crop&crop=center'
      ],
      description: 'Experience crystal-clear audio with our premium wireless headphones. Featuring noise cancellation, 30-hour battery life, and premium comfort padding.',
      features: [
        'Active Noise Cancellation',
        '30-hour battery life',
        'Premium comfort padding',
        'Bluetooth 5.0 connectivity',
        'Quick charge: 5 min = 3 hours playback'
      ],
      inStock: true
    },
    '2': {
      id: 2,
      name: 'Smart Fitness Watch',
      price: 199.99,
      originalPrice: 299.99,
      discount: 33,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&crop=center',
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&h=600&fit=crop&crop=center'
      ],
      description: 'Track your fitness goals with our advanced smart watch. Monitor heart rate, sleep patterns, and stay connected with smart notifications.',
      features: [
        'Heart rate monitoring',
        'Sleep tracking',
        'GPS tracking',
        'Water resistant (50m)',
        '7-day battery life'
      ],
      inStock: true
    },
    '3': {
      id: 3,
      name: 'Portable Bluetooth Speaker',
      price: 79.99,
      originalPrice: 129.99,
      discount: 38,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop&crop=center',
      images: [
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=center'
      ],
      description: 'Powerful portable speaker with 360-degree sound. Perfect for outdoor adventures and home entertainment.',
      features: [
        '360-degree sound',
        '12-hour battery life',
        'Waterproof design',
        'Voice assistant compatible',
        'Wireless stereo pairing'
      ],
      inStock: true
    },
    '4': {
      id: 4,
      name: 'Wireless Charging Pad',
      price: 39.99,
      originalPrice: 59.99,
      discount: 33,
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=600&fit=crop&crop=center',
      images: [
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1609592806787-3d9c4d5b4e4e?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&h=600&fit=crop&crop=center'
      ],
      description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.',
      features: [
        'Fast wireless charging',
        'Qi-compatible',
        'LED charging indicator',
        'Non-slip surface',
        'Compact design'
      ],
      inStock: true
    }
  };

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First check if it's a hardcoded deal product
      if (dealProducts[id]) {
        setProduct(dealProducts[id]);
        return;
      }
      
      // Otherwise, fetch from API
      const response = await productsAPI.getProductById(id);
      
      if (!response.success) {
        throw new Error(response.message);
      }
      
      const apiProduct = response.data;
      
      // Transform API product to match our component structure
      const transformedProduct = {
        id: apiProduct._id,
        name: apiProduct.name,
        price: apiProduct.price,
        originalPrice: apiProduct.originalPrice || apiProduct.price * 1.2,
        discount: apiProduct.originalPrice ? Math.round(((apiProduct.originalPrice - apiProduct.price) / apiProduct.originalPrice) * 100) : 0,
        image: apiProduct.image,
        images: apiProduct.images && apiProduct.images.length > 0 ? apiProduct.images : [apiProduct.image || '/placeholder-product.svg'],
        description: apiProduct.description,
        features: apiProduct.features || [
          'High-quality construction',
          'Premium materials',
          'Excellent performance',
          'Great value for money',
          'Customer satisfaction guaranteed'
        ],
        inStock: apiProduct.stock > 0,
        stock: apiProduct.stock,
        category: apiProduct.category,
        rating: apiProduct.rating,
        reviewCount: apiProduct.reviewCount
      };
      
      setProduct(transformedProduct);
      setSelectedImageIndex(0);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product');
      showToast('Failed to load product', 'error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = useCallback(async () => {
    if (!user) {
      showToast(ERROR_MESSAGES.CART.LOGIN_REQUIRED, 'error');
      navigate('/login');
      return;
    }

    try {
      await addToCart(product._id, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast(ERROR_MESSAGES.CART.ADD_FAILED, 'error');
    }
  }, [user, product, addToCart, navigate]);

  if (loading) {
    return (
      <div className="product-detail">
        <div className="product-detail-container">
          <Loading text="Loading product details..." />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-not-found">
        <h2>{error || 'Product Not Found'}</h2>
        <div className="error-actions">
          <Button 
            variant="primary" 
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
          {error && (
            <Button 
              variant="secondary" 
              onClick={fetchProduct}
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="back-btn"
        >
          ← Back
        </Button>
        
        <div className="product-detail-content">
          <div className="product-image-section">
            <div className="main-image-container">
              <img 
                src={product.images[selectedImageIndex]} 
                alt={product.name} 
                className="product-detail-image"
                onError={(e) => {
                  e.target.src = '/placeholder-product.svg';
                }}
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                    onError={(e) => {
                      e.target.src = '/placeholder-product.svg';
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="product-info-section">
            <div className="product-badges">
              <span className="sale-badge">SALE</span>
              <span className="discount-badge">{product.discount}% OFF</span>
            </div>
            
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-pricing">
              <span className="current-price">{formatCurrency(product.price)}</span>
              <span className="original-price">{formatCurrency(product.originalPrice)}</span>
              <span className="savings">Save {formatCurrency(product.originalPrice - product.price)}</span>
            </div>
            
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
            
            <div className="product-features">
              <h3>Key Features</h3>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="product-actions">
              <Button 
                variant={!product.inStock ? 'disabled' : 'primary'}
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="add-to-cart-btn"
              >
                {!user ? 'Login to Buy' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              
              {product.inStock && (
                <div className="stock-status">
                  <span className="in-stock">✓ In Stock</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;