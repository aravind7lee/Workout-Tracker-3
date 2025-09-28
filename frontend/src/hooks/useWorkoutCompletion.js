// Real-Time Workout Completion Hook
import { useCallback, useState } from 'react';


export const useWorkoutCompletion = () => {
  const [isCompleting, setIsCompleting] = useState(false);

  const completeWorkout = useCallback(async (workoutData) => {
    if (isCompleting) return null;

    try {
      setIsCompleting(true);
      
      const completedWorkout = window.realTimeWorkoutSync.addCompletedWorkout({
        exercise: workoutData.exercise || workoutData.name,
        duration: workoutData.duration || 0,
        sets: workoutData.sets || 0,
        reps: workoutData.reps || 0,
        caloriesBurned: workoutData.caloriesBurned || 0,
        category: workoutData.category || 'General',
        difficulty: workoutData.difficulty || 'Intermediate',
        notes: workoutData.notes || 'Completed from Exercise Library'
      });

      return completedWorkout;
    } finally {
      setIsCompleting(false);
    }
  }, [isCompleting]);

  return { completeWorkout, isCompleting };
};