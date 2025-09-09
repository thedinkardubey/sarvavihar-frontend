import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from './UI';
import { showToast } from '../utils';
import { SUCCESS_MESSAGES } from '../constants';
import UserIcon from './UserIcon';
import '../styles/AuthHeader.css';

const AuthHeader = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
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

  // Don't show login button on login and register pages
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  return (
    <div className="auth-corner" style={{ outline: 'none' }}>
      {isAuthenticated ? (
        <div className="user-profile-dropdown" ref={dropdownRef}>
          <button 
            className="user-profile-btn" style={{marginBottom: '5px'}}
            onClick={toggleUserDropdown}
            aria-label="User menu"
          >
            <UserIcon size={20} />
          </button>
          
          {isUserDropdownOpen && (
            <div className="user-dropdown-menu">
              <div className="user-dropdown-items">
                {location.pathname === '/cart' ? (
                  <Link to="/" className="dropdown-item" style={{ padding: '.3rem 3rem', marginTop: '0.5rem', width: '100%' , backgroundColor: 'black', color: 'white',  borderRadius: '8px', fontSize: '12px'}} onClick={closeUserDropdown}>
                    <i className="fas fa-home"></i>
                    <span>Home</span>
                  </Link>
                ) : (
                  <Link to="/cart" className="dropdown-item" style={{ padding: '.3rem 3rem', marginTop: '0.5rem', width: '100%' , backgroundColor: 'black', color: 'white',  borderRadius: '8px', fontSize: '12px'}} onClick={closeUserDropdown}>
                    <i className="fas fa-shopping-cart"></i>
                    <span>Cart</span>
                    {cartItemCount > 0 && (
                      <span className="cart-badge">{cartItemCount}</span>
                    )}
                  </Link>
                )}
                <button 
                  className="dropdown-item logout-item" style={{ padding: '.3rem .3rem', marginTop: '0.5rem', width: '100%' , backgroundColor: 'black', color: 'white',  borderRadius: '8px', fontSize: '12px'}}
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
      ) : (
        !isLoginPage && !isRegisterPage && (
          <div className="auth-links">
            <Link to="/login">
              <Button 
                variant="primary" 
                size="small" 
                className="auth-btn"
              >
                Login
              </Button>
            </Link>
          </div>
        )
      )}
    </div>
  );
};

export default AuthHeader;