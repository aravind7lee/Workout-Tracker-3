// src/pages/Dashboard.jsx - OFFLINE FIRST DASHBOARD
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { planService } from '../services/planService';
import { workoutService } from '../services/workoutService';
import { realTimeService } from '../services/realTimeService';
import { useRealTimeDashboard } from '../hooks/useRealTimeData';

// Suppress React DevTools message in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    const message = args.join(' ');
    if (!message.includes('React DevTools') && !message.includes('react-dom_client.js')) {
      originalConsoleLog.apply(console, args);
    }
  };
}

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [workoutStats, setWorkoutStats] = useState({ total: 0, today: 0, thisWeek: 0, xpPoints: 0 });
  const [realTimeStats, setRealTimeStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  // Real-time dashboard data hook
  const { data: dashboardData, loading: dashboardLoading, refresh: refreshDashboard } = useRealTimeDashboard();

  // Real data fetching using real-time service
  const fetchRealTimeData = useCallback(async () => {
    try {
      const data = await realTimeService.getDashboardData();
      
      if (data) {
        setRealTimeStats(data);
        setWorkoutStats({
          total: data.totalWorkouts || 0,
          today: data.completedToday || 0,
          thisWeek: data.completedThisWeek || 0,
          xpPoints: data.xpPoints || 0
        });
      }

      const achievements = await realTimeService.getAnalytics();
      if (achievements?.achievements) {
        setAchievements(achievements.achievements);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }
    
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Invalid user data in localStorage');
        localStorage.removeItem('user');
      }
    }
    
    loadDashboardData();
    
    // Set up real-time updates using real-time service
    const cleanup = realTimeService.startRealTimeUpdates(30000);
    
    // Subscribe to dashboard updates
    const unsubscribe = realTimeService.subscribe('dashboard', (data) => {
      if (data) {
        setRealTimeStats(data);
        setWorkoutStats({
          total: data.totalWorkouts || 0,
          today: data.completedToday || 0,
          thisWeek: data.completedThisWeek || 0,
          xpPoints: data.xpPoints || 0
        });
      }
      setLastUpdated(new Date());
    });
    
    return () => {
      cleanup();
      unsubscribe();
    };
  }, [fetchRealTimeData]);

  const loadDashboardData = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Load local data first for immediate display
      try {
        const workouts = workoutService.getAllWorkouts() || [];
        const plans = planService.getAllPlans() || [];
        setRecentWorkouts(workouts);
        setSavedPlans(plans);
      } catch (localError) {
        console.warn('Error loading local data:', localError);
      }
      
      // Fetch real-time data from backend
      await fetchRealTimeData();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login');
    }
  };
  
  // Manual refresh function
  const handleRefresh = async () => {
    setLoading(true);
    await loadDashboardData();
    setLoading(false);
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

  // Show error state if there's an error
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn bg-blue-600 hover:bg-blue-700 text-white"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // Show login prompt if not authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
        <p className="text-slate-400 mb-6">Please log in to access your dashboard</p>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => navigate('/login')}
            className="btn bg-blue-600 hover:bg-blue-700 text-white"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="btn border border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              Welcome back{user?.name ? `, ${user.name}` : ''}! 👋
            </h1>
            <p className="text-slate-400 mt-1 text-sm sm:text-base">
              Ready to crush your fitness goals today?
              {lastUpdated && (
                <span className="ml-2 text-green-400 text-xs">
                  • Live data active
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleRefresh}
              className="btn bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
              disabled={loading}
            >
              {loading ? '🔄' : '🔄'} Refresh
            </button>
            <button
              onClick={logout}
              className="btn bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-none"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Stats */}
      <div className="grid-responsive">
        <div className="card relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl">💪</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-white">{workoutStats.total || 0}</div>
              <div className="text-slate-400 text-xs sm:text-sm">Total Workouts</div>
            </div>
          </div>
          {lastUpdated && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live Data"></div>
          )}
        </div>
        
        <div className="card relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl">🔥</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-white">{realTimeStats?.currentStreak || workoutStats.thisWeek || 0}</div>
              <div className="text-slate-400 text-xs sm:text-sm">Day Streak</div>
            </div>
          </div>
          {lastUpdated && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live Data"></div>
          )}
        </div>
        
        <div className="card relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl">⭐</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-white">{realTimeStats?.xpPoints || workoutStats.xpPoints || 0}</div>
              <div className="text-slate-400 text-xs sm:text-sm">XP Points</div>
            </div>
          </div>
          {lastUpdated && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live Data"></div>
          )}
        </div>
        
        <div className="card relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl">🍎</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-white">{realTimeStats?.totalPlans || savedPlans.length || 0}</div>
              <div className="text-slate-400 text-xs sm:text-sm">Workout Plans</div>
            </div>
          </div>
          {lastUpdated && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live Data"></div>
          )}
        </div>
      </div>
      
      {/* Live Update Indicator */}
      {lastUpdated && (
        <div className="text-center">
          <span className="text-xs text-slate-500">
            🔴 Live • Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Quick Actions</h2>
        <div className="grid-responsive-4">
          <button 
            onClick={() => navigate('/library')}
            className="btn bg-blue-600 hover:bg-blue-700 text-white flex-col h-auto py-4 sm:py-6"
          >
            <div className="text-2xl sm:text-3xl mb-2">📚</div>
            <div className="font-medium text-sm sm:text-base">Exercise Library</div>
          </button>
          
          <button 
            onClick={() => navigate('/my-plans')}
            className="btn bg-green-600 hover:bg-green-700 text-white flex-col h-auto py-4 sm:py-6"
          >
            <div className="text-2xl sm:text-3xl mb-2">📋</div>
            <div className="font-medium text-sm sm:text-base">My Plans ({savedPlans.length || 0})</div>
          </button>
          
          <button 
            onClick={() => navigate('/nutrition')}
            className="btn bg-orange-600 hover:bg-orange-700 text-white flex-col h-auto py-4 sm:py-6"
          >
            <div className="text-2xl sm:text-3xl mb-2">🍎</div>
            <div className="font-medium text-sm sm:text-base">Meal Planner</div>
          </button>
          
          <button 
            onClick={() => navigate('/analytics')}
            className="btn bg-purple-600 hover:bg-purple-700 text-white flex-col h-auto py-4 sm:py-6"
          >
            <div className="text-2xl sm:text-3xl mb-2">📊</div>
            <div className="font-medium text-sm sm:text-base">Analytics</div>
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
        {savedPlans && savedPlans.length > 3 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/my-plans')}
              className="btn-secondary text-sm"
            >
              View All Plans ({savedPlans.length})
            </button>
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
            <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">No workouts completed yet. Start your first workout!</p>
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
            {recentWorkouts.slice(0, 5).map((workout, index) => (
              <div key={workout.id || index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-white text-sm sm:text-base truncate">{workout.planName || 'Workout'}</div>
                  <div className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
                    <span>{workout.exercises?.length || 0} exercises</span>
                    <span>•</span>
                    <span>{workout.duration || 0} min</span>
                    <span>•</span>
                    <span className="text-green-400">✓ Completed</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs sm:text-sm text-slate-400 flex-shrink-0">
                    {workout.completedAt ? new Date(workout.completedAt).toLocaleDateString() : 'Today'}
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
            {recentWorkouts.length > 5 && (
              <div className="text-center pt-2">
                <span className="text-sm text-slate-400">
                  +{recentWorkouts.length - 5} more workouts completed
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Real-Time Achievements */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Recent Achievements</h2>
          <button
            onClick={() => navigate('/analytics')}
            className="btn bg-purple-600 hover:bg-purple-700 text-white text-sm"
          >
            📊 View Analytics
          </button>
        </div>
        {achievements.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-4">🏆</div>
            <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">Complete workouts to unlock achievements!</p>
            <button 
              onClick={() => navigate('/my-plans')}
              className="btn bg-blue-600 hover:bg-blue-700 text-white"
            >
              Start Working Out
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.slice(0, 4).map((achievement) => (
              <div key={achievement.id} className={`p-4 rounded-lg border-2 transition-all ${
                achievement.unlocked 
                  ? 'bg-green-900/20 border-green-500/30' 
                  : 'bg-slate-700/30 border-slate-600/30'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-medium text-sm ${
                      achievement.unlocked ? 'text-green-400' : 'text-white'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className="text-xs text-slate-400">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && (
                    <span className="text-green-400 text-sm">✓</span>
                  )}
                </div>
                {!achievement.unlocked && achievement.progress && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.target}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Real-Time Activity Feed */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Live Activity Feed</h2>
          <button
            onClick={fetchRealTimeData}
            className="btn bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            🔄 Refresh
          </button>
        </div>
        <div className="space-y-3">
          {realTimeStats && (
            <div className="flex items-center gap-3 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm">📊</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium">Stats Updated</p>
                <p className="text-slate-400 text-xs">
                  {realTimeStats.totalWorkouts} workouts • {realTimeStats.totalPlans} plans • {realTimeStats.xpPoints} XP
                </p>
              </div>
              <span className="text-xs text-blue-400">
                {realTimeStats.lastActive ? new Date(realTimeStats.lastActive).toLocaleTimeString() : 'Now'}
              </span>
            </div>
          )}
          
          {recentActivity.length > 0 ? (
            recentActivity.slice(0, 4).map((activity) => (
              <div key={activity.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                activity.type === 'workout' ? 'bg-green-900/20 border-green-500/30' :
                activity.type === 'meal' ? 'bg-orange-900/20 border-orange-500/30' :
                'bg-purple-900/20 border-purple-500/30'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'workout' ? 'bg-green-600' :
                  activity.type === 'meal' ? 'bg-orange-600' :
                  'bg-purple-600'
                }`}>
                  <span className="text-sm">{activity.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium">{activity.title}</p>
                  <p className="text-slate-400 text-xs">{activity.description}</p>
                </div>
                <span className={`text-xs ${
                  activity.type === 'workout' ? 'text-green-400' :
                  activity.type === 'meal' ? 'text-orange-400' :
                  'text-purple-400'
                }`}>
                  {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : 'Today'}
                </span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm">👋</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium">Welcome to GymTracker!</p>
                <p className="text-slate-400 text-xs">Start your fitness journey by creating a workout plan</p>
              </div>
              <span className="text-xs text-slate-400">Today</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
