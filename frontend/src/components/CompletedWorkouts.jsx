import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
// Simple fallback service
const workoutCompletionService = {
  async getCompletedWorkouts(userId) {
    try {
      const workouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
      return workouts.filter(w => w.userId === userId);
    } catch (error) {
      return [];
    }
  }
};

export default function CompletedWorkouts() {
  const { user } = useAuth();
  const { isOnline } = useRealTime();
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, week, month
  const [sortBy, setSortBy] = useState('recent'); // recent, duration, calories
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load completed workouts
  useEffect(() => {
    loadCompletedWorkouts();
  }, [user, isOnline]);

  // Listen for real-time workout completions and sync events
  useEffect(() => {
    const handleWorkoutCompleted = (event) => {
      if (event.detail) {
        console.log('🎯 CompletedWorkouts: Received workout completion event:', event.detail);
        
        // Use the workout data as-is since it's already properly formatted
        const newWorkout = event.detail;
        
        setCompletedWorkouts(prev => {
          // Check if workout already exists to prevent duplicates
          const exists = prev.some(w => w.id === newWorkout.id);
          if (exists) {
            console.log('⚠️ Workout already exists, skipping duplicate');
            return prev;
          }
          
          console.log('✅ Adding new workout to list:', newWorkout);
          return [newWorkout, ...prev];
        });
      }
    };

    const handleStatsUpdate = () => {
      // Reload workouts when stats are updated
      console.log('📊 Stats updated, refreshing workout list');
      loadCompletedWorkouts();
    };
    
    const handleRefreshWorkouts = () => {
      console.log('🔄 Refresh workouts event received');
      loadCompletedWorkouts();
    };
    
    const handleRealTimeSync = (event) => {
      console.log('🔄 CompletedWorkouts: Real-time sync received:', event.detail);
      // Refresh workouts to sync with latest data
      loadCompletedWorkouts();
    };

    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    window.addEventListener('realTimeStatsUpdate', handleStatsUpdate);
    window.addEventListener('refreshCompletedWorkouts', handleRefreshWorkouts);
    window.addEventListener('realTimeStatsSync', handleRealTimeSync);
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutCompleted);
      window.removeEventListener('realTimeStatsUpdate', handleStatsUpdate);
      window.removeEventListener('refreshCompletedWorkouts', handleRefreshWorkouts);
      window.removeEventListener('realTimeStatsSync', handleRealTimeSync);
    };
  }, [user]);

  const loadCompletedWorkouts = async () => {
    try {
      setLoading(true);
      
      // Always load from localStorage for consistency
      const localWorkouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
      
      // Filter by user if user is available
      const userWorkouts = user?.id 
        ? localWorkouts.filter(w => w.userId === user.id || !w.userId) // Include workouts without userId for backward compatibility
        : localWorkouts;
      
      console.log('📋 Loaded workouts:', userWorkouts.length, 'total workouts');
      setCompletedWorkouts(userWorkouts);
      
    } catch (error) {
      console.error('Error loading completed workouts:', error);
      setCompletedWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkouts = completedWorkouts.filter(workout => {
    const workoutDate = new Date(workout.completedAt);
    const now = new Date();
    
    switch (filter) {
      case 'today':
        return workoutDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return workoutDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return workoutDate >= monthAgo;
      default:
        return true;
    }
  });

  const sortedWorkouts = [...filteredWorkouts].sort((a, b) => {
    switch (sortBy) {
      case 'duration':
        return (b.duration || 0) - (a.duration || 0);
      case 'calories':
        return (b.caloriesBurned || 0) - (a.caloriesBurned || 0);
      default:
        return new Date(b.completedAt) - new Date(a.completedAt);
    }
  });

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const deleteWorkout = (workoutId) => {
    try {
      const existing = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
      const updated = existing.filter(w => w.id !== workoutId);
      localStorage.setItem('completedWorkouts', JSON.stringify(updated));
      setCompletedWorkouts(updated);
      
      // Trigger stats update
      const todayWorkouts = updated.filter(w => 
        new Date(w.completedAt).toDateString() === new Date().toDateString()
      ).length;
      
      const weeklyWorkouts = updated.filter(w => {
        const workoutDate = new Date(w.completedAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return workoutDate >= weekAgo;
      }).length;
      
      window.dispatchEvent(new CustomEvent('realTimeStatsUpdate', { 
        detail: { 
          todayWorkouts,
          totalWorkouts: updated.length,
          weeklyWorkouts,
          totalCalories: updated.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)
        }
      }));
      
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-800/50 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="flex gap-4">
              <div className="h-8 bg-slate-700 rounded w-16"></div>
              <div className="h-8 bg-slate-700 rounded w-16"></div>
              <div className="h-8 bg-slate-700 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {['all', 'today', 'week', 'month'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === filterOption
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg text-white text-sm"
        >
          <option value="recent">Most Recent</option>
          <option value="duration">Longest Duration</option>
          <option value="calories">Most Calories</option>
        </select>
      </div>

      {/* Workout List */}
      {sortedWorkouts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💪</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {filter === 'all' ? 'No workouts yet' : `No workouts ${filter === 'today' ? 'today' : `this ${filter}`}`}
          </h3>
          <p className="text-slate-400 mb-6">
            {filter === 'all' 
              ? 'Complete your first workout to see it here!' 
              : `Try a different time filter or complete a workout ${filter === 'today' ? 'today' : `this ${filter}`}!`
            }
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.href = '/library'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🏋️ Browse Exercises
            </button>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                📊 View All Workouts
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedWorkouts.map((workout, index) => (
            <div
              key={workout.id || index}
              className="group bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 backdrop-blur-sm border border-slate-600/30 rounded-xl p-6 hover:border-blue-400/40 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {workout.exercise || workout.name || 'Workout'}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {formatDate(workout.completedAt)} • {workout.category || 'General'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    workout.savedOffline 
                      ? 'bg-yellow-400' 
                      : isOnline 
                        ? 'bg-green-400 animate-pulse' 
                        : 'bg-blue-400'
                  }`}></div>
                  <span className="text-xs text-slate-400">
                    {workout.savedOffline ? 'Offline' : isOnline ? 'Live' : 'Local'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {formatDuration(workout.duration)}
                  </div>
                  <div className="text-xs text-slate-400">Duration</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-400">
                    {workout.caloriesBurned || 0}
                  </div>
                  <div className="text-xs text-slate-400">Calories</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {workout.sets || 0}
                  </div>
                  <div className="text-xs text-slate-400">Sets</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-orange-400">
                    {workout.reps || 0}
                  </div>
                  <div className="text-xs text-slate-400">Reps</div>
                </div>
              </div>

              {workout.notes && (
                <div className="bg-slate-900/30 rounded-lg p-3 mb-4">
                  <p className="text-slate-300 text-sm italic">"{workout.notes}"</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {workout.difficulty && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      workout.difficulty === 'Beginner' ? 'bg-green-900/50 text-green-300' :
                      workout.difficulty === 'Intermediate' ? 'bg-yellow-900/50 text-yellow-300' :
                      'bg-red-900/50 text-red-300'
                    }`}>
                      {workout.difficulty}
                    </span>
                  )}
                  <span className="text-xs text-slate-500">
                    ID: {workout.id?.toString().slice(-6) || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                    View Details →
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm(workout.id)}
                    className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-900/20 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Delete Workout?</h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete this workout? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteWorkout(deleteConfirm)}
                className="btn bg-red-600 hover:bg-red-700 text-white flex-1"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {sortedWorkouts.length > 0 && (
        <div className="bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{sortedWorkouts.length}</div>
              <div className="text-xs text-slate-400">Total Workouts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {Math.round(sortedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / 60)}m
              </div>
              <div className="text-xs text-slate-400">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {sortedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)}
              </div>
              <div className="text-xs text-slate-400">Total Calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {Math.round(sortedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / sortedWorkouts.length / 60) || 0}m
              </div>
              <div className="text-xs text-slate-400">Avg Duration</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}