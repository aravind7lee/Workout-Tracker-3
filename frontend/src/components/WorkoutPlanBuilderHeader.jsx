// frontend/src/components/WorkoutPlanBuilderHeader.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MyPlansHeaderImg from '../assets/Myplansheader.jpg';

export default function WorkoutPlanBuilderHeader() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // LQIP for Plan Builder
  const PLAN_BUILDER_LQIP = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = MyPlansHeaderImg;
    img.loading = 'eager';
  }, []);

  return (
    <section className="workout-builder-header relative h-screen w-full overflow-hidden" role="banner" aria-label="My Plans Hero Section">
      {/* Background Image */}
      <div className="absolute inset-0">
        {/* LQIP Placeholder */}
        <img
          src={PLAN_BUILDER_LQIP}
          alt=""
          className="w-full h-full object-cover blur-sm transition-opacity duration-300"
          style={{ opacity: imageLoaded ? 0 : 1 }}
        />
        
        {/* Main Image */}
        {!imageError && (
          <img
            src={MyPlansHeaderImg}
            alt="My Plans – Professional gym workout plans background"
            className="w-full h-full object-cover object-center absolute inset-0 transition-opacity duration-300"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        )}
        
        {/* Fallback */}
        {imageError && (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 absolute inset-0"></div>
        )}
        {/* Light Gradient Overlay - Preserve Image Clarity */}
        <div className="gradient-overlay absolute inset-0" 
             style={{
               background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)'
             }}></div>
        
        {/* Professional Particle Background Accent */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 right-32 w-1 h-1 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '2.5s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-16 right-1/4 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '3.5s'}}></div>
        </div>
      </div>

      {/* Content Container - Full Viewport Height Professional Layout */}
      {imageLoaded && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center text-center px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-4xl mx-auto">
            {/* Main Heading - Professional Style */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 drop-shadow-2xl"
              style={{
                color: '#f59e0b',
                textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)'
              }}
            >
              My Workout Plans
            </motion.h1>
            
            {/* Subtitle - Clean and Professional */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed drop-shadow-lg"
              style={{
                color: 'var(--color-text-secondary, rgba(255,255,255,0.95))',
                textShadow: '0 2px 12px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.5)'
              }}
            >
              Track, customize, and follow your training programs effortlessly.
            </motion.p>
            
            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6"
            >
              <button 
                onClick={() => document.getElementById('plans-content')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 font-semibold rounded-lg text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: 'var(--color-accent, #2563EB)',
                  color: 'var(--color-on-accent, #FFFFFF)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent, #2563EB)'}
                aria-label="View your workout plans"
              >
                View My Plans
              </button>
              <Link
                to="/plans"
                className="px-6 py-3 font-semibold rounded-lg text-sm sm:text-base border-2 backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
                style={{
                  backgroundColor: 'var(--color-accent, #2563EB)',
                  color: 'var(--color-on-accent, #FFFFFF)',
                  borderColor: 'transparent'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent, #2563EB)'}
                aria-label="Create new workout plan"
              >
                Build New Plan
              </Link>
            </motion.div>
            
            {/* Professional Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex justify-center"
            >
              <div className="bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-full px-3 py-1 text-xs"
                   style={{ color: 'var(--color-text-muted, #999999)' }}>
                <span className="flex items-center gap-1">
                  <span>Professional Gym Tracker</span>
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}


    </section>
  );
}