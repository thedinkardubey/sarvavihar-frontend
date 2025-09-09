import React from 'react';

const UserIcon = ({ size = 24, className = '' }) => {
  return (
    <img 
      src="/people.png"
      alt="User"
      width={size} 
      height={size}
      className={className}
      style={{ borderRadius: '100%', objectFit: 'cover', outline: 'none'  }}
    />
  );
};

export default UserIcon;