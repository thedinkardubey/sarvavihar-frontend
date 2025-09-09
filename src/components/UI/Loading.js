import React from 'react';
import PropTypes from 'prop-types';

const Loading = ({ 
  size = 'medium', 
  text = 'Loading...', 
  overlay = false,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'loading-sm',
    medium: 'loading-md',
    large: 'loading-lg'
  };

  const spinnerClasses = [
    'loading-spinner',
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  const LoadingSpinner = () => (
    <div className={spinnerClasses}>
      <svg className="spinner" viewBox="0 0 24 24">
        <circle
          className="spinner-circle"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="31.416"
        />
      </svg>
      {text && <span className="loading-text">{text}</span>}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        <div className="loading-backdrop" />
        <LoadingSpinner />
      </div>
    );
  }

  return <LoadingSpinner />;
};

Loading.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  text: PropTypes.string,
  overlay: PropTypes.bool,
  className: PropTypes.string
};

export default Loading;