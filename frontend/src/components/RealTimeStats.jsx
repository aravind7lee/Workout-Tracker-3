import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';

export default function RealTimeStats() {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalPlans: 0,
    totalMeals: 0
  });
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const { user } = useAuth();
  const { stats: contextStats, isOnline: contextOnline } = useRealTime();
  const navigate = useNavigate();

  const loadRealTimeStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
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
          totalWorkouts: Math.max(data.totalWorkouts || 0, contextStats.totalWorkouts || 0),
          totalPlans: Math.max(data.totalPlans || 0, contextStats.totalPlans || 0),
          totalMeals: data.totalMeals || 0
        });
      } else {
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
      const allPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      
      // Filter plans by current user - same as Analytics
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const userPlans = currentUser ? allPlans.filter(plan => {
        return plan.userId === currentUser.id || plan.userId === currentUser._id ||
               (!plan.userId && plan.synced === false);
      }) : [];
      
      const totalWorkouts = contextStats.totalWorkouts || 0;
      const totalPlans = contextStats.totalPlans || userPlans.length;
      
      setStats({
        totalWorkouts,
        totalPlans,
        totalMeals: meals.length
      });
    } catch (error) {
      console.error('Error loading local stats:', error);
      setStats({
        totalWorkouts: 0,
        totalPlans: 0,
        totalMeals: 0
      });
    }
  };

  useEffect(() => {
    if (contextStats.totalWorkouts !== undefined) {
      setStats(prev => ({
        ...prev,
        totalWorkouts: contextStats.totalWorkouts,
        totalPlans: contextStats.totalPlans || prev.totalPlans
      }));
    }
  }, [contextStats]);

  useEffect(() => {
    loadRealTimeStats();
    
    const handleWorkoutComplete = () => {
      console.log('🏋️ Workout completed - refreshing stats');
      loadRealTimeStats();
    };
    
    // INSTANT PLAN UPDATES - Same as Analytics
    const getUserPlanCount = () => {
      const allPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (!currentUser) return 0;
      
      const userPlans = allPlans.filter(plan => {
        return plan.userId === currentUser.id || plan.userId === currentUser._id ||
               (!plan.userId && plan.synced === false);
      });
      return userPlans.length;
    };
    
    const handlePlanCreated = () => {
      console.log('📋 RealTimeStats: Plan created - instant update');
      const userPlanCount = getUserPlanCount();
      setStats(prev => ({ ...prev, totalPlans: userPlanCount }));
    };
    
    const handlePlanUpdated = () => {
      const userPlanCount = getUserPlanCount();
      setStats(prev => ({ ...prev, totalPlans: userPlanCount }));
    };
    
    const handlePlanDeleted = () => {
      const userPlanCount = getUserPlanCount();
      setStats(prev => ({ ...prev, totalPlans: userPlanCount }));
    };
    
    const handleDashboardUpdate = (event) => {
      if (event.detail && (event.detail.type === 'planCreated' || event.detail.type === 'planDeleted' || event.detail.type === 'planSynced')) {
        const userPlanCount = getUserPlanCount();
        setStats(prev => ({ ...prev, totalPlans: userPlanCount }));
      }
    };
    
    const handleMealAdded = () => loadRealTimeStats();
    
    window.addEventListener('workoutCompleted', handleWorkoutComplete);
    window.addEventListener('planCreated', handlePlanCreated);
    window.addEventListener('planUpdated', handlePlanUpdated);
    window.addEventListener('planDeleted', handlePlanDeleted);
    window.addEventListener('dashboardUpdate', handleDashboardUpdate);
    window.addEventListener('mealAdded', handleMealAdded);
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutComplete);
      window.removeEventListener('planCreated', handlePlanCreated);
      window.removeEventListener('planUpdated', handlePlanUpdated);
      window.removeEventListener('planDeleted', handlePlanDeleted);
      window.removeEventListener('dashboardUpdate', handleDashboardUpdate);
      window.removeEventListener('mealAdded', handleMealAdded);
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
      default:
        return 'Ready to start!';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {loading ? (
        Array.from({ length: 2 }).map((_, i) => (
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
            path: '/workouts'
          },
          { 
            label: 'Workout Plans', 
            value: formatNumber(stats.totalPlans), 
            color: 'text-green-400',
            icon: '📋',
            path: '/my-plans'
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
              <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-slate-400 mb-1">
                {stat.label}
              </div>
              <div className={`text-xs ${
                (stat.label === 'Total Workouts' && stats.totalWorkouts > 0) ||
                (stat.label === 'Workout Plans' && stats.totalPlans > 0)
                  ? 'text-green-400' 
                  : 'text-gray-400'
              }`}>
                {getStatMessage(stat.label, 
                  stat.label === 'Total Workouts' ? stats.totalWorkouts :
                  stat.label === 'Workout Plans' ? stats.totalPlans : 0
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}