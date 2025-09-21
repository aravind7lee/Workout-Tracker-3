// frontend/src/services/workoutService.js
const STORAGE_KEY = 'recentWorkouts';

export const workoutService = {
  // Save a completed workout
  saveWorkout: (workoutData) => {
    try {
      const existingWorkouts = workoutService.getAllWorkouts();
      const newWorkout = {
        id: Date.now().toString(),
        planId: workoutData.planId,
        planName: workoutData.planName,
        exercises: workoutData.exercises,
        duration: workoutData.duration,
        completedAt: new Date().toISOString(),
        status: 'completed'
      };
      
      const updatedWorkouts = [newWorkout, ...existingWorkouts].slice(0, 10); // Keep only last 10
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWorkouts));
      console.log('Workout saved:', newWorkout);
      return newWorkout;
    } catch (error) {
      console.error('Error saving workout:', error);
      throw new Error('Failed to save workout');
    }
  },

  // Get all recent workouts
  getAllWorkouts: () => {
    try {
      const workouts = localStorage.getItem(STORAGE_KEY);
      return workouts ? JSON.parse(workouts) : [];
    } catch (error) {
      console.error('Error loading workouts:', error);
      return [];
    }
  },

  // Get workouts count
  getWorkoutStats: () => {
    const workouts = workoutService.getAllWorkouts();
    const today = new Date().toDateString();
    const todayWorkouts = workouts.filter(w => 
      new Date(w.completedAt).toDateString() === today
    );
    
    return {
      total: workouts.length,
      today: todayWorkouts.length,
      thisWeek: workouts.filter(w => {
        const workoutDate = new Date(w.completedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return workoutDate >= weekAgo;
      }).length
    };
  }
};