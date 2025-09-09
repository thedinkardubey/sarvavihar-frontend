import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Loading, Button } from '../components/UI';
import { showToast, formatCurrency } from '../utils';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants';

const Cart = () => {
  const { 
    cart, 
    loading, 
    updateCartItem, 
    removeFromCart, 
    clearCart 
  } = useCart();
  const { user } = useAuth();

  const handleQuantityChange = useCallback(async (itemId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        await removeFromCart(itemId);
        showToast(SUCCESS_MESSAGES.CART.ITEM_REMOVED, 'success');
      } else {
        await updateCartItem(itemId, newQuantity);
        showToast(SUCCESS_MESSAGES.CART.ITEM_UPDATED, 'success');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      showToast(ERROR_MESSAGES.CART.UPDATE_FAILED, 'error');
    }
  }, [updateCartItem, removeFromCart]);

  const handleRemoveItem = useCallback(async (itemId) => {
    try {
      await removeFromCart(itemId);
      showToast(SUCCESS_MESSAGES.CART.ITEM_REMOVED, 'success');
    } catch (error) {
      console.error('Error removing item:', error);
      showToast(ERROR_MESSAGES.CART.REMOVE_FAILED, 'error');
    }
  }, [removeFromCart]);

  const handleClearCart = useCallback(async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
        showToast(ERROR_MESSAGES.CART.CLEAR_FAILED, 'error');
      }
    }
  }, [clearCart]);

  if (loading) {
    return <Loading text="Loading cart..." />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <h2 className="empty-state-title">Your cart is empty</h2>
        <p className="empty-state-description">Looks like you haven't added any items to your cart yet.</p>
        <div style={{ marginTop: '2rem' }}>
          <Link to="/" className="btn btn-primary btn-lg" style={{ color: 'white' }}>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Shopping Cart</h1>
        <p className="page-subtitle">Review your items before checkout</p>
      </div>
      {cart.items.length > 0 && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Button 
            variant="secondary"
            onClick={handleClearCart}
          >
            Clear Cart
          </Button>
        </div>
      )}

      <div className="cart-container">
        <div className="cart-items">
          {cart.items.map(item => (
            <div key={item.item._id} className="cart-item">
              <img 
                src={item.item.image} 
                alt={item.item.name}
                className="cart-item-image"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
              
              <div className="cart-item-details">
                <h3>{item.item.name}</h3>
                <p className="cart-item-description">{item.item.description}</p>

              </div>
              
              <div className="cart-item-actions">
                <div className="quantity-controls">
                  <Button
                  variant="outline"
                  size="small"
                  onClick={() => handleQuantityChange(item.item._id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="quantity-btn"
                >
                  -
                </Button>
                <span className="quantity-display">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => handleQuantityChange(item.item._id, item.quantity + 1)}
                  disabled={item.quantity >= item.item.stock}
                  className="quantity-btn"
                >
                  +
                </Button>
                </div>
                

                
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => handleRemoveItem(item.item._id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-card">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Items ({cart.totalItems}):</span>
              <span>{formatCurrency(cart.totalAmount)}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            
            <div className="summary-row">
              <span>Tax:</span>
              <span>{formatCurrency(cart.totalAmount * 0.08)}</span>
            </div>
            
            <hr style={{ margin: '1rem 0' }} />
            
            <div className="summary-row summary-total">
              <span>Total:</span>
              <span>{formatCurrency(cart.totalAmount * 1.08)}</span>
            </div>
            
            <Button 
              variant="primary"
              size="medium"
              onClick={() => alert('Checkout functionality would be implemented here')}
              className="checkout-btn"
            >
              Proceed to Checkout
            </Button>
            
            <Button 
              variant="secondary"
              size="medium"
              as={Link}
              to="/products"
              className="continue-shopping-btn" 
              style={{marginLeft: '1rem'}}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Cart;