// Real-time Workout Session Component
import React, { useState, useEffect, useCallback } from 'react';
import { onlineService } from '../services/onlineService';
import { useAuth } from '../context/AuthContext';
import RealTimeProgress from './RealTimeProgress';
import RealTimeSyncStatus from './RealTimeSyncStatus';

export default function RealTimeWorkoutSession({ plan, onWorkoutComplete }) {
  const { user } = useAuth();
  const [workoutData, setWorkoutData] = useState({
    planId: plan.id,
    planName: plan.name,
    exercises: plan.exercises.map(ex => ({
      ...ex,
      sets: ex.sets ? ex.sets.split(' x ').map(() => ({
        reps: 0,
        weight: 0,
        completed: false,
        rest: 0
      })) : [{ reps: 0, weight: 0, completed: false, rest: 0 }],
      completed: false
    })),
    startTime: new Date(),
    duration: 0,
    calories: 0,
    notes: ''
  });
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');

  // Auto-save workout data every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveWorkoutProgress();
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [workoutData]);

  // Load saved workout progress on mount
  useEffect(() => {
    loadSavedProgress();
  }, []);

  // Rest timer
  useEffect(() => {
    let interval;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  const loadSavedProgress = () => {
    const savedProgress = localStorage.getItem(`workout_session_${plan.id}`);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setWorkoutData(parsed);
        
        // Find current exercise and set
        const currentEx = parsed.exercises.findIndex(ex => !ex.completed);
        if (currentEx !== -1) {
          setCurrentExerciseIndex(currentEx);
          const currentSet = parsed.exercises[currentEx].sets.findIndex(set => !set.completed);
          setCurrentSetIndex(currentSet !== -1 ? currentSet : 0);
        }
      } catch (error) {
        console.error('Failed to load saved progress:', error);
      }
    }
  };

  const saveWorkoutProgress = useCallback(async () => {
    setAutoSaveStatus('saving');
    
    try {
      // Save locally
      localStorage.setItem(`workout_session_${plan.id}`, JSON.stringify(workoutData));
      
      // Save to backend if online and user is logged in
      if (user && navigator.onLine) {
        await onlineService.saveWorkout({
          ...workoutData,
          isComplete: false,
          progress: calculateProgress()
        });
      }
      
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Failed to save workout progress:', error);
      setAutoSaveStatus('error');
    }
  }, [workoutData, plan.id, user]);

  const calculateProgress = () => {
    const totalSets = workoutData.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const completedSets = workoutData.exercises.reduce((acc, ex) => 
      acc + ex.sets.filter(set => set.completed).length, 0
    );
    
    return {
      completedSets,
      totalSets,
      percentage: totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0
    };
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    setWorkoutData(prev => {
      const newData = { ...prev };
      newData.exercises[exerciseIndex].sets[setIndex][field] = value;
      return newData;
    });
  };

  const completeSet = async (exerciseIndex, setIndex) => {
    const updatedData = { ...workoutData };
    updatedData.exercises[exerciseIndex].sets[setIndex].completed = true;
    
    // Check if all sets for this exercise are complete
    const allSetsComplete = updatedData.exercises[exerciseIndex].sets.every(set => set.completed);
    if (allSetsComplete) {
      updatedData.exercises[exerciseIndex].completed = true;
    }
    
    setWorkoutData(updatedData);
    
    // Start rest timer if not the last set
    const exercise = updatedData.exercises[exerciseIndex];
    const nextSetIndex = setIndex + 1;
    
    if (nextSetIndex < exercise.sets.length) {
      const restTime = parseInt(exercise.rest) || 60;
      setRestTimer(restTime);
      setIsResting(true);
      setCurrentSetIndex(nextSetIndex);
    } else {
      // Move to next exercise
      const nextExerciseIndex = exerciseIndex + 1;
      if (nextExerciseIndex < updatedData.exercises.length) {
        setCurrentExerciseIndex(nextExerciseIndex);
        setCurrentSetIndex(0);
      }
    }
    
    // Auto-save after completing set
    await saveWorkoutProgress();
    
    // Update plan stats
    if (user && navigator.onLine) {
      try {
        await onlineService.updatePlanStats(plan.backendId || plan.id, {
          setCompleted: true,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to update plan stats:', error);
      }
    }
  };

  const completeWorkout = async () => {
    const completedWorkout = {
      ...workoutData,
      endTime: new Date(),
      duration: Math.floor((new Date() - new Date(workoutData.startTime)) / 1000),
      isComplete: true,
      completedAt: new Date().toISOString()
    };
    
    try {
      // Save completed workout
      if (user && navigator.onLine) {
        await onlineService.saveWorkout(completedWorkout);
        
        // Update plan stats
        await onlineService.updatePlanStats(plan.backendId || plan.id, {
          workoutCompleted: true,
          duration: completedWorkout.duration,
          timestamp: new Date().toISOString()
        });
      } else {
        // Store for offline sync
        const offlineData = JSON.parse(localStorage.getItem('gymTracker_offlineData') || '{}');
        offlineData.workouts = offlineData.workouts || [];
        offlineData.workouts.push(completedWorkout);
        localStorage.setItem('gymTracker_offlineData', JSON.stringify(offlineData));
      }
      
      // Clear session data
      localStorage.removeItem(`workout_session_${plan.id}`);
      
      if (onWorkoutComplete) {
        onWorkoutComplete(completedWorkout);
      }
    } catch (error) {
      console.error('Failed to complete workout:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExercise = workoutData.exercises[currentExerciseIndex];
  const currentSet = currentExercise?.sets[currentSetIndex];
  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Header with Sync Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
        <div className="flex items-center gap-4">
          <RealTimeSyncStatus />
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-1 rounded text-xs ${
              autoSaveStatus === 'saved' ? 'bg-red-600/20 text-red-500' :
              autoSaveStatus === 'saving' ? 'bg-red-600/20 text-red-500' :
              'bg-red-500/20 text-red-400'
            }`}>
              {autoSaveStatus === 'saved' ? '✓ Saved' :
               autoSaveStatus === 'saving' ? '⏳ Saving...' :
               '⚠ Save Error'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Component */}
      <RealTimeProgress 
        planId={plan.id}
        workoutData={workoutData}
        onProgressUpdate={(progress) => {
          // Handle progress updates
        }}
      />

      {/* Rest Timer */}
      {isResting && (
        <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-orange-400 mb-2">
            {formatTime(restTimer)}
          </div>
          <div className="text-orange-300">Rest Time</div>
          <button
            onClick={() => {
              setIsResting(false);
              setRestTimer(0);
            }}
            className="btn bg-orange-600 hover:bg-orange-700 text-white mt-2"
          >
            Skip Rest
          </button>
        </div>
      )}

      {/* Current Exercise */}
      {currentExercise && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              {currentExercise.name}
            </h3>
            <span className="text-sm text-neutral-400">
              Exercise {currentExerciseIndex + 1} of {workoutData.exercises.length}
            </span>
          </div>

          {/* Current Set */}
          <div className="bg-neutral-800/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-medium text-white">
                Set {currentSetIndex + 1} of {currentExercise.sets.length}
              </span>
              <span className="text-sm text-neutral-400">
                {progress.completedSets}/{progress.totalSets} sets completed
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Reps</label>
                <input
                  type="number"
                  value={currentSet?.reps || ''}
                  onChange={(e) => updateSet(currentExerciseIndex, currentSetIndex, 'reps', parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Weight (lbs)</label>
                <input
                  type="number"
                  value={currentSet?.weight || ''}
                  onChange={(e) => updateSet(currentExerciseIndex, currentSetIndex, 'weight', parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 text-white"
                  placeholder="0"
                />
              </div>
            </div>

            <button
              onClick={() => completeSet(currentExerciseIndex, currentSetIndex)}
              disabled={!currentSet?.reps || currentSet.completed}
              className="btn bg-green-600 hover:bg-green-700 text-white w-full disabled:opacity-50"
            >
              {currentSet?.completed ? '✓ Completed' : 'Complete Set'}
            </button>
          </div>

          {/* All Sets for Current Exercise */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-neutral-300">All Sets:</h4>
            {currentExercise.sets.map((set, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded ${
                  set.completed ? 'bg-red-600/20 border border-red-600/30' :
                  index === currentSetIndex ? 'bg-red-600/20 border border-red-600/30' :
                  'bg-neutral-800/30'
                }`}
              >
                <span className="text-sm text-white">
                  Set {index + 1}
                </span>
                <span className="text-sm text-neutral-300">
                  {set.reps} reps × {set.weight} lbs
                </span>
                <span className="text-xs">
                  {set.completed ? '✓' : index === currentSetIndex ? '→' : '○'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exercise List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Workout Overview</h3>
        <div className="space-y-2">
          {workoutData.exercises.map((exercise, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded ${
                exercise.completed ? 'bg-red-600/20 border border-red-600/30' :
                index === currentExerciseIndex ? 'bg-red-600/20 border border-red-600/30' :
                'bg-neutral-800/30'
              }`}
            >
              <div>
                <span className="text-white font-medium">{exercise.name}</span>
                <div className="text-sm text-neutral-400">
                  {exercise.sets.filter(s => s.completed).length}/{exercise.sets.length} sets
                </div>
              </div>
              <span className="text-lg">
                {exercise.completed ? '✅' : index === currentExerciseIndex ? '🔄' : '⏳'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Workout Button */}
      {progress.percentage === 100 && (
        <button
          onClick={completeWorkout}
          className="btn bg-green-600 hover:bg-green-700 text-white w-full text-lg py-3"
        >
          🎉 Complete Workout
        </button>
      )}

      {/* Real-time Features Info */}
      <div className="bg-blue-900/20 border border-red-600/30 rounded-lg p-4">
        <h4 className="text-blue-300 font-medium mb-2">🚀 Real-time Features Active:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-blue-200">
          <div>✅ Auto-save every 30s</div>
          <div>✅ Live progress tracking</div>
          <div>✅ Offline data persistence</div>
          <div>✅ Real-time sync to MongoDB</div>
          <div>✅ Plan statistics updates</div>
          <div>✅ Cross-device synchronization</div>
        </div>
      </div>
    </div>
  );
}