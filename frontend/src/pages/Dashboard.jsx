// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { planService } from '../services/planService';
import { workoutService } from '../services/workoutService';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [workoutStats, setWorkoutStats] = useState({ total: 0, today: 0, thisWeek: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Don't redirect, just show login prompt
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
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Load real workout data
      const workouts = workoutService.getAllWorkouts();
      const stats = workoutService.getWorkoutStats();
      setRecentWorkouts(workouts);
      setWorkoutStats(stats);
      
      // Load saved workout plans
      const plans = planService.getAllPlans();
      setSavedPlans(plans);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setRecentWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
            <p className="text-slate-400 mt-1 text-sm sm:text-base">Ready to crush your fitness goals today?</p>
          </div>
          <button
            onClick={logout}
            className="btn bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Quick Stats */}
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
              <div className="text-xl sm:text-2xl font-bold text-white">1,250</div>
              <div className="text-slate-400 text-xs sm:text-sm">XP Points</div>
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
            onClick={() => navigate('/meals')}
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
        {savedPlans.length === 0 ? (
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
            {savedPlans.slice(0, 3).map((plan) => (
              <div key={plan.id} className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-white text-sm sm:text-base truncate">{plan.name}</h3>
                  <span className="text-xs text-slate-400 bg-slate-600/50 px-2 py-1 rounded flex-shrink-0 ml-2">
                    {plan.category}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-400 mb-3">
                  {plan.exercises.length} {plan.exercises.length === 1 ? 'exercise' : 'exercises'}
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
        {savedPlans.length > 3 && (
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
        {recentWorkouts.length === 0 ? (
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
            {recentWorkouts.slice(0, 5).map((workout) => (
              <div key={workout.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-white text-sm sm:text-base truncate">{workout.planName}</div>
                  <div className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
                    <span>{workout.exercises.length} exercises</span>
                    <span>•</span>
                    <span>{workout.duration} min</span>
                    <span>•</span>
                    <span className="text-green-400">✓ Completed</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs sm:text-sm text-slate-400 flex-shrink-0">
                    {new Date(workout.completedAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => navigate(`/workout/${workout.planId}`)}
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
    </div>
  );
};

export default Dashboard;
