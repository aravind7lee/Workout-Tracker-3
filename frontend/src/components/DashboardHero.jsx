import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dashboardHeaderImg from '../assets/Dashboardheader.jpg';

const DashboardHero = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // LQIP for Dashboard
  const DASHBOARD_LQIP = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = dashboardHeaderImg;
    img.loading = 'eager';
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="dashboard-hero relative w-full h-screen min-h-[100vh] max-h-screen overflow-hidden mb-0"
      role="banner"
      aria-label="Dashboard header section"
    >
      {/* LQIP Placeholder */}
      <img
        src={DASHBOARD_LQIP}
        alt=""
        className="absolute inset-0 w-full h-full object-cover blur-sm transition-opacity duration-300"
        style={{ opacity: imageLoaded ? 0 : 1 }}
      />

      {/* Background Image */}
      {!imageError && (
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          src={dashboardHeaderImg}
          alt="Dashboard header – fitness progress background"
          className="absolute inset-0 w-full h-full object-cover object-center sm:object-center md:object-center"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      )}

      {/* Fallback Background */}
      {imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900"></div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 dark:from-black/30 dark:via-black/50 dark:to-black/75"></div>

      {/* Particle Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{ 
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              opacity: 0
            }}
            animate={{
              y: [null, '-20px', '20px'],
              opacity: [0, 0.6, 0],
              rotate: 360
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Content - Only show after image loads */}
      {imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl"
              style={{ textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)' }}
            >
              Dashboard
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              className="text-lg sm:text-xl md:text-2xl text-white/90 font-medium drop-shadow-lg max-w-2xl mx-auto"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
            >
              Track your progress, view stats, and manage your workouts effortlessly.
            </motion.p>

            {/* Glassmorphism Accent */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              className="mt-8 inline-block px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            >
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Real-time tracking active</span>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900 to-transparent"></div>
    </motion.div>
  );
};

export default DashboardHero;