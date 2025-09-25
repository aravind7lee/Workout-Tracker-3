// frontend/src/pages/WorkoutSession.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planService } from '../services/planService';
import { workoutService } from '../services/workoutService';
import { onlineService } from '../services/onlineService';
import realTimeEvents from '../utils/realTimeEvents';

export default function WorkoutSession() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completedExercises, setCompletedExercises] = useState(new Set());

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
    const duration = Math.floor(elapsedTime / 60);
    const completedCount = completedExercises.size;
    const totalExercises = plan.exercises.length;
    const completionRate = (completedCount / totalExercises) * 100;
    
    // Calculate estimated calories burned (rough estimate)
    const estimatedCalories = Math.round(duration * 8 + completedCount * 15);
    
    // Save workout to recent workouts
    const workoutData = {
      planId: plan.id,
      planName: plan.name,
      exercises: plan.exercises.map((ex, index) => ({
        name: ex.name,
        category: ex.category,
        sets: ex.sets,
        completed: completedExercises.has(index)
      })),
      duration: duration,
      completedExercises: completedCount,
      totalExercises: totalExercises,
      completionRate: completionRate,
      caloriesBurned: estimatedCalories,
      completed: true,
      completedAt: new Date().toISOString()
    };
    
    try {
      // Save locally first
      workoutService.saveWorkout(workoutData);
      
      // Dispatch real-time event for instant profile update
      realTimeEvents.dispatchWorkoutCompleted(workoutData);
      
      // Try to sync with backend
      const isOnline = await onlineService.checkBackendStatus();
      if (isOnline) {
        try {
          await onlineService.saveWorkout(workoutData);
          
          // Show success message
          const successMsg = document.createElement('div');
          successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm';
          successMsg.innerHTML = `
            <div class="flex items-center gap-3">
              <div class="text-2xl">🎉</div>
              <div>
                <div class="font-bold">Workout Completed!</div>
                <div class="text-sm opacity-90">${duration}min • ${estimatedCalories} cal • ${completedCount}/${totalExercises} exercises</div>
                <div class="text-xs opacity-75 mt-1">✅ Synced to MongoDB</div>
              </div>
            </div>
          `;
          document.body.appendChild(successMsg);
          setTimeout(() => {
            if (document.body.contains(successMsg)) {
              document.body.removeChild(successMsg);
            }
          }, 5000);
          
        } catch (syncError) {
          console.error('Backend sync failed:', syncError);
          
          // Show offline success message
          const offlineMsg = document.createElement('div');
          offlineMsg.className = 'fixed top-4 right-4 bg-yellow-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm';
          offlineMsg.innerHTML = `
            <div class="flex items-center gap-3">
              <div class="text-2xl">🎉</div>
              <div>
                <div class="font-bold">Workout Completed!</div>
                <div class="text-sm opacity-90">${duration}min • ${estimatedCalories} cal • ${completedCount}/${totalExercises} exercises</div>
                <div class="text-xs opacity-75 mt-1">⚠️ Will sync when online</div>
              </div>
            </div>
          `;
          document.body.appendChild(offlineMsg);
          setTimeout(() => {
            if (document.body.contains(offlineMsg)) {
              document.body.removeChild(offlineMsg);
            }
          }, 5000);
        }
      } else {
        // Show offline message
        const offlineMsg = document.createElement('div');
        offlineMsg.className = 'fixed top-4 right-4 bg-yellow-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm';
        offlineMsg.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="text-2xl">🎉</div>
            <div>
              <div class="font-bold">Workout Completed!</div>
              <div class="text-sm opacity-90">${duration}min • ${estimatedCalories} cal • ${completedCount}/${totalExercises} exercises</div>
              <div class="text-xs opacity-75 mt-1">📴 Offline mode - will sync later</div>
            </div>
          </div>
        `;
        document.body.appendChild(offlineMsg);
        setTimeout(() => {
          if (document.body.contains(offlineMsg)) {
            document.body.removeChild(offlineMsg);
          }
        }, 5000);
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      
      // Still dispatch the event for local updates
      realTimeEvents.dispatchWorkoutCompleted(workoutData);
      
      // Show basic success message
      const basicMsg = document.createElement('div');
      basicMsg.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm';
      basicMsg.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="text-2xl">🎉</div>
          <div>
            <div class="font-bold">Workout Completed!</div>
            <div class="text-sm opacity-90">${duration}min • ${completedCount}/${totalExercises} exercises</div>
          </div>
        </div>
      `;
      document.body.appendChild(basicMsg);
      setTimeout(() => {
        if (document.body.contains(basicMsg)) {
          document.body.removeChild(basicMsg);
        }
      }, 4000);
    }
    
    // Navigate back to dashboard after a short delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (!workoutStarted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="card text-center">
          <h1 className="text-2xl lg:text-3xl font-semibold text-white mb-4">{plan.name}</h1>
          <p className="text-slate-400 mb-6">
            Ready to start your workout? This plan contains {plan.exercises.length} exercises.
          </p>
          
          <div className="space-y-4 mb-8">
            {plan.exercises.map((exercise, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="text-left">
                  <div className="font-medium text-white">{exercise.name}</div>
                  <div className="text-sm text-slate-400">{exercise.category} • {exercise.sets}</div>
                </div>
                <span className="text-blue-400 font-medium">{index + 1}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/my-plans')}
              className="btn-secondary flex-1"
            >
              Back to Plans
            </button>
            <button
              onClick={startWorkout}
              className="btn bg-green-600 hover:bg-green-700 text-white flex-1"
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
            <div className="text-lg font-bold text-green-400">{formatTime(elapsedTime)}</div>
            <div className="text-sm text-slate-400">Elapsed</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Progress</span>
            <span>{completedExercises.size}/{plan.exercises.length} exercises</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Current Exercise */}
      <div className="card">
        <div className="text-center mb-6">
          <div className="text-sm text-slate-400 mb-2">
            Exercise {currentExercise + 1} of {plan.exercises.length}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {plan.exercises[currentExercise]?.name}
          </h2>
          <div className="text-slate-400">
            {plan.exercises[currentExercise]?.category} • {plan.exercises[currentExercise]?.sets}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => completeExercise(currentExercise)}
            disabled={completedExercises.has(currentExercise)}
            className="btn bg-green-600 hover:bg-green-700 text-white flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completedExercises.has(currentExercise) ? 'Completed ✓' : 'Mark Complete'}
          </button>
          
          {completedExercises.size === plan.exercises.length && (
            <button
              onClick={finishWorkout}
              className="btn bg-blue-600 hover:bg-blue-700 text-white flex-1"
            >
              Finish Workout
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
                  ? 'bg-blue-900/30 border border-blue-500/50' 
                  : completedExercises.has(index)
                  ? 'bg-green-900/20 border border-green-500/30'
                  : 'bg-slate-700/30 hover:bg-slate-700/50'
              }`}
              onClick={() => setCurrentExercise(index)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  completedExercises.has(index)
                    ? 'bg-green-500 text-white'
                    : index === currentExercise
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-600 text-slate-300'
                }`}>
                  {completedExercises.has(index) ? '✓' : index + 1}
                </div>
                <div>
                  <div className="font-medium text-white">{exercise.name}</div>
                  <div className="text-sm text-slate-400">{exercise.sets}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}