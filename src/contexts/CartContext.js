import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { cartAPI } from '../services/api';
import { showToast } from '../utils';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error(ERROR_MESSAGES.CART.CONTEXT_ERROR);
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
    totalAmount: 0,
    totalItems: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Fetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Clear cart when user logs out
      setCart({
        items: [],
        totalAmount: 0,
        totalItems: 0
      });
    }
  }, [isAuthenticated]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      // Clear cart when not authenticated
      setCart({ items: [], totalAmount: 0, totalItems: 0 });
      return { success: true };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await cartAPI.getCart();
      
      if (result.success) {
        setCart(result.data.cart || { items: [], totalAmount: 0, totalItems: 0 });
        return { success: true };
      } else {
        setError(result.message);
        if (result.message !== ERROR_MESSAGES.AUTH.UNAUTHORIZED) {
          showToast(result.message, 'error');
        }
        return { success: false, message: result.message };
      }
    } catch (error) {
      const message = ERROR_MESSAGES.CART.FETCH_FAILED;
      console.error('Error fetching cart:', error);
      setError(message);
      showToast(message, 'error');
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addToCart = useCallback(async (itemId, quantity = 1) => {
    if (!isAuthenticated) {
      const message = ERROR_MESSAGES.CART.LOGIN_REQUIRED;
      showToast(message, 'error');
      return { success: false, message };
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await cartAPI.addToCart(itemId, quantity);
      
      if (result.success) {
        setCart(result.data.cart || cart);
        showToast(SUCCESS_MESSAGES.CART.ITEM_ADDED, 'success');
        return { success: true };
      } else {
        setError(result.message);
        showToast(result.message, 'error');
        return { success: false, message: result.message };
      }
    } catch (error) {
      const message = ERROR_MESSAGES.CART.ADD_FAILED;
      setError(message);
      showToast(message, 'error');
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, cart]);

  const updateCartItem = useCallback(async (itemId, quantity) => {
    if (!isAuthenticated) {
      return { success: false, message: ERROR_MESSAGES.AUTH.UNAUTHORIZED };
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await cartAPI.updateCartItem(itemId, quantity);
      
      if (result.success) {
        setCart(result.data.cart || cart);
        
        const message = quantity === 0 
          ? SUCCESS_MESSAGES.CART.ITEM_REMOVED 
          : SUCCESS_MESSAGES.CART.ITEM_UPDATED;
        showToast(message, 'success');
        
        return { success: true };
      } else {
        setError(result.message);
        showToast(result.message, 'error');
        return { success: false, message: result.message };
      }
    } catch (error) {
      const message = ERROR_MESSAGES.CART.UPDATE_FAILED;
      setError(message);
      showToast(message, 'error');
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, cart]);

  const removeFromCart = useCallback(async (itemId) => {
    if (!isAuthenticated) {
      return { success: false, message: ERROR_MESSAGES.AUTH.UNAUTHORIZED };
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await cartAPI.removeFromCart(itemId);
      
      if (result.success) {
        setCart(result.data.cart || cart);
        showToast(SUCCESS_MESSAGES.CART.ITEM_REMOVED, 'success');
        return { success: true };
      } else {
        setError(result.message);
        showToast(result.message, 'error');
        return { success: false, message: result.message };
      }
    } catch (error) {
      const message = ERROR_MESSAGES.CART.REMOVE_FAILED;
      setError(message);
      showToast(message, 'error');
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, cart]);

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      return { success: false, message: ERROR_MESSAGES.AUTH.UNAUTHORIZED };
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await cartAPI.clearCart();
      
      if (result.success) {
        setCart(result.data.cart || { items: [], totalAmount: 0, totalItems: 0 });
        showToast(SUCCESS_MESSAGES.CART.CART_CLEARED, 'success');
        return { success: true };
      } else {
        setError(result.message);
        showToast(result.message, 'error');
        return { success: false, message: result.message };
      }
    } catch (error) {
      const message = ERROR_MESSAGES.CART.CLEAR_FAILED;
      setError(message);
      showToast(message, 'error');
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const getItemQuantity = useCallback((itemId) => {
    const cartItem = cart.items.find(item => item.item?._id === itemId);
    return cartItem ? cartItem.quantity : 0;
  }, [cart.items]);

  const isItemInCart = useCallback((itemId) => {
    return cart.items.some(item => item.item?._id === itemId);
  }, [cart.items]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    getItemQuantity,
    isItemInCart,
    clearError: () => setError(null)
  }), [cart, loading, error, addToCart, updateCartItem, removeFromCart, clearCart, fetchCart, getItemQuantity, isItemInCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};