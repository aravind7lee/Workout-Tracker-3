// Enhanced Skeleton Loader Component
import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ 
  className = '', 
  variant = 'default',
  count = 1 
}) => {
  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: {
      x: '100%',
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  };

  if (variant === 'page') {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-red-600/30 border-t-red-600 rounded-full mx-auto"
          />
          <div className="space-y-2">
            <div className="h-4 bg-neutral-800/50 rounded w-48 mx-auto animate-pulse" />
            <div className="h-3 bg-neutral-900/50 rounded w-32 mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-black/50 rounded-2xl overflow-hidden border border-neutral-800/50">
        {/* Image skeleton */}
        <div className="h-48 bg-neutral-900/50 relative overflow-hidden">
          <motion.div
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
            className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-700/20 to-transparent"
          />
        </div>
        
        {/* Content skeleton */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="h-6 bg-neutral-800/50 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-neutral-900/50 rounded w-1/2 animate-pulse" />
          </div>
          <div className="h-20 bg-neutral-900/30 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Default skeleton
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-2 mb-4">
          <div className="h-4 bg-neutral-800/50 rounded w-3/4" />
          <div className="h-4 bg-neutral-900/50 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;