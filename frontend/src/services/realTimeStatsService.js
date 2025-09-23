// Real-time stats service for tracking workout progress
class RealTimeStatsService {
  constructor() {
    this.listeners = new Set();
    this.stats = this.calculateStats();
  }

  // Subscribe to stats updates
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of stats update
  notifyListeners() {
    this.stats = this.calculateStats();
    this.listeners.forEach(callback => {
      try {
        callback(this.stats);
      } catch (error) {
        console.error('Error in stats listener:', error);
      }
    });
  }

  // Calculate current stats from localStorage
  calculateStats() {
    try {
      const workouts = JSON.parse(localStorage.getItem('recentWorkouts') || '[]');
      const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');

      const totalWorkouts = workouts.length;
      const totalPlans = plans.length;
      const totalMeals = meals.length;
      const currentStreak = this.calculateStreak(workouts);
      const xpPoints = (totalWorkouts * 100) + (totalPlans * 50) + (totalMeals * 25);

      return {
        totalWorkouts,
        totalPlans,
        totalMeals,
        currentStreak,
        xpPoints,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        totalWorkouts: 0,
        totalPlans: 0,
        totalMeals: 0,
        currentStreak: 0,
        xpPoints: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Calculate workout streak
  calculateStreak(workouts) {
    if (!workouts.length) return 0;

    const sortedWorkouts = workouts
      .map(w => new Date(w.completedAt))
      .sort((a, b) => b - a);

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const workoutDate of sortedWorkouts) {
      const workoutDay = new Date(workoutDate);
      workoutDay.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate - workoutDay) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }

  // Record workout completion
  recordWorkout(workoutData) {
    try {
      const workouts = JSON.parse(localStorage.getItem('recentWorkouts') || '[]');
      const newWorkout = {
        id: Date.now().toString(),
        planId: workoutData.planId,
        planName: workoutData.planName,
        exercises: workoutData.exercises,
        duration: workoutData.duration,
        completedAt: new Date().toISOString(),
        status: 'completed'
      };

      const updatedWorkouts = [newWorkout, ...workouts];
      localStorage.setItem('recentWorkouts', JSON.stringify(updatedWorkouts));
      
      // Notify all listeners
      this.notifyListeners();
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('workoutCompleted', { 
        detail: { workout: newWorkout, stats: this.stats } 
      }));

      return newWorkout;
    } catch (error) {
      console.error('Error recording workout:', error);
      throw error;
    }
  }

  // Record plan creation
  recordPlan(planData) {
    try {
      this.notifyListeners();
      window.dispatchEvent(new CustomEvent('planCreated', { 
        detail: { plan: planData, stats: this.stats } 
      }));
    } catch (error) {
      console.error('Error recording plan:', error);
    }
  }

  // Record meal logging
  recordMeal(mealData) {
    try {
      this.notifyListeners();
      window.dispatchEvent(new CustomEvent('mealLogged', { 
        detail: { meal: mealData, stats: this.stats } 
      }));
    } catch (error) {
      console.error('Error recording meal:', error);
    }
  }

  // Get current stats
  getStats() {
    return this.stats;
  }

  // Force refresh stats
  refreshStats() {
    this.notifyListeners();
  }
}

export const realTimeStatsService = new RealTimeStatsService();
export default realTimeStatsService;