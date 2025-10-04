import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
import { useAchievements } from '../context/AchievementsContext';
import CompletedWorkouts from '../components/CompletedWorkouts';
import RealTimeNotification from '../components/RealTimeNotification';
import YourWorkoutsImg from '../assets/Yourworkouts.jpg';

export default function Workouts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const { stats, isOnline } = useRealTime();
  const { checkAchievements } = useAchievements();
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
      
      checkAchievements();
      navigate(location.pathname, { replace: true });
      setTimeout(() => setNotification(null), 6000);
    }
  }, [location.state, navigate, location.pathname, checkAchievements]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
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
            className="w-full h-full bg-gradient-to-br from-slate-800/50 to-slate-700/50 relative overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
          </motion.div>
        ) : imageError ? (
          // Fallback content if image fails
          <motion.div 
            className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center text-white px-4">
              <div className="text-6xl mb-4">💪</div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                YOUR WORKOUTS
              </h1>
              <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
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
              className="w-full h-full object-cover sm:object-contain bg-slate-900"
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
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={imageLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                YOUR WORKOUTS
              </motion.h1>
            </div>
            
            {/* Other content at bottom */}
            <div className="absolute inset-0 flex items-end justify-center pb-8 sm:pb-12">
              <motion.div 
                className="text-center text-white px-4 max-w-6xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={imageLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                
                <motion.p 
                  className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-4 drop-shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={imageLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  Track your completed workouts and progress in real-time
                </motion.p>
                
                {/* Compact Action Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-2 justify-center items-center mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={imageLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <motion.button
                    onClick={() => navigate('/library')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🏋️ Start New Workout
                  </motion.button>
                  <motion.button
                    onClick={() => window.location.reload()}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm shadow-lg transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🔄 Refresh
                  </motion.button>
                </motion.div>
                
                {/* Compact Status Indicators */}
                <motion.div 
                  className="flex items-center justify-center gap-3 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={imageLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                    <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                    <span className="text-xs font-bold text-white">{isOnline ? 'LIVE' : 'OFFLINE'}</span>
                  </div>
                  <div className="text-xs text-white/80 font-mono bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                    {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </motion.div>

                {/* Compact Stats Grid */}
                <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={imageLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 relative">
                    <div className="text-lg font-black text-blue-400">{stats?.todayWorkouts || 0}</div>
                    <div className="text-xs text-white/80">Today</div>
                    <div className="absolute top-1 right-1 w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 relative">
                    <div className="text-lg font-black text-green-400">{stats?.totalWorkouts || 0}</div>
                    <div className="text-xs text-white/80">Total</div>
                    <div className="absolute top-1 right-1 w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 relative">
                    <div className="text-lg font-black text-purple-400">{stats?.weeklyWorkouts || 0}</div>
                    <div className="text-xs text-white/80">Week</div>
                    <div className="absolute top-1 right-1 w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 relative">
                    <div className="text-lg font-black text-orange-400">{stats?.totalCalories || 0}</div>
                    <div className="text-xs text-white/80">Calories</div>
                    <div className="absolute top-1 right-1 w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
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