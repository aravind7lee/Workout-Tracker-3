// Real-time backend service for GymTracker
import api from '../utils/api.js';

class RealTimeService {
  constructor() {
    this.cache = new Map();
    this.subscribers = new Map();
    this.isOnline = navigator.onLine;
    this.setupNetworkListeners();
  }

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncAllData();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Real-time dashboard data
  async getDashboardData() {
    try {
      const response = await api.get('/dashboard/stats');
      const data = response.data;
      this.cache.set('dashboard', data);
      this.notifySubscribers('dashboard', data);
      return data;
    } catch (error) {
      return this.getFallbackDashboard();
    }
  }

  // Real-time workout data
  async getWorkouts() {
    try {
      const response = await api.get('/workouts');
      const data = response.data;
      this.cache.set('workouts', data);
      this.notifySubscribers('workouts', data);
      return data;
    } catch (error) {
      return JSON.parse(localStorage.getItem('workouts') || '[]');
    }
  }

  // Real-time exercise library
  async getExercises() {
    try {
      const response = await api.get('/exercises');
      const data = response.data;
      this.cache.set('exercises', data);
      this.notifySubscribers('exercises', data);
      return data;
    } catch (error) {
      return JSON.parse(localStorage.getItem('exercises') || '[]');
    }
  }

  // Real-time nutrition data
  async getNutritionData() {
    try {
      const response = await api.get('/nutrition/meals');
      const data = response.data;
      this.cache.set('nutrition', data);
      this.notifySubscribers('nutrition', data);
      return data;
    } catch (error) {
      return JSON.parse(localStorage.getItem('nutrition') || '[]');
    }
  }

  // Real-time analytics
  async getAnalytics() {
    try {
      const response = await api.get('/analytics/stats');
      const data = response.data;
      this.cache.set('analytics', data);
      this.notifySubscribers('analytics', data);
      return data;
    } catch (error) {
      return this.getFallbackAnalytics();
    }
  }

  // Create/Update operations with real-time sync
  async createWorkout(workoutData) {
    try {
      const response = await api.post('/workouts', workoutData);
      this.syncAllData();
      return response.data;
    } catch (error) {
      // Store locally if offline
      const localWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
      const newWorkout = { ...workoutData, id: Date.now(), synced: false };
      localWorkouts.push(newWorkout);
      localStorage.setItem('workouts', JSON.stringify(localWorkouts));
      return newWorkout;
    }
  }

  async updateWorkout(id, workoutData) {
    try {
      const response = await api.put(`/workouts/${id}`, workoutData);
      this.syncAllData();
      return response.data;
    } catch (error) {
      // Update locally if offline
      const localWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
      const index = localWorkouts.findIndex(w => w.id === id);
      if (index !== -1) {
        localWorkouts[index] = { ...localWorkouts[index], ...workoutData, synced: false };
        localStorage.setItem('workouts', JSON.stringify(localWorkouts));
      }
      return workoutData;
    }
  }

  async createPlan(planData) {
    try {
      const response = await api.post('/plans', planData);
      this.syncAllData();
      return response.data;
    } catch (error) {
      const localPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      const newPlan = { ...planData, id: Date.now(), synced: false };
      localPlans.push(newPlan);
      localStorage.setItem('workoutPlans', JSON.stringify(localPlans));
      return newPlan;
    }
  }

  async logMeal(mealData) {
    try {
      const response = await api.post('/meals', mealData);
      this.syncAllData();
      return response.data;
    } catch (error) {
      const localMeals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      const newMeal = { ...mealData, id: Date.now(), synced: false };
      localMeals.push(newMeal);
      localStorage.setItem('recentMeals', JSON.stringify(localMeals));
      return newMeal;
    }
  }

