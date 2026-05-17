// frontend/src/pages/WorkoutSession.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
import { planService } from '../services/planService';
import { workoutService } from '../services/workoutService';
import { onlineService } from '../services/onlineService';
import { realTimeWorkoutSync } from '../services/realTimeWorkoutSync';
import realTimeEvents from '../utils/realTimeEvents';

export default function WorkoutSession() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateWorkoutStats } = useRealTime();
  const [plan, setPlan] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (planId) {
      const loadedPlan = planService.getPlanById(planId);
      if (loadedPlan) {
        setPlan(loadedPlan);
      } else {
        navigate('/my-plans');
      }
    }
  }, [planId, navigate]);

  useEffect(() => {
    let interval;
    if (workoutStarted && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workoutStarted, startTime]);

  const startWorkout = () => {
    setWorkoutStarted(true);
    setStartTime(Date.now());
  };

  const completeExercise = (index) => {
    setCompletedExercises(prev => new Set([...prev, index]));
    if (index < plan.exercises.length - 1) {
      setCurrentExercise(index + 1);
    }
  };

  const finishWorkout = async () => {
    if (isCompleting) return;
    setIsCompleting(true);
    
    try {
      const duration = Math.floor(elapsedTime / 60);
      const completedCount = completedExercises.size;
      const totalExercises = plan.exercises.length;
      const completionRate = (completedCount / totalExercises) * 100;
      
      // Calculate estimated calories burned (rough estimate)
      const estimatedCalories = Math.round(duration * 8 + completedCount * 15);
      
      // Create comprehensive workout data for real-time sync
      const workoutData = {
        id: `plan_workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user?.id || user?._id,
        planId: plan.id,
        planName: plan.name,
        exercise: `${plan.name} Plan`, // Main exercise name
        name: `${plan.name} Workout`,
        category: plan.category || 'Plan Workout',
        difficulty: plan.difficulty || 'Intermediate',
        exercises: plan.exercises.map((ex, index) => ({
          name: ex.name,
          category: ex.category,
          sets: ex.sets,
          completed: completedExercises.has(index)
        })),
        duration: duration * 60, // Convert to seconds for consistency
        completedExercises: completedCount,
        totalExercises: totalExercises,
        completionRate: completionRate,
        caloriesBurned: estimatedCalories,
        sets: completedCount, // Number of exercises completed as "sets"
        reps: totalExercises, // Total exercises as "reps"
        completed: true,
        completedAt: new Date().toISOString(),
        notes: `Completed ${completedCount}/${totalExercises} exercises from ${plan.name} plan`,
        savedOffline: false,
        synced: true
      };
    
      // 🚀 REAL-TIME WORKOUT COMPLETION - Updates ALL pages instantly
      console.log('🎯 Plan Workout Completion:', workoutData);
      
      // Save to localStorage for /workouts page
      const existingWorkouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
      const updatedWorkouts = [workoutData, ...existingWorkouts];
      localStorage.setItem('completedWorkouts', JSON.stringify(updatedWorkouts));
      
      // Add to real-time workout sync for instant stats updates
      const syncedWorkout = realTimeWorkoutSync.addCompletedWorkout(workoutData);
      
      if (syncedWorkout) {
        console.log('✅ Workout added to real-time sync:', syncedWorkout);
        
        // Trigger comprehensive real-time events for ALL pages
        window.dispatchEvent(new CustomEvent('workoutCompleted', { 
          detail: syncedWorkout 
        }));
        
        window.dispatchEvent(new CustomEvent('realTimeStatsUpdate', { 
          detail: {
            todayWorkouts: realTimeWorkoutSync.getStats().todayWorkouts,
            totalWorkouts: realTimeWorkoutSync.getStats().totalWorkouts,
            weeklyWorkouts: realTimeWorkoutSync.getStats().weeklyWorkouts,
            totalCalories: realTimeWorkoutSync.getStats().totalCalories,
            lastWorkout: syncedWorkout
          }
        }));
        
        // Update streak
        window.dispatchEvent(new CustomEvent('streakUpdated', { 
          detail: { 
            type: 'WORKOUT_COMPLETED',
            workout: syncedWorkout
          }
        }));
      }
      
      // Save to workoutService for backward compatibility
      workoutService.saveWorkout(workoutData);
      
      // Dispatch real-time event for instant profile update
      realTimeEvents.dispatchWorkoutCompleted(workoutData);
      
      // Try to sync with backend
      try {
        const isOnline = await onlineService.checkBackendStatus();
        if (isOnline) {
          await onlineService.saveWorkout(workoutData);
          console.log('✅ Workout synced to MongoDB');
        }
      } catch (syncError) {
        console.warn('⚠️ Backend sync failed, saved locally:', syncError);
      }
      
      // Notification removed as requested
      
    } catch (error) {
      console.error('❌ Error completing workout:', error);
      
      // Still try to save locally
      try {
        const existingWorkouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
        const updatedWorkouts = [workoutData, ...existingWorkouts];
        localStorage.setItem('completedWorkouts', JSON.stringify(updatedWorkouts));
        
        // Dispatch basic events
        window.dispatchEvent(new CustomEvent('workoutCompleted', { detail: workoutData }));
        realTimeEvents.dispatchWorkoutCompleted(workoutData);
      } catch (saveError) {
        console.error('❌ Failed to save workout locally:', saveError);
      }
    } finally {
      setIsCompleting(false);
    }
    
    // Navigate to /workouts page to show the completed workout
    setTimeout(() => {
      navigate('/workouts', { 
        state: { 
          workoutCompleted: true, 
          planName: plan.name,
          duration: `${duration}min`,
          exercises: `${completedCount}/${totalExercises}`,
          calories: estimatedCalories
        } 
      });
    }, 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (!workoutStarted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="card text-center">
          <h1 className="text-2xl lg:text-3xl font-semibold text-white mb-4">{plan.name}</h1>
          <p className="text-neutral-400 mb-6">
            Ready to start your workout? This plan contains {plan.exercises.length} exercises.
          </p>
          
          <div className="space-y-4 mb-8">
            {plan.exercises.map((exercise, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg">
                <div className="text-left">
                  <div className="font-medium text-white">{exercise.name}</div>
                  <div className="text-sm text-neutral-400">{exercise.category} • {exercise.sets}</div>
                </div>
                <span className="text-red-500 font-medium">{index + 1}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/my-plans')}
              className="btn-secondary flex-1"
              disabled={isCompleting}
            >
              Back to Plans
            </button>
            <button
              onClick={startWorkout}
              className="btn bg-green-600 hover:bg-green-700 text-white flex-1"
              disabled={isCompleting}
            >
              Start Workout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = (completedExercises.size / plan.exercises.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl lg:text-2xl font-semibold text-white">{plan.name}</h1>
          <div className="text-right">
            <div className="text-lg font-bold text-red-500">{formatTime(elapsedTime)}</div>
            <div className="text-sm text-neutral-400">Elapsed</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-neutral-400 mb-2">
            <span>Progress</span>
            <span>{completedExercises.size}/{plan.exercises.length} exercises</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2">
            <div 
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Current Exercise */}
      <div className="card">
        <div className="text-center mb-6">
          <div className="text-sm text-neutral-400 mb-2">
            Exercise {currentExercise + 1} of {plan.exercises.length}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {plan.exercises[currentExercise]?.name}
          </h2>
          <div className="text-neutral-400">
            {plan.exercises[currentExercise]?.category} • {plan.exercises[currentExercise]?.sets}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => completeExercise(currentExercise)}
            disabled={completedExercises.has(currentExercise) || isCompleting}
            className="btn bg-green-600 hover:bg-green-700 text-white flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completedExercises.has(currentExercise) ? 'Completed ✓' : 'Mark Complete'}
          </button>
          
          {completedExercises.size === plan.exercises.length && (
            <button
              onClick={finishWorkout}
              disabled={isCompleting}
              className="btn bg-red-700 hover:bg-blue-700 text-white flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Completing...
                </div>
              ) : (
                'Finish Workout'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Exercise List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">All Exercises</h3>
        <div className="space-y-2">
          {plan.exercises.map((exercise, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                index === currentExercise 
                  ? 'bg-blue-900/30 border border-red-600/50' 
                  : completedExercises.has(index)
                  ? 'bg-green-900/20 border border-red-600/30'
                  : 'bg-neutral-800/30 hover:bg-neutral-800/50'
              }`}
              onClick={() => setCurrentExercise(index)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  completedExercises.has(index)
                    ? 'bg-red-600 text-white'
                    : index === currentExercise
                    ? 'bg-red-600 text-white'
                    : 'bg-neutral-700 text-neutral-300'
                }`}>
                  {completedExercises.has(index) ? '✓' : index + 1}
                </div>
                <div>
                  <div className="font-medium text-white">{exercise.name}</div>
                  <div className="text-sm text-neutral-400">{exercise.sets}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}