// Offline Storage Service for Real-time Data Persistence
class OfflineStorageService {
  constructor() {
    this.storageKey = "gymTracker_offlineData";
    this.userProgressKey = "gymTracker_userProgress";
    this.exerciseStatsKey = "gymTracker_exerciseStats";
    this.workoutHistoryKey = "gymTracker_workoutHistory";
  }

  // Get offline data structure
  getOfflineData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data
        ? JSON.parse(data)
        : {
            workouts: [],
            meals: [],
            exercises: [],
            userProgress: null,
            exerciseStats: {},
            lastSync: null,
          };
    } catch (error) {
      console.error("Failed to get offline data:", error);
      return {
        workouts: [],
        meals: [],
        exercises: [],
        userProgress: null,
        exerciseStats: {},
        lastSync: null,
      };
    }
  }

  // Save offline data
  saveOfflineData(data) {
    try {
      const existingData = this.getOfflineData();
      const updatedData = {
        ...existingData,
        ...data,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(updatedData));
      return true;
    } catch (error) {
      console.error("Failed to save offline data:", error);
      return false;
    }
  }

  // Store workout data offline
  storeWorkoutOffline(workoutData) {
    const offlineData = this.getOfflineData();
    offlineData.workouts.push({
      ...workoutData,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isOffline: true,
    });
    return this.saveOfflineData(offlineData);
  }

  // Store meal data offline
  storeMealOffline(mealData) {
    const offlineData = this.getOfflineData();
    offlineData.meals.push({
      ...mealData,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isOffline: true,
    });
    return this.saveOfflineData(offlineData);
  }

  // Store exercise interaction offline
  storeExerciseInteractionOffline(exerciseId, action) {
    const offlineData = this.getOfflineData();
    offlineData.exercises.push({
      exerciseId,
      action,
      timestamp: new Date().toISOString(),
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isOffline: true,
    });
    return this.saveOfflineData(offlineData);
  }

  // Update user progress offline
  updateUserProgressOffline(progressData) {
    const offlineData = this.getOfflineData();
    offlineData.userProgress = {
      ...offlineData.userProgress,
      ...progressData,
      lastUpdated: new Date().toISOString(),
    };
    return this.saveOfflineData(offlineData);
  }

  // Update exercise stats offline
  updateExerciseStatsOffline(exerciseName, stats) {
    const offlineData = this.getOfflineData();
    if (!offlineData.exerciseStats) {
      offlineData.exerciseStats = {};
    }
    offlineData.exerciseStats[exerciseName] = {
      ...offlineData.exerciseStats[exerciseName],
      ...stats,
      lastUpdated: new Date().toISOString(),
    };
    return this.saveOfflineData(offlineData);
  }

  // Get cached user progress
  getCachedUserProgress() {
    try {
      const data = localStorage.getItem(this.userProgressKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to get cached user progress:", error);
      return null;
    }
  }

  // Cache user progress
  cacheUserProgress(progressData) {
    try {
      const dataWithTimestamp = {
        ...progressData,
        cachedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        this.userProgressKey,
        JSON.stringify(dataWithTimestamp),
      );
      return true;
    } catch (error) {
      console.error("Failed to cache user progress:", error);
      return false;
    }
  }

  // Get cached exercise stats
  getCachedExerciseStats() {
    try {
      const data = localStorage.getItem(this.exerciseStatsKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Failed to get cached exercise stats:", error);
      return {};
    }
  }

  // Cache exercise stats
  cacheExerciseStats(statsData) {
    try {
      const dataWithTimestamp = {
        ...statsData,
        cachedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        this.exerciseStatsKey,
        JSON.stringify(dataWithTimestamp),
      );
      return true;
    } catch (error) {
      console.error("Failed to cache exercise stats:", error);
      return false;
    }
  }

  // Get cached workout history
  getCachedWorkoutHistory() {
    try {
      const data = localStorage.getItem(this.workoutHistoryKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to get cached workout history:", error);
      return [];
    }
  }

  // Cache workout history
  cacheWorkoutHistory(workouts) {
    try {
      const dataWithTimestamp = {
        workouts,
        cachedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        this.workoutHistoryKey,
        JSON.stringify(dataWithTimestamp),
      );
      return true;
    } catch (error) {
      console.error("Failed to cache workout history:", error);
      return false;
    }
  }

  // Clear all offline data
  clearOfflineData() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.userProgressKey);
      localStorage.removeItem(this.exerciseStatsKey);
      localStorage.removeItem(this.workoutHistoryKey);
      return true;
    } catch (error) {
      console.error("Failed to clear offline data:", error);
      return false;
    }
  }

  // Get storage usage info
  getStorageInfo() {
    try {
      const offlineData = this.getOfflineData();
      const userProgress = this.getCachedUserProgress();
      const exerciseStats = this.getCachedExerciseStats();
      const workoutHistory = this.getCachedWorkoutHistory();

      return {
        offlineWorkouts: offlineData.workouts.length,
        offlineMeals: offlineData.meals.length,
        offlineExercises: offlineData.exercises.length,
        hasUserProgress: !!userProgress,
        exerciseStatsCount: Object.keys(exerciseStats).length,
        workoutHistoryCount: workoutHistory.length,
        lastSync: offlineData.lastSync,
        totalSize: this.calculateStorageSize(),
      };
    } catch (error) {
      console.error("Failed to get storage info:", error);
      return null;
    }
  }

  // Calculate approximate storage size
  calculateStorageSize() {
    try {
      let totalSize = 0;
      const keys = [
        this.storageKey,
        this.userProgressKey,
        this.exerciseStatsKey,
        this.workoutHistoryKey,
      ];

      keys.forEach((key) => {
        const data = localStorage.getItem(key);
        if (data) {
          totalSize += new Blob([data]).size;
        }
      });

      return totalSize;
    } catch (error) {
      console.error("Failed to calculate storage size:", error);
      return 0;
    }
  }

  // Check if data is stale (older than specified minutes)
  isDataStale(cachedData, maxAgeMinutes = 5) {
    if (!cachedData || !cachedData.cachedAt) return true;

    const cacheTime = new Date(cachedData.cachedAt);
    const now = new Date();
    const ageMinutes = (now - cacheTime) / (1000 * 60);

    return ageMinutes > maxAgeMinutes;
  }

  // Simulate real-time updates for offline mode
  simulateRealTimeUpdate(exerciseName, action = "view") {
    const stats = this.getCachedExerciseStats();

    if (!stats[exerciseName]) {
      stats[exerciseName] = {
        totalSessions: 0,
        totalSets: 0,
        totalReps: 0,
        maxWeight: 0,
        lastPerformed: null,
        personalBest: 0,
      };
    }

    // Simulate interaction
    if (action === "workout_start") {
      stats[exerciseName].totalSessions++;
      stats[exerciseName].lastPerformed = new Date().toISOString();
    }

    this.cacheExerciseStats(stats);
    return stats[exerciseName];
  }
}

export const offlineStorageService = new OfflineStorageService();
export default offlineStorageService;
