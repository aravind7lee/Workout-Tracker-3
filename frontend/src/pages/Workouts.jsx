import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';

import CompletedWorkouts from '../components/CompletedWorkouts';
import RealTimeNotification from '../components/RealTimeNotification';
import YourWorkoutsImg from '../assets/Yourworkouts.jpg';

export default function Workouts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const { stats, isOnline } = useRealTime();
  const [notification, setNotification] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, loading, navigate]);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Preload hero image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = YourWorkoutsImg;
    img.loading = 'eager';
    img.fetchPriority = 'high';
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  // Handle navigation from StartWorkout
  useEffect(() => {
    const workoutState = location.state;
    if (workoutState?.workoutCompleted) {
      const message = workoutState.sets 
        ? `🎉 ${workoutState.exercise} completed! ${workoutState.sets} sets, ${workoutState.duration}, +${workoutState.calories} calories!`
        : `🎉 ${workoutState.exercise} completed!`;
      
      setNotification({
        message,
        type: 'workout'
      });
      
      navigate(location.pathname, { replace: true });
      setTimeout(() => setNotification(null), 6000);
    }
  }, [location.state, navigate, location.pathname]);

  // Listen for workout completion events and real-time sync
  useEffect(() => {
    const handleWorkoutCompleted = (event) => {
      if (event.detail) {
        const workout = event.detail;
        console.log('🎯 Workouts page: Received workout completion:', workout);
        
        setNotification({
          message: `🎉 ${workout.exercise || workout.name} completed! +${workout.caloriesBurned || 0} calories burned!`,
          type: 'workout'
        });
        setTimeout(() => setNotification(null), 5000);
        
        // Force refresh of CompletedWorkouts component
        window.dispatchEvent(new CustomEvent('refreshCompletedWorkouts'));
      }
    };

    const handleStatsUpdate = (event) => {
      if (event.detail) {
        console.log('📊 Workouts page: Stats updated:', event.detail);
        // The RealTimeContext will handle the stats update
      }
    };
    
    const handleRealTimeSync = (event) => {
      console.log('🔄 Workouts page: Real-time sync received:', event.detail);
      // Stats are automatically updated via RealTimeContext
    };

    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    window.addEventListener('realTimeStatsUpdate', handleStatsUpdate);
    window.addEventListener('realTimeStatsSync', handleRealTimeSync);
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutCompleted);
      window.removeEventListener('realTimeStatsUpdate', handleStatsUpdate);
      window.removeEventListener('realTimeStatsSync', handleRealTimeSync);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Premium Hero Section with Yourworkouts.jpg */}
      <motion.div 
        className="relative w-full h-screen min-h-screen overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        role="banner"
        aria-label="Your Workouts Hero Section"
      >
        {!imageLoaded && !imageError ? (
          // Skeleton loader with shimmer
          <motion.div 
            className="w-full h-full bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 relative overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
          </motion.div>
        ) : imageError ? (
          // Fallback content if image fails
          <motion.div 
            className="w-full h-full bg-gradient-to-br from-neutral-900 to-black flex items-center justify-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center text-white px-3 xs:px-4">
              <div className="text-4xl xs:text-5xl sm:text-6xl mb-3 xs:mb-4">💪</div>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 xs:mb-3 sm:mb-4 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent leading-tight">
                YOUR WORKOUTS
              </h1>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
                Track your completed workouts and progress in real-time
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Main hero image - responsive for mobile vertical */}
            <motion.img
              src={YourWorkoutsImg}
              alt="Your Workouts - Professional gym training background"
              className="w-full h-full object-cover sm:object-contain bg-black"
              style={{
                objectPosition: window.innerWidth <= 640 ? '65% center' : 'center center'
              }}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ 
                opacity: imageLoaded ? 1 : 0, 
                scale: imageLoaded ? 1 : 0.98 
              }}
              transition={{ 
                duration: 0.6, 
                ease: "easeOut"
              }}
            />
            
            {/* Dark overlay for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
            
            {/* Title in center */}
            <div className="absolute inset-0 flex items-center justify-center px-2 xs:px-3 sm:px-4">
              <motion.h1 
                className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-2xl text-center leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={imageLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                YOUR WORKOUTS
              </motion.h1>
            </div>
            
            {/* Other content at bottom */}
            <div className="absolute inset-0 flex items-end justify-center pb-4 xs:pb-6 sm:pb-8 md:pb-12">
              <motion.div 
                className="text-center text-white px-2 xs:px-3 sm:px-4 max-w-6xl mx-auto w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={imageLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                
                <motion.p 
                  className="text-[10px] xs:text-xs sm:text-sm md:text-base text-white/90 max-w-2xl mx-auto mb-2 xs:mb-2.5 sm:mb-3 drop-shadow-lg leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={imageLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  Track your personal completed workouts and progress in real-time
                </motion.p>
                
                {/* Compact Action Buttons */}
                <motion.div
                  className="flex flex-col xs:flex-row gap-1.5 xs:gap-2 justify-center items-stretch xs:items-center mb-2 xs:mb-2.5 sm:mb-3 max-w-md mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={imageLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <motion.button
                    onClick={() => navigate('/library')}
                    className="bg-red-700 hover:bg-blue-700 active:bg-blue-800 text-white px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-2 rounded-lg font-semibold text-[10px] xs:text-xs sm:text-sm shadow-lg transition-all duration-200 active:scale-95"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🏋️ Start New Workout
                  </motion.button>
                  <motion.button
                    onClick={() => navigate('/your-workout-splits')}
                    className="bg-red-800 hover:bg-purple-700 active:bg-purple-800 text-white px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-2 rounded-lg font-semibold text-[10px] xs:text-xs sm:text-sm shadow-lg transition-all duration-200 active:scale-95"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🎯 Your WorkoutSplits
                  </motion.button>
                  <motion.button
                    onClick={() => window.location.reload()}
                    className="bg-neutral-700 hover:bg-neutral-800 active:bg-neutral-900 text-white px-2.5 xs:px-3 py-1.5 xs:py-2 rounded-lg text-[10px] xs:text-xs sm:text-sm shadow-lg transition-all duration-200 active:scale-95 flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🔄 Refresh
                  </motion.button>
                </motion.div>
                
                {/* Compact Status Indicators */}
                <motion.div 
                  className="flex items-center justify-center gap-1.5 xs:gap-2 mb-2 xs:mb-2.5 sm:mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={imageLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <div className="flex items-center gap-1 xs:gap-1.5 bg-black/30 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full backdrop-blur-sm">
                    <div className={`w-1 h-1 xs:w-1.5 xs:h-1.5 rounded-full ${isOnline ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' : 'bg-red-400'}`}></div>
                    <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-white tracking-wide">{isOnline ? 'LIVE' : 'OFFLINE'}</span>
                  </div>
                  <div className="text-[9px] xs:text-[10px] sm:text-xs text-white/80 font-mono bg-black/30 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full backdrop-blur-sm">
                    {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </motion.div>

                {/* Compact Stats Grid - USER SPECIFIC */}
                <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 xs:gap-2 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={imageLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-1.5 xs:p-2 relative shadow-lg">
                    <div className="text-base xs:text-lg sm:text-xl font-black text-red-500">{stats?.todayWorkouts || 0}</div>
                    <div className="text-[9px] xs:text-[10px] sm:text-xs text-white/80 leading-tight">Your Today</div>
                    <div className="absolute top-0.5 right-0.5 xs:top-1 xs:right-1 w-1 h-1 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-1.5 xs:p-2 relative shadow-lg">
                    <div className="text-base xs:text-lg sm:text-xl font-black text-red-500">{stats?.totalWorkouts || 0}</div>
                    <div className="text-[9px] xs:text-[10px] sm:text-xs text-white/80 leading-tight">Your Total</div>
                    <div className="absolute top-0.5 right-0.5 xs:top-1 xs:right-1 w-1 h-1 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-1.5 xs:p-2 relative shadow-lg">
                    <div className="text-base xs:text-lg sm:text-xl font-black text-red-600">{stats?.weeklyWorkouts || 0}</div>
                    <div className="text-[9px] xs:text-[10px] sm:text-xs text-white/80 leading-tight">Your Week</div>
                    <div className="absolute top-0.5 right-0.5 xs:top-1 xs:right-1 w-1 h-1 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-1.5 xs:p-2 relative shadow-lg">
                    <div className="text-base xs:text-lg sm:text-xl font-black text-orange-400">{stats?.totalCalories || 0}</div>
                    <div className="text-[9px] xs:text-[10px] sm:text-xs text-white/80 leading-tight">Your Calories</div>
                    <div className="absolute top-0.5 right-0.5 xs:top-1 xs:right-1 w-1 h-1 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-2 xs:px-3 sm:px-4 py-3 xs:py-4 sm:py-6 md:py-8">
        <CompletedWorkouts />
      </div>

      {/* Real-time Notifications */}
      {notification && (
        <RealTimeNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}