  // Subscription system for real-time updates
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);

    return () => {
      const subs = this.subscribers.get(key);
      if (subs) {
        subs.delete(callback);
      }
    };
  }

  notifySubscribers(key, data) {
    const subs = this.subscribers.get(key);
    if (subs) {
      subs.forEach(callback => callback(data));
    }
  }

  // Sync all data when online
  async syncAllData() {
    if (!this.isOnline) return;

    try {
      // Sync workouts
      const localWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
      const unsyncedWorkouts = localWorkouts.filter(w => !w.synced);
      
      for (const workout of unsyncedWorkouts) {
        try {
          await api.post('/workouts', workout);
          workout.synced = true;
        } catch (error) {
          console.error('Failed to sync workout:', error);
        }
      }
      
      if (unsyncedWorkouts.length > 0) {
        localStorage.setItem('workouts', JSON.stringify(localWorkouts));
      }

      // Refresh all cached data
      await Promise.all([
        this.getDashboardData(),
        this.getWorkouts(),
        this.getNutritionData(),
        this.getAnalytics()
      ]);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  getFallbackDashboard() {
    const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
    const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
    const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');

    return {
      totalWorkouts: workouts.length,
      totalPlans: plans.length,
      totalMeals: meals.length,
      currentStreak: this.calculateStreak(workouts),
      weeklyGoal: 5,
      completedThisWeek: this.getWeeklyCount(workouts)
    };
  }

  getFallbackAnalytics() {
    const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
    const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');

    return {
      workoutFrequency: this.generateWeeklyData(workouts),
      caloriesTrend: this.generateCaloriesData(meals),
      muscleDistribution: this.generateMuscleData(workouts),
      achievements: this.generateAchievements(workouts, meals)
    };
  }

  calculateStreak(workouts) {
    if (!workouts.length) return 0;
    
    const sortedWorkouts = workouts.sort((a, b) => 
      new Date(b.completedAt || b.date) - new Date(a.completedAt || a.date)
    );
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.completedAt || workout.date);
      const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= streak + 1) {
        streak++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  getWeeklyCount(workouts) {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return workouts.filter(w => 
      new Date(w.completedAt || w.date) >= oneWeekAgo
    ).length;
  }

  generateWeeklyData(workouts) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(day => ({ day, count: 0 }));
    
    workouts.forEach(workout => {
      const date = new Date(workout.completedAt || workout.date);
      const dayIndex = date.getDay();
      data[dayIndex].count++;
    });
    
    return data;
  }

  generateCaloriesData(meals) {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push({
        date: date.toDateString(),
        calories: 0
      });
    }
    
    meals.forEach(meal => {
      const mealDate = new Date(meal.consumedAt || meal.date).toDateString();
      const dayData = last7Days.find(d => d.date === mealDate);
      if (dayData) {
        dayData.calories += meal.calories || 0;
      }
    });
    
    return last7Days;
  }

  generateMuscleData(workouts) {
    const muscleGroups = {};
    
    workouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        const muscle = exercise.muscleGroup || 'Other';
        muscleGroups[muscle] = (muscleGroups[muscle] || 0) + 1;
      });
    });
    
    return Object.entries(muscleGroups).map(([muscle, count]) => ({
      muscle,
      percentage: count
    }));
  }

  generateAchievements(workouts, meals) {
    const achievements = [];
    
    if (workouts.length >= 1) {
      achievements.push({
        id: 'first-workout',
        title: 'First Steps',
        description: 'Complete your first workout',
        unlocked: true,
        date: workouts[0].completedAt || workouts[0].date
      });
    }
    
    if (workouts.length >= 10) {
      achievements.push({
        id: 'consistency',
        title: 'Consistency King',
        description: 'Complete 10 workouts',
        unlocked: true,
        date: new Date().toISOString()
      });
    }
    
    if (this.calculateStreak(workouts) >= 7) {
      achievements.push({
        id: 'streak-7',
        title: '7 Day Streak',
        description: 'Workout for 7 consecutive days',
        unlocked: true,
        date: new Date().toISOString()
      });
    }
    
    return achievements;
  }

  // Start real-time polling
  startRealTimeUpdates(interval = 30000) {
    const updateData = async () => {
      if (this.isOnline) {
        await this.syncAllData();
      }
    };

    updateData();
    const intervalId = setInterval(updateData, interval);
    
    return () => clearInterval(intervalId);
  }
}

export const realTimeService = new RealTimeService();
export default realTimeService;