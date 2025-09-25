// frontend/src/components/WorkoutPlanBuilderHeader.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PlanBuilderHeaderImg from '../assets/PlanBuilderheader.jpg';
import { preloadImage } from '../utils/imageOptimization';

export default function WorkoutPlanBuilderHeader() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // LQIP for Plan Builder
  const PLAN_BUILDER_LQIP = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = PlanBuilderHeaderImg;
    img.loading = 'eager';
  }, []);

  return (
    <section className="workout-builder-header relative min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] overflow-hidden rounded-2xl mb-8" role="banner" aria-label="Workout Plan Builder Section">
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
            src={PlanBuilderHeaderImg}
            alt="Workout plans header – athlete training background"
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
        {/* Gradient Overlay - Subtle vertical gradient */}
        <div className="gradient-overlay absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 light-theme:from-black/30 light-theme:to-black/70"></div>
        
        {/* 8 Floating Particles */}
        <div className="absolute inset-0 opacity-40">
          <div className="particles-container">
            <div className="particle p1"></div>
            <div className="particle p2"></div>
            <div className="particle p3"></div>
            <div className="particle p4"></div>
            <div className="particle p5"></div>
            <div className="particle p6"></div>
            <div className="particle p7"></div>
            <div className="particle p8"></div>
          </div>
        </div>
      </div>

      {/* Content Container - Only show after image loads */}
      {imageLoaded && (
        <div className="relative z-10 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            {/* Professional Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-200 border border-blue-400/30 backdrop-blur-sm">
                Professional Gym Tracker
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 drop-shadow-2xl">
              My Workout Builder
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-white/95 max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed drop-shadow-lg">
              Track, customize, and follow your training programs effortlessly.
            </p>

            {/* Premium Gradient Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-sm sm:max-w-md">
              <button
                onClick={() => document.getElementById('plans-content')?.scrollIntoView({ behavior: 'smooth' })}
                className="premium-btn primary flex-1 font-semibold py-3 px-6 rounded-lg text-sm sm:text-base transition-all duration-300 transform hover:scale-105 bg-blue-600 hover:bg-blue-700 text-white"
                aria-label="Build new workout plan"
              >
                Build New Plan
              </button>
              <Link
                to="/library"
                className="premium-btn secondary flex-1 font-semibold py-3 px-6 rounded-lg text-sm sm:text-base transition-all duration-300 transform hover:scale-105 border-2 border-white/60 text-white hover:bg-white/10"
                aria-label="Browse exercise templates"
              >
                Browse Templates
              </Link>
            </div>


          </motion.div>
        </div>
      )}

      {/* Subtle Curve Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none"></div>
    </section>
  );
}