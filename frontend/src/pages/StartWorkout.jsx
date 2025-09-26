// Real-time Start Workout Component
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
import { onlineService } from '../services/onlineService';

export default function StartWorkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { updateWorkoutStats, triggerUpdate } = useRealTime();
  const [exercise, setExercise] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [workoutData, setWorkoutData] = useState({
    sets: [],
    notes: '',
    startTime: new Date(),
    duration: 0,
    targetSets: 3,
    targetReps: 12
  });
  const [currentSet, setCurrentSet] = useState({ reps: '', weight: '', rest: 60 });
  const [timer, setTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);

  useEffect(() => {
    // Get exercise and configuration from navigation state
    const selectedExercise = location.state?.selectedExercise;
    const workoutConfig = location.state?.workoutConfig;
    
    if (selectedExercise) {
      setExercise(selectedExercise);
      
      // Apply workout configuration if provided
      if (workoutConfig) {
        setCurrentSet({
          reps: workoutConfig.targetReps.toString(),
          weight: workoutConfig.weight.toString(),
          rest: workoutConfig.restTime
        });
        
        // Set initial workout data with config
        setWorkoutData(prev => ({
          ...prev,
          notes: workoutConfig.notes || '',
          targetSets: workoutConfig.targetSets,
          targetReps: workoutConfig.targetReps
        }));
      }
    } else {
      // Fallback exercise if none provided
      setExercise({
        id: 1,
        name: 'Push-ups',
        category: 'Chest',
        icon: '💪',
        color: 'bg-blue-500',
        sets: '3 sets of 10-15 reps',
        difficulty: 'beginner'
      });
    }

    // Check online status
    checkOnlineStatus();
  }, [location.state]);

  // Timer effect - only runs when workout is started
  useEffect(() => {
    if (!workoutStarted) return;
    
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
      if (isResting && restTimer > 0) {
        setRestTimer(prev => prev - 1);
      } else if (isResting && restTimer === 0) {
        setIsResting(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [workoutStarted, isResting, restTimer]);

  const checkOnlineStatus = async () => {
    try {
      const online = await onlineService.checkBackendStatus();
      setIsOnline(online);
    } catch (error) {
      setIsOnline(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addSet = () => {
    if (currentSet.reps && currentSet.weight) {
      const newSet = {
        ...currentSet,
        reps: parseInt(currentSet.reps),
        weight: parseFloat(currentSet.weight),
        timestamp: new Date()
      };
      
      setWorkoutData(prev => ({
        ...prev,
        sets: [...prev.sets, newSet]
      }));
      
      // Start rest timer
      setIsResting(true);
      setRestTimer(currentSet.rest || 60);
      
      // Reset current set
      setCurrentSet(prev => ({ ...prev, reps: '', weight: '' }));
    }
  };

  const finishWorkout = async () => {
    if (workoutData.sets.length === 0) {
      alert('Please add at least one set before finishing the workout.');
      return;
    }

    const finalWorkoutData = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: workoutData.sets,
      notes: workoutData.notes,
      duration: timer,
      completedAt: new Date(),
      calories: Math.floor(timer / 60 * 5)
    };

    try {
      const backendOnline = await onlineService.checkBackendStatus();
      
      if (backendOnline && user) {
        const workoutPayload = {
          title: `${exercise.name} Workout`,
          exercises: [{
            exercise: exercise.name,
            sets: workoutData.sets.map(set => ({
              reps: parseInt(set.reps) || 0,
              weight: parseFloat(set.weight) || 0,
              rest: parseInt(set.rest) || 60
            })),
            notes: workoutData.notes || ''
          }],
          durationMinutes: Math.floor(timer / 60),
          calories: finalWorkoutData.calories,
          date: new Date().toISOString(),
          isPublic: false
        };
        
        const result = await onlineService.saveWorkout(workoutPayload);
        
        if (result) {
          // Trigger real-time updates
          updateWorkoutStats({
            exerciseName: exercise.name,
            sets: workoutData.sets.length,
            duration: timer,
            xpGained: Math.floor(timer / 60 * 10) + workoutData.sets.length * 5
          });
          
          triggerUpdate();
          
          navigate('/', { 
            state: { 
              workoutCompleted: true, 
              exercise: exercise.name,
              duration: formatTime(timer),
              savedOnline: true
            } 
          });
          return;
        }
      }
      
      // Fallback to offline storage
      const savedWorkouts = JSON.parse(localStorage.getItem('offlineWorkouts') || '[]');
      savedWorkouts.push(finalWorkoutData);
      localStorage.setItem('offlineWorkouts', JSON.stringify(savedWorkouts));
      
      // Trigger real-time updates for offline
      updateWorkoutStats({
        exerciseName: exercise.name,
        sets: workoutData.sets.length,
        duration: timer,
        xpGained: Math.floor(timer / 60 * 10) + workoutData.sets.length * 5
      });
      
      triggerUpdate();
      
      navigate('/', { 
        state: { 
          workoutCompleted: true, 
          exercise: exercise.name,
          duration: formatTime(timer),
          savedOffline: true
        } 
      });
      
    } catch (error) {
      // Always save offline as final fallback
      const savedWorkouts = JSON.parse(localStorage.getItem('offlineWorkouts') || '[]');
      savedWorkouts.push(finalWorkoutData);
      localStorage.setItem('offlineWorkouts', JSON.stringify(savedWorkouts));
      
      // Trigger real-time updates for error case
      updateWorkoutStats({
        exerciseName: exercise.name,
        sets: workoutData.sets.length,
        duration: timer,
        xpGained: Math.floor(timer / 60 * 10) + workoutData.sets.length * 5
      });
      
      triggerUpdate();
      
      navigate('/', { 
        state: { 
          workoutCompleted: true, 
          exercise: exercise.name,
          duration: formatTime(timer),
          savedOffline: true,
          error: error.message
        } 
      });
    }
  };

  if (!exercise) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading workout...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/library')}
          className="text-slate-400 hover:text-white flex items-center gap-2"
        >
          ← Back to Library
        </button>
        <div className={`px-3 py-1 rounded-full text-xs ${
          isOnline ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'
        }`}>
          {isOnline ? '🟢 Online - Auto-sync' : '🟡 Offline - Local save'}
        </div>
      </div>

      {/* Exercise Info */}
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 ${exercise.color} rounded-lg flex items-center justify-center`}>
            <span className="text-3xl">{exercise.icon}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{exercise.name}</h1>
            <p className="text-slate-400">{exercise.category} • {exercise.sets}</p>
          </div>
        </div>

        {/* Start Workout Button or Timer */}
        {!workoutStarted ? (
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-6 mb-6 text-center">
            <div className="text-2xl font-bold text-white mb-2">Ready to Start?</div>
            <p className="text-slate-300 mb-4">Take your time to get ready. Click below when you're prepared to begin your workout.</p>
            <button
              onClick={() => setWorkoutStarted(true)}
              className="btn bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
            >
              🚀 Start Workout Duration
            </button>
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {formatTime(timer)}
              </div>
              <div className="text-sm text-slate-400">Workout Duration</div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Progress</span>
                <span>{workoutData.sets.length} / {workoutData.targetSets} sets</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (workoutData.sets.length / workoutData.targetSets) * 100)}%` }}
                ></div>
              </div>
            </div>
            
            {workoutData.sets.length >= workoutData.targetSets && (
              <div className="text-center text-green-400 text-sm font-medium">
                ✅ Target sets completed! You can add more or finish.
              </div>
            )}
          </div>
        )}

        {/* Rest Timer */}
        {isResting && (
          <div className="bg-orange-600/20 border border-orange-500 rounded-lg p-4 mb-6 text-center">
            <div className="text-2xl font-bold text-orange-400 mb-2">
              Rest: {formatTime(restTimer)}
            </div>
            <div className="text-sm text-orange-300">
              Take a break before your next set ({Math.floor(currentSet.rest / 60)}:{(currentSet.rest % 60).toString().padStart(2, '0')} total)
            </div>
            {restTimer <= 10 && restTimer > 0 && (
              <div className="text-xs text-orange-200 mt-1 animate-pulse">
                ⚠️ Get ready for your next set!
              </div>
            )}
          </div>
        )}

        {/* Current Set Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Reps</label>
            <input
              type="number"
              value={currentSet.reps}
              onChange={(e) => setCurrentSet(prev => ({ ...prev, reps: e.target.value }))}
              className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white"
              placeholder="12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Weight (kg)</label>
            <input
              type="number"
              step="0.5"
              value={currentSet.weight}
              onChange={(e) => setCurrentSet(prev => ({ ...prev, weight: e.target.value }))}
              className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white"
              placeholder="20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Rest Time ({Math.floor(currentSet.rest / 60)}:{(currentSet.rest % 60).toString().padStart(2, '0')})
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSet(prev => ({ ...prev, rest: Math.max(15, prev.rest - 15) }))}
                className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white text-sm"
              >
                -
              </button>
              <input
                type="number"
                value={currentSet.rest}
                onChange={(e) => setCurrentSet(prev => ({ ...prev, rest: parseInt(e.target.value) || 60 }))}
                className="flex-1 p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white text-center"
                min="15"
                max="900"
                placeholder="60"
              />
              <button
                onClick={() => setCurrentSet(prev => ({ ...prev, rest: prev.rest + 15 }))}
                className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white text-sm"
              >
                +
              </button>
            </div>
            <div className="flex gap-1 mt-2">
              {[30, 60, 90, 120, 180].map(time => (
                <button
                  key={time}
                  onClick={() => setCurrentSet(prev => ({ ...prev, rest: time }))}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    currentSet.rest === time 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {time >= 60 ? `${Math.floor(time/60)}m` : `${time}s`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {workoutStarted && (
          <button
            onClick={addSet}
            disabled={!currentSet.reps || !currentSet.weight || isResting}
            className="btn bg-blue-600 hover:bg-blue-700 text-white w-full mb-6 disabled:opacity-50"
          >
            {isResting ? 'Resting...' : 'Add Set'}
          </button>
        )}

        {/* Completed Sets */}
        {workoutData.sets.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Completed Sets</h3>
            <div className="space-y-2">
              {workoutData.sets.map((set, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-800/30 rounded-lg p-3">
                  <span className="text-white">Set {index + 1}</span>
                  <span className="text-slate-300">{set.reps} reps × {set.weight}kg</span>
                  <span className="text-green-400">✓</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
          <textarea
            value={workoutData.notes}
            onChange={(e) => setWorkoutData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white"
            rows={3}
            placeholder="How did this exercise feel? Any observations..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/library')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            onClick={finishWorkout}
            disabled={workoutData.sets.length === 0}
            className="btn bg-green-600 hover:bg-green-700 text-white flex-1 disabled:opacity-50"
          >
            Finish Workout ({workoutData.sets.length} sets)
          </button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-400">{workoutData.sets.length}</div>
          <div className="text-sm text-slate-400">Sets Completed</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-400">
            {workoutData.sets.reduce((total, set) => total + set.reps, 0)}
          </div>
          <div className="text-sm text-slate-400">Total Reps</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-400">
            {Math.floor(timer / 60 * 5)}
          </div>
          <div className="text-sm text-slate-400">Est. Calories</div>
        </div>
      </div>
    </div>
  );
}