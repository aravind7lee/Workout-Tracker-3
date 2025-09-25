import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Universal LQIP placeholder
const UNIVERSAL_LQIP = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

export default function OptimizedHeroImage({ 
  src, 
  alt, 
  className = '', 
  fallbackIcon = '🏋️',
  fallbackGradient = 'from-slate-800 to-slate-900',
  onLoad,
  children 
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      onLoad?.(true);
    };
    img.onerror = () => {
      setImageError(true);
      onLoad?.(false);
    };
    img.src = src;
    img.loading = 'eager';
    img.fetchPriority = 'high';
  }, [src, onLoad]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* LQIP Placeholder */}
      <img
        src={UNIVERSAL_LQIP}
        alt=""
        className="w-full h-full object-cover blur-sm transition-opacity duration-300"
        style={{ opacity: imageLoaded ? 0 : 1 }}
      />
      
      {/* Main Image */}
      {src && !imageError && (
        <motion.img
          src={src}
          alt={alt}
          className="w-full h-full object-cover absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      )}
      
      {/* Fallback */}
      {imageError && (
        <motion.div 
          className={`w-full h-full bg-gradient-to-br ${fallbackGradient} flex items-center justify-center absolute inset-0`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center text-white">
            <div className="text-6xl mb-4">{fallbackIcon}</div>
            {children}
          </div>
        </motion.div>
      )}
      
      {/* Content Overlay */}
      {!imageError && children && (
        <div className="absolute inset-0">
          {children}
        </div>
      )}
    </div>
  );
}