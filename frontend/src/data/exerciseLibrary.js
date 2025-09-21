// frontend/src/data/exerciseLibrary.js
export const exerciseLibrary = {
  chest: {
    name: 'Chest',
    icon: '💪',
    color: 'bg-red-600',
    exercises: [
      { id: 'chest-1', name: 'Barbell Bench Press', sets: '4x6-8', type: 'compound', difficulty: 'intermediate' },
      { id: 'chest-2', name: 'Incline Dumbbell Press', sets: '3x8-10', type: 'compound', difficulty: 'beginner' },
      { id: 'chest-3', name: 'Decline Bench Press', sets: '3x8-10', type: 'compound', difficulty: 'intermediate' },
      { id: 'chest-4', name: 'Cable Crossover', sets: '3x10-12', type: 'isolation', difficulty: 'beginner' },
      { id: 'chest-5', name: 'Pec-Deck Machine', sets: '3x10-12', type: 'isolation', difficulty: 'beginner' },
      { id: 'chest-6', name: 'Weighted Dips', sets: '3x10-15', type: 'compound', difficulty: 'advanced' },
      { id: 'chest-7', name: 'Push-ups', sets: '3x15-20', type: 'compound', difficulty: 'beginner' },
      { id: 'chest-8', name: 'Incline Cable Fly', sets: '3x12-15', type: 'isolation', difficulty: 'intermediate' }
    ]
  },
  shoulders: {
    name: 'Shoulders',
    icon: '🔥',
    color: 'bg-orange-600',
    exercises: [
      { id: 'shoulders-1', name: 'Overhead Press', sets: '4x6-8', type: 'compound', difficulty: 'intermediate' },
      { id: 'shoulders-2', name: 'Lateral Raises', sets: '3x12-15', type: 'isolation', difficulty: 'beginner' },
      { id: 'shoulders-3', name: 'Front Raises', sets: '3x12-15', type: 'isolation', difficulty: 'beginner' },
      { id: 'shoulders-4', name: 'Rear Delt Fly', sets: '3x12-15', type: 'isolation', difficulty: 'beginner' },
      { id: 'shoulders-5', name: 'Arnold Press', sets: '3x10-12', type: 'compound', difficulty: 'intermediate' },
      { id: 'shoulders-6', name: 'Upright Rows', sets: '3x10-12', type: 'compound', difficulty: 'intermediate' },
      { id: 'shoulders-7', name: 'Face Pulls', sets: '3x15-20', type: 'isolation', difficulty: 'beginner' },
      { id: 'shoulders-8', name: 'Pike Push-ups', sets: '3x10-15', type: 'compound', difficulty: 'intermediate' }
    ]
  },
  back: {
    name: 'Back',
    icon: '🎯',
    color: 'bg-blue-600',
    exercises: [
      { id: 'back-1', name: 'Deadlift', sets: '4x5-6', type: 'compound', difficulty: 'advanced' },
      { id: 'back-2', name: 'Pull-ups', sets: '3x6-10', type: 'compound', difficulty: 'intermediate' },
      { id: 'back-3', name: 'Barbell Rows', sets: '4x8-10', type: 'compound', difficulty: 'intermediate' },
      { id: 'back-4', name: 'Lat Pulldowns', sets: '3x10-12', type: 'compound', difficulty: 'beginner' },
      { id: 'back-5', name: 'Cable Rows', sets: '3x10-12', type: 'compound', difficulty: 'beginner' },
      { id: 'back-6', name: 'T-Bar Rows', sets: '3x8-10', type: 'compound', difficulty: 'intermediate' },
      { id: 'back-7', name: 'Single-Arm Dumbbell Row', sets: '3x10-12', type: 'compound', difficulty: 'beginner' },
      { id: 'back-8', name: 'Hyperextensions', sets: '3x12-15', type: 'isolation', difficulty: 'beginner' }
    ]
  },
  arms: {
    name: 'Arms',
    icon: '💥',
    color: 'bg-purple-600',
    exercises: [
      { id: 'arms-1', name: 'Barbell Curls', sets: '3x10-12', type: 'isolation', difficulty: 'beginner' },
      { id: 'arms-2', name: 'Close-Grip Bench Press', sets: '3x8-10', type: 'compound', difficulty: 'intermediate' },
      { id: 'arms-3', name: 'Hammer Curls', sets: '3x10-12', type: 'isolation', difficulty: 'beginner' },
      { id: 'arms-4', name: 'Tricep Dips', sets: '3x10-15', type: 'compound', difficulty: 'intermediate' },
      { id: 'arms-5', name: 'Preacher Curls', sets: '3x10-12', type: 'isolation', difficulty: 'intermediate' },
      { id: 'arms-6', name: 'Overhead Tricep Extension', sets: '3x10-12', type: 'isolation', difficulty: 'beginner' },
      { id: 'arms-7', name: 'Cable Curls', sets: '3x12-15', type: 'isolation', difficulty: 'beginner' },
      { id: 'arms-8', name: 'Tricep Pushdowns', sets: '3x12-15', type: 'isolation', difficulty: 'beginner' }
    ]
  },
  legs: {
    name: 'Legs',
    icon: '🦵',
    color: 'bg-green-600',
    exercises: [
      { id: 'legs-1', name: 'Squats', sets: '4x8-10', type: 'compound', difficulty: 'intermediate' },
      { id: 'legs-2', name: 'Romanian Deadlifts', sets: '3x8-10', type: 'compound', difficulty: 'intermediate' },
      { id: 'legs-3', name: 'Leg Press', sets: '3x12-15', type: 'compound', difficulty: 'beginner' },
      { id: 'legs-4', name: 'Leg Curls', sets: '3x12-15', type: 'isolation', difficulty: 'beginner' },
      { id: 'legs-5', name: 'Leg Extensions', sets: '3x12-15', type: 'isolation', difficulty: 'beginner' },
      { id: 'legs-6', name: 'Calf Raises', sets: '4x15-20', type: 'isolation', difficulty: 'beginner' },
      { id: 'legs-7', name: 'Bulgarian Split Squats', sets: '3x10-12', type: 'compound', difficulty: 'intermediate' },
      { id: 'legs-8', name: 'Walking Lunges', sets: '3x12-15', type: 'compound', difficulty: 'beginner' }
    ]
  },
  abs: {
    name: 'Abdominals',
    icon: '⚡',
    color: 'bg-yellow-600',
    exercises: [
      { id: 'abs-1', name: 'Plank', sets: '3x30-60s', type: 'isometric', difficulty: 'beginner' },
      { id: 'abs-2', name: 'Crunches', sets: '3x15-20', type: 'isolation', difficulty: 'beginner' },
      { id: 'abs-3', name: 'Russian Twists', sets: '3x20-30', type: 'isolation', difficulty: 'beginner' },
      { id: 'abs-4', name: 'Leg Raises', sets: '3x10-15', type: 'isolation', difficulty: 'intermediate' },
      { id: 'abs-5', name: 'Mountain Climbers', sets: '3x20-30', type: 'compound', difficulty: 'intermediate' },
      { id: 'abs-6', name: 'Dead Bug', sets: '3x10-12', type: 'isolation', difficulty: 'beginner' },
      { id: 'abs-7', name: 'Bicycle Crunches', sets: '3x20-30', type: 'isolation', difficulty: 'beginner' },
      { id: 'abs-8', name: 'Hanging Knee Raises', sets: '3x8-12', type: 'isolation', difficulty: 'advanced' }
    ]
  }
};