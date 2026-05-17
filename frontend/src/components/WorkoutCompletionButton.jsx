import React, { useState } from 'react';
import { useWorkoutCompletionHook as useWorkoutCompletion } from '../hooks/useWorkoutCompletion';

export default function WorkoutCompletionButton({ 
  exercise, 
  category = 'General',
  difficulty = 'Beginner',
  onComplete,
  className = '',
  children 
}) {
  const { completeWorkout, isCompleting } = useWorkoutCompletion();
  const [showModal, setShowModal] = useState(false);
  const [workoutData, setWorkoutData] = useState({
    sets: 1,
    reps: 10,
    weight: 0,
    duration: 0,
    caloriesBurned: 0,
    notes: ''
  });

  const handleQuickComplete = async () => {
    try {
      const completedWorkout = await completeWorkout({
        exercise,
        category,
        difficulty,
        ...workoutData,
        duration: workoutData.duration || 60, // Default 1 minute
        caloriesBurned: workoutData.caloriesBurned || 50 // Default calories
      });
      
      if (onComplete) {
        onComplete(completedWorkout);
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };

  const handleDetailedComplete = async () => {
    try {
      const completedWorkout = await completeWorkout({
        exercise,
        category,
        difficulty,
        ...workoutData
      });
      
      if (onComplete) {
        onComplete(completedWorkout);
      }
      
      setShowModal(false);
      setWorkoutData({
        sets: 1,
        reps: 10,
        weight: 0,
        duration: 0,
        caloriesBurned: 0,
        notes: ''
      });
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isCompleting}
        className={`relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 text-white font-bold px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isCompleting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Completing...
          </div>
        ) : (
          children || '✅ Complete Workout'
        )}
      </button>

      {/* Completion Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-2xl p-6 max-w-md w-full border border-neutral-700/30">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Complete Workout</h3>
              <p className="text-neutral-300">{exercise}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded-full text-xs">
                  {category}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  difficulty === 'Beginner' ? 'bg-green-900/50 text-green-300' :
                  difficulty === 'Intermediate' ? 'bg-yellow-900/50 text-yellow-300' :
                  'bg-red-900/50 text-red-300'
                }`}>
                  {difficulty}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Sets</label>
                  <input
                    type="number"
                    min="1"
                    value={workoutData.sets}
                    onChange={(e) => setWorkoutData(prev => ({ ...prev, sets: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 bg-black/50 border border-neutral-700/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Reps</label>
                  <input
                    type="number"
                    min="1"
                    value={workoutData.reps}
                    onChange={(e) => setWorkoutData(prev => ({ ...prev, reps: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 bg-black/50 border border-neutral-700/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    min="0"
                    value={Math.round(workoutData.duration / 60)}
                    onChange={(e) => setWorkoutData(prev => ({ ...prev, duration: (parseInt(e.target.value) || 0) * 60 }))}
                    className="w-full px-3 py-2 bg-black/50 border border-neutral-700/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Calories</label>
                  <input
                    type="number"
                    min="0"
                    value={workoutData.caloriesBurned}
                    onChange={(e) => setWorkoutData(prev => ({ ...prev, caloriesBurned: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-black/50 border border-neutral-700/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Weight (lbs)</label>
                <input
                  type="number"
                  min="0"
                  value={workoutData.weight}
                  onChange={(e) => setWorkoutData(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-black/50 border border-neutral-700/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Notes (optional)</label>
                <textarea
                  value={workoutData.notes}
                  onChange={(e) => setWorkoutData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="How did it feel? Any observations..."
                  className="w-full px-3 py-2 bg-black/50 border border-neutral-700/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleQuickComplete}
                disabled={isCompleting}
                className="flex-1 bg-gradient-to-r from-red-700 to-blue-700 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50"
              >
                {isCompleting ? 'Completing...' : 'Quick Complete'}
              </button>
              <button
                onClick={handleDetailedComplete}
                disabled={isCompleting}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:opacity-50"
              >
                {isCompleting ? 'Completing...' : 'Complete with Details'}
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-3 text-neutral-400 hover:text-white transition-colors py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}