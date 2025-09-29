import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import dashboardHeaderImg from '../assets/Dashboardheader.jpg';

const DashboardHero = () => {
  let theme = 'dark';
  try {
    const themeContext = useTheme();
    theme = themeContext?.theme || 'dark';
  } catch (error) {
    // Fallback to dark theme if context fails
    theme = 'dark';
  }
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // LQIP for Dashboard
  const DASHBOARD_LQIP = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

    const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.1,
        staggerChildren: 0.06,
        delayChildren: 0.08
      }
    }
  };

   const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };


  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setTimeout(() => setIsVisible(true), 100);
    };
    img.onerror = () => setImageError(true);
    img.src = dashboardHeaderImg;
    img.loading = 'eager';
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="dashboard-hero relative w-full h-screen min-h-[100vh] max-h-screen overflow-hidden mb-0 bg-slate-900"
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
          fetchpriority="high"
        />
      )}

      {/* Fallback Background */}
      {imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900"></div>
      )}

      {/* Light Background Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(15,23,42,0.15) 50%, rgba(0,0,0,0.2) 100%)'
        }}
      ></div>

      {/* Enhanced Particle Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              background: i % 2 === 0 
                ? 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(186,230,253,0.2))'
                : 'linear-gradient(135deg, rgba(125,211,252,0.4), rgba(56,189,248,0.2))'
            }}
            initial={{ 
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              opacity: 0
            }}
            animate={{
              y: [null, '-30px', '30px'],
              opacity: [0, 0.8, 0],
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Content - Only show after image loads */}
      {imageLoaded && isVisible && (
        <div className="absolute inset-0 flex items-center justify-center text-center px-6 sm:px-8 lg:px-12">
          <div className="max-w-5xl mx-auto">
             <motion.div 
                        className="text-center max-w-5xl w-full space-y-2"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
             <motion.h1 
                       className="font-heading font-black mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-7xl tracking-tight"
                       variants={itemVariants}
                       style={{
                         color: '#00d4ff',
                         textShadow: '0 8px 32px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)',
                         filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))'
                       }}
                     >
                       Dashboard
                     </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              className="text-lg sm:text-xl md:text-2xl font-semibold max-w-3xl mx-auto font-body leading-relaxed"
              style={{
                color: '#f1f5f9',
                textShadow: '0 4px 12px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4)',
                letterSpacing: '0.025em'
              }}
            >
              Track your progress, view stats, and manage your workouts effortlessly.
            </motion.p>

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              className="mt-8 inline-block"
            >
              <div 
                className="px-8 py-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
              >
                <div className="flex items-center gap-3 text-base font-semibold">
                  <div 
                    className="w-3 h-3 rounded-full animate-pulse shadow-lg"
                    style={{ 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      boxShadow: '0 0 12px rgba(16, 185, 129, 0.6)'
                    }}
                  ></div>
                  <span 
                    className="font-body tracking-wide"
                    style={{
                      color: '#f8fafc',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}
                  >
                    Real-time tracking active
                  </span>
                </div>
              </div>
            </motion.div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Subtle Accent Elements */}
      <div className="absolute top-1/4 left-8 w-1 h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent rounded-full hidden lg:block"></div>
      <div className="absolute top-1/3 right-12 w-1 h-12 bg-gradient-to-b from-transparent via-blue-300/30 to-transparent rounded-full hidden lg:block"></div>
      <div className="absolute bottom-1/4 left-16 w-2 h-2 bg-white/30 rounded-full hidden lg:block animate-pulse"></div>
      <div className="absolute bottom-1/3 right-8 w-1.5 h-1.5 bg-blue-200/40 rounded-full hidden lg:block animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Enhanced Bottom Fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-12"
        style={{
          background: 'linear-gradient(to top, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.8) 40%, transparent 100%)'
        }}
      ></div>
    </motion.div>
  );
};

export default DashboardHero;