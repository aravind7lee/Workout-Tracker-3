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

  // Professional overlay for maximum visual impact with stronger Light Mode overlay
  const overlayClasses = theme === 'dark' 
    ? 'bg-gradient-to-t from-black/80 via-black/50 to-black/30'
    : 'bg-gradient-to-t from-black/60 via-black/50 to-black/40';

  return (
    <motion.div 
      className="nutrition-hero-container relative h-screen w-full overflow-hidden mb-6 sm:mb-8 shadow-xl sm:shadow-2xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      role="banner"
      aria-label="Nutrition Tracker Hero Section"
      style={{
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8fafc'
      }}
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
          className="nutrition-hero-image w-full h-full absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          sizes="100vw"
          style={{
            objectFit: 'cover',
            objectPosition: 'center center',
            width: '100%',
            height: '100%'
          }}
        />
        
        {imageError && (
          <div className="w-full h-full bg-gradient-to-br from-green-600 via-red-700 to-red-800 flex items-center justify-center">
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

      {/* Dark Overlay for Text Contrast - Stronger overlay for Light Mode */}
      <div 
        className="absolute inset-0"
        style={{
          background: theme === 'light' 
            ? 'rgba(0,0,0,0.45)' 
            : 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.3) 100%)'
        }}
      />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight nutrition-hero-title"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ 
              color: theme === 'light' ? '#FF0000' : '#FF0000',
              textShadow: 'none',
              fontWeight: theme === 'light' ? '900' : '800'
            }}
          >
            Nutrition Tracker
          </motion.h1>
          
          <motion.p 
            className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 leading-relaxed font-medium max-w-3xl mx-auto nutrition-hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ 
              color: theme === 'light' ? '#374151' : '#CCCCCC',
              textShadow: 'none',
              fontWeight: theme === 'light' ? '700' : '500'
            }}
          >
            Transform your fitness journey with precision nutrition tracking
            <br className="hidden sm:block" />
            <span 
              className="nutrition-hero-accent"
              style={{ 
                color: theme === 'light' ? '#4B5563' : '#AAAAAA',
                fontWeight: theme === 'light' ? '600' : '500'
              }}
            >
              Real-time insights
            </span> • <span 
              className="nutrition-hero-accent"
              style={{ 
                color: theme === 'light' ? '#4B5563' : '#AAAAAA',
                fontWeight: theme === 'light' ? '600' : '500'
              }}
            >
              Smart goals
            </span> • <span 
              className="nutrition-hero-accent"
              style={{ 
                color: theme === 'light' ? '#4B5563' : '#AAAAAA',
                fontWeight: theme === 'light' ? '600' : '500'
              }}
            >
              Professional results
            </span>
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
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-auto sm:min-w-[140px] focus:outline-none focus:ring-4"
              style={{
                background: '#FF0000',
                color: '#FFFFFF',
                border: 'none'
              }}
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
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 w-auto sm:min-w-[140px] focus:outline-none focus:ring-4"
              style={{
                background: theme === 'light' ? '#F3F4F6' : 'rgba(255,255,255,0.1)',
                color: theme === 'light' ? '#111111' : '#FFFFFF',
                border: theme === 'light' ? '2px solid rgba(0,0,0,0.1)' : '2px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)'
              }}
              aria-label="Learn more about nutrition tracking features"
            >
              Learn More
            </button>
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-24 lg:h-32 bg-gradient-to-t from-light-bg-primary dark:from-dark-bg-primary to-transparent" />
    </motion.div>
  );
}