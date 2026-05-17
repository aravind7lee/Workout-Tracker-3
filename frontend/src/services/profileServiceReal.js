// Real-time profile service with backend integration
import api from "../utils/api";
import { realTimeService } from "./realTimeService";

class ProfileServiceReal {
  constructor() {
    this.cache = new Map();
  }

  // Get user profile from backend
  async getUserProfile() {
    try {
      const response = await api.get("/users/profile");
      const profile = response.data;
      localStorage.setItem("user", JSON.stringify(profile));
      return profile;
    } catch (error) {
      return JSON.parse(localStorage.getItem("user") || "{}");
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.put("/users/profile", profileData);
      const updatedProfile = response.data;
      localStorage.setItem("user", JSON.stringify(updatedProfile));
      return updatedProfile;
    } catch (error) {
      // Update locally if offline
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...currentUser, ...profileData, synced: false };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    }
  }

  // Upload profile picture
  async uploadProfilePicture(imageFile) {
    try {
      const formData = new FormData();
      formData.append("avatar", imageFile);

      const response = await api.post("/users/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedProfile = response.data;
      localStorage.setItem("user", JSON.stringify(updatedProfile));
      return updatedProfile;
    } catch (error) {
      throw new Error("Failed to upload profile picture");
    }
  }

  // Get real-time profile statistics
  async getProfileStats() {
    try {
      const response = await api.get("/users/stats");
      return response.data;
    } catch (error) {
      return this.getFallbackStats();
    }
  }

  // Get user activity history
  async getUserActivity() {
    try {
      const response = await api.get("/users/activity");
      return response.data;
    } catch (error) {
      return this.getFallbackActivity();
    }
  }

  // Get user achievements
  async getUserAchievements() {
    try {
      const response = await api.get("/users/achievements");
      return response.data;
    } catch (error) {
      return this.getFallbackAchievements();
    }
  }

  // Delete user account
  async deleteAccount() {
    try {
      await api.delete("/users/profile");
      localStorage.clear();
      return true;
    } catch (error) {
      throw new Error("Failed to delete account");
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.put("/users/change-password", passwordData);
      return response.data;
    } catch (error) {
      throw new Error("Failed to change password");
    }
  }

  // Get fallback stats from local data
  getFallbackStats() {
    const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
    const meals = JSON.parse(localStorage.getItem("recentMeals") || "[]");
    const plans = JSON.parse(localStorage.getItem("workoutPlans") || "[]");

    return {
      totalWorkouts: workouts.length,
      totalMeals: meals.length,
      totalPlans: plans.length,
      currentStreak: realTimeService.calculateStreak(workouts),
      xpPoints: workouts.length * 100 + plans.length * 50,
      joinDate:
        plans.length > 0 ? plans[0].createdAt : new Date().toISOString(),
      lastActive:
        workouts.length > 0
          ? workouts[0].completedAt
          : new Date().toISOString(),
    };
  }

  // Get fallback activity from local data
  getFallbackActivity() {
    const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
    const meals = JSON.parse(localStorage.getItem("recentMeals") || "[]");

    const activities = [];

    // Add recent workouts
    workouts.slice(0, 5).forEach((workout) => {
      activities.push({
        id: workout.id,
        type: "workout",
        title: "Completed Workout",
        description: workout.planName || "Workout Session",
        timestamp: workout.completedAt || workout.date,
        icon: "💪",
      });
    });

    // Add recent meals
    meals.slice(0, 3).forEach((meal) => {
      activities.push({
        id: meal.id,
        type: "meal",
        title: "Logged Meal",
        description: meal.parsedName || meal.name,
        timestamp: meal.consumedAt || meal.date,
        icon: "🍽️",
      });
    });

    // Sort by timestamp
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  }

  // Get fallback achievements
  getFallbackAchievements() {
    const stats = this.getFallbackStats();
    const achievements = [];

    if (stats.totalWorkouts >= 1) {
      achievements.push({
        id: "first-workout",
        title: "First Steps",
        description: "Complete your first workout",
        icon: "🎯",
        unlocked: true,
        unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      });
    }

    if (stats.totalWorkouts >= 10) {
      achievements.push({
        id: "workout-10",
        title: "Consistency Builder",
        description: "Complete 10 workouts",
        icon: "💪",
        unlocked: true,
        unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      });
    }

    if (stats.currentStreak >= 7) {
      achievements.push({
        id: "streak-7",
        title: "7 Day Streak",
        description: "Workout for 7 consecutive days",
        icon: "🔥",
        unlocked: true,
        unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      });
    }

    return achievements;
  }

  // Subscribe to real-time profile updates
  subscribeToUpdates(callback) {
    return realTimeService.subscribe("profile", callback);
  }
}

export const profileServiceReal = new ProfileServiceReal();
export default profileServiceReal;
