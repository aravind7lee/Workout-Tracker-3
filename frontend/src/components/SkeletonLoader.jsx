// frontend/src/components/SkeletonLoader.jsx
import React from 'react';

export default function SkeletonLoader({ className = 'h-6 w-full rounded' }) {
  return <div className={`animate-pulse bg-slate-700/40 ${className}`} />;
}
