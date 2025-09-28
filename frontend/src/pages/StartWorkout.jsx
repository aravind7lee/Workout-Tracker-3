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
  const [showSetSelector, setShowSetSelector] = useState(false);
  const [customSets, setCustomSets] = useState(3);
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
        setCustomSets(workoutConfig.targetSets);
      } else {
        // Show set selector for new workouts
        setShowSetSelector(true);
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
      setShowSetSelector(true);
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

    const completedWorkout = {
      id: Date.now(),
      exercise: exercise.name,
      name: exercise.name,
      category: exercise.category,
      difficulty: exercise.difficulty,
      completedAt: new Date().toISOString(),
      duration: timer,
      caloriesBurned: Math.floor(timer / 60 * 5) + workoutData.sets.length * 10,
      sets: workoutData.sets.length,
      reps: workoutData.sets.reduce((total, set) => total + set.reps, 0),
      totalWeight: workoutData.sets.reduce((total, set) => total + (set.weight * set.reps), 0),
      userId: user?.id,
      savedOffline: !isOnline,
      notes: workoutData.notes || `Completed ${workoutData.sets.length} sets in ${formatTime(timer)}`,
      setsData: workoutData.sets
    };

    try {
      // Save to localStorage for /workouts page
      const existing = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
      const updatedWorkouts = [completedWorkout, ...existing];
      localStorage.setItem('completedWorkouts', JSON.stringify(updatedWorkouts));
      
      // Calculate real-time stats
      const todayWorkouts = updatedWorkouts.filter(w => 
        new Date(w.completedAt).toDateString() === new Date().toDateString()
      ).length;
      
      const weeklyWorkouts = updatedWorkouts.filter(w => {
        const workoutDate = new Date(w.completedAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return workoutDate >= weekAgo;
      }).length;
      
      // Trigger comprehensive real-time events
      window.dispatchEvent(new CustomEvent('workoutCompleted', { detail: completedWorkout }));
      
      window.dispatchEvent(new CustomEvent('realTimeStatsUpdate', { 
        detail: { 
          todayWorkouts,
          totalWorkouts: updatedWorkouts.length,
          weeklyWorkouts,
          totalCalories: updatedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)
        }
      }));
      
      // Trigger streak update
      window.dispatchEvent(new CustomEvent('streakUpdated', { 
        detail: { 
          type: 'WORKOUT_COMPLETED',
          currentStreak: todayWorkouts,
          exercise: exercise.name
        }
      }));
      
      console.log('🎯 Workout completed from StartWorkout:', completedWorkout);
      
      // Navigate to workouts page to show the completed workout
      navigate('/workouts', { 
        state: { 
          workoutCompleted: true, 
          exercise: exercise.name,
          duration: formatTime(timer),
          sets: workoutData.sets.length,
          calories: completedWorkout.caloriesBurned
        } 
      });
      
    } catch (error) {
      console.error('Error finishing workout:', error);
      alert('Error saving workout. Please try again.');
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

        {/* Set Selector Modal */}
        {showSetSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">How many sets do you want to perform?</h3>
              <p className="text-slate-300 mb-6">Choose the number of sets for your {exercise.name} workout.</p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[1,2,3,4,5,6].map(num => (
                  <button
                    key={num}
                    onClick={() => setCustomSets(num)}
                    className={`p-4 rounded-lg text-center transition-all ${
                      customSets === num 
                        ? 'bg-blue-600 text-white border-2 border-blue-400' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-2 border-transparent'
                    }`}
                  >
                    <div className="text-2xl font-bold">{num}</div>
                    <div className="text-xs">{num === 1 ? 'set' : 'sets'}</div>
                  </button>
                ))}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Custom amount:</label>
                <input
                  type="number"
                  value={customSets}
                  onChange={(e) => setCustomSets(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
                  min="1"
                  max="20"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/library')}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setWorkoutData(prev => ({ ...prev, targetSets: customSets }));
                    setShowSetSelector(false);
                  }}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  Start with {customSets} {customSets === 1 ? 'set' : 'sets'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Start Workout Button or Timer */}
        {!workoutStarted && !showSetSelector && (
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-6 mb-6 text-center">
            <div className="text-2xl font-bold text-white mb-2">Ready to Start?</div>
            <p className="text-slate-300 mb-2">Target: {workoutData.targetSets} {workoutData.targetSets === 1 ? 'set' : 'sets'}</p>
            <p className="text-slate-400 mb-4 text-sm">Take your time to get ready. Click below when you're prepared to begin your workout.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowSetSelector(true)}
                className="btn bg-slate-600 hover:bg-slate-700 text-white px-6 py-3"
              >
                ⚙️ Change Sets
              </button>
              <button
                onClick={() => setWorkoutStarted(true)}
                className="btn bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
              >
                🚀 Start Workout
              </button>
            </div>
          </div>
        )}

        {workoutStarted && (
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
            className="btn bg-green-600 hover:bg-green-700 text-white flex-1 disabled:opacity-50 font-semibold"
          >
            ✅ Finish Workout ({workoutData.sets.length}/{workoutData.targetSets} sets)
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