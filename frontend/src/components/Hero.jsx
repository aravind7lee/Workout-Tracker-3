import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useRealTime } from "../context/RealTimeContext";

import Heroimg from "../assets/Heroimg.jpg";

export default function Hero() {
  const { isAuthenticated } = useAuth();
  const { stats, isOnline, lastSync, updateTrigger } = useRealTime();

  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatNumber = (num) => {
    if (typeof num !== "number" || isNaN(num)) return "0";
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // LQIP for Home hero
  const HOME_LQIP =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = Heroimg;
    img.loading = "eager";
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="relative w-full overflow-hidden mb-0">
      {/* Hero Container with Responsive Heights */}
      <div className="relative w-full h-screen min-h-[100vh] max-h-screen">
        {/* Skeleton Loader */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
          </div>
        )}

        {/* Background Image */}
        <div className="absolute inset-0">
          {/* LQIP Placeholder */}
          <img
            src={HOME_LQIP}
            alt=""
            className="w-full h-full object-cover blur-sm transition-opacity duration-300"
            style={{ opacity: imageLoaded ? 0 : 1 }}
          />

          {/* Main Image */}
          {!imageError && (
            <img
              src={Heroimg}
              alt="Welcome to GymTracker - Professional Fitness Tracking"
              className="w-full h-full object-cover object-center absolute inset-0 transition-opacity duration-300"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
          )}

          {/* Fallback */}
          {imageError && (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 absolute inset-0"></div>
          )}

          {/* Gradient Overlay - Semantic overlay for proper text contrast */}
          <div
            className="absolute inset-0 hero-overlay"
            style={{ background: "rgba(0,0,0,0.15)" }}
          ></div>
        </div>

        {/* Content Overlay */}
        {imageLoaded && (
          <motion.div
            className="relative z-10 h-full flex items-center justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
              {/* Main Title with Advanced Animation */}
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold hero-text-primary mb-2 sm:mb-3 drop-shadow-lg font-heading"
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 1.2, 
                  delay: 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                <motion.span
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  Welcome to{" "}
                </motion.span>
                <motion.span
                  className="font-heading font-black"
                  style={{ fontSize: "1.1em" }}
                  initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ 
                    duration: 1.0, 
                    delay: 0.8,
                    ease: "backOut"
                  }}
                >
                  <motion.span
                    style={{
                      color: "#C62828",
                      textShadow: "3px 3px 6px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8)",
                    }}
                    initial={{ opacity: 0, x: -20, rotateX: 45 }}
                    animate={{ opacity: 1, x: 0, rotateX: 0 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 1.0,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      scale: 1.1, 
                      textShadow: "5px 5px 10px rgba(198,40,40,0.8), 0 0 20px rgba(198,40,40,0.6)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    GRIND
                  </motion.span>
                  <motion.span
                    style={{
                      color: "#4DB6AC",
                      textShadow: "3px 3px 6px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8)",
                    }}
                    initial={{ opacity: 0, x: 20, rotateX: -45 }}
                    animate={{ opacity: 1, x: 0, rotateX: 0 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 1.2,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      scale: 1.15, 
                      textShadow: "5px 5px 10px rgba(77,182,172,0.8), 0 0 20px rgba(77,182,172,0.6)",
                      rotate: [0, -5, 5, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    X
                  </motion.span>
                </motion.span>
              </motion.h1>

              {/* Subtitle with Staggered Animation */}
              <motion.p
                className="text-sm sm:text-base md:text-lg font-bold mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed px-2 font-body"
                style={{
                  color: "#ffffff",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                }}
                initial={{ opacity: 0, y: 30, blur: 10 }}
                animate={{ opacity: 1, y: 0, blur: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 1.4,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                Track workouts, monitor progress, and achieve your fitness goals
                efficiently.
              </motion.p>

              {/* CTA Buttons with Advanced Animation */}
              <motion.div
                className="flex flex-row gap-2 sm:gap-3 justify-center items-center"
                initial={{ opacity: 0, y: 40, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 1.6,
                  ease: "backOut"
                }}
              >
                <Link
                  to={isAuthenticated?.() ? "/dashboard" : "/register"}
                  className="px-3 py-2 sm:px-4 sm:py-2 hero-button-primary font-semibold rounded-md text-xs sm:text-sm shadow-lg transition-all duration-300 font-body"
                >
                  {isAuthenticated?.() ? "Dashboard" : "Start Now"}
                </Link>

                <Link
                  to="/library"
                  className="px-3 py-2 sm:px-4 sm:py-2 hero-button-secondary font-medium rounded-md text-xs sm:text-sm transition-all duration-300 font-body"
                >
                  Exercises
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Real-time update indicator */}
        {isAuthenticated?.() && isOnline && (
          <motion.div
            className="absolute bottom-4 right-4 bg-green-500/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-green-300 border border-green-500/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            🟢 Real-time sync active
          </motion.div>
        )}
      </div>
    </section>
  );
}
