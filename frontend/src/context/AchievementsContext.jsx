// ULTRA AURA++ Real-time Achievements Context - Professional Gym Level
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { onlineService } from '../services/onlineService';
import { useAuth } from './AuthContext';

const AchievementsContext = createContext();

export const useAchievements = () => {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
};

export const AchievementsProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [realTimeStats, setRealTimeStats] = useState(null);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const intervalRef = useRef(null);

  // Professional Achievement Definitions - ULTRA AURA++ Level
  const ACHIEVEMENT_DEFINITIONS = [
    // 🏋️ WORKOUT ACHIEVEMENTS
    { id: 'workout_1', title: 'First Rep', description: 'Completed your first workout', icon: '🎯', xp: 100, tier: 'bronze', threshold: 1, type: 'workout' },
    { id: 'workout_5', title: 'Getting Strong', description: 'Completed 5 workouts', icon: '💪', xp: 250, tier: 'bronze', threshold: 5, type: 'workout' },
    { id: 'workout_10', title: 'Fitness Enthusiast', description: 'Completed 10 workouts', icon: '🔥', xp: 500, tier: 'silver', threshold: 10, type: 'workout' },
    { id: 'workout_25', title: 'Iron Warrior', description: 'Completed 25 workouts', icon: '⚔️', xp: 1000, tier: 'silver', threshold: 25, type: 'workout' },
    { id: 'workout_50', title: 'Gym Legend', description: 'Completed 50 workouts', icon: '👑', xp: 2000, tier: 'gold', threshold: 50, type: 'workout' },
    { id: 'workout_100', title: 'Ultimate Beast', description: 'Completed 100 workouts', icon: '🦁', xp: 5000, tier: 'platinum', threshold: 100, type: 'workout' },
    
    // 📋 PLANNING ACHIEVEMENTS
    { id: 'plan_1', title: 'Plan Creator', description: 'Created your first workout plan', icon: '📋', xp: 150, tier: 'bronze', threshold: 1, type: 'plan' },
    { id: 'plan_3', title: 'Strategic Planner', description: 'Created 3 workout plans', icon: '🎯', xp: 400, tier: 'silver', threshold: 3, type: 'plan' },
    { id: 'plan_5', title: 'Master Planner', description: 'Created 5 workout plans', icon: '🧠', xp: 750, tier: 'gold', threshold: 5, type: 'plan' },
    
    // 🔥 STREAK ACHIEVEMENTS
    { id: 'streak_3', title: 'On Fire', description: '3-day workout streak', icon: '🔥', xp: 200, tier: 'bronze', threshold: 3, type: 'streak' },
    { id: 'streak_7', title: 'Week Warrior', description: '7-day workout streak', icon: '⚡', xp: 500, tier: 'silver', threshold: 7, type: 'streak' },
    { id: 'streak_14', title: 'Unstoppable', description: '14-day workout streak', icon: '🚀', xp: 1000, tier: 'gold', threshold: 14, type: 'streak' },
    { id: 'streak_30', title: 'Consistency King', description: '30-day workout streak', icon: '👑', xp: 2500, tier: 'platinum', threshold: 30, type: 'streak' },
    
    // 🥗 NUTRITION ACHIEVEMENTS
    { id: 'nutrition_1', title: 'Nutrition Starter', description: 'Logged your first meal', icon: '🥗', xp: 50, tier: 'bronze', threshold: 1, type: 'nutrition' },
    { id: 'nutrition_10', title: 'Meal Tracker', description: 'Logged 10 meals', icon: '🍎', xp: 300, tier: 'silver', threshold: 10, type: 'nutrition' },
    { id: 'nutrition_50', title: 'Nutrition Expert', description: 'Logged 50 meals', icon: '🥇', xp: 1000, tier: 'gold', threshold: 50, type: 'nutrition' },
    
    // 💎 XP ACHIEVEMENTS
    { id: 'xp_500', title: 'XP Collector', description: 'Earned 500 XP points', icon: '💎', xp: 100, tier: 'bronze', threshold: 500, type: 'xp' },
    { id: 'xp_1000', title: 'XP Master', description: 'Earned 1,000 XP points', icon: '💠', xp: 200, tier: 'silver', threshold: 1000, type: 'xp' },
    { id: 'xp_2500', title: 'XP Legend', description: 'Earned 2,500 XP points', icon: '🌟', xp: 500, tier: 'gold', threshold: 2500, type: 'xp' },
    { id: 'xp_5000', title: 'XP God', description: 'Earned 5,000 XP points', icon: '⭐', xp: 1000, tier: 'platinum', threshold: 5000, type: 'xp' }
  ];

  // Real-time MongoDB Achievement Calculation
  const calculateRealTimeAchievements = useCallback(async () => {
    if (!isAuthenticated?.()) {
      setUnlockedCount(0);
      setTotalCount(ACHIEVEMENT_DEFINITIONS.length);
      setTotalXPEarned(0);
      return;
    }

    try {
      setLoading(true);
      
      // Check backend status
      const online = await onlineService.checkBackendStatus();
      setIsOnline(online);

      let userStats = null;
      
      if (online) {
        try {
          // Fetch real-time stats from MongoDB
          userStats = await onlineService.getRealTimeStats();
          setLastSync(new Date());
        } catch (error) {
          console.warn('Backend fetch failed, using local data:', error);
        }
      }
      
      // Fallback to local calculation if backend unavailable
      if (!userStats || !userStats.isRealTime) {
        const workouts = JSON.parse(localStorage.getItem('recentWorkouts') || '[]');
        const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
        const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
        
        const calculateStreak = (workouts) => {
          if (!workouts.length) return 0;
          const today = new Date();
          let streak = 0;
          for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const hasWorkout = workouts.some(w => {
              const workoutDate = new Date(w.completedAt || w.createdAt || w.date);
              return workoutDate.toDateString() === checkDate.toDateString();
            });
            if (hasWorkout) streak++;
            else break;
          }
          return streak;
        };
        
        userStats = {
          totalWorkouts: workouts.length,
          totalPlans: plans.length,
          totalMeals: meals.length,
          currentStreak: calculateStreak(workouts),
          xpPoints: (workouts.length * 100) + (plans.length * 150) + (meals.length * 50),
          isRealTime: false
        };
      }
      
      setRealTimeStats(userStats);
      
      // Process achievements with real-time data
      const processedAchievements = ACHIEVEMENT_DEFINITIONS.map(def => {
        let current = 0;
        switch (def.type) {
          case 'workout':
            current = userStats.totalWorkouts || 0;
            break;
          case 'plan':
            current = userStats.totalPlans || 0;
            break;
          case 'streak':
            current = userStats.currentStreak || 0;
            break;
          case 'nutrition':
            current = userStats.totalMeals || 0;
            break;
          case 'xp':
            current = userStats.xpPoints || 0;
            break;
        }
        
        const isUnlocked = current >= def.threshold;
        const progress = Math.min(current, def.threshold);
        const percentage = Math.min((current / def.threshold) * 100, 100);
        
        return {
          ...def,
          unlocked: isUnlocked,
          progress,
          target: def.threshold,
          percentage,
          current
        };
      });
      
      // Sort achievements: unlocked first, then by tier, then by progress
      processedAchievements.sort((a, b) => {
        if (a.unlocked !== b.unlocked) return b.unlocked - a.unlocked;
        const tierOrder = { 'platinum': 4, 'gold': 3, 'silver': 2, 'bronze': 1 };
        if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[b.tier] - tierOrder[a.tier];
        return b.percentage - a.percentage;
      });
      
      setAchievements(processedAchievements);
      setUnlockedCount(processedAchievements.filter(a => a.unlocked).length);
      setTotalCount(processedAchievements.length);
      setTotalXPEarned(processedAchievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xp, 0));
      
    } catch (error) {
      console.error('Error calculating real-time achievements:', error);
      setUnlockedCount(0);
      setTotalCount(ACHIEVEMENT_DEFINITIONS.length);
      setTotalXPEarned(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initialize ONLY - NO POLLING
  useEffect(() => {
    calculateRealTimeAchievements();
  }, [calculateRealTimeAchievements]);

  // Listen for real-time events
  useEffect(() => {
    const handleWorkoutComplete = () => {
      console.log('🏋️ Workout completed - updating achievements');
      setTimeout(calculateRealTimeAchievements, 1000);
    };
    
    const handleMealAdded = () => {
      console.log('🍽️ Meal added - updating achievements');
      setTimeout(calculateRealTimeAchievements, 1000);
    };
    
    const handlePlanCreated = () => {
      console.log('📋 Plan created - updating achievements');
      setTimeout(calculateRealTimeAchievements, 1000);
    };
    
    const handleAchievementCheck = () => {
      console.log('🏆 Achievement check triggered - updating achievements');
      setTimeout(calculateRealTimeAchievements, 500);
    };
    
    const handleForceRefresh = () => {
      console.log('🔄 Force refresh triggered - updating achievements immediately');
      calculateRealTimeAchievements();
    };
    
    window.addEventListener('workoutCompleted', handleWorkoutComplete);
    window.addEventListener('mealAdded', handleMealAdded);
    window.addEventListener('planCreated', handlePlanCreated);
    window.addEventListener('achievementCheck', handleAchievementCheck);
    window.addEventListener('achievementForceRefresh', handleForceRefresh);
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutComplete);
      window.removeEventListener('mealAdded', handleMealAdded);
      window.removeEventListener('planCreated', handlePlanCreated);
      window.removeEventListener('achievementCheck', handleAchievementCheck);
      window.removeEventListener('achievementForceRefresh', handleForceRefresh);
    };
  }, [calculateRealTimeAchievements]);

  // Force sync function for manual refresh
  const syncNow = useCallback(async () => {
    await calculateRealTimeAchievements();
  }, [calculateRealTimeAchievements]);

  const value = {
    // Core achievement data
    achievements,
    unlockedCount,
    totalCount,
    totalXPEarned,
    loading,
    
    // Real-time stats
    realTimeStats,
    isOnline,
    lastSync,
    
    // Actions
    syncNow,
    checkAchievements: calculateRealTimeAchievements,
    
    // Professional gym metrics
    completionPercentage: totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0,
    currentXP: realTimeStats?.xpPoints || 0,
    currentStreak: realTimeStats?.currentStreak || 0
  };

  return (
    <AchievementsContext.Provider value={value}>
      {children}
    </AchievementsContext.Provider>
  );
};