// Simple Skeleton Loader Component
import React from 'react';

const SkeletonLoader = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-slate-700 rounded ${className}`}>
      <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-600 rounded w-1/2"></div>
    </div>
  );
};

export default SkeletonLoader;