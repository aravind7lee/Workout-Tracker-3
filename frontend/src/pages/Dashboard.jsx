// Real-Time MongoDB Dashboard - INSTANT PLAN UPDATES
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';


import { useRealTimeDashboard } from '../hooks/useRealTimeDashboard';
import { useRealTimeWorkouts } from '../hooks/useRealTimeWorkouts';
import DashboardHero from '../components/DashboardHero';
import AuthGuard from '../components/AuthGuard';
import DashboardErrorBoundary from '../components/DashboardErrorBoundary';

import api from '../utils/api';
import Dashboard1 from '../assets/Dashboard1.jpg';
import Dashboard2 from '../assets/Dashboard2.jpg';
import DashboardImageCard from '../components/DashboardImageCard';

const Dashboard = () => {
  const { user: authUser, logout, isAuthenticated, loading: authLoading } = useAuth();
  const { stats, isOnline, loading: statsLoading, refreshStats } = useRealTime();
  const { stats: workoutStats, refreshStats: refreshWorkoutStats } = useRealTimeWorkouts();

  

  // Achievement system removed
  
  // REAL-TIME DASHBOARD HOOK - INSTANT PLAN UPDATES
  const {
    dashboardStats,
    planStats,
    recentPlans,
    syncStatus: planSyncStatus,
    refreshDashboard,
    forceSync,
    isOnline: plansOnline,
    isRealTime,
    lastSync: planLastSync
  } = useRealTimeDashboard();
  
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [showAllWorkouts, setShowAllWorkouts] = useState(false);
  const [showAllPlans, setShowAllPlans] = useState(false);

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
      if (!authLoading && !isAuthenticated()) {
        setLoading(false);
        return;
      }
      
      console.log('🚀 Loading REAL-TIME dashboard data...');
      
      // Get workouts from real-time sync service first
      const localWorkouts = window.realTimeWorkoutSync?.getWorkoutHistory(30) || [];
      setRecentWorkouts(localWorkouts);
      console.log('✅ Real-time workouts loaded:', localWorkouts.length);
      
      // Try to load from MongoDB backend as well
      try {
        const response = await api.get('/workouts');
        if (response?.data) {
          const mongoWorkouts = Array.isArray(response.data.workouts) ? response.data.workouts : 
                               Array.isArray(response.data) ? response.data : [];
          
          const realCompletedWorkouts = mongoWorkouts.filter(workout => 
            workout.completed === true || workout.completedAt
          );
          
          // Combine and deduplicate
          const allWorkouts = [...localWorkouts, ...realCompletedWorkouts];
          const uniqueWorkouts = allWorkouts.filter((workout, index, self) => 
            index === self.findIndex(w => w.id === workout.id || 
              (w.exercise === workout.exercise && w.completedAt === workout.completedAt))
          );
          
          setRecentWorkouts(uniqueWorkouts); // Show all workouts
          console.log('✅ Combined workouts loaded:', uniqueWorkouts.length);
        }
      } catch (apiError) {
        console.warn('⚠️ MongoDB load failed, using local data:', apiError.message);
      }
      
    } catch (error) {
      console.error('❌ Dashboard load error:', error.message);
      // Fallback to real-time sync data
      const fallbackWorkouts = window.realTimeWorkoutSync?.getWorkoutHistory(30) || [];
      setRecentWorkouts(fallbackWorkouts);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      setLoading(false);
      return;
    }
    
    if (authLoading) {
      return;
    }
    
    loadDashboardData();
    
    // Listen for real-time events
    const handleWorkoutCompleted = (event) => {
      console.log('🏋️ Dashboard: Workout completed - refreshing data');
      
      // Get fresh workouts from real-time sync
      const freshWorkouts = window.realTimeWorkoutSync?.getWorkoutHistory(30) || [];
      setRecentWorkouts(freshWorkouts);
      
      // Show completion message if event has details
      if (event.detail) {
        const { workout, exercise, duration, sets, offline } = event.detail;
        setCompletionData({ exercise, duration, sets, offline });
        setShowCompletionMessage(true);
        setTimeout(() => setShowCompletionMessage(false), 5000);
      }
      
      // Refresh stats
      refreshStats();
      
      // Full refresh after short delay
      setTimeout(() => loadDashboardData(), 1000);
    };
    

    
    const handlePlanCreated = () => {
      console.log('📋 Plan created - refreshing dashboard');
      loadDashboardData();
    };
    
    const handleMealAdded = () => {
      console.log('🍽️ Meal added - refreshing stats');
      refreshStats();
    };
    
    const handleMealDeleted = () => {
      console.log('🗑️ Meal deleted - refreshing stats');
      refreshStats();
    };
    
    window.addEventListener('workoutCompleted', handleWorkoutCompleted);

    window.addEventListener('planCreated', handlePlanCreated);
    window.addEventListener('mealAdded', handleMealAdded);
    window.addEventListener('mealDeleted', handleMealDeleted);
    
    // NO AUTOMATIC REFRESH - MANUAL ONLY
    // const refreshInterval = setInterval(() => {
    //   if (isAuthenticated()) {
    //     refreshStats();
    //     loadDashboardData();
    //   }
    // }, 600000); // Disabled to prevent API spam
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutCompleted);

      window.removeEventListener('planCreated', handlePlanCreated);
      window.removeEventListener('mealAdded', handleMealAdded);
      window.removeEventListener('mealDeleted', handleMealDeleted);
      // clearInterval(refreshInterval); // Disabled
    };
  }, [isAuthenticated, refreshStats]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered - REAL-TIME SYNC');
    refreshStats();
    loadDashboardData();
    await refreshDashboard();
  };
  
  const handleForceSync = async () => {
    console.log('🚀 Force sync triggered - INSTANT UPDATES');
    const result = await forceSync();
    if (result.success) {
      console.log('✅ Force sync completed successfully');
    } else {
      console.error('❌ Force sync failed:', result.error);
    }
  };

  if (loading || authLoading) {
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
      <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      
      {/* Notification removed as requested */}
      
      {/* Header */}
      <div className="card">
        <div className="flex flex-col gap-4">
          {/* Welcome Section */}
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
              Welcome back{authUser?.name ? `, ${authUser.name}` : ''}! 👋
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Track your progress, manage workouts, and achieve your fitness goals efficiently.
            </p>
          </div>
          
          {/* Status Section */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                plansOnline ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
              }`}>
                {plansOnline ? '🚀' : '❌'}
                {plansOnline ? 'REAL-TIME MongoDB + INSTANT Plan Updates' : 'MongoDB connection failed'}
              </span>
              {planLastSync && (
                <span className="text-slate-500 bg-slate-800/50 px-2 py-1 rounded-full">
                  Plans sync: {new Date(planLastSync).toLocaleTimeString()}
                </span>
              )}
              {planSyncStatus !== 'idle' && (
                <span className={`px-2 py-1 rounded-full ${
                  planSyncStatus === 'syncing' ? 'bg-blue-900/30 text-blue-400' :
                  planSyncStatus === 'synced' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                }`}>
                  {planSyncStatus === 'syncing' ? '🔄 Syncing...' : 
                      planSyncStatus === 'synced' ? '✅ Synced' : '❌ Sync Error'}
                </span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleRefresh}
              className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm flex-1 sm:flex-none"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleForceSync}
              disabled={planSyncStatus === 'syncing'}
              className="btn bg-green-600 hover:bg-green-700 text-white text-sm flex-1 sm:flex-none disabled:opacity-50"
            >
              {planSyncStatus === 'syncing' ? '🔄 Syncing...' : '⚡ Force Sync'}
            </button>

            <button
              onClick={handleLogout}
              className="btn bg-red-600 hover:bg-red-700 text-white text-sm flex-1 sm:flex-none"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Feature Sections - After Header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <DashboardImageCard
          image={Dashboard1}
          title="TRANSFORM YOUR FITNESS JOURNEY"
          description="Track every rep, celebrate every milestone, and watch your strength transform with intelligent analytics that fuel your motivation."
          gradient="from-blue-400 to-cyan-400"
          glowColor="blue"
          badgeText=""
          badgeIcon="✨"
        />

        <DashboardImageCard
          image={Dashboard2}
          title="ELEVATE YOUR PERFORMANCE"
          description="Unlock your potential with custom workout plans designed for your goals, backed by smart insights that evolve with your journey."
          gradient="from-green-400 to-emerald-400"
          glowColor="green"
          badgeText=""
          badgeIcon="💫"
        />
      </div>

      {/* Real-Time Stats - MongoDB Data Only */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        <button 
          onClick={() => navigate('/workouts')}
          className="card cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 text-left relative p-3 sm:p-4"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-base sm:text-lg lg:text-2xl">💪</span>
            </div>
            <div className="min-w-0 text-center sm:text-left">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{workoutStats?.totalWorkouts || stats?.totalWorkouts || 0}</div>
              <div className="text-slate-400 text-xs sm:text-sm">Total Workouts</div>
              <div className="text-xs text-green-400 hidden sm:block">
                {(workoutStats?.totalWorkouts || stats?.totalWorkouts || 0) > 0 ? `${workoutStats?.totalWorkouts || stats?.totalWorkouts} completed by you!` : 'Start your first workout'}
              </div>
            </div>
          </div>
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xs text-blue-400/70">
            {workoutStats?.lastUpdate ? '🔴' : isOnline && stats.isRealTime ? '🔴' : '❌'}
          </div>
        </button>
        

        
        <button 
          onClick={() => navigate('/analytics')}
          className="card cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 text-left relative p-3 sm:p-4"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-base sm:text-lg lg:text-2xl">📊</span>
            </div>
            <div className="min-w-0 text-center sm:text-left">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{workoutStats?.weeklyWorkouts || stats?.weeklyWorkouts || 0}</div>
              <div className="text-slate-400 text-xs sm:text-sm">This Week</div>
              <div className="text-xs text-green-400 hidden sm:block">
                {(workoutStats?.weeklyWorkouts || stats?.weeklyWorkouts || 0) > 0 ? `${workoutStats?.weeklyWorkouts || stats?.weeklyWorkouts} by you this week!` : 'No workouts yet'}
              </div>
            </div>
          </div>
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xs text-green-400/70">
            {isOnline && stats.isRealTime ? '🔴' : '❌'}
          </div>
        </button>
        

        
        <button 
          onClick={() => navigate('/my-plans')}
          className="card cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 text-left relative p-3 sm:p-4"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-base sm:text-lg lg:text-2xl">📋</span>
            </div>
            <div className="min-w-0 text-center sm:text-left">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                {dashboardStats.totalPlans}
                {planSyncStatus === 'syncing' && (
                  <div className="animate-spin w-3 h-3 sm:w-4 sm:h-4 border border-orange-500 border-t-transparent rounded-full"></div>
                )}
              </div>
              <div className="text-slate-400 text-xs sm:text-sm">Workout Plans</div>
              <div className="text-xs text-green-400 hidden sm:block">
                {dashboardStats.totalPlans > 0 ? `${dashboardStats.totalPlans} plans ready • REAL-TIME` : 'Create your first plan'}
              </div>
            </div>
          </div>
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xs text-orange-400/70">
            {plansOnline && isRealTime ? '🚀' : '❌'}
          </div>
        </button>
        

      </div>

      {/* Real-Time Quick Actions */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white">Quick Actions</h2>
          <div className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Real-time Data
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <button 
            onClick={() => navigate('/library')}
            className="btn bg-blue-600 hover:bg-blue-700 text-white flex-col h-auto py-3 sm:py-4 lg:py-6 transition-all hover:scale-105 relative text-center"
          >
            <div className="text-xl sm:text-2xl lg:text-3xl mb-1 sm:mb-2">📚</div>
            <div className="font-medium text-xs sm:text-sm lg:text-base">Exercise Library</div>
            <div className="text-xs text-blue-200 mt-1 hidden sm:block">
              Browse exercises
            </div>
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xs text-blue-300/70">
              {isOnline && stats.isRealTime ? '🔴' : '❌'}
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/my-plans')}
            className="btn bg-green-600 hover:bg-green-700 text-white flex-col h-auto py-3 sm:py-4 lg:py-6 transition-all hover:scale-105 relative text-center"
          >
            <div className="text-xl sm:text-2xl lg:text-3xl mb-1 sm:mb-2">📋</div>
            <div className="font-medium text-xs sm:text-sm lg:text-base flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
              <span className="whitespace-nowrap">My Plans ({dashboardStats.totalPlans})</span>
              {planSyncStatus === 'syncing' && (
                <div className="animate-spin w-3 h-3 border border-green-300 border-t-transparent rounded-full"></div>
              )}
            </div>
            <div className="text-xs text-green-200 mt-1 px-1 leading-tight">
              {dashboardStats.totalPlans > 0 ? (
                <>
                  <span className="block sm:hidden">{dashboardStats.totalPlans} plans</span>
                  <span className="hidden sm:block">{dashboardStats.totalPlans} plans • INSTANT</span>
                </>
              ) : (
                <span className="block">Create first plan</span>
              )}
            </div>
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xs text-green-300/70">
              {plansOnline && isRealTime ? '🚀' : '❌'}
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
              View your progress
            </div>
            <div className="absolute top-2 right-2 text-xs text-purple-300/70">
              {isOnline && stats.isRealTime ? '🔴' : '❌'}
            </div>
          </button>
        </div>
      </div>

      {/* Saved Plans */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white">My Workout Plans</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {recentPlans && recentPlans.length > 3 && (
              <button
                onClick={() => setShowAllPlans(!showAllPlans)}
                className="btn bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm"
              >
                {showAllPlans ? 'Show Less' : `Show More (${recentPlans.length})`}
              </button>
            )}
            <button
              onClick={() => navigate('/plans')}
              className="btn bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm w-full sm:w-auto"
            >
              + Create Plan
            </button>
          </div>
        </div>
        {!recentPlans || recentPlans.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-4">📋</div>
            <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">
              {dashboardStats.loading ? 'Loading plans...' : 'No workout plans yet. Create your first plan!'}
            </p>
            <div className="text-xs text-slate-500 mb-4">
              {plansOnline ? '🚀 Real-time MongoDB data' : '📱 Offline mode'}
            </div>
            <button 
              onClick={() => navigate('/plans')}
              className="btn bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              Create Plan
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                {plansOnline ? 'REAL-TIME MongoDB Plans' : 'Local Plans'}
              </span>
              <span className="text-xs text-slate-400">
                {dashboardStats.totalPlans} total • {planStats.syncedPlans} synced
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {(showAllPlans ? recentPlans : recentPlans.slice(0, 3)).map((plan, index) => (
                <div key={plan.id || index} className="p-3 sm:p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors relative">
                  {/* Sync Status Badge */}
                  <div className="absolute top-2 right-2">
                    {plan.synced ? (
                      <div className="w-2 h-2 bg-green-400 rounded-full" title="Synced to MongoDB"></div>
                    ) : (
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title="Pending sync"></div>
                    )}
                  </div>
                  
                  <div className="flex items-start justify-between mb-3 pr-4">
                    <h3 className="font-medium text-white text-sm sm:text-base truncate">{plan.name || 'Unnamed Plan'}</h3>
                    <span className="text-xs text-slate-400 bg-slate-600/50 px-2 py-1 rounded flex-shrink-0 ml-2">
                      {plan.category || 'General'}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 mb-3">
                    {plan.exercises?.length || 0} {(plan.exercises?.length || 0) === 1 ? 'exercise' : 'exercises'}
                    {plan.isTemp && <span className="text-yellow-400 ml-2">• Creating...</span>}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const workoutId = plan.id || plan.tempId || `temp_${Date.now()}`;
                        console.log('🚀 Starting workout for plan:', plan.name, 'ID:', workoutId);
                        navigate(`/workout/${workoutId}`);
                      }}
                      className="btn bg-green-600 hover:bg-green-700 text-white text-xs flex-1 font-medium"
                      title={`Start workout: ${plan.name}`}
                    >
                      🏋️ Start Workout
                    </button>
                    <button 
                      onClick={() => navigate('/my-plans')}
                      className="btn bg-blue-600 hover:bg-blue-700 text-white text-xs flex-1"
                    >
                      📋 View All
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>



      {/* Recent Workouts */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white">Recent Workouts</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {recentWorkouts.length > 5 && (
              <button
                onClick={() => setShowAllWorkouts(!showAllWorkouts)}
                className="btn bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
              >
                {showAllWorkouts ? 'Show Less' : `Show More (${recentWorkouts.length})`}
              </button>
            )}
            <button
              onClick={() => navigate('/my-plans')}
              className="btn bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
            >
              🏋️ Start Workout
            </button>
          </div>
        </div>
        {!recentWorkouts || recentWorkouts.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-4">🏋️</div>
            <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">
              {isOnline ? `No completed workouts found for your account (${authUser?.name || 'User'}).` : 'No completed workouts found in your local storage.'}
            </p>
            <p className="text-xs text-slate-500 mb-4">
              {isOnline ? `Real-time data from MongoDB for user: ${authUser?.id || 'Unknown'}` : 'Offline data from device storage'}
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
                {isOnline ? `Real-time data for ${authUser?.name || 'you'}` : 'Your local workouts'}
              </span>
              <span className="text-xs text-slate-400">
                {recentWorkouts.length} your workout{recentWorkouts.length !== 1 ? 's' : ''}
              </span>
            </div>
            {(showAllWorkouts ? recentWorkouts : recentWorkouts.slice(0, 5)).map((workout, index) => (
              <div key={workout.id || index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors border-l-2 sm:border-l-4 border-green-500">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-white text-sm sm:text-base truncate">
                    {workout.exercise || workout.planName || workout.exerciseName || 'Workout Session'}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span>{workout.exercises?.length || 1} exercise{(workout.exercises?.length || 1) !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span className="text-green-400 font-medium">✓ Completed</span>
                    {workout.synced && <span className="text-blue-400">☁️ Synced</span>}

                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    <div className="text-xs sm:text-sm text-slate-400 flex-shrink-0">
                      {workout.completedAt ? (
                        new Date(workout.completedAt).toLocaleDateString() === new Date().toLocaleDateString() 
                          ? 'Today' 
                          : new Date(workout.completedAt).toLocaleDateString()
                      ) : 'Today'}
                    </div>
                    <button
                      onClick={() => {
                        const workoutId = workout.planId || workout.id;
                        if (workoutId) {
                          console.log('🔄 Repeating workout:', workout.exercise || workout.planName, 'ID:', workoutId);
                          navigate(`/workout/${workoutId}`);
                        } else {
                          console.warn('⚠️ Workout ID missing, redirecting to plans');
                          navigate('/my-plans');
                        }
                      }}
                      className="btn bg-orange-600 hover:bg-orange-700 text-white text-xs px-2 sm:px-3 py-1 w-full sm:w-auto"
                      title={`Repeat workout: ${workout.exercise || workout.planName || 'Workout Session'}`}
                    >
                      🔄 Repeat
                    </button>
                  </div>
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