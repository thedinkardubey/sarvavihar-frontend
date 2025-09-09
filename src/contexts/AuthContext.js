import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authAPI } from '../services/api';
import { showToast } from '../utils';
import { STORAGE_KEYS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(ERROR_MESSAGES.AUTH.CONTEXT_ERROR);
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Error reading token from localStorage:', error);
      return null;
    }
  });

  // Check if user is authenticated on app load
  const checkAuth = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const result = await authAPI.getCurrentUser();
      
      if (result.success) {
        setUser(result.data.user);
      } else {
        // Clear invalid token
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        setToken(null);
        setUser(null);
        setError(result.message);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      setToken(null);
      setUser(null);
      setError(ERROR_MESSAGES.AUTH.AUTH_CHECK_FAILED);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authAPI.login(email, password);
      
      if (result.success) {
        const { token: newToken, user: userData } = result.data;
        
        // Store token securely
        try {
          localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
          setToken(newToken);
          setUser(userData);
          showToast(SUCCESS_MESSAGES.AUTH.LOGIN, 'success');
          return { success: true };
        } catch (storageError) {
          console.error('Error storing token:', storageError);
          setError('Failed to save login data');
          return { success: false, message: 'Failed to save login data' };
        }
      } else {
        setError(result.message);
        showToast(result.message, 'error');
        return { success: false, message: result.message };
      }
    } catch (error) {
      const message = ERROR_MESSAGES.AUTH.LOGIN_FAILED;
      setError(message);
      showToast(message, 'error');
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (username, email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authAPI.register(username, email, password);
      
      if (result.success) {
        const { token: newToken, user: userData } = result.data;
        
        // Store token securely
        try {
          localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
          setToken(newToken);
          setUser(userData);
          showToast(SUCCESS_MESSAGES.AUTH.REGISTER, 'success');
          return { success: true };
        } catch (storageError) {
          console.error('Error storing token:', storageError);
          setError('Failed to save registration data');
          return { success: false, message: 'Failed to save registration data' };
        }
      } else {
        setError(result.message);
        showToast(result.message, 'error');
        return { success: false, message: result.message };
      }
    } catch (error) {
      const message = ERROR_MESSAGES.AUTH.REGISTER_FAILED;
      setError(message);
      showToast(message, 'error');
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call logout API (don't wait for response)
      authAPI.logout().catch(error => {
        console.error('Logout API error:', error);
      });
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local data regardless of API response
      try {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
      
      setToken(null);
      setUser(null);
      setError(null);
      setLoading(false);
      showToast(SUCCESS_MESSAGES.AUTH.LOGOUT, 'success');
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    isAuthenticated: !!user,
    clearError: () => setError(null)
  }), [user, token, loading, error, login, register, logout, checkAuth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};