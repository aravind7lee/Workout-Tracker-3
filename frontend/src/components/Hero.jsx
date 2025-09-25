import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Hero() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    workouts: 0,
    meals: 0,
    xpPoints: 0,
    streak: 0,
    weeklyGoal: { completed: 0, target: 4, percentage: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userIsAuth = isAuthenticated && typeof isAuthenticated === 'function' ? isAuthenticated() : false;
        
        if (userIsAuth) {
          let workouts = [];
          let meals = [];
          
          try {
            workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
            if (!Array.isArray(workouts)) workouts = [];
          } catch (e) {
            workouts = [];
          }
          
          try {
            meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
            if (!Array.isArray(meals)) meals = [];
          } catch (e) {
            meals = [];
          }
          
          setStats({
            workouts: workouts.length,
            meals: meals.length,
            xpPoints: workouts.length * 100 + meals.length * 50,
            streak: Math.min(workouts.length, 7),
            weeklyGoal: { 
              completed: Math.min(workouts.length, 4), 
              target: 4, 
              percentage: Math.min((workouts.length / 4) * 100, 100) 
            }
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchStats, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const formatNumber = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section className="relative w-full overflow-hidden mb-0">
      {/* Hero Container with Responsive Heights */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[480px]">
        {/* Skeleton Loader */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
          </div>
        )}

        {/* Background Image */}
        <div className="absolute inset-0">
          {!imageError ? (
            <img 
              src="/Heroimg.jpg" 
              alt="Welcome to GymTracker - Professional Fitness Tracking" 
              className="w-full h-full object-cover object-center"
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"></div>
          )}
          
          {/* Gradient Overlay - Lighter for better image visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40"></div>
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
              {/* Main Title */}
              <motion.h1 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white dark:text-white light-theme:text-slate-900 mb-2 sm:mb-3 drop-shadow-lg hero-text-contrast"
                variants={itemVariants}
              >
                Welcome to{' '}
                <span className="text-blue-400 font-extrabold">
                  GymTracker
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                className="text-sm sm:text-base md:text-lg text-gray-200 dark:text-gray-200 light-theme:text-gray-700 mb-4 sm:mb-6 drop-shadow-md max-w-2xl mx-auto leading-relaxed px-2 hero-text-contrast"
                variants={itemVariants}
              >
                Track workouts, monitor progress, and achieve your fitness goals efficiently.
              </motion.p>

              {/* CTA Buttons - Very Compact on Mobile */}
              <motion.div 
                className="flex flex-row gap-2 sm:gap-3 justify-center items-center"
                variants={itemVariants}
              >
                <Link 
                  to={isAuthenticated?.() ? "/dashboard" : "/register"}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-md text-xs sm:text-sm shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  {isAuthenticated?.() ? 'Dashboard' : 'Start Now'}
                </Link>
                
                <Link 
                  to="/library" 
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium rounded-md text-xs sm:text-sm hover:bg-white/20 transition-all duration-300"
                >
                  Exercises
                </Link>
              </motion.div>

              {/* Real-time Stats Preview - Compact on Mobile */}
              {isAuthenticated?.() && (
                <motion.div 
                  className="mt-4 sm:mt-6 bg-black/15 dark:bg-black/15 light-theme:bg-white/20 backdrop-blur-md rounded-lg p-3 sm:p-4 border border-white/10 dark:border-white/10 light-theme:border-black/20 max-w-xs sm:max-w-md mx-auto"
                  variants={itemVariants}
                >
                  <h3 className="text-white dark:text-white light-theme:text-slate-800 font-semibold text-sm sm:text-base mb-2 sm:mb-3">Your Progress</h3>
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-blue-400">
                        {loading ? '...' : formatNumber(stats.workouts)}
                      </div>
                      <div className="text-xs text-gray-300 dark:text-gray-300 light-theme:text-gray-600">Workouts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-green-400">
                        {loading ? '...' : formatNumber(stats.meals)}
                      </div>
                      <div className="text-xs text-gray-300 dark:text-gray-300 light-theme:text-gray-600">Meals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-purple-400">
                        {loading ? '...' : formatNumber(stats.xpPoints)}
                      </div>
                      <div className="text-xs text-gray-300 dark:text-gray-300 light-theme:text-gray-600">XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-orange-400">
                        {loading ? '...' : `${stats.streak}🔥`}
                      </div>
                      <div className="text-xs text-gray-300 dark:text-gray-300 light-theme:text-gray-600">Streak</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}