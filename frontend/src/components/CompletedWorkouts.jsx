import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
import { workoutSync } from '../services/workoutSync';
import { realTimeWorkoutSync } from '../services/realTimeWorkoutSync';


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
    // Clean up fake workouts first
    if (typeof window.cleanupFakeWorkouts === 'function') {
      window.cleanupFakeWorkouts();
    }
    loadCompletedWorkouts();
  }, [user, isOnline]);

  // Listen for real-time workout completions and sync events
  useEffect(() => {
    const handleWorkoutCompleted = (event) => {
      if (event.detail) {
        console.log('🎯 CompletedWorkouts: Received workout completion event:', event.detail);
        
        // Reload workouts from real-time sync service to ensure consistency
        setTimeout(() => {
          loadCompletedWorkouts();
        }, 100);
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
      
      // Get workouts from real-time sync service
      const workouts = realTimeWorkoutSync.getWorkoutHistory(365); // Get last year
      setCompletedWorkouts(workouts);
      
      console.log('✅ Loaded real workouts from RealTimeWorkoutSync:', workouts.length);
      
    } catch (error) {
      console.error('Error loading workouts:', error);
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

  const deleteWorkout = async (workoutId) => {
    try {
      // Delete from localStorage first
      const workouts = JSON.parse(localStorage.getItem('workoutSync_workouts') || '[]');
      const updated = workouts.filter(w => w.id !== workoutId);
      localStorage.setItem('workoutSync_workouts', JSON.stringify(updated));
      
      // Delete from MongoDB backend if available
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workouts/${workoutId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            console.log('✅ Workout deleted from MongoDB');
          } else {
            console.warn('⚠️ MongoDB delete failed:', response.status);
          }
        }
      } catch (apiError) {
        console.warn('⚠️ MongoDB delete failed, local delete successful:', apiError.message);
      }
      
      // Update UI immediately
      setCompletedWorkouts(updated);
      
      // Update real-time sync
      if (window.realTimeWorkoutSync) {
        window.realTimeWorkoutSync.refreshStats();
      }
      
      // Broadcast stats update
      window.dispatchEvent(new CustomEvent('realTimeStatsUpdate'));
      
      setDeleteConfirm(null);
      console.log('🗑️ Workout deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting workout:', error);
      setDeleteConfirm(null);
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
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
          {['all', 'today', 'week', 'month'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${
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
          className="px-2.5 py-1.5 sm:px-4 sm:py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg text-white text-[10px] sm:text-sm w-full sm:w-auto"
        >
          <option value="recent">Most Recent</option>
          <option value="duration">Longest Duration</option>
          <option value="calories">Most Calories</option>
        </select>
      </div>

      {/* Workout List */}
      {sortedWorkouts.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">💪</div>
          <h3 className="text-base sm:text-xl font-bold text-white mb-2">
            {filter === 'all' ? 'No workouts yet' : `No workouts ${filter === 'today' ? 'today' : `this ${filter}`}`}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6 px-4">
            {filter === 'all' 
              ? 'Complete your first workout to see it here!' 
              : `Try a different filter or complete a workout!`
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center px-4">
            <button
              onClick={() => window.location.href = '/library'}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
            >
              🏋️ Browse Exercises
            </button>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-xs sm:text-sm font-medium"
              >
                📊 View All Workouts
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {sortedWorkouts.map((workout, index) => (
            <div
              key={workout.id || index}
              className="group bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 backdrop-blur-sm border border-slate-600/30 rounded-xl p-3 sm:p-6 hover:border-blue-400/40 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-xl font-bold text-white mb-1 truncate">
                    {workout.exercise || workout.name || 'Workout'}
                  </h3>
                  <p className="text-slate-400 text-[10px] sm:text-sm truncate">
                    {formatDate(workout.completedAt)} • {workout.category || 'General'}
                  </p>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 ml-2">
                  <div className={`w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full ${
                    workout.savedOffline 
                      ? 'bg-yellow-400' 
                      : isOnline 
                        ? 'bg-green-400 animate-pulse' 
                        : 'bg-blue-400'
                  }`}></div>
                  <span className="text-[9px] sm:text-xs text-slate-400">
                    {workout.savedOffline ? 'Offline' : isOnline ? 'Live' : 'Local'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4">
                <div className="bg-slate-900/50 rounded-lg p-2 sm:p-3 text-center">
                  <div className="text-sm sm:text-lg font-bold text-blue-400">
                    {formatDuration(workout.duration)}
                  </div>
                  <div className="text-[9px] sm:text-xs text-slate-400">Duration</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 sm:p-3 text-center">
                  <div className="text-sm sm:text-lg font-bold text-green-400">
                    {workout.caloriesBurned || 0}
                  </div>
                  <div className="text-[9px] sm:text-xs text-slate-400">Calories</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 sm:p-3 text-center">
                  <div className="text-sm sm:text-lg font-bold text-purple-400">
                    {workout.sets || 0}
                  </div>
                  <div className="text-[9px] sm:text-xs text-slate-400">Sets</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 sm:p-3 text-center">
                  <div className="text-sm sm:text-lg font-bold text-orange-400">
                    {workout.reps || 0}
                  </div>
                  <div className="text-[9px] sm:text-xs text-slate-400">Reps</div>
                </div>
              </div>

              {workout.notes && (
                <div className="bg-slate-900/30 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                  <p className="text-slate-300 text-[10px] sm:text-sm italic line-clamp-2">"{workout.notes}"</p>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {workout.difficulty && (
                    <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium ${
                      workout.difficulty === 'Beginner' ? 'bg-green-900/50 text-green-300' :
                      workout.difficulty === 'Intermediate' ? 'bg-yellow-900/50 text-yellow-300' :
                      'bg-red-900/50 text-red-300'
                    }`}>
                      {workout.difficulty}
                    </span>
                  )}
                  <span className="text-[9px] sm:text-xs text-slate-500 hidden sm:inline">
                    ID: {workout.id?.toString().slice(-6) || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button className="text-blue-400 hover:text-blue-300 text-[10px] sm:text-sm hidden sm:inline">
                    View Details →
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm(workout.id)}
                    className="text-red-400 hover:text-red-300 text-[10px] sm:text-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded hover:bg-red-900/20 transition-colors"
                  >
                    🗑️ <span className="hidden sm:inline">Delete</span>
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
        <div className="bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-xl p-3 sm:p-6 mt-6 sm:mt-8">
          <h3 className="text-sm sm:text-lg font-bold text-white mb-3 sm:mb-4">Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-400">{sortedWorkouts.length}</div>
              <div className="text-[9px] sm:text-xs text-slate-400">Total Workouts</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-400">
                {Math.round(sortedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / 60)}m
              </div>
              <div className="text-[9px] sm:text-xs text-slate-400">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-400">
                {sortedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)}
              </div>
              <div className="text-[9px] sm:text-xs text-slate-400">Total Calories</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-orange-400">
                {Math.round(sortedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / sortedWorkouts.length / 60) || 0}m
              </div>
              <div className="text-[9px] sm:text-xs text-slate-400">Avg Duration</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}