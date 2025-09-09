import { toast } from 'react-toastify';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';

/**
 * Handle API errors consistently
 * @param {Error} error - The error object
 * @param {string} fallbackMessage - Fallback error message
 * @returns {string} - Error message to display
 */
export const handleApiError = (error, fallbackMessage = ERROR_MESSAGES.NETWORK.GENERIC) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return data?.message || ERROR_MESSAGES.AUTH.UNAUTHORIZED;
      case HTTP_STATUS.BAD_REQUEST:
        return data?.message || fallbackMessage;
      case HTTP_STATUS.NOT_FOUND:
        return data?.message || 'Resource not found';
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return ERROR_MESSAGES.NETWORK.SERVER_ERROR;
      default:
        return data?.message || fallbackMessage;
    }
  } else if (error.request) {
    // Network error
    return ERROR_MESSAGES.NETWORK.GENERIC;
  } else {
    // Other error
    return error.message || fallbackMessage;
  }
};

/**
 * Show toast notification with error handling
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, error, info, warning)
 */
export const showToast = (message, type = 'info') => {
  try {
    toast[type](message);
  } catch (error) {
    console.error('Toast error:', error);
    // Fallback to console if toast fails
    console.log(`${type.toUpperCase()}: ${message}`);
  }
};

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `₹${amount}`;
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Convert Unsplash URL to direct image URL
 * @param {string} url - Unsplash URL or regular image URL
 * @param {object} options - Image options (width, height, quality)
 * @returns {string} - Direct image URL
 */
export const processImageUrl = (url, options = {}) => {
  if (!url) return '';
  
  // Default options
  const { width = 600, height = 600, quality = 80 } = options;
  
  // Check if it's an Unsplash photo URL
  const unsplashPhotoMatch = url.match(/unsplash\.com\/photos\/([^/?]+)/);
  if (unsplashPhotoMatch) {
    const photoId = unsplashPhotoMatch[1];
    // Extract the actual photo ID (remove any additional path segments)
    const cleanPhotoId = photoId.split('-').pop();
    return `https://images.unsplash.com/photo-${cleanPhotoId}?w=${width}&h=${height}&fit=crop&crop=center&q=${quality}`;
  }
  
  // Check if it's already a direct Unsplash image URL
  if (url.includes('images.unsplash.com')) {
    return url;
  }
  
  // Return the original URL if it's not an Unsplash URL
  return url;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid and errors
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get item from localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} - Stored value or default
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Set item in localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {boolean} - True if successful
 */
export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Remove item from localStorage with error handling
 * @param {string} key - Storage key
 * @returns {boolean} - True if successful
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Create a retry function for failed operations
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise} - Promise that resolves when function succeeds or max retries reached
 */
export const retry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};