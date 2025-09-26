// Real-Time MongoDB Dashboard - Online Mode Only
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
import { useStreak } from '../context/StreakContext';
import { useAchievements } from '../context/AchievementsContext';
import DashboardHero from '../components/DashboardHero';
import AuthGuard from '../components/AuthGuard';
import DashboardErrorBoundary from '../components/DashboardErrorBoundary';
import api from '../utils/api';

const Dashboard = () => {
  const { user: authUser, logout, isAuthenticated } = useAuth();
  const { stats, isOnline, loading: statsLoading, refreshStats } = useRealTime();
  const { currentStreak, longestStreak, totalCheckIns } = useStreak();
  const { unlockedCount, totalCount, currentXP, completionPercentage, isOnline: achievementsOnline, checkAchievements } = useAchievements();
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  const navigate = useNavigate();

  const checkOnlineStatus = async () => {
    try {
      const response = await api.get('/health');
      const online = response.status === 200;
      console.log('🔗 Backend status:', online ? 'ONLINE' : 'OFFLINE');
      return online;
    } catch (error) {
      console.warn('⚠️ Backend check failed:', error.message);
      return false;
    }
  };

  const loadDashboardData = async () => {
    try {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }
      
      console.log('🚀 Loading REAL-TIME MongoDB dashboard data...');
      
      // Load REAL-TIME data from MongoDB backend
      const [userPlans, completedWorkouts] = await Promise.allSettled([
        api.get('/plans'),
        api.get('/workouts')
      ]);
      
      // Set REAL plans from MongoDB
      if (userPlans.status === 'fulfilled' && userPlans.value?.data) {
        const plans = Array.isArray(userPlans.value.data.plans) ? userPlans.value.data.plans : 
                     Array.isArray(userPlans.value.data) ? userPlans.value.data : [];
        setSavedPlans(plans);
        console.log('✅ Real plans loaded:', plans.length);
      } else {
        setSavedPlans([]);
        console.log('⚠️ No plans found or failed to load');
      }
      
      // Set REAL completed workouts from MongoDB
      if (completedWorkouts.status === 'fulfilled' && completedWorkouts.value?.data) {
        const workouts = Array.isArray(completedWorkouts.value.data.workouts) ? completedWorkouts.value.data.workouts : 
                        Array.isArray(completedWorkouts.value.data) ? completedWorkouts.value.data : [];
        
        // Only show completed workouts
        const realCompletedWorkouts = workouts.filter(workout => 
          workout.completed === true || workout.completedAt
        );
        setRecentWorkouts(realCompletedWorkouts);
        console.log('✅ Real workouts loaded:', realCompletedWorkouts.length);
      } else {
        setRecentWorkouts([]);
        console.log('⚠️ No workouts found or failed to load');
      }
      
      console.log('✅ Real-time MongoDB dashboard data loaded successfully');
      
    } catch (error) {
      console.error('❌ Dashboard load error:', error.message);
      // Set empty states on error
      setSavedPlans([]);
      setRecentWorkouts([]);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    
    loadDashboardData();
    
    // Listen for real-time events
    const handleWorkoutCompleted = (event) => {
      const { workout, exercise, duration, sets, offline } = event.detail;
      
      setCompletionData({ exercise, duration, sets, offline });
      setShowCompletionMessage(true);
      
      // Add REAL completed workout to the list
      const newCompletedWorkout = {
        id: workout.id || Date.now(),
        planName: workout.title || workout.exerciseName || exercise,
        exercises: workout.exercises || [{ exercise: workout.exerciseName || exercise }],
        duration: Math.floor(duration / 60) || workout.durationMinutes,
        completedAt: new Date(),
        completed: true,
        synced: !offline,
        xpEarned: (sets * 10) + 50
      };
      
      setRecentWorkouts(prev => [newCompletedWorkout, ...prev]);
      
      // Refresh real-time stats
      refreshStats();
      
      // Check for new achievements
      checkAchievements();
      
      setTimeout(() => setShowCompletionMessage(false), 5000);
      setTimeout(() => loadDashboardData(), 2000);
    };
    
    const handleStreakUpdated = () => {
      console.log('🔥 Streak updated - refreshing dashboard');
      refreshStats();
      loadDashboardData();
    };
    
    const handlePlanCreated = () => {
      console.log('📋 Plan created - refreshing dashboard');
      loadDashboardData();
    };
    
    const handleMealAdded = () => {
      console.log('🍽️ Meal added - refreshing stats');
      refreshStats();
    };
    
    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    window.addEventListener('streakUpdated', handleStreakUpdated);
    window.addEventListener('planCreated', handlePlanCreated);
    window.addEventListener('mealAdded', handleMealAdded);
    
    // Real-time refresh interval - every 2 minutes
    const refreshInterval = setInterval(() => {
      if (isAuthenticated()) {
        refreshStats();
        loadDashboardData();
      }
    }, 120000); // 2 minutes
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutCompleted);
      window.removeEventListener('streakUpdated', handleStreakUpdated);
      window.removeEventListener('planCreated', handlePlanCreated);
      window.removeEventListener('mealAdded', handleMealAdded);
      clearInterval(refreshInterval);
    };
  }, [isAuthenticated, refreshStats]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    refreshStats();
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardErrorBoundary>
      <AuthGuard>
        <div>
        {/* Dashboard Hero Section - Full Viewport */}
        <DashboardHero />
      
      {/* Dashboard Content */}
      <div className="space-y-4 sm:space-y-6 px-4 py-8">
      
      {/* Workout Completion Notification */}
      {showCompletionMessage && completionData && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white p-4 rounded-lg shadow-lg border border-green-500 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <div className="font-bold">Workout Completed!</div>
              <div className="text-sm opacity-90">
                {completionData.exercise} • {Math.floor(completionData.duration / 60)}:{(completionData.duration % 60).toString().padStart(2, '0')} • {completionData.sets} sets
              </div>
              <div className="text-xs opacity-75">
                {completionData.offline ? '💾 Saved offline' : '☁️ Synced online'} • +{completionData.sets * 10 + 50} XP
              </div>
            </div>
            <button 
              onClick={() => setShowCompletionMessage(false)}
              className="text-white hover:text-green-200 ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              Welcome back{authUser?.name ? `, ${authUser.name}` : ''}! 👋
            </h1>
            <p className="text-slate-400 mt-1 text-sm sm:text-base">
              Track your progress, manage workouts, and achieve your fitness goals efficiently.
              <span className={`ml-2 text-xs preserve-color ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                • {isOnline ? '🔥 Real-time MongoDB tracking active' : '❌ MongoDB connection failed'}
              </span>
              {stats.lastSync && (
                <span className="ml-2 text-xs text-slate-500">
                  Last sync: {new Date(stats.lastSync).toLocaleTimeString()}
                </span>
              )}
            </p>

          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleRefresh}
              className="btn bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleLogout}
              className="btn bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-none"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Stats - MongoDB Data Only */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <button 
          onClick={() => navigate('/analytics')}
          className="card cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 text-left relative"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl">💪</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.totalWorkouts || 0}</div>
              <div className="text-slate-400 text-xs sm:text-sm">Total Workouts</div>
              <div className="text-xs text-green-400">
                {stats.totalWorkouts > 0 ? `${stats.totalWorkouts} completed!` : 'Start your first workout'}
              </div>
            </div>
          </div>
          <div className="absolute top-2 right-2 text-xs text-blue-400/70">
            {isOnline && stats.isRealTime ? '🔴 LIVE' : '❌ OFFLINE'}
          </div>
          <div className="absolute bottom-2 right-2 text-blue-400/50 text-xs">→</div>
        </button>
        
        <button 
          onClick={() => navigate('/current-streak')}
          className="card cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 text-left relative"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl">🔥</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-white">
                {stats.currentStreak > 0 ? `${stats.currentStreak}🔥` : '0🔥'}
              </div>
              <div className="text-slate-400 text-xs sm:text-sm">Current Streak</div>
              <div className="text-xs text-green-400">
                {stats.currentStreak > 0 ? `${stats.currentStreak} days strong!` : 'Start your streak'}
              </div>
            </div>
          </div>
          <div className="absolute top-2 right-2 text-xs text-red-400/70">
            {isOnline && stats.isRealTime ? '🔴 LIVE' : '❌ OFFLINE'}
          </div>
          <div className="absolute bottom-2 right-2 text-red-400/50 text-xs">→</div>
        </button>
        
        <button 
          onClick={() => navigate('/analytics')}
          className="card cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 text-left relative"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl">📊</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.weeklyGoal?.completed || 0}</div>
              <div className="text-slate-400 text-xs sm:text-sm">This Week</div>
              <div className="text-xs text-green-400">
                {stats.weeklyGoal?.completed > 0 ? `${stats.weeklyGoal.completed} this week!` : 'No workouts yet'}
              </div>
            </div>
          </div>
          <div className="absolute top-2 right-2 text-xs text-green-400/70">
            {isOnline && stats.isRealTime ? '🔴 LIVE' : '❌ OFFLINE'}
          </div>
          <div className="absolute bottom-2 right-2 text-green-400/50 text-xs">→</div>
        </button>
        
        <button 
          onClick={() => navigate('/xp-points')}
          className="card cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 text-left relative"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl">⭐</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.xpPoints || 0}</div>
              <div className="text-slate-400 text-xs sm:text-sm">XP Points</div>
              <div className="text-xs text-green-400">
                {stats.xpPoints > 0 ? `Level ${Math.floor(stats.xpPoints / 100) + 1}` : 'Earn XP by working out'}
              </div>
            </div>
          </div>
          <div className="absolute top-2 right-2 text-xs text-purple-400/70">
            {isOnline && stats.isRealTime ? '🔴 LIVE' : '❌ OFFLINE'}
          </div>
          <div className="absolute bottom-2 right-2 text-purple-400/50 text-xs">→</div>
        </button>
        
        <button 
          onClick={() => navigate('/my-plans')}
          className="card cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 text-left relative"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl">📋</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-white">{savedPlans.length}</div>
              <div className="text-slate-400 text-xs sm:text-sm">Workout Plans</div>
              <div className="text-xs text-green-400">
                {savedPlans.length > 0 ? `${savedPlans.length} plans ready` : 'Create your first plan'}
              </div>
            </div>
          </div>
          <div className="absolute top-2 right-2 text-xs text-orange-400/70">
            {isOnline && stats.isRealTime ? '🔴 LIVE' : '❌ OFFLINE'}
          </div>
          <div className="absolute bottom-2 right-2 text-orange-400/50 text-xs">→</div>
        </button>
        
        <button 
          onClick={() => navigate('/achievements')}
          className="card cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 text-left relative"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl">🏆</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                {unlockedCount}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${achievementsOnline ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {achievementsOnline ? 'LIVE' : 'LOCAL'}
                </span>
              </div>
              <div className="text-slate-400 text-xs sm:text-sm">Achievements</div>
              <div className="text-xs text-green-400">
                {unlockedCount > 0 ? `${completionPercentage}% • ${currentXP.toLocaleString()} XP` : 'Start earning achievements'}
              </div>
            </div>
          </div>
          <div className="absolute bottom-2 right-2 text-yellow-400/50 text-xs">→</div>
        </button>
      </div>

      {/* Real-Time Quick Actions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Quick Actions</h2>
          <div className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Real-time Data
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button 
            onClick={() => navigate('/library')}
            className="btn bg-blue-600 hover:bg-blue-700 text-white flex-col h-auto py-4 sm:py-6 transition-all hover:scale-105 relative"
          >
            <div className="text-2xl sm:text-3xl mb-2">📚</div>
            <div className="font-medium text-sm sm:text-base">Exercise Library</div>
            <div className="text-xs text-blue-200 mt-1">
              Browse exercises
            </div>
            <div className="absolute top-2 right-2 text-xs text-blue-300/70">
              {isOnline && stats.isRealTime ? '🔴' : '❌'}
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/my-plans')}
            className="btn bg-green-600 hover:bg-green-700 text-white flex-col h-auto py-4 sm:py-6 transition-all hover:scale-105 relative"
          >
            <div className="text-2xl sm:text-3xl mb-2">📋</div>
            <div className="font-medium text-sm sm:text-base">My Plans ({savedPlans.length})</div>
            <div className="text-xs text-green-200 mt-1">
              {savedPlans.length > 0 ? `${savedPlans.length} plans ready` : 'Create your first plan'}
            </div>
            <div className="absolute top-2 right-2 text-xs text-green-300/70">
              {isOnline && stats.isRealTime ? '🔴' : '❌'}
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/nutrition')}
            className="btn bg-orange-600 hover:bg-orange-700 text-white flex-col h-auto py-4 sm:py-6 transition-all hover:scale-105 relative"
          >
            <div className="text-2xl sm:text-3xl mb-2">🍎</div>
            <div className="font-medium text-sm sm:text-base">Meal Planner</div>
            <div className="text-xs text-orange-200 mt-1">
              {stats.totalMeals > 0 ? `${stats.totalMeals} meals logged` : 'Track your nutrition'}
            </div>
            <div className="absolute top-2 right-2 text-xs text-orange-300/70">
              {isOnline && stats.isRealTime ? '🔴' : '❌'}
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/analytics')}
            className="btn bg-purple-600 hover:bg-purple-700 text-white flex-col h-auto py-4 sm:py-6 transition-all hover:scale-105 relative"
          >
            <div className="text-2xl sm:text-3xl mb-2">📊</div>
            <div className="font-medium text-sm sm:text-base">Analytics</div>
            <div className="text-xs text-purple-200 mt-1">
              {stats.totalWorkouts > 0 ? `${stats.totalWorkouts} workouts tracked` : 'View your progress'}
            </div>
            <div className="absolute top-2 right-2 text-xs text-purple-300/70">
              {isOnline && stats.isRealTime ? '🔴' : '❌'}
            </div>
          </button>
        </div>
      </div>

      {/* Saved Plans */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white">My Workout Plans</h2>
          <button
            onClick={() => navigate('/plans')}
            className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            + Create Plan
          </button>
        </div>
        {!savedPlans || savedPlans.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-4">📋</div>
            <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">No workout plans yet. Create your first plan!</p>
            <button 
              onClick={() => navigate('/plans')}
              className="btn bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              Create Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPlans.slice(0, 3).map((plan, index) => (
              <div key={plan.id || index} className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-white text-sm sm:text-base truncate">{plan.name || 'Unnamed Plan'}</h3>
                  <span className="text-xs text-slate-400 bg-slate-600/50 px-2 py-1 rounded flex-shrink-0 ml-2">
                    {plan.category || 'General'}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-400 mb-3">
                  {plan.exercises?.length || 0} {(plan.exercises?.length || 0) === 1 ? 'exercise' : 'exercises'}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/workout/${plan.id}`)}
                    className="btn-secondary text-xs flex-1"
                  >
                    Start
                  </button>
                  <button 
                    onClick={() => navigate('/my-plans')}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white text-xs flex-1"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Workouts */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Recent Workouts</h2>
          <button
            onClick={() => navigate('/my-plans')}
            className="btn bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            🏋️ Start Workout
          </button>
        </div>
        {!recentWorkouts || recentWorkouts.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-4">🏋️</div>
            <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">
              {isOnline ? 'No completed workouts found in your account.' : 'No completed workouts found locally.'}
            </p>
            <p className="text-xs text-slate-500 mb-4">
              {isOnline ? 'Real-time data from MongoDB' : 'Offline data from device storage'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => navigate('/my-plans')}
                className="btn bg-blue-600 hover:bg-blue-700 text-white"
              >
                View My Plans
              </button>
              <button 
                onClick={() => navigate('/library')}
                className="btn-secondary"
              >
                Browse Exercises
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                {isOnline ? 'Real-time MongoDB data' : 'Local completed workouts'}
              </span>
              <span className="text-xs text-slate-400">
                {recentWorkouts.length} completed workout{recentWorkouts.length !== 1 ? 's' : ''}
              </span>
            </div>
            {recentWorkouts.slice(0, 5).map((workout, index) => (
              <div key={workout.id || index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors border-l-4 border-green-500">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-white text-sm sm:text-base truncate">
                    {workout.planName || workout.exerciseName || 'Workout Session'}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span>{workout.exercises?.length || 1} exercise{(workout.exercises?.length || 1) !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>{workout.duration || 0} min</span>
                    <span>•</span>
                    <span className="text-green-400 font-medium">✓ Completed</span>
                    {workout.synced && <span className="text-blue-400">☁️ Synced</span>}
                    {workout.xpEarned && <span className="text-purple-400">+{workout.xpEarned} XP</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs sm:text-sm text-slate-400 flex-shrink-0">
                    {workout.completedAt ? (
                      new Date(workout.completedAt).toLocaleDateString() === new Date().toLocaleDateString() 
                        ? 'Today' 
                        : new Date(workout.completedAt).toLocaleDateString()
                    ) : 'Today'}
                  </div>
                  <button
                    onClick={() => navigate(`/workout/${workout.planId || workout.id}`)}
                    className="btn-secondary text-xs px-3 py-1"
                  >
                    Repeat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </div>
      </div>
      </AuthGuard>
    </DashboardErrorBoundary>
  );
};

export default Dashboard;