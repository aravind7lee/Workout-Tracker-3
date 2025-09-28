// Real-Time Workout Synchronization Service
class WorkoutSyncService {
  constructor() {
    this.listeners = new Set();
    // Clear any existing fake data on initialization
    this.clearFakeData();
    this.workouts = this.loadWorkouts();
  }

  // Clear all fake workout data
  clearFakeData() {
    localStorage.removeItem('completedWorkouts');
    localStorage.removeItem('workouts');
    localStorage.removeItem('workoutHistory');
    localStorage.removeItem('recentWorkouts');
    console.log('🧹 Cleared all fake workout data');
  }

  // Load workouts from localStorage
  loadWorkouts() {
    try {
      const workouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
      console.log('📊 Loaded real workouts:', workouts.length);
      return workouts;
    } catch {
      return [];
    }
  }

  // Save workouts to localStorage
  saveWorkouts(workouts) {
    localStorage.setItem('completedWorkouts', JSON.stringify(workouts));
    this.workouts = workouts;
  }

  // Add completed workout
  addWorkout(workout) {
    const newWorkout = {
      id: Date.now(),
      ...workout,
      completedAt: new Date().toISOString(),
      completed: true
    };

    const updatedWorkouts = [newWorkout, ...this.workouts];
    this.saveWorkouts(updatedWorkouts);
    
    // Broadcast to all pages instantly
    this.broadcastUpdate('workoutCompleted', newWorkout);
    this.broadcastStats();
    
    return newWorkout;
  }

  // Get workout statistics
  getStats() {
    const today = new Date().toDateString();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const todayWorkouts = this.workouts.filter(w => 
      new Date(w.completedAt).toDateString() === today
    ).length;
    
    const weeklyWorkouts = this.workouts.filter(w => 
      new Date(w.completedAt) >= weekAgo
    ).length;
    
    return {
      totalWorkouts: this.workouts.length,
      todayWorkouts,
      weeklyWorkouts,
      totalCalories: this.workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
      totalDuration: this.workouts.reduce((sum, w) => sum + (w.duration || 0), 0)
    };
  }

  // Broadcast update to all pages
  broadcastUpdate(eventType, data) {
    window.dispatchEvent(new CustomEvent(eventType, { detail: data }));
  }

  // Broadcast stats update
  broadcastStats() {
    const stats = this.getStats();
    window.dispatchEvent(new CustomEvent('realTimeStatsUpdate', { detail: stats }));
  }

  // Get all workouts
  getAllWorkouts() {
    return this.workouts;
  }
}

// Create singleton instance
export const workoutSync = new WorkoutSyncService();