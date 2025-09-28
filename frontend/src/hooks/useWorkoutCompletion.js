import { useState, useCallback } from 'react';
// Import with alias to avoid naming conflicts
import { useWorkoutCompletion as useWorkoutContext } from '../context/WorkoutCompletionContext';
import { useRealTime } from '../context/RealTimeContext';
import { useStreak } from '../context/StreakContext';
import { useAchievements } from '../context/AchievementsContext';

export const useWorkoutCompletionHook = () => {
  const workoutContext = useWorkoutContext();
  const { refreshStats } = useRealTime();
  const { updateStreak } = useStreak();
  const { checkAchievements } = useAchievements();
  const [isCompleting, setIsCompleting] = useState(false);

  const completeWorkout = useCallback(async (workoutData) => {
    if (isCompleting) return null;
    
    try {
      setIsCompleting(true);
      
      // Complete the workout
      const completedWorkout = await workoutContext.completeWorkout(workoutData);
      
      // Update real-time stats
      refreshStats();
      
      // Update streak
      updateStreak();
      
      // Check for achievements
      checkAchievements();
      
      // Show success notification
      window.dispatchEvent(new CustomEvent('workoutCompleted', {
        detail: {
          ...completedWorkout,
          message: `🎉 ${workoutData.exercise} completed! Great job!`
        }
      }));
      
      return completedWorkout;
    } catch (error) {
      console.error('Error completing workout:', error);
      
      // Show error notification
      window.dispatchEvent(new CustomEvent('workoutError', {
        detail: {
          message: 'Failed to save workout. Please try again.',
          error: error.message
        }
      }));
      
      throw error;
    } finally {
      setIsCompleting(false);
    }
  }, [workoutContext, updateStats, updateStreak, checkAchievements, isCompleting]);

  return {
    ...workoutContext,
    completeWorkout,
    isCompleting
  };
};

// Default export for backward compatibility
export { useWorkoutCompletionHook as useWorkoutCompletion };