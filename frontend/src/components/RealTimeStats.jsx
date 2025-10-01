import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStreak } from '../context/StreakContext';
import { useRealTime } from '../context/RealTimeContext';
import { useAchievements } from '../context/AchievementsContext';
import { getRealTimeStreak } from '../utils/streakUtils';

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
  const { currentStreak } = useStreak();
  const { stats: contextStats, isOnline: contextOnline, refreshStats, updatePlansCount } = useRealTime();
  const { currentXP, currentStreak: achievementsStreak } = useAchievements();
  const navigate = useNavigate();
  
  // Get real-time streak using utility function (same as other pages)
  const realTimeCurrentStreak = achievementsStreak || contextStats.currentStreak || contextStats.streak || currentStreak || 0;
  
  // Get real XP from AchievementsContext
  const realTimeXP = currentXP || 0;

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
        
        const serverStreak = data.currentStreak || 0;
        const finalStreak = getRealTimeStreak(currentStreak, serverStreak);
        
        // Use server XP if available, otherwise use AchievementsContext XP
        const serverXP = data.xpPoints || realTimeXP;
        
        setStats({
          totalWorkouts: Math.max(data.totalWorkouts || 0, contextStats.totalWorkouts || 0),
          totalPlans: Math.max(data.totalPlans || 0, contextStats.totalPlans || 0),
          totalMeals: data.totalMeals || 0,
          currentStreak: finalStreak,
          xpPoints: serverXP
        });
        
        console.log('🔥 REAL-TIME STATS: Server data loaded:', {
          serverStreak,
          contextStreak: currentStreak,
          finalStreak
        });
      } else {
        // Fallback to localStorage
        loadLocalStats();
        setIsOnline(contextOnline);
      }
    } catch (error) {
      console.warn('Database unavailable, using local data:', error);
      loadLocalStats();
      setIsOnline(contextOnline);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalStats = () => {
    try {
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      
      // Get streak using utility function for consistency
      const localStreak = getRealTimeStreak(currentStreak, null);
      
      // Use RealTimeContext stats directly (including totalPlans)
      const totalWorkouts = contextStats.totalWorkouts || 0;
      const totalPlans = contextStats.totalPlans || 0;
      
      // Use the exact same XP calculation as XP Points page
      const calculatedXP = (totalWorkouts * 100) + (totalPlans * 50) + (meals.length * 25);
      
      setStats({
        totalWorkouts,
        totalPlans,
        totalMeals: meals.length,
        currentStreak: localStreak,
        xpPoints: realTimeXP || calculatedXP
      });
      
      console.log('🔥 REAL-TIME STATS: Local data loaded with real-time workouts:', {
        contextStreak: currentStreak,
        localStreak,
        totalWorkouts,
        totalPlans
      });
    } catch (error) {
      console.error('Error loading local stats:', error);
      const currentStats = window.realTimeWorkoutSync?.getStats() || {};
      setStats({
        totalWorkouts: currentStats.totalWorkouts || 0,
        totalPlans: 0,
        totalMeals: 0,
        currentStreak: 0,
        xpPoints: realTimeXP || 0
      });
    }
  };

  // Update stats when contextStats change
  useEffect(() => {
    if (contextStats.totalWorkouts !== undefined) {
      // Always use AchievementsContext XP for consistency
      setStats(prev => ({
        ...prev,
        totalWorkouts: contextStats.totalWorkouts,
        totalPlans: contextStats.totalPlans || prev.totalPlans,
        todayWorkouts: contextStats.todayWorkouts || 0,
        weeklyWorkouts: contextStats.weeklyWorkouts || 0,
        currentStreak: contextStats.currentStreak || contextStats.streak || prev.currentStreak,
        xpPoints: realTimeXP
      }));
    }
  }, [contextStats]);

  useEffect(() => {
    loadRealTimeStats();
    
    // Listen for real-time updates
    const handleWorkoutComplete = () => {
      console.log('🏋️ REAL-TIME STATS: Workout completed - refreshing stats');
      // RealTimeContext will handle the update automatically
      refreshStats();
      loadRealTimeStats();
    };
    const handlePlanCreated = () => {
      updatePlansCount();
      loadRealTimeStats();
    };
    const handleMealAdded = () => loadRealTimeStats();
    
    // REAL-TIME STREAK UPDATE HANDLER
    const handleStreakUpdate = (event) => {
      console.log('🔥 REAL-TIME STATS: Streak update received');
      
      if (event.detail && event.detail.currentStreak !== undefined) {
        const streakData = event.detail;
        const newStreak = streakData.currentStreak;
        
        // Update stats immediately with new streak
        setStats(prev => ({
          ...prev,
          currentStreak: newStreak
        }));
        
        console.log('✅ REAL-TIME STATS: Streak updated instantly:', newStreak);
      }
      
      // Also refresh full stats
      setTimeout(loadRealTimeStats, 500);
    };
    
    window.addEventListener('workoutCompleted', handleWorkoutComplete);
    window.addEventListener('planCreated', handlePlanCreated);
    window.addEventListener('mealAdded', handleMealAdded);
    window.addEventListener('streakUpdated', handleStreakUpdate);
    window.addEventListener('analyticsStreakUpdate', handleStreakUpdate);
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadRealTimeStats, 30000);
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutComplete);
      window.removeEventListener('planCreated', handlePlanCreated);
      window.removeEventListener('mealAdded', handleMealAdded);
      window.removeEventListener('streakUpdated', handleStreakUpdate);
      window.removeEventListener('analyticsStreakUpdate', handleStreakUpdate);
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
            value: formatNumber(realTimeXP), 
            color: 'text-green-400',
            icon: '⭐',
            path: '/xp-points'
          },
          { 
            label: 'Current Streak', 
            value: realTimeCurrentStreak > 0 ? `${realTimeCurrentStreak}🔥` : '0🔥', 
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
                (stat.label === 'XP Points' && realTimeXP > 0) ||
                (stat.label === 'Current Streak' && realTimeCurrentStreak > 0)
                  ? 'text-green-400' 
                  : 'text-gray-400'
              }`}>
                {getStatMessage(stat.label, 
                  stat.label === 'Total Workouts' ? stats.totalWorkouts :
                  stat.label === 'Workout Plans' ? stats.totalPlans :
                  stat.label === 'XP Points' ? realTimeXP :
                  realTimeCurrentStreak
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}