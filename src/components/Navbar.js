import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from './UI';
import { showToast } from '../utils';
import { SUCCESS_MESSAGES } from '../constants';
import UserIcon from './UserIcon';


const Navbar = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      showToast(SUCCESS_MESSAGES.AUTH.LOGOUT, 'success');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const toggleUserDropdown = useCallback(() => {
    setIsUserDropdownOpen(prev => !prev);
  }, []);

  const closeUserDropdown = useCallback(() => {
    setIsUserDropdownOpen(false);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <img src="/sarvavihar-logo.png" alt="SarvaVihar" className="navbar-logo" />
          SarvaVihar
        </Link>
        
        <div className="navbar-search">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="search-input"
          />
          <Button 
            variant="primary" 
            size="medium" 
            className="search-btn"
            aria-label="Search products"
          >
            <i className="fas fa-search"></i>
          </Button>
        </div>
        
        <button 
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className={`navbar-actions ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/favorites" className="navbar-link" onClick={closeMenu}>
            <i className="fas fa-heart"></i>
            <span className="navbar-link-text">Favorites</span>
          </Link>
          
          {isAuthenticated && (
            <Link to="/add-product" className="navbar-link" onClick={closeMenu}>
              <i className="fas fa-plus"></i>
              <span className="navbar-link-text">Add Product</span>
            </Link>
          )}
          
          <Link to="/cart" className="navbar-link cart-link" onClick={closeMenu}>
            <i className="fas fa-shopping-cart"></i>
            <span className="navbar-link-text">Cart</span>
            {cartItemCount > 0 && (
              <span className="cart-count">{cartItemCount}</span>
            )}
          </Link>
          
          {isAuthenticated && (
            <div className="user-profile-dropdown" ref={dropdownRef}>
              <button 
                className="user-profile-btn"
                onClick={toggleUserDropdown}
                aria-label="User menu"
              >
                <UserIcon size={20} />
              </button>
              
              {isUserDropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="user-dropdown-items">
                    {location.pathname === '/cart' ? (
                      <Link to="/" className="dropdown-item" onClick={closeUserDropdown}>
                        <i className="fas fa-home"></i>
                        <span>Home</span>
                      </Link>
                    ) : (
                      <Link to="/cart" className="dropdown-item" onClick={closeUserDropdown}>
                        <i className="fas fa-shopping-cart"></i>
                        <span>Cart</span>
                        {cartItemCount > 0 && (
                          <span className="cart-badge">{cartItemCount}</span>
                        )}
                      </Link>
                    )}
                    <button 
                      className="dropdown-item logout-item"
                      onClick={() => {
                        handleLogout();
                        closeUserDropdown();
                      }}
                      disabled={loading}
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      <span>{loading ? 'Logging out...' : 'Logout'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!isAuthenticated && (
            <div className="auth-links-corner">
              <Link to="/login" onClick={closeMenu}>
                <Button 
                  variant="outline" 
                  size="small" 
                  className="auth-btn login-btn"
                >
                  <i className="fas fa-sign-in-alt"></i>
                  Login
                </Button>
              </Link>
              <Link to="/register" onClick={closeMenu}>
                <Button 
                  variant="primary" 
                  size="small" 
                  className="auth-btn signup-btn"
                >
                  <i className="fas fa-user-plus"></i>
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;