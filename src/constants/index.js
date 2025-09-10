// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me'
  },
  CART: {
    BASE: '/api/cart',
    ADD: '/api/cart/add',
    UPDATE: '/api/cart/update',
    REMOVE: (id) => `/api/cart/remove/${id}`,
    CLEAR: '/api/cart/clear'
  },
  PRODUCTS: {
    BASE: '/api/items',
    DETAIL: (id) => `/api/items/${id}`,
    CATEGORIES: '/api/items/categories/list'
  }
};

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CART: 'cart'
};

// Error Messages
export const ERROR_MESSAGES = {
  AUTH: {
    LOGIN_FAILED: 'Login failed. Please check your credentials.',
    REGISTER_FAILED: 'Registration failed. Please try again.',
    LOGOUT_FAILED: 'Logout failed. Please try again.',
    AUTH_CHECK_FAILED: 'Authentication check failed.',
    UNAUTHORIZED: 'Please login to continue.',
    CONTEXT_ERROR: 'useAuth must be used within an AuthProvider'
  },
  CART: {
    FETCH_FAILED: 'Failed to load cart',
    ADD_FAILED: 'Failed to add item to cart',
    UPDATE_FAILED: 'Failed to update cart',
    REMOVE_FAILED: 'Failed to remove item from cart',
    CLEAR_FAILED: 'Failed to clear cart',
    LOGIN_REQUIRED: 'Please login to add items to cart',
    CONTEXT_ERROR: 'useCart must be used within a CartProvider'
  },
  PRODUCTS: {
    FETCH_FAILED: 'Failed to load products',
    FETCH_CATEGORIES_FAILED: 'Failed to load categories'
  },
  NETWORK: {
    GENERIC: 'Network error. Please check your connection. The app will automatically retry connecting.',
    TIMEOUT: 'Request timeout. Please try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    RETRY_ATTEMPT: (attempt, max) => `Connection attempt ${attempt} of ${max}...`,
    RETRY_SUCCESS: 'Connection restored!'
  }
};

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN: 'Login successful!',
    REGISTER: 'Registration successful!',
    LOGOUT: 'Logged out successfully!'
  },
  CART: {
    ITEM_ADDED: 'Item added to cart!',
    ITEM_UPDATED: 'Cart updated',
    ITEM_REMOVED: 'Item removed from cart',
    CART_CLEARED: 'Cart cleared'
  }
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// Request Timeouts (in milliseconds)
export const TIMEOUTS = {
  DEFAULT: 10000,
  AUTH: 15000,
  UPLOAD: 30000
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100
};

// UI Constants
export const UI = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 3000
};