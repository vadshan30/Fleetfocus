import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'text', count = 1, className = '' }) => {
  const skeletons = Array(count).fill(0).map((_, index) => (
    <div 
      key={index} 
      className={`skeleton-base skeleton-${type} ${className}`}
    />
  ));

  if (count === 1) return skeletons[0];
  
  return <div className={`skeleton-wrapper skeleton-wrapper-${type}`}>{skeletons}</div>;
};

export default SkeletonLoader;
