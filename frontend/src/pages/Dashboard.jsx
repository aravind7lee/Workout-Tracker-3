// Online-enabled Dashboard with MongoDB backend integration
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { planService } from '../services/planService';
import { workoutService } from '../services/workoutService';
import { onlineService } from '../services/onlineService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user: authUser, logout, isAuthenticated } = useAuth();
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [workoutStats, setWorkoutStats] = useState({ total: 0, today: 0, thisWeek: 0, xpPoints: 0 });
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  const navigate = useNavigate();

  const checkOnlineStatus = async () => {
    try {
      const online = await onlineService.checkBackendStatus();
      setIsOnline(online);
      return online;
    } catch (error) {
      setIsOnline(false);
      return false;
    }
  };

  const loadDashboardData = async () => {
    try {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }
      
      // Check if online first
      const online = await checkOnlineStatus();
      
      if (online) {
        // Load from backend
        try {
          const [onlinePlans, onlineWorkouts, onlineAnalytics] = await Promise.all([
            onlineService.getWorkoutPlans(),
            onlineService.getWorkoutHistory(),
            onlineService.getAnalytics()
          ]);
          
          setSavedPlans(onlinePlans || []);
          setRecentWorkouts(onlineWorkouts || []);
          
          if (onlineAnalytics) {
            setWorkoutStats({
              total: onlineAnalytics.workouts || onlineAnalytics.totalWorkouts || 0,
              today: onlineAnalytics.todayWorkouts || 0,
              thisWeek: onlineAnalytics.weeklyGoal?.completed || onlineAnalytics.weeklyWorkouts || 0,
              xpPoints: onlineAnalytics.xpPoints || 0
            });
          }
        } catch (onlineError) {
          console.error('Failed to load online data:', onlineError);
          loadOfflineData();
        }
      } else {
        loadOfflineData();
      }
      
    } catch (error) {
      console.error('Dashboard load error:', error);
      loadOfflineData();
    } finally {
      setLoading(false);
    }
  };

  // Load data from localStorage
  const loadOfflineData = useCallback(() => {
    try {
      const workouts = workoutService.getAllWorkouts() || [];
      const plans = planService.getAllPlans() || [];
      
      setRecentWorkouts(workouts);
      setSavedPlans(plans);
      setWorkoutStats({
        total: workouts.length,
        today: 0,
        thisWeek: workouts.length,
        xpPoints: workouts.length * 100 + plans.length * 50
      });
    } catch (error) {
      console.error('Offline data loading error:', error);
      setRecentWorkouts([]);
      setSavedPlans([]);
      setWorkoutStats({ total: 0, today: 0, thisWeek: 0, xpPoints: 0 });
    }
  }, []);



  useEffect(() => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    
    loadDashboardData();
    
    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      checkOnlineStatus();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleRefresh = () => {
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

  if (!isAuthenticated()) {
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
              Welcome back{authUser?.name ? `, ${authUser.name}` : ''}! 👋
            </h1>
            <p className="text-slate-400 mt-1 text-sm sm:text-base">
              Ready to crush your fitness goals today?
              <span className={`ml-2 text-xs preserve-color ${isOnline ? 'text-green-400' : 'text-yellow-400'}`}>
                • {isOnline ? 'Online mode' : 'Offline mode'}
              </span>
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



      {/* Stats */}
      <div className="grid-responsive">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl">💪</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-white">{workoutStats.total}</div>
              <div className="text-slate-400 text-xs sm:text-sm">Total Workouts</div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl">🔥</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-white">{workoutStats.thisWeek}</div>
              <div className="text-slate-400 text-xs sm:text-sm">This Week</div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl">⭐</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-white">{workoutStats.xpPoints}</div>
              <div className="text-slate-400 text-xs sm:text-sm">XP Points</div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl">📋</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-white">{savedPlans.length}</div>
              <div className="text-slate-400 text-xs sm:text-sm">Workout Plans</div>
            </div>
          </div>
        </div>
      </div>

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
            <div className="font-medium text-sm sm:text-base">My Plans ({savedPlans.length})</div>
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
                    {workout.synced && <span className="text-blue-400">☁️ Synced</span>}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;