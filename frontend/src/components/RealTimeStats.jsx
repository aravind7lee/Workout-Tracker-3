import React, { useState, useEffect } from 'react';
import { onlineService } from '../services/onlineService';
import { useAuth } from '../context/AuthContext';

export default function RealTimeStats() {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalPlans: 0,
    totalMeals: 0,
    currentStreak: 0,
    xpPoints: 0,
    weeklyGoal: { completed: 0, target: 4, percentage: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const { isAuthenticated } = useAuth();

  const loadRealTimeStats = async () => {
    if (!isAuthenticated()) return;

    try {
      const online = await onlineService.checkBackendStatus();
      setIsOnline(online);

      let workouts = [], plans = [], meals = [];

      if (online) {
        const [workoutData, planData] = await Promise.all([
          onlineService.getWorkoutHistory().catch(() => []),
          onlineService.getWorkoutPlans().catch(() => [])
        ]);
        workouts = workoutData || [];
        plans = planData || [];
      }

      // Fallback to localStorage
      if (!online || workouts.length === 0) {
        workouts = JSON.parse(localStorage.getItem('recentWorkouts') || '[]');
        plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
        meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      }

      const newStats = {
        totalWorkouts: workouts.length,
        totalPlans: plans.length,
        totalMeals: meals.length,
        currentStreak: calculateStreak(workouts),
        xpPoints: (workouts.length * 100) + (plans.length * 150) + (meals.length * 50),
        weeklyGoal: {
          completed: Math.min(workouts.length, 4),
          target: 4,
          percentage: Math.min((workouts.length / 4) * 100, 100)
        }
      };

      setStats(newStats);
    } catch (error) {
      console.error('Real-time stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (workouts) => {
    if (!workouts.length) return 0;
    
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasWorkout = workouts.some(workout => {
        const workoutDate = new Date(workout.date || workout.createdAt);
        return workoutDate.toDateString() === checkDate.toDateString();
      });
      
      if (hasWorkout) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  useEffect(() => {
    loadRealTimeStats();
    const interval = setInterval(loadRealTimeStats, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-700 rounded mb-2"></div>
              <div className="h-4 bg-slate-700 rounded mb-1"></div>
              <div className="h-3 bg-slate-700 rounded"></div>
            </div>
          </div>
        ))
      ) : (
        [
          { 
            label: 'Total Workouts', 
            value: formatNumber(stats.totalWorkouts), 
            change: stats.totalWorkouts > 0 ? 'Great progress!' : 'Start your first workout', 
            color: 'text-blue-400',
            icon: '💪'
          },
          { 
            label: 'Workout Plans', 
            value: formatNumber(stats.totalPlans), 
            change: stats.totalPlans > 0 ? `${stats.totalPlans} plans created` : 'Create your first plan', 
            color: 'text-green-400',
            icon: '📋'
          },
          { 
            label: 'XP Points', 
            value: formatNumber(stats.xpPoints), 
            change: stats.xpPoints > 0 ? `Level ${Math.floor(stats.xpPoints / 500) + 1}` : 'Earn XP by working out', 
            color: 'text-purple-400',
            icon: '⭐'
          },
          { 
            label: 'Current Streak', 
            value: `${stats.currentStreak}🔥`, 
            change: stats.currentStreak > 0 ? `${stats.currentStreak} days strong!` : 'Start your streak', 
            color: 'text-orange-400',
            icon: '🔥'
          }
        ].map((stat, index) => (
          <div key={index} className="card relative overflow-hidden">
            <div className="absolute top-2 right-2 text-xs">
              <span className={`px-1 py-0.5 rounded ${isOnline ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {isOnline ? '🟢' : '🟡'}
              </span>
            </div>
            <div className="text-center">
              <div className="text-lg mb-1">{stat.icon}</div>
              <div className={`text-2xl sm:text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-xs sm:text-sm text-slate-400 mb-1">{stat.label}</div>
              <div className="text-xs text-green-400">{stat.change}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}