// frontend/src/services/realDashboardService.js - REAL DATA DASHBOARD
import { exerciseLibrary } from "../data/exerciseLibrary";

import api from "../utils/api";

class RealDashboardService {
  constructor() {
    this.cache = new Map();
  }

  // Get real workout plans from API
  async getWorkoutPlans() {
    try {
      if (navigator.onLine) {
         const res = await api.get("/workouts/plans");
         return res.data || [];
      }
      return JSON.parse(localStorage.getItem("workoutPlans") || "[]");
    } catch (error) {
      console.error("Error loading workout plans:", error);
      return JSON.parse(localStorage.getItem("workoutPlans") || "[]");
    }
  }

  // Get real workout history from API
  async getWorkoutHistory() {
    try {
      if (navigator.onLine) {
         const res = await api.get("/workouts");
         let workouts = res.data?.workouts || res.data || [];
         if (!Array.isArray(workouts)) workouts = [];
         return workouts.filter(w => w.completed || w.completedAt);
      }
      return JSON.parse(localStorage.getItem("workoutHistory") || JSON.parse(localStorage.getItem("workoutSync_workouts") || "[]"));
    } catch (error) {
      console.error("Error loading workout history:", error);
      return JSON.parse(localStorage.getItem("workoutHistory") || JSON.parse(localStorage.getItem("workoutSync_workouts") || "[]"));
    }
  }

  // Get real nutrition data from localStorage
  getNutritionData() {
    try {
      const meals = JSON.parse(localStorage.getItem("recentMeals") || "[]");
      const nutritionTotals = JSON.parse(
        localStorage.getItem("nutritionTotals") || "{}",
      );
      return { meals, totals: nutritionTotals };
    } catch (error) {
      console.error("Error loading nutrition data:", error);
      return { meals: [], totals: {} };
    }
  }

  // Calculate real stats from actual data
  async getDashboardStats() {
    const plansPromise = this.getWorkoutPlans();
    const historyPromise = this.getWorkoutHistory();
    
    const [plans, history] = await Promise.all([plansPromise, historyPromise]);
    const { meals } = this.getNutritionData();

    // Calculate total exercises available
    const totalExercises = Object.values(exerciseLibrary).reduce(
      (total, group) => total + group.exercises.length,
      0,
    );

    // Calculate workout stats
    const totalWorkouts = history.length;
    const completedToday = history.filter((w) => {
      const today = new Date().toDateString();
      const workoutDate = new Date(w.completedAt || w.date).toDateString();
      return workoutDate === today;
    }).length;

    // Calculate streak
    const sortedHistory = history.sort(
      (a, b) =>
        new Date(b.completedAt || b.date) - new Date(a.completedAt || a.date),
    );

    let currentStreak = 0;
    let lastDate = null;

    for (const workout of sortedHistory) {
      const workoutDate = new Date(
        workout.completedAt || workout.date,
      ).toDateString();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (!lastDate) {
        if (workoutDate === today || workoutDate === yesterday) {
          currentStreak = 1;
          lastDate = workoutDate;
        } else {
          break;
        }
      } else {
        const expectedDate = new Date(
          new Date(lastDate).getTime() - 86400000,
        ).toDateString();
        if (workoutDate === expectedDate) {
          currentStreak++;
          lastDate = workoutDate;
        } else {
          break;
        }
      }
    }

    // Calculate XP points (100 per workout + bonus for streaks)
    const xpPoints =
      totalWorkouts * 100 + (currentStreak > 3 ? currentStreak * 50 : 0);

    return {
      totalWorkouts,
      completedToday,
      currentStreak,
      xpPoints,
      totalPlans: plans.length,
      totalExercises,
      totalMeals: meals.length,
      lastActive:
        history.length > 0 ? history[0].completedAt || history[0].date : null,
    };
  }

