// Fallback workout completion service
class WorkoutCompletionFallback {
  constructor() {
    this.baseURL = 'https://workout-tracker-backend-wga7.onrender.com/api';
    this.isOnline = navigator.onLine;
  }

  async completeWorkout(workoutData) {
    const workout = {
      id: Date.now(),
      ...workoutData,
      completedAt: new Date().toISOString(),
      savedOffline: !this.isOnline
    };

    // Save to localStorage
    try {
      const existingWorkouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
      const updatedWorkouts = [workout, ...existingWorkouts];
      localStorage.setItem('completedWorkouts', JSON.stringify(updatedWorkouts));
      
      // Trigger events
      window.dispatchEvent(new CustomEvent('workoutCompleted', { detail: workout }));
      window.dispatchEvent(new CustomEvent('realTimeStatsUpdate', { 
        detail: { 
          todayWorkouts: updatedWorkouts.filter(w => 
            new Date(w.completedAt).toDateString() === new Date().toDateString()
          ).length,
          totalWorkouts: updatedWorkouts.length
        }
      }));
      
      return workout;
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    }
  }

  async getCompletedWorkouts(userId) {
    try {
      const workouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
      return workouts.filter(w => w.userId === userId);
    } catch (error) {
      console.error('Error loading workouts:', error);
      return [];
    }
  }

  getWorkoutStats(userId) {
    try {
      const workouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]')
        .filter(w => w.userId === userId);
      
      const today = new Date().toDateString();
      const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      return {
        todayWorkouts: workouts.filter(w => new Date(w.completedAt).toDateString() === today).length,
        totalWorkouts: workouts.length,
        weeklyWorkouts: workouts.filter(w => new Date(w.completedAt) >= thisWeek).length,
        totalCalories: workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
        totalDuration: workouts.reduce((sum, w) => sum + (w.duration || 0), 0)
      };
    } catch (error) {
      console.error('Error getting workout stats:', error);
      return {
        todayWorkouts: 0,
        totalWorkouts: 0,
        weeklyWorkouts: 0,
        totalCalories: 0,
        totalDuration: 0
      };
    }
  }
}

export const workoutCompletionFallback = new WorkoutCompletionFallback();