import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';

export default function WorkoutsFixed() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const { stats, isOnline } = useRealTime();
  const [currentTime, setCurrentTime] = useState(new Date());

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
      {/* Simple Hero Section */}
      <motion.div 
        className="relative w-full h-screen min-h-screen overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center text-white px-4">
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-2xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            YOUR WORKOUTS
          </motion.h1>
          
          <motion.p 
            className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Track your completed workouts and progress in real-time
          </motion.p>
          
          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.button
              onClick={() => navigate('/library')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🏋️ Start New Workout
            </motion.button>
            <motion.button
              onClick={() => window.location.reload()}
              className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Refresh
            </motion.button>
          </motion.div>
          
          {/* Status Indicators */}
          <motion.div 
            className="flex items-center justify-center gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-full backdrop-blur-sm">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-sm font-bold text-white">{isOnline ? 'LIVE' : 'OFFLINE'}</span>
            </div>
            <div className="text-sm text-white/80 font-mono bg-black/30 px-3 py-2 rounded-full backdrop-blur-sm">
              {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 relative">
              <div className="text-2xl font-black text-blue-400">{stats?.todayWorkouts || 0}</div>
              <div className="text-sm text-white/80">Today</div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 relative">
              <div className="text-2xl font-black text-green-400">{stats?.totalWorkouts || 0}</div>
              <div className="text-sm text-white/80">Total</div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 relative">
              <div className="text-2xl font-black text-purple-400">{stats?.weeklyWorkouts || 0}</div>
              <div className="text-sm text-white/80">Week</div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 relative">
              <div className="text-2xl font-black text-orange-400">{stats?.totalCalories || 0}</div>
              <div className="text-sm text-white/80">Calories</div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💪</div>
          <h3 className="text-xl font-bold text-white mb-2">
            Workout tracking is working!
          </h3>
          <p className="text-slate-400 mb-6">
            This is a simplified version of the workouts page that should work without errors.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/library')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🏋️ Browse Exercises
            </button>
            <button
              onClick={() => navigate('/workouts-original')}
              className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              📊 Try Original Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}