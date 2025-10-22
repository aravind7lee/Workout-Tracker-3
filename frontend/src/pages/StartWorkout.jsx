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
  const [isPaused, setIsPaused] = useState(false);
  const [currentSetInProgress, setCurrentSetInProgress] = useState(false);
  const [isInRestPeriod, setIsInRestPeriod] = useState(false);
  const [showRestChoice, setShowRestChoice] = useState(false);
  const [currentSetTimer, setCurrentSetTimer] = useState(0);
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);
  const [currentSetStarted, setCurrentSetStarted] = useState(false);
  const [showWorkoutComplete, setShowWorkoutComplete] = useState(false);

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

  // Timer effect - workout timer pauses during rest and choice selection
  useEffect(() => {
    if (!workoutStarted || isPaused) return;
    
    const interval = setInterval(() => {
      // Current set timer - only runs when set is started and not resting/choosing and workout not complete
      if (!isResting && !showRestChoice && currentSetStarted && !showWorkoutComplete) {
        setCurrentSetTimer(prev => prev + 1);
      }
      
      // Handle rest timer separately
      if (isResting && restTimer > 0) {
        setRestTimer(prev => prev - 1);
      } else if (isResting && restTimer === 0) {
        setIsResting(false);
        setIsInRestPeriod(false);
        // Ensure inputs are clear when rest ends
        if (!currentSet.reps && !currentSet.weight) {
          // Inputs already cleared, ready for next set
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [workoutStarted, isPaused, isResting, restTimer, showRestChoice, currentSetStarted, showWorkoutComplete]);

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

  const finishSet = () => {
    if (currentSet.reps && currentSet.weight) {
      const newSet = {
        ...currentSet,
        reps: parseInt(currentSet.reps),
        weight: parseFloat(currentSet.weight),
        timestamp: new Date(),
        duration: currentSetTimer // Save current set duration
      };
      
      const updatedSets = [...workoutData.sets, newSet];
      
      setWorkoutData(prev => ({
        ...prev,
        sets: updatedSets
      }));
      
      // Add current set time to total workout time
      setTotalWorkoutTime(prev => prev + currentSetTimer);
      
      // Reset current set timer for next set
      setCurrentSetTimer(0);
      
      // Check if all target sets are completed
      if (updatedSets.length >= workoutData.targetSets) {
        // All sets completed - stop timers and show completion message
        setCurrentSetStarted(false);
        setShowWorkoutComplete(true);
      } else {
        // More sets remaining - show rest choice
        setShowRestChoice(true);
      }
      
      // Don't reset here - will be reset when user chooses rest option
    }
  };
  
  const startRest = () => {
    setIsResting(true);
    setIsInRestPeriod(true);
    setRestTimer(currentSet.rest || 60);
    setShowRestChoice(false);
    // Clear inputs for next set - user must enter new values
    setCurrentSet(prev => ({ ...prev, reps: '', weight: '' }));
    // Reset set started state - user must start next set manually
    setCurrentSetStarted(false);
  };
  
  const skipRest = () => {
    setShowRestChoice(false);
    // Clear inputs for next set - user must enter new values
    setCurrentSet(prev => ({ ...prev, reps: '', weight: '' }));
    // Reset set started state - user must start next set manually
    setCurrentSetStarted(false);
  };

  const finishWorkout = async () => {
    if (workoutData.sets.length === 0) {
      alert('Please add at least one set before finishing the workout.');
      return;
    }

    // Calculate total active workout time (excluding rest periods)
    const totalActiveTime = totalWorkoutTime + currentSetTimer;
    
    const completedWorkout = {
      id: Date.now(),
      exercise: exercise.name,
      name: exercise.name,
      category: exercise.category || exercise.muscle || 'Other',
      muscle: exercise.category || exercise.muscle || 'Other',
      difficulty: exercise.difficulty,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      duration: totalActiveTime, // Use active time instead of total time
      totalTime: timer, // Keep total time including rest
      activeTime: totalActiveTime, // Explicit active time tracking
      caloriesBurned: Math.floor(totalActiveTime / 60 * 5) + workoutData.sets.length * 10,
      sets: workoutData.sets.length,
      reps: workoutData.sets.reduce((total, set) => total + set.reps, 0),
      totalWeight: workoutData.sets.reduce((total, set) => total + (set.weight * set.reps), 0),
      userId: user?.id,
      user: user?.id,
      savedOffline: !isOnline,
      notes: workoutData.notes || `Completed ${workoutData.sets.length} sets in ${formatTime(totalActiveTime)} active time`,
      setsData: workoutData.sets
    };
    
    console.log('🎯 StartWorkout: Saving completed workout:', completedWorkout);

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
      
      // Trigger comprehensive real-time events with duration data
      window.dispatchEvent(new CustomEvent('workoutCompleted', { detail: completedWorkout }));
      
      window.dispatchEvent(new CustomEvent('realTimeStatsUpdate', { 
        detail: { 
          todayWorkouts,
          totalWorkouts: updatedWorkouts.length,
          weeklyWorkouts,
          totalCalories: updatedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
          totalDuration: updatedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)
        }
      }));
      
      // Trigger analytics refresh specifically
      window.dispatchEvent(new CustomEvent('analyticsRefresh', { 
        detail: { 
          workout: completedWorkout,
          duration: totalActiveTime
        }
      }));
      
      console.log('📡 Events dispatched: workoutCompleted, realTimeStatsUpdate, analyticsRefresh');
      
      // Trigger streak update
      window.dispatchEvent(new CustomEvent('streakUpdated', { 
        detail: { 
          type: 'WORKOUT_COMPLETED',
          currentStreak: todayWorkouts,
          exercise: exercise.name
        }
      }));
      
      console.log('🎯 Workout saved to localStorage:', completedWorkout);
      console.log('🎯 Total workouts in storage:', updatedWorkouts.length);
      
      // Navigate to analytics page to show the updated charts
      navigate('/analytics', { 
        state: { 
          workoutCompleted: true, 
          exercise: exercise.name,
          duration: formatTime(totalActiveTime),
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
      <div className={`card ${isPaused ? 'ring-2 ring-yellow-500/50 bg-yellow-900/10' : ''}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 ${exercise.color} rounded-lg flex items-center justify-center relative`}>
            <span className="text-3xl">{exercise.icon}</span>
            {isPaused && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-black">⏸️</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{exercise.name}</h1>
            <p className="text-slate-400">{exercise.category} • {exercise.sets}</p>
            {isPaused && (
              <p className="text-yellow-400 text-sm font-medium animate-pulse">⏸️ Workout Paused</p>
            )}
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
            <p className="text-slate-400 mb-4 text-sm">Enter your reps and weight before starting the workout.</p>
            
            {/* Pre-workout validation inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Reps</label>
                <input
                  type="number"
                  value={currentSet.reps}
                  onChange={(e) => setCurrentSet(prev => ({ ...prev, reps: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white text-center"
                  placeholder="12"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={currentSet.weight}
                  onChange={(e) => setCurrentSet(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white text-center"
                  placeholder="20"
                  min="0"
                />
              </div>
            </div>
            
            {/* Validation message */}
            {(!currentSet.reps || !currentSet.weight) && (
              <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-3 mb-4 text-yellow-300 text-sm">
                ⚠️ Please enter both reps and weight to start your workout
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowSetSelector(true)}
                className="btn bg-slate-600 hover:bg-slate-700 text-white px-6 py-3"
              >
                ⚙️ Change Sets
              </button>
              <button
                onClick={() => {
                  if (!currentSet.reps || !currentSet.weight) {
                    alert('Please enter both reps and weight before starting the workout!');
                    return;
                  }
                  setWorkoutStarted(true);
                  setCurrentSetStarted(true);
                }}
                disabled={!currentSet.reps || !currentSet.weight}
                className="btn bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🚀 Start Workout
              </button>
            </div>
          </div>
        )}

        {workoutStarted && !showWorkoutComplete && (
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {showRestChoice ? formatTime(0) : isResting ? formatTime(0) : formatTime(currentSetTimer)}
              </div>
              <div className="text-sm text-slate-400">
                {showRestChoice ? 'Set Completed - Choose Rest Option' : 
                 isResting ? 'Resting (Set Timer Reset)' : 
                 !currentSetStarted && workoutData.sets.length > 0 ? `Set ${workoutData.sets.length + 1} - Enter Details to Start` :
                 'Current Set Duration'}
              </div>
              {totalWorkoutTime > 0 && (
                <div className="text-xs text-slate-500 mt-1">
                  Total Active Time: {formatTime(totalWorkoutTime)}
                </div>
              )}
              
              {/* Pause/Resume Button */}
              <div className="mt-3">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`btn ${isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white px-6 py-2`}
                >
                  {isPaused ? '▶️ Resume Workout' : '⏸️ Pause Workout'}
                </button>
              </div>
              
              {isPaused && (
                <div className="mt-2 text-yellow-400 text-sm animate-pulse">
                  ⏸️ Workout paused - Timer stopped
                </div>
              )}
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

        {/* Workout Completion Message */}
        {showWorkoutComplete && (
          <div className="bg-gradient-to-r from-green-600/30 to-blue-600/30 border border-green-400 rounded-lg p-8 mb-6 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <div className="text-3xl font-bold text-green-400 mb-3">Congratulations!</div>
            <div className="text-xl font-semibold text-white mb-2">You have successfully completed</div>
            <div className="text-2xl font-bold text-blue-400 mb-4">{workoutData.targetSets} sets of {exercise.name}!</div>
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">{workoutData.sets.length}</div>
                  <div className="text-sm text-slate-300">Sets Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">{formatTime(totalWorkoutTime + currentSetTimer)}</div>
                  <div className="text-sm text-slate-300">Active Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{workoutData.sets.reduce((total, set) => total + set.reps, 0)}</div>
                  <div className="text-sm text-slate-300">Total Reps</div>
                </div>
              </div>
            </div>
            <div className="text-lg text-green-300 mb-6">💪 Outstanding effort! You've crushed your workout goals!</div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowWorkoutComplete(false);
                  // Add one more set if user wants
                  setCurrentSet(prev => ({ ...prev, reps: '', weight: '' }));
                  setCurrentSetStarted(false);
                }}
                className="btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
              >
                💪 Add Bonus Set
              </button>
              <button
                onClick={finishWorkout}
                className="btn bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
              >
                🏆 Finish Workout
              </button>
            </div>
          </div>
        )}
        
        {/* Rest Choice Modal - Only for incomplete workouts */}
        {showRestChoice && (
          <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-6 mb-6 text-center">
            <div className="text-2xl font-bold text-white mb-3">✅ Set Completed!</div>
            <p className="text-slate-300 mb-4">What would you like to do next?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={startRest}
                className="btn bg-orange-600 hover:bg-orange-700 text-white px-6 py-3"
              >
                🛌 Take Rest ({Math.floor(currentSet.rest / 60)}:{(currentSet.rest % 60).toString().padStart(2, '0')})
              </button>
              <button
                onClick={skipRest}
                className="btn bg-green-600 hover:bg-green-700 text-white px-6 py-3"
              >
                🚀 Next Set Now
              </button>
            </div>
          </div>
        )}
        
        {/* Rest Timer */}
        {isResting && (
          <div className="bg-orange-600/20 border border-orange-500 rounded-lg p-4 mb-6 text-center">
            <div className="text-2xl font-bold text-orange-400 mb-2">
              🛌 Rest: {isPaused ? '⏸️ Paused' : formatTime(restTimer)}
            </div>
            <div className="text-sm text-orange-300">
              {isPaused ? 'Rest timer paused' : `Take a break before your next set (${Math.floor(currentSet.rest / 60)}:${(currentSet.rest % 60).toString().padStart(2, '0')} total)`}
            </div>
            <div className="text-xs text-blue-300 mt-1">
              💡 Workout timer paused during rest
            </div>
            
            {/* Finish Rest Button */}
            {!isPaused && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    setIsResting(false);
                    setIsInRestPeriod(false);
                    setRestTimer(0);
                    // Clear inputs for next set - user must enter new values
                    setCurrentSet(prev => ({ ...prev, reps: '', weight: '' }));
                    // Reset set started state - user must start next set manually
                    setCurrentSetStarted(false);
                  }}
                  className="btn bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm font-semibold"
                >
                  ✅ Finish Rest Early
                </button>
                <div className="text-xs text-slate-400 mt-2">
                  Ready to continue? Skip the remaining rest time
                </div>
              </div>
            )}
            
            {!isPaused && restTimer <= 10 && restTimer > 0 && (
              <div className="text-xs text-orange-200 mt-1 animate-pulse">
                ⚠️ Get ready for your next set!
              </div>
            )}
            {isPaused && (
              <div className="text-xs text-yellow-200 mt-1">
                ⏸️ Resume to continue rest timer
              </div>
            )}
          </div>
        )}

        {/* Current Set Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Reps {workoutData.sets.length > 0 && `(Set ${workoutData.sets.length + 1})`}
            </label>
            <input
              type="number"
              value={currentSet.reps}
              onChange={(e) => setCurrentSet(prev => ({ ...prev, reps: e.target.value }))}
              className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white"
              placeholder={workoutData.sets.length > 0 ? "Enter reps for next set" : "12"}
              disabled={isPaused}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Weight (kg) {workoutData.sets.length > 0 && `(Set ${workoutData.sets.length + 1})`}
            </label>
            <input
              type="number"
              step="0.5"
              value={currentSet.weight}
              onChange={(e) => setCurrentSet(prev => ({ ...prev, weight: e.target.value }))}
              className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white"
              placeholder={workoutData.sets.length > 0 ? "Enter weight for next set" : "20"}
              disabled={isPaused}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Rest Time ({Math.floor(currentSet.rest / 60)}:{(currentSet.rest % 60).toString().padStart(2, '0')})
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSet(prev => ({ ...prev, rest: Math.max(15, prev.rest - 15) }))}
                disabled={isPaused}
                className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white text-sm disabled:opacity-50"
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
                disabled={isPaused}
              />
              <button
                onClick={() => setCurrentSet(prev => ({ ...prev, rest: prev.rest + 15 }))}
                disabled={isPaused}
                className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white text-sm disabled:opacity-50"
              >
                +
              </button>
            </div>
            <div className="flex gap-1 mt-2">
              {[30, 60, 90, 120, 180].map(time => (
                <button
                  key={time}
                  onClick={() => setCurrentSet(prev => ({ ...prev, rest: time }))}
                  disabled={isPaused}
                  className={`px-2 py-1 rounded text-xs transition-colors disabled:opacity-50 ${
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
          <>
            {/* Set preparation section for subsequent sets */}
            {workoutData.sets.length > 0 && !isResting && !showRestChoice && !showWorkoutComplete && !currentSetStarted && (
              <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-6 mb-6 text-center">
                <div className="text-2xl font-bold text-white mb-2">Ready for Set {workoutData.sets.length + 1}?</div>
                <p className="text-slate-300 mb-2">Target: {workoutData.targetSets} {workoutData.targetSets === 1 ? 'set' : 'sets'}</p>
                <p className="text-slate-400 mb-4 text-sm">Enter your reps and weight before starting this set.</p>
                
                {/* Input validation for next set */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Reps</label>
                    <input
                      type="number"
                      value={currentSet.reps}
                      onChange={(e) => setCurrentSet(prev => ({ ...prev, reps: e.target.value }))}
                      className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white text-center"
                      placeholder="12"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={currentSet.weight}
                      onChange={(e) => setCurrentSet(prev => ({ ...prev, weight: e.target.value }))}
                      className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white text-center"
                      placeholder="20"
                      min="0"
                    />
                  </div>
                </div>
                
                {/* Validation message */}
                {(!currentSet.reps || !currentSet.weight) && (
                  <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-3 mb-4 text-yellow-300 text-sm">
                    ⚠️ Please enter both reps and weight to start Set {workoutData.sets.length + 1}
                  </div>
                )}
                
                <button
                  onClick={() => {
                    if (!currentSet.reps || !currentSet.weight) {
                      alert(`Please enter both reps and weight before starting Set ${workoutData.sets.length + 1}!`);
                      return;
                    }
                    setCurrentSetStarted(true);
                  }}
                  disabled={!currentSet.reps || !currentSet.weight}
                  className="btn bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚀 Start Set {workoutData.sets.length + 1}
                </button>
              </div>
            )}
            
            {/* Finish Set Button - only show when set is started and workout not complete */}
            {currentSetStarted && !showWorkoutComplete && (
              <button
                onClick={finishSet}
                disabled={!currentSet.reps || !currentSet.weight || isResting || isPaused || showRestChoice}
                className="btn bg-blue-600 hover:bg-blue-700 text-white w-full mb-6 disabled:opacity-50"
              >
                {isPaused ? 'Workout Paused' : isResting ? 'Resting...' : showRestChoice ? 'Choose Rest Option Above' : `✅ Finish Set ${workoutData.sets.length + 1}`}
              </button>
            )}
          </>
        )}

        {/* Completed Sets */}
        {workoutData.sets.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Completed Sets</h3>
            <div className="space-y-2">
              {workoutData.sets.map((set, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-800/30 rounded-lg p-3">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">Set {index + 1}</span>
                    <span className="text-xs text-slate-400">⏱️ {formatTime(set.duration || 0)}</span>
                  </div>
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
            disabled={isPaused}
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
            disabled={workoutData.sets.length === 0 || isPaused}
            className="btn bg-green-600 hover:bg-green-700 text-white flex-1 disabled:opacity-50 font-semibold"
          >
            {isPaused ? '⏸️ Resume to Finish' : `✅ Finish Workout (${workoutData.sets.length}/${workoutData.targetSets} sets)`}
          </button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`card text-center ${isPaused ? 'opacity-60' : ''}`}>
          <div className="text-2xl font-bold text-blue-400">{workoutData.sets.length}</div>
          <div className="text-sm text-slate-400">Sets Completed</div>
        </div>
        <div className={`card text-center ${isPaused ? 'opacity-60' : ''}`}>
          <div className="text-2xl font-bold text-green-400">
            {workoutData.sets.reduce((total, set) => total + set.reps, 0)}
          </div>
          <div className="text-sm text-slate-400">Total Reps</div>
        </div>
        <div className={`card text-center ${isPaused ? 'opacity-60' : ''}`}>
          <div className="text-2xl font-bold text-purple-400">
            {showWorkoutComplete ? formatTime(totalWorkoutTime) : formatTime(totalWorkoutTime + currentSetTimer)}
          </div>
          <div className="text-sm text-slate-400">{showWorkoutComplete ? 'Final Active Time' : 'Active Time'}</div>
          {isPaused && !showWorkoutComplete && (
            <div className="text-xs text-yellow-400 mt-1">⏸️ Paused</div>
          )}
          {showWorkoutComplete && (
            <div className="text-xs text-green-400 mt-1">✅ Completed</div>
          )}
        </div>
      </div>
    </div>
  );
}