  // Generate real achievements based on actual data
  async getAchievements() {
    const stats = await this.getDashboardStats();
    const plans = await this.getWorkoutPlans();

    const achievements = [
      {
        id: "first-workout",
        title: "First Steps",
        description: "Complete your first workout",
        icon: "🎯",
        unlocked: stats.totalWorkouts >= 1,
        progress: Math.min(stats.totalWorkouts, 1),
        target: 1,
      },
      {
        id: "workout-streak-3",
        title: "3 Day Streak",
        description: "Workout for 3 consecutive days",
        icon: "🔥",
        unlocked: stats.currentStreak >= 3,
        progress: Math.min(stats.currentStreak, 3),
        target: 3,
      },
      {
        id: "workout-streak-7",
        title: "Week Warrior",
        description: "Workout for 7 consecutive days",
        icon: "⚡",
        unlocked: stats.currentStreak >= 7,
        progress: Math.min(stats.currentStreak, 7),
        target: 7,
      },
      {
        id: "plan-creator",
        title: "Plan Creator",
        description: "Create your first workout plan",
        icon: "📋",
        unlocked: plans.length >= 1,
        progress: Math.min(plans.length, 1),
        target: 1,
      },
      {
        id: "workout-10",
        title: "Consistency Builder",
        description: "Complete 10 workouts",
        icon: "💪",
        unlocked: stats.totalWorkouts >= 10,
        progress: Math.min(stats.totalWorkouts, 10),
        target: 10,
      },
      {
        id: "workout-25",
        title: "Fitness Enthusiast",
        description: "Complete 25 workouts",
        icon: "🏆",
        unlocked: stats.totalWorkouts >= 25,
        progress: Math.min(stats.totalWorkouts, 25),
        target: 25,
      },
    ];

    return achievements.map((achievement) => ({
      ...achievement,
      unlockedAt: achievement.unlocked ? new Date().toISOString() : null,
    }));
  }

  // Get recent activity from real data
  async getRecentActivity() {
    const history = await this.getWorkoutHistory();
    const { meals } = this.getNutritionData();

    const activities = [];

    // Add recent workouts
    history.slice(0, 5).forEach((workout) => {
      activities.push({
        id: `workout-${workout.id}`,
        type: "workout",
        title: `Completed: ${workout.planName || "Workout"}`,
        description: `${workout.exercises?.length || 0} exercises • ${workout.duration || 0} min`,
        timestamp: workout.completedAt || workout.date,
        icon: "🏋️",
      });
    });

    // Add recent meals
    meals.slice(0, 3).forEach((meal) => {
      activities.push({
        id: `meal-${meal._id || meal.id}`,
        type: "meal",
        title: `Logged: ${meal.parsedName || meal.name}`,
        description: `${Math.round(meal.calories || 0)} cal • ${Math.round(meal.protein || 0)}g protein`,
        timestamp: meal.consumedAt || meal.date,
        icon: "🍽️",
      });
    });

    // Sort by timestamp
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  }

  // Get muscle group distribution from workout plans
  async getMuscleDistribution() {
    const plans = await this.getWorkoutPlans();
    const muscleCount = {};

    plans.forEach((plan) => {
      plan.exercises?.forEach((exercise) => {
        // Find the muscle group for this exercise
        Object.entries(exerciseLibrary).forEach(([key, group]) => {
          const found = group.exercises.find((ex) => ex.name === exercise.name);
          if (found) {
            muscleCount[group.name] = (muscleCount[group.name] || 0) + 1;
          }
        });
      });
    });

    const total = Object.values(muscleCount).reduce(
      (sum, count) => sum + count,
      0,
    );

    return Object.entries(muscleCount).map(([muscle, count]) => ({
      muscle,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  }

  // Refresh all real data
  async refreshAllData() {
    const [stats, achievements, activity, muscles] = await Promise.all([
      this.getDashboardStats(),
      this.getAchievements(),
      this.getRecentActivity(),
      this.getMuscleDistribution(),
    ]);

    return {
      stats,
      achievements,
      activity,
      muscles,
      lastUpdated: new Date().toISOString(),
    };
  }

  // Real-time updates using actual data
  startRealTimeUpdates(callback, interval = 30000) {
    const updateData = async () => {
      try {
        const data = await this.refreshAllData();
        callback(data);
      } catch (error) {
        console.error("Error updating real-time data:", error);
      }
    };

    // Initial fetch
    updateData();

    // Set up polling
    const intervalId = setInterval(updateData, interval);

    return () => clearInterval(intervalId);
  }

  clearCache() {
    this.cache.clear();
  }
}

export const realDashboardService = new RealDashboardService();
export default realDashboardService;
