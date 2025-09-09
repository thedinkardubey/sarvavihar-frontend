import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './UI';
import { formatCurrency } from '../utils';
import { showToast } from '../utils';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants';

const ProductCard = memo(({
  product,
  showAddToCart = true,
  showQuickView = false,
  className = '',
  onEdit,
  onDelete,
  deleteLoading = false
}) => {
  const { addToCart, loading: cartLoading, isItemInCart, getItemQuantity } = useCart();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showToast(ERROR_MESSAGES.CART.LOGIN_REQUIRED, 'error');
      return;
    }

    try {
      await addToCart(product._id, 1);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  }, [product._id, addToCart, isAuthenticated]);

  const isInCart = isItemInCart(product._id);
  const quantity = getItemQuantity(product._id);
  const isOutOfStock = product.stock === 0 || product.stock < 1;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  const cardClasses = [
    'product-card',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      <Link to={isAdmin ? `/admin/edit-product/${product._id}` : `/product/${product._id}`} className="product-card-link">
        <div className="product-card-image">
          <img 
            src={product.image || '/placeholder-product.svg'} 
            alt={product.name}
            loading="lazy"
            onError={(e) => {
                e.target.src = '/placeholder-product.svg';
              }}
          />
          {product.discount && (
            <span className="product-discount-badge">
              -{product.discount}%
            </span>
          )}
        </div>
        
        <div className="product-card-content">
          <h3 className="product-card-title">{product.name}</h3>
          
          {product.description && (
            <p className="product-card-description">
              {product.description.length > 100 
                ? `${product.description.substring(0, 100)}...` 
                : product.description
              }
            </p>
          )}
          
          <div className="product-card-price">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="product-original-price">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
            <span className="product-current-price">
              {formatCurrency(product.price)}
            </span>
          </div>
          
          {product.rating && (
            <div className="product-card-rating">
              <div className="rating-stars">
                {[...Array(5)].map((_, index) => (
                  <span 
                    key={index} 
                    className={`star ${index < Math.floor(product.rating) ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-text">({product.rating})</span>
            </div>
          )}
        </div>
      </Link>
      
      {showAddToCart && (
        <div className="product-card-actions">
          {isAdmin ? (
            // Admin view: Show Edit and Delete buttons
            <div className="admin-actions">
              <Button
                variant="secondary"
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit && onEdit(product._id);
                }}
                className="btn-sm"
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete && onDelete(product._id);
                }}
                className="btn-sm"
                loading={deleteLoading}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          ) : (
            // Regular user view: Show stock status and Add to Cart
            <>
              <div className={`product-card-stock ${
                isOutOfStock ? 'out-of-stock' : 
                isLowStock ? 'low-stock' : 'in-stock'
              }`}>
                {isOutOfStock ? 'Out of Stock' : 
                 isLowStock ? `Only ${product.stock} left` : 
                 `${product.stock} in stock`}
              </div>
              {isInCart ? (
                <div className="quantity-info" style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  padding: '8px 12px',              // Optional: adds padding
  backgroundColor: 'white',         // Optional: background color
  borderRadius: '4px'               // Optional: rounded corners
}}>
  <span className="in-cart-text" style={{
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  }}>
    In Cart ({quantity})
  </span>
  <Button
    variant="outline"
    size="small"
    onClick={handleAddToCart}
    loading={cartLoading}
    disabled={cartLoading || isOutOfStock}
  >
    Add More
  </Button>
</div>

              ) : (
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleAddToCart}
                  loading={cartLoading}
                  disabled={cartLoading || isOutOfStock}
                  className="add-to-cart-btn"
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              )}
            </>
          )}
        </div>
      )}
      
      {showQuickView && (
        <Button
          variant="outline"
          size="small"
          className="quick-view-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Quick view functionality can be implemented later
            console.log('Quick view:', product._id);
          }}
        >
          Quick View
        </Button>
      )}
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    originalPrice: PropTypes.number,
    image: PropTypes.string,
    rating: PropTypes.number,
    discount: PropTypes.number,
    inStock: PropTypes.bool
  }).isRequired,
  showAddToCart: PropTypes.bool,
  showQuickView: PropTypes.bool,
  className: PropTypes.string,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  deleteLoading: PropTypes.bool
};

export default ProductCard;