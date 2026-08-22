// Real-Time Workout Completion Hook
// Uses WorkoutCompletionContext (which calls the API exactly once) as the single save path.
import { useCallback, useState } from "react";
import { useWorkoutCompletion as useWorkoutCompletionContext } from "../context/WorkoutCompletionContext";

export const useWorkoutCompletionHook = () => {
  const { completeWorkout: contextComplete } = useWorkoutCompletionContext();
  const [isCompleting, setIsCompleting] = useState(false);

  const completeWorkout = useCallback(
    async (workoutData) => {
      if (isCompleting) return null;

      try {
        setIsCompleting(true);
        
        // Use the context which saves to API exactly once
        const completedWorkout = await contextComplete({
          title: workoutData.exercise || workoutData.name || "Quick Workout",
          exercise: workoutData.exercise || workoutData.name,
          duration: workoutData.duration || 0,
          sets: workoutData.sets || 0,
          reps: workoutData.reps || 0,
          caloriesBurned: workoutData.caloriesBurned || 0,
          calories: workoutData.caloriesBurned || 0,
          category: workoutData.category || "General",
          difficulty: workoutData.difficulty || "Intermediate",
          notes: workoutData.notes || "",
        });

        return completedWorkout;
      } finally {
        setIsCompleting(false);
      }
    },
    [isCompleting, contextComplete],
  );

  return { completeWorkout, isCompleting };
};

