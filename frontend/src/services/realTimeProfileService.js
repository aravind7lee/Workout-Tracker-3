// frontend/src/services/realTimeProfileService.js
import { onlineService } from "./onlineService";

class RealTimeProfileService {
  constructor() {
    this.isActive = false;
    this.syncInterval = null;
    this.eventListeners = new Map();
    this.lastSyncTime = null;
    this.profileData = null;
    this.statsData = null;

    this.initializeRealTimeFeatures();
  }

  initializeRealTimeFeatures() {
    if (typeof window !== "undefined") {
      this.onlineHandler = () => this.handleOnlineStatus(true);
      this.offlineHandler = () => this.handleOnlineStatus(false);

      window.addEventListener("online", this.onlineHandler);
      window.addEventListener("offline", this.offlineHandler);
    }
  }

  // Start real-time profile sync
  startRealTimeSync(intervalMs = 30000) {
    if (this.isActive) return;

    this.isActive = true;
    console.log("🔄 Starting real-time profile sync...");

    // Initial sync
    this.performSync();

    // Set up interval sync
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, intervalMs);

    this.emitEvent("syncStarted", { timestamp: new Date().toISOString() });
  }

  // Stop real-time sync
  stopRealTimeSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.isActive = false;
    console.log("⏹️ Real-time profile sync stopped");

    this.emitEvent("syncStopped", { timestamp: new Date().toISOString() });
  }

  // Perform sync operation
  async performSync() {
    try {
      const isOnline = await onlineService.checkBackendStatus();
      if (!isOnline) {
        this.emitEvent("syncStatus", {
          status: "offline",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      this.emitEvent("syncStatus", {
        status: "syncing",
        timestamp: new Date().toISOString(),
      });

      // Sync profile data and stats
      await Promise.all([
        this.syncProfileData(),
        this.syncStatsData(),
        this.syncActivityData(),
      ]);

      this.lastSyncTime = new Date().toISOString();

      this.emitEvent("syncStatus", {
        status: "synced",
        timestamp: this.lastSyncTime,
      });
    } catch (error) {
      console.error("Profile sync failed:", error);
      this.emitEvent("syncStatus", {
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Sync profile data
  async syncProfileData() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const profileData = await response.json();
        this.profileData = profileData;

        // Update local storage
        localStorage.setItem("user", JSON.stringify(profileData));

        this.emitEvent("profileUpdated", { profile: profileData });
        return profileData;
      }
    } catch (error) {
      console.error("Failed to sync profile data:", error);
    }
    return null;
  }

  // Sync stats data
  async syncStatsData() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/users/stats`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const statsData = await response.json();
        this.statsData = statsData;

        this.emitEvent("statsUpdated", { stats: statsData });
        return statsData;
      }
    } catch (error) {
      console.error("Failed to sync stats data:", error);
    }
    return null;
  }

  // Sync activity data
  async syncActivityData() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/users/activity`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const activityData = await response.json();

        this.emitEvent("activityUpdated", { activity: activityData });
        return activityData;
      }
    } catch (error) {
      console.error("Failed to sync activity data:", error);
    }
    return null;
  }

  // Update profile
  async updateProfile(profileData) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/users/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileData),
        },
      );

      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          this.profileData = result.user;
          localStorage.setItem("user", JSON.stringify(result.user));

          this.emitEvent("profileUpdated", { profile: result.user });

          // Trigger immediate sync
          setTimeout(() => this.performSync(), 1000);

          return { success: true, user: result.user };
        }
      }

      throw new Error("Failed to update profile");
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  }

  // Get real-time stats
  async getRealTimeStats() {
    try {
      const isOnline = await onlineService.checkBackendStatus();
      if (isOnline) {
        const stats = await this.syncStatsData();
        if (stats) return stats;
      }

      // Fallback to local stats
      const localStats = this.getLocalStats();
      return localStats;
    } catch (error) {
      console.error("Failed to get real-time stats:", error);
      return this.getLocalStats();
    }
  }

  // Get local stats as fallback
  getLocalStats() {
    try {
      const workouts = JSON.parse(
        localStorage.getItem("recentWorkouts") || "[]",
      );
      const plans = JSON.parse(localStorage.getItem("workoutPlans") || "[]");
      const meals = JSON.parse(localStorage.getItem("recentMeals") || "[]");

      return {
        totalWorkouts: workouts.length,
        totalPlans: plans.length,
        totalMeals: meals.length,
        currentStreak: this.calculateLocalStreak(workouts),
        xpPoints: workouts.length * 100 + plans.length * 50,
        lastSync: this.lastSyncTime,
        isRealTime: false,
      };
    } catch (error) {
      return {
        totalWorkouts: 0,
        totalPlans: 0,
        totalMeals: 0,
        currentStreak: 0,
        xpPoints: 0,
        lastSync: null,
        isRealTime: false,
      };
    }
  }

  // Calculate local streak
  calculateLocalStreak(workouts) {
    if (!workouts.length) return 0;

    const sortedWorkouts = workouts.sort(
      (a, b) =>
        new Date(b.completedAt || b.date) - new Date(a.completedAt || a.date),
    );

    let streak = 0;
    let currentDate = new Date();

    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.completedAt || workout.date);
      const daysDiff = Math.floor(
        (currentDate - workoutDate) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff <= streak + 1) {
        streak++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }

    return streak;
  }

  // Handle network status changes
  handleOnlineStatus(isOnline) {
    this.emitEvent("networkStatusChanged", {
      isOnline,
      timestamp: new Date().toISOString(),
    });

    if (isOnline) {
      console.log("🌐 Back online - syncing profile data...");
      setTimeout(() => this.performSync(), 2000);
    }
  }

  // Event system
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emitEvent(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      isActive: this.isActive,
      lastSyncTime: this.lastSyncTime,
      hasProfileData: !!this.profileData,
      hasStatsData: !!this.statsData,
    };
  }

  // Force sync
  async forceSync() {
    console.log("🔄 Force profile sync triggered...");
    await this.performSync();
  }

  // Cleanup method
  cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (
      typeof window !== "undefined" &&
      this.onlineHandler &&
      this.offlineHandler
    ) {
      window.removeEventListener("online", this.onlineHandler);
      window.removeEventListener("offline", this.offlineHandler);
    }

    this.eventListeners.clear();
    this.isActive = false;
  }
}

// Create singleton instance
export const realTimeProfileService = new RealTimeProfileService();
export default realTimeProfileService;
