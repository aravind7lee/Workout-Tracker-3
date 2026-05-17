// Real-Time Plan Service - Instant Dashboard Updates
import { onlineService } from "./onlineService";

class RealTimePlanService {
  constructor() {
    this.listeners = new Map();
    this.planCache = new Map();
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.lastSync = null;

    // Listen for network changes
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });

    // Listen for user logout to clear plans
    window.addEventListener("userLoggedOut", () => {
      console.log("🔒 User logged out - clearing plan cache");
      this.planCache.clear();
      this.syncQueue = [];
    });

    // Listen for user login to refresh plans
    window.addEventListener("userDataInitialized", () => {
      console.log("👤 User logged in - refreshing plan cache");
      setTimeout(() => {
        this.getPlans(true);
      }, 200);
    });

    console.log("🚀 Real-Time Plan Service initialized");
  }

  // Get current authenticated user
  getCurrentUser() {
    try {
      const authUser = localStorage.getItem("user");
      if (authUser) {
        return JSON.parse(authUser);
      }
      return null;
    } catch (error) {
      console.warn("⚠️ Error getting current user:", error);
      return null;
    }
  }

  // Event system for real-time updates
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("Event callback error:", error);
        }
      });
    }
  }

  // Real-time plan creation with instant dashboard updates - USER SPECIFIC
  async createPlan(planData) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      const tempId = `temp_${Date.now()}`;
      const localPlan = {
        id: tempId,
        userId: currentUser.id || currentUser._id, // Associate with user
        ...planData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: false,
        backendId: null,
        isTemp: true,
      };

      // 1. INSTANT UI UPDATE - Add to cache immediately
      this.planCache.set(tempId, localPlan);

      // 2. INSTANT DASHBOARD UPDATE - Emit event immediately
      this.emit("planCreated", {
        plan: localPlan,
        isTemp: true,
        timestamp: new Date().toISOString(),
      });

      // 3. INSTANT DASHBOARD COUNTER UPDATE
      window.dispatchEvent(
        new CustomEvent("dashboardUpdate", {
          detail: {
            type: "planCreated",
            plan: localPlan,
            instant: true,
          },
        }),
      );

      // 4. Save to localStorage immediately
      this.saveToLocalStorage();

      // 5. Background MongoDB sync
      if (this.isOnline) {
        try {
          const savedPlan = await onlineService.saveWorkoutPlan(planData);

          if (savedPlan) {
            // Update with real backend data
            const realPlan = {
              ...localPlan,
              id: savedPlan._id,
              backendId: savedPlan._id,
              synced: true,
              isTemp: false,
              ...savedPlan,
            };

            // Update cache
            this.planCache.delete(tempId);
            this.planCache.set(savedPlan._id, realPlan);

            // Update localStorage
            this.saveToLocalStorage();

            // Emit sync success
            this.emit("planSynced", {
              tempId,
              realPlan,
              timestamp: new Date().toISOString(),
            });

            // Update dashboard with real data
            window.dispatchEvent(
              new CustomEvent("dashboardUpdate", {
                detail: {
                  type: "planSynced",
                  tempId,
                  plan: realPlan,
                  instant: true,
                },
              }),
            );

            console.log(
              "✅ Plan created and synced to MongoDB:",
              realPlan.name,
            );
            return realPlan;
          }
        } catch (error) {
          console.error("❌ MongoDB sync failed, keeping local:", error);
          // Keep the local plan, add to sync queue
          this.syncQueue.push({ action: "create", data: planData, tempId });
        }
      } else {
        // Offline - add to sync queue
        this.syncQueue.push({ action: "create", data: planData, tempId });
      }

      return localPlan;
    } catch (error) {
      console.error("❌ Plan creation failed:", error);
      throw error;
    }
  }

  // Real-time plan loading with cache - USER SPECIFIC
  async getPlans(forceRefresh = false) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.log("🔒 No authenticated user - returning empty plans");
        this.planCache.clear();
        return [];
      }

      if (!forceRefresh && this.planCache.size > 0) {
        // Return only current user's plans from cache - STRICT filtering
        const userPlans = Array.from(this.planCache.values()).filter(
          (plan) =>
            plan.userId === currentUser.id || plan.userId === currentUser._id,
        );
        console.log(
          `💾 Cache: ${userPlans.length} plans for user ${currentUser.id}`,
        );
        return userPlans;
      }

      let plans = [];

      // Load from MongoDB if online
      if (this.isOnline) {
        try {
          const backendPlans = await onlineService.getWorkoutPlans();
          // Filter MongoDB plans by current user
          const userBackendPlans = backendPlans.filter(
            (plan) =>
              plan.user === currentUser.id ||
              plan.user === currentUser._id ||
              plan.userId === currentUser.id ||
              plan.userId === currentUser._id,
          );

          plans = userBackendPlans.map((plan) => ({
            id: plan._id,
            backendId: plan._id,
            userId: plan.user || plan.userId || currentUser.id,
            name: plan.name,
            exercises: plan.exercises || [],
            category: plan.category || "General",
            description: plan.description || "",
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
            synced: true,
            isTemp: false,
            stats: plan.stats || {},
          }));

          console.log(
            `✅ User ${currentUser.id} plans loaded from MongoDB:`,
            plans.length,
          );

          if (plans.length === 0) {
            console.log("📊 No plans found in MongoDB for current user");
          }
        } catch (error) {
          console.error("❌ MongoDB load failed, using local:", error);
          this.isOnline = false;
        }
      }

      // Fallback to localStorage - filter by user
      if (plans.length === 0) {
        const localPlans = JSON.parse(
          localStorage.getItem("workoutPlans") || "[]",
        );
        // STRICT filtering - only plans with explicit userId match
        const userLocalPlans = localPlans.filter((plan) => {
          const belongsToUser =
            plan.userId === currentUser.id || plan.userId === currentUser._id;
          if (!belongsToUser && plan.name) {
            console.log(
              `🗑️ Excluding plan: "${plan.name}" (userId: ${plan.userId})`,
            );
          }
          return belongsToUser;
        });

        plans = userLocalPlans.map((plan) => ({
          ...plan,
          userId: plan.userId || currentUser.id,
          synced: plan.synced || false,
          isTemp: plan.isTemp || false,
        }));
        console.log(
          `📱 User ${currentUser.id} plans loaded from localStorage:`,
          plans.length,
        );

        if (plans.length === 0) {
          console.log("📊 No plans found in localStorage for current user");
        }
      }

      // Update cache with user-specific plans only - STRICT filtering
      this.planCache.clear();
      plans.forEach((plan) => {
        // ONLY cache plans that explicitly belong to current user
        if (plan.userId === currentUser.id || plan.userId === currentUser._id) {
          this.planCache.set(plan.id, plan);
        } else {
          console.log(
            `🗑️ Not caching plan: "${plan.name}" (userId: ${plan.userId})`,
          );
        }
      });

      console.log(
        `💾 Cached ${this.planCache.size} plans for user ${currentUser.id}`,
      );

      this.lastSync = new Date().toISOString();
      return plans;
    } catch (error) {
      console.error("❌ Failed to load plans:", error);
      return [];
    }
  }

  // Real-time plan deletion
  async deletePlan(planId) {
    try {
      const plan = this.planCache.get(planId);
      if (!plan) return false;

      // 1. INSTANT UI UPDATE - Remove from cache
      this.planCache.delete(planId);

      // 2. INSTANT DASHBOARD UPDATE
      this.emit("planDeleted", {
        planId,
        plan,
        timestamp: new Date().toISOString(),
      });

      // 3. INSTANT DASHBOARD COUNTER UPDATE
      window.dispatchEvent(
        new CustomEvent("dashboardUpdate", {
          detail: {
            type: "planDeleted",
            planId,
            plan,
            instant: true,
          },
        }),
      );

      // 4. Update localStorage immediately
      this.saveToLocalStorage();

      // 5. Background MongoDB deletion
      if (this.isOnline && plan.backendId) {
        try {
          await onlineService.deletePlan(plan.backendId);
          console.log("✅ Plan deleted from MongoDB:", plan.name);
        } catch (error) {
          console.error("❌ MongoDB deletion failed:", error);
          // Add to sync queue for later
          this.syncQueue.push({ action: "delete", planId: plan.backendId });
        }
      } else if (!this.isOnline && plan.backendId) {
        // Offline - add to sync queue
        this.syncQueue.push({ action: "delete", planId: plan.backendId });
      }

      return true;
    } catch (error) {
      console.error("❌ Plan deletion failed:", error);
      return false;
    }
  }

  // Real-time plan duplication
  async duplicatePlan(originalPlan) {
    try {
      const duplicatedData = {
        name: `${originalPlan.name} (Copy)`,
        exercises: [...(originalPlan.exercises || [])],
        category: originalPlan.category || "General",
        description: originalPlan.description || "",
      };

      return await this.createPlan(duplicatedData);
    } catch (error) {
      console.error("❌ Plan duplication failed:", error);
      throw error;
    }
  }

  // Get real-time plan count for dashboard - USER SPECIFIC
  getPlanCount() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return 0;
    }
    return this.planCache.size;
  }

  // Get real-time plan stats for dashboard - USER SPECIFIC
  getPlanStats() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return {
        totalPlans: 0,
        syncedPlans: 0,
        unsyncedPlans: 0,
        totalExercises: 0,
        categories: [],
        lastSync: null,
        isOnline: this.isOnline,
      };
    }

    const plans = Array.from(this.planCache.values());
    const syncedPlans = plans.filter((p) => p.synced).length;
    const totalExercises = plans.reduce(
      (sum, p) => sum + (p.exercises?.length || 0),
      0,
    );

    return {
      totalPlans: plans.length,
      syncedPlans,
      unsyncedPlans: plans.length - syncedPlans,
      totalExercises,
      categories: [...new Set(plans.map((p) => p.category).filter(Boolean))],
      lastSync: this.lastSync,
      isOnline: this.isOnline,
    };
  }

  // Save to localStorage - USER SPECIFIC
  saveToLocalStorage() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.log("🔒 No user - not saving plans");
        return;
      }

      // Get existing plans from localStorage
      const allPlans = JSON.parse(localStorage.getItem("workoutPlans") || "[]");

      // Remove current user's plans
      const otherUsersPlans = allPlans.filter(
        (plan) =>
          plan.userId &&
          plan.userId !== currentUser.id &&
          plan.userId !== currentUser._id,
      );

      // Add current user's plans from cache
      const currentUserPlans = Array.from(this.planCache.values()).map(
        (plan) => ({
          ...plan,
          userId: plan.userId || currentUser.id, // Ensure userId is set
        }),
      );

      // Combine all plans
      const finalPlans = [...otherUsersPlans, ...currentUserPlans];

      localStorage.setItem("workoutPlans", JSON.stringify(finalPlans));
      console.log(
        `💾 Saved ${currentUserPlans.length} plans for user ${currentUser.id}`,
      );
    } catch (error) {
      console.error("❌ Failed to save to localStorage:", error);
    }
  }

  // Process sync queue when back online
  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    console.log("🔄 Processing sync queue:", this.syncQueue.length, "items");

    const queue = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of queue) {
      try {
        if (item.action === "create") {
          const savedPlan = await onlineService.saveWorkoutPlan(item.data);
          if (savedPlan && item.tempId) {
            // Update temp plan with real data
            const tempPlan = this.planCache.get(item.tempId);
            if (tempPlan) {
              const realPlan = {
                ...tempPlan,
                id: savedPlan._id,
                backendId: savedPlan._id,
                synced: true,
                isTemp: false,
              };

              this.planCache.delete(item.tempId);
              this.planCache.set(savedPlan._id, realPlan);

              this.emit("planSynced", {
                tempId: item.tempId,
                realPlan,
                timestamp: new Date().toISOString(),
              });
            }
          }
        } else if (item.action === "delete") {
          await onlineService.deletePlan(item.planId);
        }
      } catch (error) {
        console.error("❌ Sync queue item failed:", error);
        // Re-add to queue for retry
        this.syncQueue.push(item);
      }
    }

    if (this.syncQueue.length === 0) {
      this.saveToLocalStorage();
      console.log("✅ Sync queue processed successfully");
    }
  }

  // Force sync all data
  async forceSync() {
    try {
      if (!this.isOnline) {
        throw new Error("Cannot sync while offline");
      }

      console.log("🔄 Force syncing all plans...");

      // Process sync queue first
      await this.processSyncQueue();

      // Reload all plans from backend
      const freshPlans = await this.getPlans(true);

      // Emit sync complete event
      this.emit("syncComplete", {
        planCount: freshPlans.length,
        timestamp: new Date().toISOString(),
      });

      // Update dashboard
      window.dispatchEvent(
        new CustomEvent("dashboardUpdate", {
          detail: {
            type: "syncComplete",
            planCount: freshPlans.length,
            instant: true,
          },
        }),
      );

      console.log("✅ Force sync completed:", freshPlans.length, "plans");
      return { success: true, planCount: freshPlans.length };
    } catch (error) {
      console.error("❌ Force sync failed:", error);
      return { success: false, error: error.message };
    }
  }

  // Get sync status
  getSyncStatus() {
    const stats = this.getPlanStats();
    return {
      isOnline: this.isOnline,
      totalPlans: stats.totalPlans,
      syncedPlans: stats.syncedPlans,
      unsyncedPlans: stats.unsyncedPlans,
      queueLength: this.syncQueue.length,
      lastSync: this.lastSync,
      syncPercentage:
        stats.totalPlans > 0
          ? Math.round((stats.syncedPlans / stats.totalPlans) * 100)
          : 100,
    };
  }
}

// Create singleton instance
export const realTimePlanService = new RealTimePlanService();
export default realTimePlanService;
