// Real-time dashboard service integrated with backend
import { realTimeService } from "./realTimeService.js";
import api from "../utils/api.js";

class DashboardService {
  constructor() {
    this.cache = new Map();
    this.realTimeService = realTimeService;
  }

  // Real-time data fetching methods
  async getAnalyticsStats() {
    try {
      const response = await api.get("/analytics/stats");
      return response.data;
    } catch (error) {
      return this.realTimeService.getFallbackDashboard();
    }
  }

  async getAchievements() {
    try {
      const response = await api.get("/analytics/achievements");
      return response.data;
    } catch (error) {
      const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
      const meals = JSON.parse(localStorage.getItem("recentMeals") || "[]");
      return this.realTimeService.generateAchievements(workouts, meals);
    }
  }

  async getCalorieTrends() {
    try {
      const response = await api.get("/analytics/calories");
      return response.data;
    } catch (error) {
      const meals = JSON.parse(localStorage.getItem("recentMeals") || "[]");
      return this.realTimeService.generateCaloriesData(meals);
    }
  }

  async getWorkoutFrequency() {
    try {
      const response = await api.get("/analytics/frequency");
      return response.data;
    } catch (error) {
      const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
      return this.realTimeService.generateWeeklyData(workouts);
    }
  }

  async getMuscleDistribution() {
    try {
      const response = await api.get("/analytics/muscles");
      return response.data;
    } catch (error) {
      const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
      return this.realTimeService.generateMuscleData(workouts);
    }
  }

  async getDashboardStats() {
    return this.realTimeService.getDashboardData();
  }

  clearCache() {
    this.cache.clear();
    this.realTimeService.cache.clear();
  }

  // Real-time data refresh
  async refreshAllData() {
    try {
      const [stats, achievements, calories, frequency, muscles] =
        await Promise.all([
          this.getAnalyticsStats(),
          this.getAchievements(),
          this.getCalorieTrends(),
          this.getWorkoutFrequency(),
          this.getMuscleDistribution(),
        ]);

      return {
        stats,
        achievements,
        calories,
        frequency,
        muscles,
        dashboardStats: stats,
      };
    } catch (error) {
      console.error("Failed to refresh data:", error);
      return this.realTimeService.getFallbackDashboard();
    }
  }

  // Real-time updates with backend sync
  startRealTimeUpdates(callback, interval = 30000) {
    const updateData = async () => {
      try {
        await this.realTimeService.syncAllData();
        const data = await this.refreshAllData();
        callback(data);
      } catch (error) {
        console.error("Real-time update failed:", error);
      }
    };

    updateData();
    const intervalId = setInterval(updateData, interval);

    return () => clearInterval(intervalId);
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
