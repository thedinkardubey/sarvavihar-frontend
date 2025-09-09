import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from './UI';
import { debounce } from '../utils';

const SearchBar = ({
  onSearch,
  placeholder = 'Search products...',
  debounceMs = 300,
  showButton = true,
  className = '',
  autoFocus = false,
  initialValue = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (onSearch) {
        setIsSearching(true);
        try {
          await onSearch(term);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsSearching(false);
        }
      }
    }, debounceMs),
    [onSearch, debounceMs]
  );

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Trigger debounced search
    if (value.trim() || value === '') {
      debouncedSearch(value.trim());
    }
  }, [debouncedSearch]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (onSearch && searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  }, [onSearch, searchTerm]);

  // Handle clear search
  const handleClear = useCallback(() => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  }, [onSearch]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  // Update search term when initialValue changes
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const containerClasses = [
    'search-bar',
    className
  ].filter(Boolean).join(' ');

  return (
    <form className={containerClasses} onSubmit={handleSubmit}>
      <div className="search-input-container">
        <Input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="search-input"
          autoFocus={autoFocus}
          disabled={isSearching}
        />
        
        {searchTerm && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
      
      {showButton && (
        <Button
          type="submit"
          variant="primary"
          size="medium"
          loading={isSearching}
          disabled={isSearching}
          className="search-submit-btn"
          aria-label="Search"
          style={{ 
      width: '50px', 
      height: '40px',
      borderRadius: '6px',
      padding: '0'  // Remove default padding for icon-only button
    }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </Button>
      )}
    </form>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  debounceMs: PropTypes.number,
  showButton: PropTypes.bool,
  className: PropTypes.string,
  autoFocus: PropTypes.bool,
  initialValue: PropTypes.string
};

export default SearchBar;