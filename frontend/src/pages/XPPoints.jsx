// XP Points Component - Real-time MongoDB Integration
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AuthGuard from '../components/AuthGuard';
import api from '../utils/api';

const XPPoints = () => {
  const [xpData, setXpData] = useState({
    totalXP: 0,
    level: 1,
    xpToNextLevel: 1000,
    currentLevelXP: 0,
    xpHistory: [],
    achievements: [],
    xpSources: {
      workouts: 0,
      meals: 0,
      plans: 0,
      streaks: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  const fetchXPData = async () => {
    try {
      const response = await api.get('/users/xp-details');
      const data = response.data;
      
      setXpData({
        totalXP: data.totalXP || 0,
        level: Math.floor((data.totalXP || 0) / 1000) + 1,
        xpToNextLevel: 1000 - ((data.totalXP || 0) % 1000),
        currentLevelXP: (data.totalXP || 0) % 1000,
        xpHistory: data.xpHistory || [],
        achievements: data.achievements || [],
        xpSources: data.xpSources || {
          workouts: data.workoutXP || 0,
          meals: data.mealXP || 0,
          plans: data.planXP || 0,
          streaks: data.streakXP || 0
        }
      });
    } catch (error) {
      console.error('Failed to fetch XP data:', error);
      loadOfflineXP();
    } finally {
      setLoading(false);
    }
  };

  const loadOfflineXP = () => {
    const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
    const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
    const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
    
    const workoutXP = workouts.length * 100;
    const mealXP = meals.length * 25;
    const planXP = plans.length * 50;
    const totalXP = workoutXP + mealXP + planXP;
    
    setXpData({
      totalXP,
      level: Math.floor(totalXP / 1000) + 1,
      xpToNextLevel: 1000 - (totalXP % 1000),
      currentLevelXP: totalXP % 1000,
      xpHistory: [],
      achievements: [],
      xpSources: { workouts: workoutXP, meals: mealXP, plans: planXP, streaks: 0 }
    });
  };

  useEffect(() => {
    fetchXPData();
    
    const handleWorkoutComplete = () => {
      setTimeout(fetchXPData, 1000);
    };
    
    const handleMealAdded = () => {
      setTimeout(fetchXPData, 1000);
    };
    
    window.addEventListener('workoutCompleted', handleWorkoutComplete);
    window.addEventListener('mealAdded', handleMealAdded);
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutComplete);
      window.removeEventListener('mealAdded', handleMealAdded);
    };
  }, []);

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </AuthGuard>
    );
  }

  const progressPercentage = (xpData.currentLevelXP / 1000) * 100;

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <span className="flex items-center gap-2">
                  ⭐ XP Points System
                </span>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 sm:px-3 py-1 rounded-full border border-purple-500/30 animate-pulse w-fit">
                  REAL-TIME
                </span>
              </h1>
              <p className="text-slate-400 mt-2 text-sm sm:text-base">Track your fitness journey through experience points</p>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base w-full sm:w-auto"
            >
              ← Back to Analytics
            </button>
          </div>
        </motion.div>

        {/* Level Progress */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-center mb-4 sm:mb-6">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🏆</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Level {xpData.level}</h2>
            <p className="text-slate-400 text-sm sm:text-base">{xpData.totalXP} Total XP</p>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-xs sm:text-sm text-slate-400 mb-2">
              <span>Progress to Level {xpData.level + 1}</span>
              <span>{xpData.currentLevelXP} / 1000 XP</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 sm:h-4">
              <motion.div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 sm:h-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-center text-slate-400 text-xs sm:text-sm mt-2">
              {xpData.xpToNextLevel} XP needed for next level
            </p>
          </div>
        </motion.div>

        {/* XP Sources */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">XP Sources</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-blue-600/20 rounded-lg border border-blue-500/30">
              <div className="text-xl sm:text-2xl mb-2">💪</div>
              <div className="text-lg sm:text-xl font-bold text-blue-400">{xpData.xpSources.workouts}</div>
              <div className="text-xs sm:text-sm text-slate-400">Workout XP</div>
              <div className="text-xs text-blue-300 mt-1">100 XP per workout</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-green-600/20 rounded-lg border border-green-500/30">
              <div className="text-xl sm:text-2xl mb-2">🍽️</div>
              <div className="text-lg sm:text-xl font-bold text-green-400">{xpData.xpSources.meals}</div>
              <div className="text-xs sm:text-sm text-slate-400">Meal XP</div>
              <div className="text-xs text-green-300 mt-1">25 XP per meal</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-purple-600/20 rounded-lg border border-purple-500/30">
              <div className="text-xl sm:text-2xl mb-2">📋</div>
              <div className="text-lg sm:text-xl font-bold text-purple-400">{xpData.xpSources.plans}</div>
              <div className="text-xs sm:text-sm text-slate-400">Plan XP</div>
              <div className="text-xs text-purple-300 mt-1">50 XP per plan</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-orange-600/20 rounded-lg border border-orange-500/30">
              <div className="text-xl sm:text-2xl mb-2">🔥</div>
              <div className="text-lg sm:text-xl font-bold text-orange-400">{xpData.xpSources.streaks}</div>
              <div className="text-xs sm:text-sm text-slate-400">Streak XP</div>
              <div className="text-xs text-orange-300 mt-1">Bonus XP</div>
            </div>
          </div>
        </motion.div>

        {/* Level Rewards */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Level Rewards</h3>
          <div className="space-y-2 sm:space-y-3">
            {[1, 5, 10, 25, 50].map(level => (
              <div 
                key={level}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  xpData.level >= level 
                    ? 'bg-green-600/20 border border-green-500/30' 
                    : 'bg-slate-800/50 border border-slate-600/30'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className={`text-xl sm:text-2xl flex-shrink-0 ${xpData.level >= level ? '' : 'grayscale'}`}>
                    {level === 1 && '🎯'}
                    {level === 5 && '🏃'}
                    {level === 10 && '💪'}
                    {level === 25 && '🏋️'}
                    {level === 50 && '👑'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`font-medium text-sm sm:text-base ${xpData.level >= level ? 'text-green-400' : 'text-slate-400'}`}>
                      Level {level}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 truncate">
                      {level === 1 && 'Welcome to GymTracker!'}
                      {level === 5 && 'Fitness Enthusiast'}
                      {level === 10 && 'Dedicated Athlete'}
                      {level === 25 && 'Fitness Warrior'}
                      {level === 50 && 'Gym Legend'}
                    </div>
                  </div>
                </div>
                <div className={`text-xs sm:text-sm flex-shrink-0 ${xpData.level >= level ? 'text-green-400' : 'text-slate-500'}`}>
                  {xpData.level >= level ? '✅ Unlocked' : `${level * 1000} XP`}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Earn More XP</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <button 
              onClick={() => navigate('/library')}
              className="btn bg-blue-600 hover:bg-blue-700 text-white flex-col h-auto py-3 sm:py-4"
            >
              <div className="text-xl sm:text-2xl mb-2">💪</div>
              <div className="font-medium text-sm sm:text-base">Complete Workout</div>
              <div className="text-xs sm:text-sm opacity-75">+100 XP</div>
            </button>
            
            <button 
              onClick={() => navigate('/nutrition')}
              className="btn bg-green-600 hover:bg-green-700 text-white flex-col h-auto py-3 sm:py-4"
            >
              <div className="text-xl sm:text-2xl mb-2">🍽️</div>
              <div className="font-medium text-sm sm:text-base">Log Meal</div>
              <div className="text-xs sm:text-sm opacity-75">+25 XP</div>
            </button>
            
            <button 
              onClick={() => navigate('/my-plans')}
              className="btn bg-purple-600 hover:bg-purple-700 text-white flex-col h-auto py-3 sm:py-4"
            >
              <div className="text-xl sm:text-2xl mb-2">📋</div>
              <div className="font-medium text-sm sm:text-base">Create Plan</div>
              <div className="text-xs sm:text-sm opacity-75">+50 XP</div>
            </button>
          </div>
        </motion.div>
      </div>
    </AuthGuard>
  );
};

export default XPPoints;