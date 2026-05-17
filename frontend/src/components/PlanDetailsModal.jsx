// frontend/src/components/PlanDetailsModal.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function PlanDetailsModal({ plan, onClose }) {
  if (!plan) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50" onClick={onClose}>
      <div className="card w-full max-w-xs sm:max-w-md lg:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white truncate pr-2">{plan.name}</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-xl sm:text-2xl flex-shrink-0 w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <span className="text-xs text-neutral-400 bg-neutral-700/50 px-2 py-1 rounded w-fit">
            {plan.category}
          </span>
          <span className="text-sm text-neutral-400">
            {plan.exercises.length} {plan.exercises.length === 1 ? 'exercise' : 'exercises'}
          </span>
          <span className="text-xs text-neutral-500">
            Created: {new Date(plan.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="mb-4 sm:mb-6">
          <h4 className="text-base sm:text-lg font-medium text-white mb-3">All Exercises</h4>
          <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 lg:max-h-96 overflow-y-auto exercise-scroll">
            {plan.exercises.map((exercise, index) => (
              <div key={index} className="flex items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-neutral-800/30 rounded-lg">
                <span className="text-red-500 font-bold text-xs sm:text-sm bg-blue-900/30 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 sm:mt-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm sm:text-base truncate">
                    {exercise.name}
                  </div>
                  <div className="text-xs text-neutral-400 flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                    <span className="bg-neutral-700/50 px-1 sm:px-2 py-1 rounded">{exercise.sets}</span>
                    {exercise.difficulty && (
                      <span className={`px-1 sm:px-2 py-1 rounded text-xs ${
                        exercise.difficulty === 'beginner' ? 'bg-green-900/30 text-green-300' :
                        exercise.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-300' :
                        'bg-red-900/30 text-red-300'
                      }`}>
                        {exercise.difficulty}
                      </span>
                    )}
                    {exercise.type && (
                      <span className="text-neutral-500 hidden sm:inline">{exercise.type}</span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1 sm:hidden">
                    {exercise.category}
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-neutral-400 hidden sm:block flex-shrink-0">
                  {exercise.category}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link
            to={`/workout/${plan.id}`}
            className="btn bg-green-600 hover:bg-green-700 text-white flex-1 text-center text-sm sm:text-base"
            onClick={onClose}
          >
            🏋️ Start Workout
          </Link>
          <Link
            to={`/edit-plan/${plan.id}`}
            className="btn bg-red-700 hover:bg-blue-700 text-white flex-1 text-center text-sm sm:text-base"
            onClick={onClose}
          >
            ✏️ Edit Plan
          </Link>
          <button
            onClick={onClose}
            className="btn-secondary flex-1 text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}