import React from 'react';
import { motion } from 'framer-motion';

const PremiumSkeletonLoader = ({ className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black ${className}`}
      role="status"
      aria-label="Loading"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-700/20 to-transparent animate-pulse" 
           style={{
             background: 'linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.1) 50%, transparent 100%)',
             backgroundSize: '200% 100%',
             animation: 'skeleton-shimmer 2s infinite'
           }} />
      
      {/* Minimal skeleton */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 px-4 max-w-2xl mx-auto">
          {/* Title skeleton */}
          <div className="h-8 sm:h-10 bg-neutral-700 rounded-lg mx-auto animate-pulse" style={{ width: '280px' }} />
          
          {/* Subtitle skeleton */}
          <div className="h-4 bg-neutral-700/60 rounded-lg mx-auto animate-pulse" style={{ width: '320px' }} />
          
          {/* Buttons skeleton */}
          <div className="flex gap-3 justify-center mt-6">
            <div className="w-24 h-10 bg-neutral-700 rounded-lg animate-pulse" />
            <div className="w-24 h-10 bg-neutral-700/80 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
      

    </motion.div>
  );
};

export default PremiumSkeletonLoader;