import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate(from, { replace: true });
    }
    
    setLoading(false);
  };

  return (
    <div className="form-container">
      <h2 className="page-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        Welcome back
      </h2>
      <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Sign in to your account
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="Enter your email"
            disabled={loading}
          />
          {errors.email && (
            <div style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem', fontWeight: '500' }}>
              {errors.email}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`form-input ${errors.password ? 'error' : ''}`}
            placeholder="Enter your password"
            disabled={loading}
          />
          {errors.password && (
            <div style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem', fontWeight: '500' }}>
              {errors.password}
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', marginTop: '1.5rem', marginBottom: '1rem', padding: '1rem 1rem' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <p style={{ color: '#6b7280' }}>
          Don't have an account?{' '}
          <Link 
            to="/register" 
            style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}
          >
            Sign up here
          </Link>
        </p>
      </div>
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f9fafb', 
        border: '1px solid #f3f4f6',
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: '#6b7280'
      }}>
        <strong style={{ color: '#374151' }}>Demo Accounts:</strong><br />
        User: user@example.com / user123<br />
        Admin: admin@example.com / admin123
      </div>
    </div>
  );
};

export default Login;