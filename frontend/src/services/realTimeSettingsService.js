// frontend/src/services/realTimeSettingsService.js
import { onlineService } from "./onlineService";

class RealTimeSettingsService {
  constructor() {
    this.isActive = false;
    this.syncInterval = null;
    this.eventListeners = new Map();
    this.lastSyncTime = null;
    this.settingsData = null;

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

  // Start real-time settings sync with reduced frequency
  startRealTimeSync(intervalMs = 120000) {
    // Increased to 2 minutes
    if (this.isActive) return;

    this.isActive = true;
    console.log("🔄 Starting real-time settings sync...");

    // Initial sync with delay
    setTimeout(() => {
      this.performSync();
    }, 2000);

    // Set up interval sync
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && localStorage.getItem("token")) {
        this.performSync();
      }
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
    console.log("⏹️ Real-time settings sync stopped");

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

      // Sync settings data
      await this.syncSettingsData();

      this.lastSyncTime = new Date().toISOString();

      this.emitEvent("syncStatus", {
        status: "synced",
        timestamp: this.lastSyncTime,
      });
    } catch (error) {
      console.error("Settings sync failed:", error);
      this.emitEvent("syncStatus", {
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Sync settings data with timeout and error handling
  async syncSettingsData() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/users/settings`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const settingsData = await response.json();
        this.settingsData = settingsData;

        this.emitEvent("settingsUpdated", { settings: settingsData });
        return settingsData;
      } else if (response.status === 404) {
        // Settings endpoint not found, return default settings
        console.log("Settings endpoint not available, using local settings");
        return this.getLocalSettings();
      } else if (response.status >= 500) {
        console.warn("Server error, using local settings");
        return this.getLocalSettings();
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("Settings sync timed out");
      } else {
        console.error("Failed to sync settings data:", error.message);
      }
    }
    return this.getLocalSettings();
  }

  // Update settings with timeout and error handling
  async updateSettings(settingsData) {
    try {
      // Always save locally first
      localStorage.setItem("userSettings", JSON.stringify(settingsData));
      this.settingsData = settingsData;
      this.emitEvent("settingsUpdated", { settings: settingsData });

      // Try to save to server if online
      if (!navigator.onLine || !localStorage.getItem("token")) {
        return { success: true, settings: settingsData, source: "local" };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/users/settings`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settingsData),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          // Trigger delayed sync to avoid spam
          setTimeout(() => this.performSync(), 5000);

          return { success: true, settings: result.settings, source: "server" };
        }
      }

      // Server save failed, but local save succeeded
      return { success: true, settings: settingsData, source: "local" };
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("Settings update timed out");
      } else {
        console.error("Settings update failed:", error.message);
      }

      // Local save already completed above
      return { success: true, settings: settingsData, source: "local" };
    }
  }

  // Get real-time settings
  async getRealTimeSettings() {
    try {
      const isOnline = await onlineService.checkBackendStatus();
      if (isOnline) {
        const settings = await this.syncSettingsData();
        if (settings) return settings;
      }

      // Fallback to local settings
      const localSettings = this.getLocalSettings();
      return localSettings;
    } catch (error) {
      console.error("Failed to get real-time settings:", error);
      return this.getLocalSettings();
    }
  }

  // Get local settings as fallback
  getLocalSettings() {
    try {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }

      // Default settings
      return {
        profile: {
          name: "",
          email: "",
          phone: "",
          location: "",
        },
        fitnessGoals: {
          goal: "maintain",
          activityLevel: "moderate",
          targetWeight: null,
          weeklyGoal: 3,
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          workoutReminders: true,
          mealReminders: false,
          achievementAlerts: true,
        },
        privacy: {
          profileVisibility: "public",
          dataSharing: false,
          analyticsOptOut: false,
        },
        preferences: {
          theme: "dark",
          language: "en",
          units: "metric",
          dateFormat: "MM/DD/YYYY",
          timeFormat: "12h",
        },
        data: {
          autoBackup: true,
          syncAcrossDevices: true,
          dataRetention: "1year",
        },
        lastSync: this.lastSyncTime,
        isRealTime: false,
      };
    } catch (error) {
      console.error("Error loading local settings:", error);
      return this.getLocalSettings();
    }
  }

  // Handle network status changes
  handleOnlineStatus(isOnline) {
    this.emitEvent("networkStatusChanged", {
      isOnline,
      timestamp: new Date().toISOString(),
    });

    if (isOnline) {
      console.log("🌐 Back online - syncing settings data...");
      // Increased delay to prevent immediate spam when coming online
      setTimeout(() => this.performSync(), 5000);
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
      hasSettingsData: !!this.settingsData,
    };
  }

  // Force sync
  async forceSync() {
    console.log("🔄 Force settings sync triggered...");
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
export const realTimeSettingsService = new RealTimeSettingsService();
export default realTimeSettingsService;
