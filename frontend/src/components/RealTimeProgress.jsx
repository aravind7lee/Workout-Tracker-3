// Real-time Progress Tracking Component
import React, { useState, useEffect } from 'react';
import { onlineService } from '../services/onlineService';
import { useAuth } from '../context/AuthContext';

export default function RealTimeProgress({ planId, workoutData, onProgressUpdate }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState({
    completedExercises: 0,
    totalExercises: 0,
    completedSets: 0,
    totalSets: 0,
    duration: 0,
    calories: 0,
    volume: 0
  });
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    if (workoutData) {
      calculateProgress(workoutData);
    }
  }, [workoutData]);

  useEffect(() => {
    let interval;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        setProgress(prev => ({ ...prev, duration }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const calculateProgress = (data) => {
    const totalExercises = data.exercises?.length || 0;
    const completedExercises = data.exercises?.filter(ex => ex.completed)?.length || 0;
    
    let totalSets = 0;
    let completedSets = 0;
    let volume = 0;
    
    data.exercises?.forEach(exercise => {
      totalSets += exercise.sets?.length || 0;
      exercise.sets?.forEach(set => {
        if (set.completed) {
          completedSets++;
          volume += (set.weight || 0) * (set.reps || 0);
        }
      });
    });

    const calories = Math.floor(volume * 0.1 + (progress.duration / 60) * 5);

    const newProgress = {
      completedExercises,
      totalExercises,
      completedSets,
      totalSets,
      duration: progress.duration,
      calories,
      volume
    };

    setProgress(newProgress);
    
    // Real-time sync to backend
    if (user && onlineService.isOnline) {
      syncProgressToBackend(newProgress);
    }
    
    // Store locally for offline access
    localStorage.setItem(`workout_progress_${planId}`, JSON.stringify({
      ...newProgress,
      timestamp: new Date().toISOString()
    }));

    if (onProgressUpdate) {
      onProgressUpdate(newProgress);
    }
  };

  const syncProgressToBackend = async (progressData) => {
    try {
      await onlineService.updatePlanStats(planId, {
        progress: progressData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to sync progress:', error);
    }
  };

  const startTracking = () => {
    setIsTracking(true);
    setStartTime(Date.now());
  };

  const stopTracking = () => {
    setIsTracking(false);
    setStartTime(null);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (progress.totalSets === 0) return 0;
    return Math.round((progress.completedSets / progress.totalSets) * 100);
  };

  return (
    <div className="bg-neutral-900/60 rounded-lg p-4 border border-neutral-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Real-time Progress</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            navigator.onLine ? 'bg-red-600' : 'bg-red-500'
          }`}></div>
          <span className="text-xs text-neutral-400">
            {navigator.onLine ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-neutral-400 mb-2">
          <span>Overall Progress</span>
          <span>{getProgressPercentage()}%</span>
        </div>
        <div className="w-full bg-neutral-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-red-600 to-red-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-neutral-800/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-red-500">
            {progress.completedExercises}/{progress.totalExercises}
          </div>
          <div className="text-xs text-neutral-400">Exercises</div>
        </div>
        
        <div className="bg-neutral-800/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-red-500">
            {progress.completedSets}/{progress.totalSets}
          </div>
          <div className="text-xs text-neutral-400">Sets</div>
        </div>
        
        <div className="bg-neutral-800/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-red-600">
            {formatDuration(progress.duration)}
          </div>
          <div className="text-xs text-neutral-400">Duration</div>
        </div>
        
        <div className="bg-neutral-800/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-orange-400">
            {progress.calories}
          </div>
          <div className="text-xs text-neutral-400">Calories</div>
        </div>
      </div>

      {/* Volume */}
      <div className="bg-neutral-800/50 rounded-lg p-3 mb-4">
        <div className="text-xl font-bold text-yellow-400">
          {progress.volume.toLocaleString()} lbs
        </div>
        <div className="text-xs text-neutral-400">Total Volume</div>
      </div>

      {/* Tracking Controls */}
      <div className="flex gap-2">
        {!isTracking ? (
          <button
            onClick={startTracking}
            className="btn bg-green-600 hover:bg-green-700 text-white flex-1"
          >
            ▶️ Start Tracking
          </button>
        ) : (
          <button
            onClick={stopTracking}
            className="btn bg-red-600 hover:bg-red-700 text-white flex-1"
          >
            ⏹️ Stop Tracking
          </button>
        )}
      </div>

      {/* Real-time Features Info */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-red-600/30 rounded-lg">
        <div className="text-xs text-blue-300 space-y-1">
          <div>✅ Real-time progress sync</div>
          <div>✅ Offline data persistence</div>
          <div>✅ Live calorie calculation</div>
          <div>✅ Auto-save every change</div>
        </div>
      </div>
    </div>
  );
}