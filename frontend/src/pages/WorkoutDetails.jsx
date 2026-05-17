import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function WorkoutDetails() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);

  useEffect(() => {
    // Try both localStorage keys
    let workouts = JSON.parse(localStorage.getItem('workoutSync_workouts') || '[]');
    if (workouts.length === 0) {
      workouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
    }
    const found = workouts.find(w => w.id.toString() === workoutId);
    setWorkout(found);
  }, [workoutId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!workout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4">🏋️</div>
          <div className="text-xl">Workout not found</div>
          <button onClick={() => navigate('/workouts')} className="mt-4 btn bg-red-700 hover:bg-blue-700 text-white">
            Back to Workouts
          </button>
        </div>
      </div>
    );
  }

  const isWorkoutPlan = workout.planId || workout.exercises?.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600/10 via-red-600/10 to-orange-600/10 border-b border-orange-500/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 md:py-4">
          <button
            onClick={() => navigate('/workouts')}
            className="flex items-center gap-1.5 sm:gap-2 md:gap-3 px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-lg sm:rounded-xl border border-neutral-700/50 text-neutral-300 hover:text-white transition-all duration-300"
          >
            <span className="text-orange-400 text-sm sm:text-base">←</span>
            <span className="font-semibold text-[10px] sm:text-xs md:text-sm">BACK TO WORKOUTS</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-5 md:space-y-6">
        {/* Workout Header */}
        <div className="bg-gradient-to-br from-neutral-900/90 via-gray-800/90 to-black/90 border border-orange-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-2xl">
          <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl sm:text-2xl md:text-3xl">🏋️</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-white mb-1.5 sm:mb-2 truncate">{workout.name || workout.exercise}</h1>
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-wrap">
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 bg-orange-600/20 text-orange-400 rounded-lg text-[10px] sm:text-xs md:text-sm font-bold border border-orange-500/30">
                  {workout.category || workout.muscle}
                </span>
                {workout.difficulty && (
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 bg-red-700/20 text-red-500 rounded-lg text-[10px] sm:text-xs md:text-sm font-bold border border-red-600/30">
                    {workout.difficulty}
                  </span>
                )}
                {isWorkoutPlan && (
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 bg-red-800/20 text-red-600 rounded-lg text-[10px] sm:text-xs md:text-sm font-bold border border-red-700/30">
                    📋 Workout Plan
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-neutral-400 text-[10px] sm:text-xs md:text-sm">
            <span>✅ Completed on {formatDate(workout.completedAt)}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-red-700/20 to-blue-800/20 border border-red-600/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 text-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-red-500 mb-0.5 sm:mb-1">{workout.sets}</div>
            <div className="text-[10px] sm:text-xs md:text-sm text-blue-300 font-medium">Total Sets</div>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-red-600/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 text-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-red-500 mb-0.5 sm:mb-1">{workout.reps}</div>
            <div className="text-[10px] sm:text-xs md:text-sm text-green-300 font-medium">Total Reps</div>
          </div>
          <div className="bg-gradient-to-br from-red-800/20 to-purple-800/20 border border-red-700/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 text-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-red-600 mb-0.5 sm:mb-1">{formatTime(workout.duration)}</div>
            <div className="text-[10px] sm:text-xs md:text-sm text-purple-300 font-medium">Duration</div>
          </div>
          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 text-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-orange-400 mb-0.5 sm:mb-1">{workout.caloriesBurned}</div>
            <div className="text-[10px] sm:text-xs md:text-sm text-orange-300 font-medium">Calories</div>
          </div>
        </div>

        {/* Workout Plan Exercises */}
        {isWorkoutPlan && workout.exercises && (
          <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-xl p-3 sm:p-4 md:p-6">
            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
              <span>📋</span>
              <span>Exercises Completed ({workout.exercises.length})</span>
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {workout.exercises.map((ex, idx) => (
                <div key={idx} className="bg-black/50 border border-neutral-700/30 rounded-lg p-2.5 sm:p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2 sm:mb-2.5 md:mb-3">
                    <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white text-xs sm:text-sm md:text-base lg:text-lg truncate">{ex.exerciseName}</div>
                        <div className="text-[10px] sm:text-xs md:text-sm text-neutral-400">Exercise {idx + 1}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-red-500 font-bold text-xs sm:text-sm md:text-base">{formatTime(ex.duration)}</div>
                      <div className="text-[9px] sm:text-[10px] md:text-xs text-neutral-400">Duration</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-2.5 md:mb-3">
                    <div className="bg-neutral-900/50 rounded-lg p-2 sm:p-2.5 md:p-3 text-center">
                      <div className="text-base sm:text-lg md:text-xl font-bold text-red-500">{ex.sets}</div>
                      <div className="text-[9px] sm:text-[10px] md:text-xs text-neutral-400">Sets</div>
                    </div>
                    <div className="bg-neutral-900/50 rounded-lg p-2 sm:p-2.5 md:p-3 text-center">
                      <div className="text-base sm:text-lg md:text-xl font-bold text-red-600">{ex.reps}</div>
                      <div className="text-[9px] sm:text-[10px] md:text-xs text-neutral-400">Total Reps</div>
                    </div>
                    <div className="bg-neutral-900/50 rounded-lg p-2 sm:p-2.5 md:p-3 text-center">
                      <div className="text-base sm:text-lg md:text-xl font-bold text-orange-400">{ex.totalWeight.toFixed(1)}kg</div>
                      <div className="text-[9px] sm:text-[10px] md:text-xs text-neutral-400">Volume</div>
                    </div>
                  </div>
                  
                  {ex.setsData && (
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="text-[10px] sm:text-xs text-neutral-400 font-medium mb-1.5 sm:mb-2">Set Details:</div>
                      {ex.setsData.map((set, setIdx) => (
                        <div key={setIdx} className="flex items-center justify-between bg-neutral-900/30 rounded-lg p-2 sm:p-2.5 md:p-3">
                          <span className="text-neutral-300 font-medium text-[10px] sm:text-xs md:text-sm">Set {setIdx + 1}</span>
                          <span className="text-white font-bold text-xs sm:text-sm md:text-base">{set.reps} reps × {set.weight}kg</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Single Exercise Sets */}
        {!isWorkoutPlan && workout.setsData && (
          <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-xl p-3 sm:p-4 md:p-6">
            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
              <span>💪</span>
              <span>Sets Completed ({workout.setsData.length})</span>
            </h2>
            <div className="space-y-1.5 sm:space-y-2">
              {workout.setsData.map((set, idx) => (
                <div key={idx} className="flex items-center justify-between bg-black/50 border border-neutral-700/30 rounded-lg p-2.5 sm:p-3 md:p-4">
                  <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      {idx + 1}
                    </div>
                    <span className="text-white font-medium text-xs sm:text-sm md:text-base">Set {idx + 1}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-sm sm:text-base md:text-lg">{set.reps} reps × {set.weight}kg</div>
                    {set.duration && (
                      <div className="text-[9px] sm:text-[10px] md:text-xs text-neutral-400">Duration: {formatTime(set.duration)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {workout.notes && (
          <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-xl p-3 sm:p-4 md:p-6">
            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
              <span>📝</span>
              <span>Notes</span>
            </h2>
            <p className="text-neutral-300 text-xs sm:text-sm md:text-base">{workout.notes}</p>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-xl p-3 sm:p-4 md:p-6">
          <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
            <span>ℹ️</span>
            <span>Additional Information</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            {workout.totalWeight && (
              <div className="flex items-center justify-between p-2 sm:p-2.5 md:p-3 bg-black/50 rounded-lg">
                <span className="text-neutral-400 text-[10px] sm:text-xs md:text-sm">Total Volume</span>
                <span className="text-white font-bold text-xs sm:text-sm md:text-base">{workout.totalWeight.toFixed(1)}kg</span>
              </div>
            )}
            {workout.activeTime && (
              <div className="flex items-center justify-between p-2 sm:p-2.5 md:p-3 bg-black/50 rounded-lg">
                <span className="text-neutral-400 text-[10px] sm:text-xs md:text-sm">Active Time</span>
                <span className="text-white font-bold text-xs sm:text-sm md:text-base">{formatTime(workout.activeTime)}</span>
              </div>
            )}
            <div className="flex items-center justify-between p-2 sm:p-2.5 md:p-3 bg-black/50 rounded-lg">
              <span className="text-neutral-400 text-[10px] sm:text-xs md:text-sm">Status</span>
              <span className="text-red-500 font-bold text-xs sm:text-sm md:text-base">✅ Completed</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-2.5 md:p-3 bg-black/50 rounded-lg">
              <span className="text-neutral-400 text-[10px] sm:text-xs md:text-sm">Workout ID</span>
              <span className="text-neutral-300 font-mono text-[10px] sm:text-xs md:text-sm truncate">{workout.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
