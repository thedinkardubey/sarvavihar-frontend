import axios from 'axios';
import { API_ENDPOINTS, STORAGE_KEYS, TIMEOUTS, HTTP_STATUS } from '../constants';
import { handleApiError, removeStorageItem } from '../utils';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  timeout: TIMEOUTS.DEFAULT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors globally
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      removeStorageItem(STORAGE_KEYS.TOKEN);
      removeStorageItem(STORAGE_KEYS.USER);
      // Redirect to login if needed
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - API response
   */
  login: async (email, password) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password
      });
      return { success: true, data: response.data };
    } catch (error) {
      const message = handleApiError(error, 'Login failed');
      return { success: false, message };
    }
  },

  /**
   * Register user
   * @param {string} username - Username
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - API response
   */
  register: async (username, email, password) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
        username,
        email,
        password
      });
      return { success: true, data: response.data };
    } catch (error) {
      const message = handleApiError(error, 'Registration failed');
      return { success: false, message };
    }
  },

  /**
   * Logout user
   * @returns {Promise} - API response
   */
  logout: async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
      return { success: true };
    } catch (error) {
      // Even if logout fails on server, we should clear local data
      console.error('Logout error:', error);
      return { success: true };
    }
  },

  /**
   * Get current user
   * @returns {Promise} - API response
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.ME);
      return { success: true, data: response.data };
    } catch (error) {
      const message = handleApiError(error, 'Failed to get user data');
      return { success: false, message };
    }
  }
};

// Cart API
export const cartAPI = {
  /**
   * Get user cart
   * @returns {Promise} - API response
   */
  getCart: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CART.BASE);
      return { success: true, data: response.data };
    } catch (error) {
      const message = handleApiError(error, 'Failed to load cart');
      return { success: false, message };
    }
  },

  /**
   * Add item to cart
   * @param {string} itemId - Product ID
   * @param {number} quantity - Quantity to add
   * @returns {Promise} - API response
   */
  addToCart: async (itemId, quantity = 1) => {
    try {
      const response = await api.post(API_ENDPOINTS.CART.ADD, {
        itemId,
        quantity
      });
      return { success: true, data: response.data };
    } catch (error) {
      const message = handleApiError(error, 'Failed to add item to cart');
      return { success: false, message };
    }
  },

  /**
   * Update cart item quantity
   * @param {string} itemId - Product ID
   * @param {number} quantity - New quantity
   * @returns {Promise} - API response
   */
  updateCartItem: async (itemId, quantity) => {
    try {
      const response = await api.put(API_ENDPOINTS.CART.UPDATE, {
        itemId,
        quantity
      });
      return { success: true, data: response.data };
    } catch (error) {
      const message = handleApiError(error, 'Failed to update cart');
      return { success: false, message };
    }
  },

  /**
   * Remove item from cart
   * @param {string} itemId - Product ID
   * @returns {Promise} - API response
   */
  removeFromCart: async (itemId) => {
    try {
      const response = await api.delete(API_ENDPOINTS.CART.REMOVE(itemId));
      return { success: true, data: response.data };
    } catch (error) {
      const message = handleApiError(error, 'Failed to remove item from cart');
      return { success: false, message };
    }
  },

  /**
   * Clear entire cart
   * @returns {Promise} - API response
   */
  clearCart: async () => {
    try {
      const response = await api.delete(API_ENDPOINTS.CART.CLEAR);
      return { success: true, data: response.data };
    } catch (error) {
      const message = handleApiError(error, 'Failed to clear cart');
      return { success: false, message };
    }
  }
};

// Products API
export const productsAPI = {
  /**
   * Get products with filters
   * @param {object} params - Query parameters
   * @returns {Promise} - API response
   */
  getProducts: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCTS.BASE, { params });
      return { success: true, data: response.data };
    } catch (error) {
      const message = handleApiError(error, 'Failed to load products');
      return { success: false, message };
    }
  },

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Promise} - API response
   */
  getProductById: async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCTS.DETAIL(id));
      return { success: true, data: response.data };
    } catch (error) {
      const message = handleApiError(error, 'Failed to load product');
      return { success: false, message };
    }
  },

  /**
   * Get product categories
   * @returns {Promise} - API response
   */
  getCategories: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCTS.CATEGORIES);
      return { success: true, data: response.data };
    } catch (error) {
      const message = handleApiError(error, 'Failed to load categories');
      return { success: false, message };
    }
  },

  /**
   * Create a new product
   * @param {object} productData - Product data
   * @returns {Promise} - API response
   */
  createProduct: async (productData) => {
    try {
      const response = await api.post(API_ENDPOINTS.PRODUCTS.BASE, productData);
      return { success: true, data: response.data };
    } catch (error) {
      const message = handleApiError(error, 'Failed to create product');
      return { success: false, message };
    }
  },

  /**
   * Update a product
   * @param {string} id - Product ID
   * @param {object} productData - Updated product data
   * @returns {Promise} - API response
   */
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(API_ENDPOINTS.PRODUCTS.DETAIL(id), productData);
      return { success: true, data: response.data };
    } catch (error) {
      const message = handleApiError(error, 'Failed to update product');
      return { success: false, message };
    }
  },

  /**
   * Delete a product
   * @param {string} id - Product ID
   * @returns {Promise} - API response
   */
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(API_ENDPOINTS.PRODUCTS.DETAIL(id));
      return { success: true, data: response.data };
    } catch (error) {
      const message = handleApiError(error, 'Failed to delete product');
      return { success: false, message };
    }
  }
};

export default api;