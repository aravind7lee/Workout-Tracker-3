import { useState, useEffect, useCallback } from 'react';
import { onlineService } from '../services/onlineService';
import { useAuth } from '../context/AuthContext';

export const useRealTimeAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const { isAuthenticated } = useAuth();

  const calculateProgress = useCallback((workouts, plans, meals) => {
    return {
      firstWorkout: { current: workouts.length, target: 1, completed: workouts.length >= 1 },
      workout5: { current: workouts.length, target: 5, completed: workouts.length >= 5 },
      workout10: { current: workouts.length, target: 10, completed: workouts.length >= 10 },
      firstPlan: { current: plans.length, target: 1, completed: plans.length >= 1 },
      nutrition3: { current: meals.length, target: 3, completed: meals.length >= 3 }
    };
  }, []);

  const generateAchievements = useCallback((workouts, plans, meals) => {
    const achievements = [];
    const now = new Date();
    
    if (workouts.length >= 1) {
      achievements.push({
        id: 'first_workout',
        title: 'First Steps',
        description: 'Completed your first workout',
        icon: '🎯',
        xp: 100,
        unlockedAt: now.toISOString(),
        category: 'workout'
      });
    }
    
    if (workouts.length >= 5) {
      achievements.push({
        id: 'workout_5',
        title: 'Getting Strong',
        description: 'Completed 5 workouts',
        icon: '💪',
        xp: 250,
        unlockedAt: now.toISOString(),
        category: 'workout'
      });
    }
    
    if (workouts.length >= 10) {
      achievements.push({
        id: 'workout_10',
        title: 'Fitness Enthusiast',
        description: 'Completed 10 workouts',
        icon: '🔥',
        xp: 500,
        unlockedAt: now.toISOString(),
        category: 'workout'
      });
    }
    
    if (plans.length >= 1) {
      achievements.push({
        id: 'first_plan',
        title: 'Plan Creator',
        description: 'Created your first workout plan',
        icon: '📋',
        xp: 150,
        unlockedAt: now.toISOString(),
        category: 'planning'
      });
    }
    
    if (meals.length >= 3) {
      achievements.push({
        id: 'nutrition_3',
        title: 'Nutrition Tracker',
        description: 'Logged 3 meals',
        icon: '🥗',
        xp: 100,
        unlockedAt: now.toISOString(),
        category: 'nutrition'
      });
    }
    
    return achievements;
  }, []);

  const loadRealTimeData = useCallback(async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      const online = await onlineService.checkBackendStatus();
      setIsOnline(online);

      let workouts = [], plans = [], meals = [];

      if (online) {
        try {
          const [workoutData, planData] = await Promise.all([
            onlineService.getWorkoutHistory(),
            onlineService.getWorkoutPlans()
          ]);
          workouts = workoutData || [];
          plans = planData || [];
          meals = []; // Add meal service when available
        } catch (error) {
          console.error('Backend data fetch failed:', error);
        }
      }

      // Fallback to localStorage
      if (!online || (workouts.length === 0 && plans.length === 0)) {
        workouts = JSON.parse(localStorage.getItem('recentWorkouts') || '[]');
        plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
        meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      }

      const newAchievements = generateAchievements(workouts, plans, meals);
      const newProgress = calculateProgress(workouts, plans, meals);

      setAchievements(newAchievements);
      setProgress(newProgress);
    } catch (error) {
      console.error('Real-time data load error:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, generateAchievements, calculateProgress]);

  useEffect(() => {
    loadRealTimeData();
    const interval = setInterval(loadRealTimeData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [loadRealTimeData]);

  return {
    achievements,
    progress,
    loading,
    isOnline,
    refresh: loadRealTimeData,
    totalXP: achievements.reduce((sum, a) => sum + a.xp, 0)
  };
};