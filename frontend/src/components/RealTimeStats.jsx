import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RealTimeStats() {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalPlans: 0,
    totalMeals: 0,
    currentStreak: 0,
    xpPoints: 0
  });
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadRealTimeStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Try MongoDB first
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsOnline(true);
        
        setStats({
          totalWorkouts: data.totalWorkouts || 0,
          totalPlans: data.totalPlans || 0,
          totalMeals: data.totalMeals || 0,
          currentStreak: data.currentStreak || 0,
          xpPoints: data.xpPoints || 0
        });
      } else {
        // Fallback to localStorage
        loadLocalStats();
        setIsOnline(false);
      }
    } catch (error) {
      console.warn('Database unavailable, using local data:', error);
      loadLocalStats();
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalStats = () => {
    try {
      const workouts = JSON.parse(localStorage.getItem('recentWorkouts') || '[]');
      const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      
      // Get streak from localStorage
      const streakKey = `gymtracker_streak_${user.id}`;
      const streakData = JSON.parse(localStorage.getItem(streakKey) || '{}');
      
      setStats({
        totalWorkouts: workouts.filter(w => w.completed).length,
        totalPlans: plans.length,
        totalMeals: meals.length,
        currentStreak: streakData.currentStreak || 0,
        xpPoints: (workouts.filter(w => w.completed).length * 100) + (plans.length * 50) + (meals.length * 25)
      });
    } catch (error) {
      console.error('Error loading local stats:', error);
      setStats({
        totalWorkouts: 0,
        totalPlans: 0,
        totalMeals: 0,
        currentStreak: 0,
        xpPoints: 0
      });
    }
  };

  useEffect(() => {
    loadRealTimeStats();
    
    // Listen for real-time updates
    const handleWorkoutComplete = () => loadRealTimeStats();
    const handlePlanCreated = () => loadRealTimeStats();
    const handleMealAdded = () => loadRealTimeStats();
    const handleStreakUpdate = () => loadRealTimeStats();
    
    window.addEventListener('workoutCompleted', handleWorkoutComplete);
    window.addEventListener('planCreated', handlePlanCreated);
    window.addEventListener('mealAdded', handleMealAdded);
    window.addEventListener('streakUpdated', handleStreakUpdate);
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadRealTimeStats, 30000);
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutComplete);
      window.removeEventListener('planCreated', handlePlanCreated);
      window.removeEventListener('mealAdded', handleMealAdded);
      window.removeEventListener('streakUpdated', handleStreakUpdate);
      clearInterval(interval);
    };
  }, [user]);

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getStatMessage = (label, value) => {
    switch (label) {
      case 'Total Workouts':
        return value > 0 ? `${value} completed!` : 'Start your first workout';
      case 'Workout Plans':
        return value > 0 ? `${value} plans ready` : 'Create your first plan';
      case 'XP Points':
        return value > 0 ? `Level ${Math.floor(value / 100) + 1}` : 'Earn XP by working out';
      case 'Current Streak':
        return value > 0 ? `${value} days strong!` : 'Start your streak';
      default:
        return 'Ready to start!';
    }
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
            color: 'text-blue-400',
            icon: '💪',
            path: '/library'
          },
          { 
            label: 'Workout Plans', 
            value: formatNumber(stats.totalPlans), 
            color: 'text-green-400',
            icon: '📋',
            path: '/my-plans'
          },
          { 
            label: 'XP Points', 
            value: formatNumber(stats.xpPoints), 
            color: 'text-purple-400',
            icon: '⭐',
            path: '/xp-points'
          },
          { 
            label: 'Current Streak', 
            value: stats.currentStreak > 0 ? `${stats.currentStreak}🔥` : '0🔥', 
            color: 'text-orange-400',
            icon: '🔥',
            path: '/current-streak'
          }
        ].map((stat, index) => (
          <div 
            key={index} 
            className="card relative overflow-hidden cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg"
            onClick={() => navigate(stat.path)}
          >
            <div className="absolute top-2 right-2 text-xs">
              <span className={`px-1 py-0.5 rounded-full text-xs ${
                isOnline 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {isOnline ? '🟢' : '🟡'}
              </span>
            </div>
            <div className="text-center">
              <div className="text-lg mb-1">{stat.icon}</div>
              <div className={`text-2xl sm:text-3xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mb-1">
                {stat.label}
              </div>
              <div className={`text-xs ${
                (stat.label === 'Total Workouts' && stats.totalWorkouts > 0) ||
                (stat.label === 'Workout Plans' && stats.totalPlans > 0) ||
                (stat.label === 'XP Points' && stats.xpPoints > 0) ||
                (stat.label === 'Current Streak' && stats.currentStreak > 0)
                  ? 'text-green-400' 
                  : 'text-gray-400'
              }`}>
                {getStatMessage(stat.label, 
                  stat.label === 'Total Workouts' ? stats.totalWorkouts :
                  stat.label === 'Workout Plans' ? stats.totalPlans :
                  stat.label === 'XP Points' ? stats.xpPoints :
                  stats.currentStreak
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}