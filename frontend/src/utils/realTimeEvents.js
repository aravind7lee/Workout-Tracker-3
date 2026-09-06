// Real-time event dispatcher for profile updates
class RealTimeEventDispatcher {
  constructor() {
    this.listeners = new Map();
  }

  // Dispatch workout completion event
  dispatchWorkoutCompleted(workoutData) {
    console.log("🏋️ Dispatching workout completed event:", workoutData);

    // Update local storage immediately
    const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
    workouts.unshift({
      ...workoutData,
      completed: true,
      completedAt: new Date().toISOString(),
      id: Date.now().toString(),
    });
    localStorage.setItem("workouts", JSON.stringify(workouts));

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent("workoutCompleted", {
        detail: workoutData,
      }),
    );

    // Trigger profile refresh
    this.triggerProfileRefresh();
  }

  // Dispatch meal added event
  dispatchMealAdded(mealData) {
    console.log("🍽️ Dispatching meal added event:", mealData);

    // Update local storage immediately
    const meals = JSON.parse(localStorage.getItem("recentMeals") || "[]");
    meals.unshift({
      ...mealData,
      addedAt: new Date().toISOString(),
      id: Date.now().toString(),
    });
    localStorage.setItem("recentMeals", JSON.stringify(meals));

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent("mealAdded", {
        detail: mealData,
      }),
    );

    // Trigger profile refresh
    this.triggerProfileRefresh();
  }

  // Dispatch nutrition targets updated event
  dispatchTargetsUpdated(targetsData) {
    console.log("🎯 Dispatching nutrition targets updated event:", targetsData);
    window.dispatchEvent(
      new CustomEvent("nutritionTargetsUpdated", {
        detail: targetsData,
      }),
    );
    this.triggerProfileRefresh();
  }

  // Dispatch plan created event
  dispatchPlanCreated(planData) {
    console.log("📋 Dispatching plan created event:", planData);

    // Update local storage immediately
    const plans = JSON.parse(localStorage.getItem("workoutPlans") || "[]");
    plans.unshift({
      ...planData,
      createdAt: new Date().toISOString(),
      id: Date.now().toString(),
    });
    localStorage.setItem("workoutPlans", JSON.stringify(plans));

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent("planCreated", {
        detail: planData,
      }),
    );

    // Trigger profile refresh
    this.triggerProfileRefresh();
  }

  // Dispatch achievement unlocked event
  dispatchAchievementUnlocked(achievementData) {
    console.log("🏆 Dispatching achievement unlocked event:", achievementData);

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent("achievementUnlocked", {
        detail: achievementData,
      }),
    );

    // Show achievement notification
    this.showAchievementNotification(achievementData);
  }

  // Trigger profile refresh
  triggerProfileRefresh() {
    // Small delay to allow backend processing
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("profileRefreshRequested"));
    }, 500);
  }

  // Show achievement notification
  showAchievementNotification(achievement) {
    // Create notification element
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm";
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="text-2xl">${achievement.icon || "🏆"}</div>
        <div>
          <div class="font-bold">Achievement Unlocked!</div>
          <div class="text-sm opacity-90">${achievement.title}</div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.opacity = "0";
        notification.style.transform = "translateX(100%)";
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
  }

  // Subscribe to events
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Emit event to subscribers
  emit(eventType, data) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${eventType}:`, error);
        }
      });
    }
  }

  // Check for achievements based on current stats
  checkAchievements(stats) {
    const achievements = [];

    // First workout achievement
    if (stats.totalWorkouts === 1) {
      achievements.push({
        id: "first-workout",
        title: "First Steps",
        description: "Complete your first workout",
        icon: "🎯",
      });
    }

    // Workout milestones
    if ([5, 10, 25, 50, 100].includes(stats.totalWorkouts)) {
      const titles = {
        5: "Getting Started",
        10: "Consistency Builder",
        25: "Dedicated Athlete",
        50: "Fitness Warrior",
        100: "Gym Legend",
      };

      achievements.push({
        id: `workout-${stats.totalWorkouts}`,
        title: titles[stats.totalWorkouts],
        description: `Complete ${stats.totalWorkouts} workouts`,
        icon: stats.totalWorkouts >= 50 ? "⚡" : "💪",
      });
    }

    // Streak achievements
    if ([3, 7, 14, 30].includes(stats.currentStreak)) {
      const titles = {
        3: "3 Day Streak",
        7: "Week Warrior",
        14: "Two Week Champion",
        30: "Monthly Master",
      };

      achievements.push({
        id: `streak-${stats.currentStreak}`,
        title: titles[stats.currentStreak],
        description: `Workout for ${stats.currentStreak} consecutive days`,
        icon: "🔥",
      });
    }

    // Nutrition achievements
    if ([10, 25, 50].includes(stats.totalMeals)) {
      achievements.push({
        id: `nutrition-${stats.totalMeals}`,
        title: "Nutrition Tracker",
        description: `Log ${stats.totalMeals} meals`,
        icon: "🥗",
      });
    }

    // Dispatch achievement events
    achievements.forEach((achievement) => {
      this.dispatchAchievementUnlocked(achievement);
    });

    return achievements;
  }

  // Initialize real-time sync
  initializeRealTimeSync() {
    console.log("🔄 Initializing real-time sync system...");

    // Listen for online/offline events
    window.addEventListener("online", () => {
      console.log("🟢 Back online - syncing data...");
      this.syncOfflineData();
    });

    window.addEventListener("offline", () => {
      console.log("🔴 Gone offline - enabling offline mode...");
    });

    // Auto-sync every 30 seconds when online
    setInterval(() => {
      if (navigator.onLine) {
        this.syncOfflineData();
      }
    }, 30000);
  }

  // Sync offline data when back online
  async syncOfflineData() {
    try {
      // Get pending data from localStorage
      const pendingWorkouts = JSON.parse(
        localStorage.getItem("pendingWorkouts") || "[]",
      );
      const pendingMeals = JSON.parse(
        localStorage.getItem("pendingMeals") || "[]",
      );

      // Sync workouts
      for (const workout of pendingWorkouts) {
        try {
          await fetch("/api/workouts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(workout),
          });
        } catch (error) {
          console.error("Failed to sync workout:", error);
        }
      }

      // Sync meals
      for (const meal of pendingMeals) {
        try {
          await fetch("/api/meals", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(meal),
          });
        } catch (error) {
          console.error("Failed to sync meal:", error);
        }
      }

      // Clear pending data after successful sync
      localStorage.removeItem("pendingWorkouts");
      localStorage.removeItem("pendingMeals");

      console.log("✅ Offline data synced successfully");
    } catch (error) {
      console.error("Sync error:", error);
    }
  }
}

// Create global instance
const realTimeEvents = new RealTimeEventDispatcher();

// Initialize on load
if (typeof window !== "undefined") {
  realTimeEvents.initializeRealTimeSync();
}

export default realTimeEvents;
export { RealTimeEventDispatcher };
