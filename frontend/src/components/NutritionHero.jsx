import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import NutritionParticles from './NutritionParticles';
import SkeletonLoader from './SkeletonLoader';
import nutritionHeaderImg from '../assets/Nutritionheader.jpg';
import '../styles/nutrition-hero.css';

// LQIP base64 placeholder (tiny blurred version)
const LQIP_PLACEHOLDER = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

export default function NutritionHero() {
  const { theme } = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Preload image immediately
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      // Small delay for smooth transition
      setTimeout(() => setImageError(false), 50);
    };
    img.onerror = () => setImageError(true);
    img.src = nutritionHeaderImg;
    
    // Start loading immediately
    img.loading = 'eager';
  }, []);

  // Lighter overlay to show image more clearly
  const overlayClasses = theme === 'dark' 
    ? 'bg-gradient-to-t from-black/70 via-black/40 to-black/20'
    : 'bg-gradient-to-t from-black/60 via-black/30 to-black/10';

  return (
    <motion.div 
      className="relative h-64 sm:h-80 md:h-96 lg:h-[480px] w-full overflow-hidden rounded-xl sm:rounded-2xl mb-6 sm:mb-8 shadow-xl sm:shadow-2xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      role="banner"
      aria-label="Nutrition Tracker Hero Section"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {/* LQIP Placeholder */}
        <img
          src={LQIP_PLACEHOLDER}
          alt=""
          className="w-full h-full object-cover blur-sm transition-opacity duration-300"
          style={{ opacity: imageLoaded ? 0 : 1 }}
        />
        
        {/* Main Image */}
        <motion.img
          src={nutritionHeaderImg}
          alt="Professional nutrition tracking and meal planning - healthy foods and fitness lifestyle"
          className="nutrition-hero-image w-full h-full object-cover absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          sizes="(max-width: 640px) 100vw, 100vw"
        />
        
        {imageError && (
          <div className="w-full h-full bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 flex items-center justify-center">
            <div className="text-white text-6xl">🥗</div>
          </div>
        )}
      </div>

      {/* Nutrition-themed Particle Background - Defer until image loads */}
      {imageLoaded && (
        <div className="absolute inset-0 opacity-40">
          <NutritionParticles />
        </div>
      )}

      {/* Dark Overlay for Text Contrast */}
      <div className={`absolute inset-0 ${overlayClasses}`} />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4 sm:px-6 max-w-5xl mx-auto">
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight drop-shadow-lg"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Nutrition Tracker
          </motion.h1>
          
          <motion.p 
            className="text-sm sm:text-base md:text-lg lg:text-xl text-white/95 mb-4 sm:mb-6 leading-relaxed font-medium drop-shadow-md max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Transform your fitness journey with precision nutrition tracking
            <br className="hidden sm:block" />
            <span className="text-green-300 font-semibold">Real-time insights</span> • <span className="text-blue-300 font-semibold">Smart goals</span> • <span className="text-purple-300 font-semibold">Professional results</span>
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <button 
              onClick={() => {
                const mealInput = document.querySelector('[data-meal-input]');
                if (mealInput) {
                  mealInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  setTimeout(() => {
                    const input = mealInput.querySelector('input');
                    if (input) input.focus();
                  }, 500);
                }
              }}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-auto sm:min-w-[140px] focus:outline-none focus:ring-4 focus:ring-green-500/30"
              aria-label="Start tracking your nutrition now"
            >
              Start Tracking
            </button>
            <button 
              onClick={() => {
                const progressSection = document.querySelector('[data-progress-section]');
                if (progressSection) {
                  progressSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                  // Fallback: scroll to the main content area
                  window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                }
              }}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 w-auto sm:min-w-[140px] focus:outline-none focus:ring-4 focus:ring-white/30"
              aria-label="Learn more about nutrition tracking features"
            >
              Learn More
            </button>
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-t from-light-bg-primary dark:from-dark-bg-primary to-transparent" />
    </motion.div>
  );
}