// frontend/src/services/realTimeService.js - ZERO API CALLS VERSION
class RealTimeService {
  constructor() {
    this.subscribers = new Map();
    this.updateInterval = null;
    this.isOfflineMode = true; // Force offline mode
  }

  // Subscribe to updates
  subscribe(dataType, callback) {
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, new Set());
    }
    this.subscribers.get(dataType).add(callback);
    
    return () => {
      const callbacks = this.subscribers.get(dataType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(dataType);
        }
      }
    };
  }

  // Notify subscribers
  notifySubscribers(dataType, data) {
    const callbacks = this.subscribers.get(dataType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          // Silent
        }
      });
    }
  }

  // Start updates
  startRealTimeUpdates(interval = 30000) {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.updateInterval = setInterval(() => {
      const dashboardData = this.getDashboardData();
      this.notifySubscribers('dashboard', dashboardData);
    }, interval);
    
    return () => {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    };
  }

  // OFFLINE ONLY - NO API CALLS
  getDashboardData() {
    return {
      totalWorkouts: this.getLocalWorkoutCount(),
      completedToday: 0,
      completedThisWeek: this.getLocalWeeklyCount(),
      xpPoints: this.getLocalXP(),
      currentStreak: this.getLocalStreak(),
      totalPlans: this.getLocalPlanCount(),
      lastActive: new Date().toISOString()
    };
  }

  getWorkouts() {
    return this.getLocalWorkouts();
  }

  getExercises() {
    return [];
  }

  getNutritionData() {
    return { meals: [], totalCalories: 0, totalProtein: 0 };
  }

  getAnalytics() {
    return { 
      achievements: this.getLocalAchievements(), 
      stats: this.getLocalStats() 
    };
  }

  // Local storage helpers
  getLocalWorkoutCount() {
    try {
      const workouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
      return workouts.length;
    } catch {
      return 0;
    }
  }

  getLocalWeeklyCount() {
    try {
      const workouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return workouts.filter(w => new Date(w.completedAt) > oneWeekAgo).length;
    } catch {
      return 0;
    }
  }

  getLocalXP() {
    try {
      return parseInt(localStorage.getItem('userXP') || '0');
    } catch {
      return 0;
    }
  }

  getLocalStreak() {
    try {
      return parseInt(localStorage.getItem('workoutStreak') || '0');
    } catch {
      return 0;
    }
  }

  getLocalPlanCount() {
    try {
      const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      return plans.length;
    } catch {
      return 0;
    }
  }

  getLocalWorkouts() {
    try {
      return JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
    } catch {
      return [];
    }
  }

  getLocalAchievements() {
    try {
      return JSON.parse(localStorage.getItem('achievements') || '[]');
    } catch {
      return [];
    }
  }

  getLocalStats() {
    return {
      workouts: this.getLocalWorkoutCount(),
      plans: this.getLocalPlanCount(),
      xp: this.getLocalXP(),
      streak: this.getLocalStreak()
    };
  }

  // All methods return promises for compatibility - NO API CALLS
  updateProfile(profileData) {
    return Promise.resolve({ success: true, user: profileData });
  }

  trackWorkout(workoutData) {
    const workouts = this.getLocalWorkouts();
    workouts.push({ ...workoutData, id: Date.now(), completedAt: new Date().toISOString() });
    localStorage.setItem('completedWorkouts', JSON.stringify(workouts));
    return Promise.resolve(workoutData);
  }

  trackMeal(mealData) {
    return Promise.resolve(mealData);
  }

  createPlan(planData) {
    return Promise.resolve(planData);
  }

  getUserData() {
    try {
      return Promise.resolve(JSON.parse(localStorage.getItem('user') || '{}'));
    } catch {
      return Promise.resolve({});
    }
  }

  getStats() {
    return Promise.resolve({
      data: {
        workouts: this.getLocalWorkoutCount(),
        meals: 0,
        xpPoints: this.getLocalXP(),
        streak: this.getLocalStreak(),
        weeklyGoal: { completed: this.getLocalWeeklyCount(), target: 4, percentage: 0 }
      }
    });
  }

  uploadProfilePicture(imageData) {
    return Promise.resolve({ success: true, profileImage: imageData });
  }
}

export const realTimeService = new RealTimeService();
export default realTimeService;