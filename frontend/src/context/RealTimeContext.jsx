// Real-time Context for instant updates across the app
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onlineService } from '../services/onlineService';
import { useAuth } from './AuthContext';

const RealTimeContext = createContext();

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

export const RealTimeProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState({
    workouts: 0,
    meals: 0,
    xpPoints: 0,
    streak: 0,
    weeklyGoal: { completed: 0, target: 4, percentage: 0 }
  });
  const [isOnline, setIsOnline] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Real-time data fetching
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated?.() || !user) return;

    try {
      const online = await onlineService.checkBackendStatus();
      setIsOnline(online);
      
      if (online) {
        const analytics = await onlineService.getAnalytics();
        
        if (analytics) {
          setStats({
            workouts: analytics.workouts || analytics.totalWorkouts || 0,
            meals: analytics.meals || analytics.totalMeals || 0,
            xpPoints: analytics.xpPoints || analytics.totalXP || 0,
            streak: analytics.streak || analytics.currentStreak || 0,
            weeklyGoal: {
              completed: analytics.weeklyGoal?.completed || analytics.weeklyProgress?.completed || 0,
              target: analytics.weeklyGoal?.target || analytics.weeklyProgress?.target || 4,
              percentage: analytics.weeklyGoal?.percentage || analytics.weeklyProgress?.percentage || 0
            }
          });
          setLastSync(new Date());
        }
      }
    } catch (error) {
      console.error('Real-time fetch error:', error);
    }
  }, [isAuthenticated, user]);

  // Listen for streak updates from StreakContext
  useEffect(() => {
    const handleStreakUpdate = (event) => {
      setStats(prev => ({
        ...prev,
        streak: event.detail.currentStreak || 0
      }));
    };

    window.addEventListener('streakUpdated', handleStreakUpdate);
    return () => window.removeEventListener('streakUpdated', handleStreakUpdate);
  }, []);

  // Trigger instant update
  const triggerUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
    fetchStats();
  }, [fetchStats]);

  // Update stats after workout completion
  const updateWorkoutStats = useCallback((workoutData) => {
    setStats(prev => {
      const newWorkouts = prev.workouts + 1;
      const newXP = prev.xpPoints + (workoutData.xpGained || 100);
      const newStreak = prev.streak + 1;
      const newWeeklyCompleted = Math.min(prev.weeklyGoal.completed + 1, prev.weeklyGoal.target);
      
      return {
        ...prev,
        workouts: newWorkouts,
        xpPoints: newXP,
        streak: newStreak,
        weeklyGoal: {
          ...prev.weeklyGoal,
          completed: newWeeklyCompleted,
          percentage: Math.min((newWeeklyCompleted / prev.weeklyGoal.target) * 100, 100)
        }
      };
    });
    
    // Sync with backend after a short delay
    setTimeout(fetchStats, 2000);
  }, [fetchStats]);

  // Update stats after meal addition
  const updateMealStats = useCallback((mealData) => {
    setStats(prev => {
      const newMeals = prev.meals + 1;
      const newXP = prev.xpPoints + (mealData.xpGained || 50);
      
      return {
        ...prev,
        meals: newMeals,
        xpPoints: newXP
      };
    });
    
    // Sync with backend after a short delay
    setTimeout(fetchStats, 2000);
  }, [fetchStats]);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Periodic sync
  useEffect(() => {
    if (!isAuthenticated?.()) return;
    
    const interval = setInterval(fetchStats, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [fetchStats, isAuthenticated]);

  const value = {
    stats,
    isOnline,
    lastSync,
    updateTrigger,
    triggerUpdate,
    updateWorkoutStats,
    updateMealStats,
    fetchStats
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};