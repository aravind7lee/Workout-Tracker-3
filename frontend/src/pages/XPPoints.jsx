// XP Points Component - Real-time MongoDB Integration
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAchievements } from '../context/AchievementsContext';
import { useRealTime } from '../context/RealTimeContext';
import AuthGuard from '../components/AuthGuard';
import api from '../utils/api';

const XPPoints = () => {
  const { currentXP, currentStreak, realTimeStats, isOnline: achievementsOnline, syncNow } = useAchievements();
  const { stats, isOnline: realTimeOnline, refreshStats } = useRealTime();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Calculate real-time XP sources using context data
  const xpSources = {
    workouts: (realTimeStats?.totalWorkouts || stats?.totalWorkouts || 0) * 100,
    meals: (realTimeStats?.totalMeals || stats?.totalMeals || 0) * 25,
    plans: (realTimeStats?.totalPlans || stats?.totalPlans || 0) * 50,
    streaks: (currentStreak || stats?.currentStreak || 0) * 10 // 10 XP per streak day
  };
  
  const totalXP = currentXP || (xpSources.workouts + xpSources.meals + xpSources.plans + xpSources.streaks);
  const level = Math.floor(totalXP / 1000) + 1;
  const currentLevelXP = totalXP % 1000;
  const xpToNextLevel = 1000 - currentLevelXP;
  const isOnline = achievementsOnline || realTimeOnline;

  // Real-time data refresh using contexts
  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([syncNow(), refreshStats()]);
      console.log('🔄 XP Points: Real-time data refreshed');
    } catch (error) {
      console.error('Error refreshing XP data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleWorkoutComplete = () => {
      console.log('🏋️ XP Points: Workout completed - updating XP');
      setTimeout(refreshData, 500);
    };
    
    const handleMealAdded = () => {
      console.log('🍽️ XP Points: Meal added - updating XP');
      setTimeout(refreshData, 500);
    };
    
    const handlePlanCreated = () => {
      console.log('📋 XP Points: Plan created - updating XP');
      setTimeout(refreshData, 500);
    };
    
    const handleStreakUpdated = () => {
      console.log('🔥 XP Points: Streak updated - updating XP');
      setTimeout(refreshData, 500);
    };
    
    window.addEventListener('workoutCompleted', handleWorkoutComplete);
    window.addEventListener('mealAdded', handleMealAdded);
    window.addEventListener('planCreated', handlePlanCreated);
    window.addEventListener('streakUpdated', handleStreakUpdated);
    window.addEventListener('achievementCheck', refreshData);
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutComplete);
      window.removeEventListener('mealAdded', handleMealAdded);
      window.removeEventListener('planCreated', handlePlanCreated);
      window.removeEventListener('streakUpdated', handleStreakUpdated);
      window.removeEventListener('achievementCheck', refreshData);
    };
  }, [syncNow, refreshStats]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </AuthGuard>
    );
  }

  const progressPercentage = (currentLevelXP / 1000) * 100;

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
            <div className="flex gap-2">
              <button
                onClick={refreshData}
                disabled={loading}
                className="btn bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base flex items-center gap-2"
              >
                <span className={loading ? 'animate-spin' : ''}>{loading ? '⟳' : '🔄'}</span>
                {loading ? 'Syncing...' : 'Sync Now'}
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base w-full sm:w-auto"
              >
                ← Back to Analytics
              </button>
            </div>
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
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Level {level}</h2>
            <p className="text-slate-400 text-sm sm:text-base">{totalXP.toLocaleString()} Total XP</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full border text-xs ${isOnline ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                {isOnline ? '🔥 LIVE DATA' : '📱 LOCAL DATA'}
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-xs sm:text-sm text-slate-400 mb-2">
              <span>Progress to Level {level + 1}</span>
              <span>{currentLevelXP} / 1000 XP</span>
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
              {xpToNextLevel} XP needed for next level
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
            <motion.div 
              className="text-center p-3 sm:p-4 bg-blue-600/20 rounded-lg border border-blue-500/30 hover:bg-blue-600/30 transition-all cursor-pointer"
              onClick={() => navigate('/workouts')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-xl sm:text-2xl mb-2">💪</div>
              <div className="text-lg sm:text-xl font-bold text-blue-400">{xpSources.workouts.toLocaleString()}</div>
              <div className="text-xs sm:text-sm text-slate-400">Workout XP</div>
              <div className="text-xs text-blue-300 mt-1">100 XP per workout</div>
              <div className="text-xs text-blue-200 mt-1 opacity-75">
                {Math.floor(xpSources.workouts / 100)} workouts completed
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center p-3 sm:p-4 bg-green-600/20 rounded-lg border border-green-500/30 hover:bg-green-600/30 transition-all cursor-pointer"
              onClick={() => navigate('/nutrition')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-xl sm:text-2xl mb-2">🍽️</div>
              <div className="text-lg sm:text-xl font-bold text-green-400">{xpSources.meals.toLocaleString()}</div>
              <div className="text-xs sm:text-sm text-slate-400">Meal XP</div>
              <div className="text-xs text-green-300 mt-1">25 XP per meal</div>
              <div className="text-xs text-green-200 mt-1 opacity-75">
                {Math.floor(xpSources.meals / 25)} meals logged
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center p-3 sm:p-4 bg-purple-600/20 rounded-lg border border-purple-500/30 hover:bg-purple-600/30 transition-all cursor-pointer"
              onClick={() => navigate('/my-plans')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-xl sm:text-2xl mb-2">📋</div>
              <div className="text-lg sm:text-xl font-bold text-purple-400">{xpSources.plans.toLocaleString()}</div>
              <div className="text-xs sm:text-sm text-slate-400">Plan XP</div>
              <div className="text-xs text-purple-300 mt-1">50 XP per plan</div>
              <div className="text-xs text-purple-200 mt-1 opacity-75">
                {Math.floor(xpSources.plans / 50)} plans created
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center p-3 sm:p-4 bg-orange-600/20 rounded-lg border border-orange-500/30 hover:bg-orange-600/30 transition-all cursor-pointer"
              onClick={() => navigate('/current-streak')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-xl sm:text-2xl mb-2">🔥</div>
              <div className="text-lg sm:text-xl font-bold text-orange-400">{xpSources.streaks.toLocaleString()}</div>
              <div className="text-xs sm:text-sm text-slate-400">Streak XP</div>
              <div className="text-xs text-orange-300 mt-1">10 XP per streak day</div>
              <div className="text-xs text-orange-200 mt-1 opacity-75">
                {Math.floor(xpSources.streaks / 10)} day streak
              </div>
            </motion.div>
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
            {[1, 5, 10, 25, 50].map(levelReward => (
              <motion.div 
                key={levelReward}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  level >= levelReward 
                    ? 'bg-green-600/20 border border-green-500/30' 
                    : 'bg-slate-800/50 border border-slate-600/30'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: levelReward * 0.1 }}
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className={`text-xl sm:text-2xl flex-shrink-0 ${level >= levelReward ? '' : 'grayscale'}`}>
                    {levelReward === 1 && '🎯'}
                    {levelReward === 5 && '🏃'}
                    {levelReward === 10 && '💪'}
                    {levelReward === 25 && '🏋️'}
                    {levelReward === 50 && '👑'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`font-medium text-sm sm:text-base ${level >= levelReward ? 'text-green-400' : 'text-slate-400'}`}>
                      Level {levelReward}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 truncate">
                      {levelReward === 1 && 'Welcome to GRINDX!'}
                      {levelReward === 5 && 'Fitness Enthusiast'}
                      {levelReward === 10 && 'Dedicated Athlete'}
                      {levelReward === 25 && 'Fitness Warrior'}
                      {levelReward === 50 && 'Gym Legend'}
                    </div>
                  </div>
                </div>
                <div className={`text-xs sm:text-sm flex-shrink-0 ${level >= levelReward ? 'text-green-400' : 'text-slate-500'}`}>
                  {level >= levelReward ? '✅ Unlocked' : `${(levelReward * 1000).toLocaleString()} XP`}
                </div>
              </motion.div>
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
            <motion.button 
              onClick={() => navigate('/library')}
              className="btn bg-blue-600 hover:bg-blue-700 text-white flex-col h-auto py-3 sm:py-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-xl sm:text-2xl mb-2">💪</div>
              <div className="font-medium text-sm sm:text-base">Complete Workout</div>
              <div className="text-xs sm:text-sm opacity-75">+100 XP</div>
            </motion.button>
            
            <motion.button 
              onClick={() => navigate('/nutrition')}
              className="btn bg-green-600 hover:bg-green-700 text-white flex-col h-auto py-3 sm:py-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-xl sm:text-2xl mb-2">🍽️</div>
              <div className="font-medium text-sm sm:text-base">Log Meal</div>
              <div className="text-xs sm:text-sm opacity-75">+25 XP</div>
            </motion.button>
            
            <motion.button 
              onClick={() => navigate('/my-plans')}
              className="btn bg-purple-600 hover:bg-purple-700 text-white flex-col h-auto py-3 sm:py-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-xl sm:text-2xl mb-2">📋</div>
              <div className="font-medium text-sm sm:text-base">Create Plan</div>
              <div className="text-xs sm:text-sm opacity-75">+50 XP</div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AuthGuard>
  );
};

export default XPPoints;