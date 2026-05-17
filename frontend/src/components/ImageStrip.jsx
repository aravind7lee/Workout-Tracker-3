import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';
import '../styles/legends.css';

const ImageStrip = ({ images, name, isHovered }) => {
  const [loadedImages, setLoadedImages] = useState([]);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    const imagePromises = images.map((src, index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          setLoadedImages(prev => [...prev, index]);
          if (loadedCount === images.length) {
            setAllImagesLoaded(true);
          }
          resolve();
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === images.length) {
            setAllImagesLoaded(true);
          }
          resolve();
        };
        img.src = src;
      });
    });

    Promise.all(imagePromises);
  }, [images]);

  // Auto-slide functionality - optimized
  useEffect(() => {
    if (!isAutoPlaying || !allImagesLoaded) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, allImagesLoaded, images.length]);



  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
    setIsAutoPlaying(false);
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    
    if (Math.abs(diff) > 30) {
      if (diff > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
    setIsDragging(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setStartX(e.clientX);
    setIsDragging(true);
    setIsAutoPlaying(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const handleMouseUp = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const endX = e.clientX;
    const diff = startX - endX;
    
    if (Math.abs(diff) > 30) {
      if (diff > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
    setIsDragging(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };



  if (!allImagesLoaded) {
    return (
      <div className="relative h-48 bg-neutral-900/50 rounded-t-2xl overflow-hidden">
        <div className="grid grid-cols-3 h-full gap-1">
          {[0, 1, 2].map((index) => (
            <div key={index} className="relative bg-neutral-800/50 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-700/30 to-neutral-800/30" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative h-64 sm:h-80 md:h-96 lg:h-[30rem] xl:h-[34rem] w-full overflow-hidden rounded-t-2xl bg-black/50 group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Image Slider */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <img
              src={images[currentIndex]}
              alt={`${name} - Image ${currentIndex + 1}`}
              className="w-full h-full object-contain"
              loading="lazy"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          onTouchEnd={(e) => { e.stopPropagation(); prevImage(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all duration-200 opacity-70 md:opacity-0 md:group-hover:opacity-100 z-10"
        >
          <ChevronLeft size={18} className="text-white" />
        </button>
        
        <button
          onClick={nextImage}
          onTouchEnd={(e) => { e.stopPropagation(); nextImage(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all duration-200 opacity-70 md:opacity-0 md:group-hover:opacity-100 z-10"
        >
          <ChevronRight size={18} className="text-white" />
        </button>
        
        {/* Dots Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageStrip;