// Professional Real-Time Dashboard with Authentication Guard
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { planService } from '../services/planService';
import { workoutService } from '../services/workoutService';
import { onlineService } from '../services/onlineService';
import { useAuth } from '../context/AuthContext';
import DashboardHero from '../components/DashboardHero';
import AuthGuard from '../components/AuthGuard';

const Dashboard = () => {
  const { user: authUser, logout, isAuthenticated } = useAuth();
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [workoutStats, setWorkoutStats] = useState({ total: 0, today: 0, thisWeek: 0, currentStreak: 0, xpPoints: 0, totalMeals: 0, totalExercises: 0 });
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [completionData, setCompletionData] = useState(null);

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
        // Load from MongoDB backend
        try {
          const token = localStorage.getItem('token');
          const [statsResponse, plansResponse, workoutsResponse] = await Promise.all([
            fetch('/api/users/stats', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }),
            fetch('/api/plans', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }),
            fetch('/api/workouts', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
          ]);
          
          if (statsResponse.ok) {
            const stats = await statsResponse.json();
            setWorkoutStats({
              total: stats.totalWorkouts || 0,
              today: stats.todayWorkouts || 0,
              thisWeek: stats.weeklyWorkouts || 0,
              currentStreak: stats.currentStreak || 0,
              xpPoints: stats.xpPoints || 0,
              totalMeals: stats.totalMeals || 0,
              totalExercises: stats.totalExercises || 0
            });
          }
          
          if (plansResponse.ok) {
            const plans = await plansResponse.json();
            setSavedPlans(plans || []);
          }
          
          if (workoutsResponse.ok) {
            const workouts = await workoutsResponse.json();
            setRecentWorkouts(workouts || []);
          }
          
          console.log('✅ Dashboard data loaded from MongoDB');
        } catch (onlineError) {
          console.error('Failed to load MongoDB data:', onlineError);
          setIsOnline(false);
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
      
      // Get streak from localStorage
      const streakKey = `gymtracker_streak_${authUser?.id}`;
      const streakData = JSON.parse(localStorage.getItem(streakKey) || '{}');
      
      setRecentWorkouts(workouts);
      setSavedPlans(plans);
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      const exercises = JSON.parse(localStorage.getItem('exerciseLibrary') || '[]');
      
      setWorkoutStats({
        total: workouts.filter(w => w.completed).length,
        today: 0,
        thisWeek: workouts.filter(w => w.completed).length,
        currentStreak: streakData.currentStreak || 0,
        xpPoints: (workouts.filter(w => w.completed).length * 100) + (plans.length * 50),
        totalMeals: meals.length,
        totalExercises: exercises.length || 50 // Default exercise count
      });
    } catch (error) {
      console.error('Offline data loading error:', error);
      setRecentWorkouts([]);
      setSavedPlans([]);
      setWorkoutStats({ total: 0, today: 0, thisWeek: 0, currentStreak: 0, xpPoints: 0, totalMeals: 0, totalExercises: 50 });
    }
  }, [authUser]);



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
      
      setWorkoutStats(prev => ({
        ...prev,
        total: prev.total + 1,
        thisWeek: prev.thisWeek + 1,
        xpPoints: prev.xpPoints + (sets * 10) + 50
      }));
      
      setRecentWorkouts(prev => [{
        id: workout.id || Date.now(),
        planName: workout.title || workout.exerciseName || exercise,
        exercises: workout.exercises || [{ exercise: workout.exerciseName || exercise }],
        duration: Math.floor(duration / 60) || workout.durationMinutes,
        completedAt: new Date(),
        synced: !offline
      }, ...prev]);
      
      setTimeout(() => setShowCompletionMessage(false), 5000);
      setTimeout(() => loadDashboardData(), 2000);
    };
    
    const handleStreakUpdated = () => {
      console.log('🔥 Streak updated - refreshing dashboard');
      loadDashboardData();
    };
    
    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    window.addEventListener('streakUpdated', handleStreakUpdated);
    window.addEventListener('planCreated', loadDashboardData);
    window.addEventListener('mealAdded', loadDashboardData);
    
    // Real-time refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      if (isAuthenticated()) {
        loadDashboardData();
      }
    }, 30000);
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutCompleted);
      window.removeEventListener('streakUpdated', handleStreakUpdated);
      window.removeEventListener('planCreated', loadDashboardData);
      window.removeEventListener('mealAdded', loadDashboardData);
      clearInterval(refreshInterval);
    };
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



  return (
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
              Ready to crush your fitness goals today?
              <span className={`ml-2 text-xs preserve-color ${isOnline ? 'text-green-400' : 'text-yellow-400'}`}>
                • {isOnline ? '🔥 MongoDB Live' : '📱 Local Mode'}
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



      {/* Real-Time Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="card cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/library')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl">💪</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-white">{workoutStats.total}</div>
              <div className="text-slate-400 text-xs sm:text-sm">Total Workouts</div>
              <div className="text-xs text-green-400">
                {workoutStats.total > 0 ? `${workoutStats.total} completed!` : 'Start your first workout'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="card cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/current-streak')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl">🔥</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-white">
                {workoutStats.currentStreak > 0 ? `${workoutStats.currentStreak}🔥` : '0🔥'}
              </div>
              <div className="text-slate-400 text-xs sm:text-sm">Current Streak</div>
              <div className="text-xs text-green-400">
                {workoutStats.currentStreak > 0 ? `${workoutStats.currentStreak} days strong!` : 'Start your streak'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="card cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/analytics')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl">📊</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-white">{workoutStats.thisWeek}</div>
              <div className="text-slate-400 text-xs sm:text-sm">This Week</div>
              <div className="text-xs text-green-400">
                {workoutStats.thisWeek > 0 ? `${workoutStats.thisWeek} this week!` : 'No workouts yet'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="card cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/xp-points')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl">⭐</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-white">{workoutStats.xpPoints}</div>
              <div className="text-slate-400 text-xs sm:text-sm">XP Points</div>
              <div className="text-xs text-green-400">
                {workoutStats.xpPoints > 0 ? `Level ${Math.floor(workoutStats.xpPoints / 100) + 1}` : 'Earn XP by working out'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="card cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/my-plans')}>
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
        </div>
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
            className="btn bg-blue-600 hover:bg-blue-700 text-white flex-col h-auto py-4 sm:py-6 transition-all hover:scale-105"
          >
            <div className="text-2xl sm:text-3xl mb-2">📚</div>
            <div className="font-medium text-sm sm:text-base">Exercise Library</div>
            <div className="text-xs text-blue-200 mt-1">
              {workoutStats.totalExercises || 50}+ exercises
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/my-plans')}
            className="btn bg-green-600 hover:bg-green-700 text-white flex-col h-auto py-4 sm:py-6 transition-all hover:scale-105"
          >
            <div className="text-2xl sm:text-3xl mb-2">📋</div>
            <div className="font-medium text-sm sm:text-base">My Plans ({savedPlans.length})</div>
            <div className="text-xs text-green-200 mt-1">
              {savedPlans.length > 0 ? `${savedPlans.length} plans ready` : 'Create your first plan'}
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/nutrition')}
            className="btn bg-orange-600 hover:bg-orange-700 text-white flex-col h-auto py-4 sm:py-6 transition-all hover:scale-105"
          >
            <div className="text-2xl sm:text-3xl mb-2">🍎</div>
            <div className="font-medium text-sm sm:text-base">Meal Planner</div>
            <div className="text-xs text-orange-200 mt-1">
              {workoutStats.totalMeals > 0 ? `${workoutStats.totalMeals} meals logged` : 'Track your nutrition'}
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/analytics')}
            className="btn bg-purple-600 hover:bg-purple-700 text-white flex-col h-auto py-4 sm:py-6 transition-all hover:scale-105"
          >
            <div className="text-2xl sm:text-3xl mb-2">📊</div>
            <div className="font-medium text-sm sm:text-base">Analytics</div>
            <div className="text-xs text-purple-200 mt-1">
              {workoutStats.total > 0 ? `${workoutStats.total} workouts tracked` : 'View your progress'}
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
    </div>
    </AuthGuard>
  );
};

export default Dashboard;