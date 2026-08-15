// Personal Records (PR) Service - Authoritative backend PR tracking from MongoDB Atlas
import api from '../utils/api';

export class PRService {
  static getPRKey(userId, exerciseName) {
    return `pr_${userId}_${exerciseName.toLowerCase().replace(/\s+/g, "_")}`;
  }

  // Fetch all authoritative PRs from MongoDB Atlas API
  static async fetchUserPRsFromAPI() {
    try {
      const res = await api.get('/workouts/prs');
      if (res.data?.success && Array.isArray(res.data.prs)) {
        const prMap = {};
        res.data.prs.forEach(item => {
          prMap[item._id] = {
            exerciseName: item._id,
            maxWeight: item.maxWeight || 0,
            maxReps: item.maxReps || 0,
            lastUpdated: item.latestDate
          };
        });
        return prMap;
      }
      return {};
    } catch (error) {
      console.warn('Failed to fetch PRs from API, using local storage fallback:', error.message);
      return {};
    }
  }

  static getUserPRs(userId) {
    try {
      const allPRs = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`pr_${userId}_`)) {
          const exerciseName = key
            .replace(`pr_${userId}_`, "")
            .replace(/_/g, " ");
          allPRs[exerciseName] = JSON.parse(localStorage.getItem(key));
        }
      }
      return allPRs;
    } catch (error) {
      console.error("Error getting user PRs:", error);
      return {};
    }
  }

  static getCurrentPR(userId, exerciseName) {
    try {
      const key = this.getPRKey(userId, exerciseName);
      const pr = localStorage.getItem(key);
      return pr ? JSON.parse(pr) : null;
    } catch (error) {
      console.error("Error getting current PR:", error);
      return null;
    }
  }

  static checkAndUpdatePR(userId, exerciseName, workoutData) {
    try {
      const currentPR = this.getCurrentPR(userId, exerciseName);
      const newPRs = [];

      // Calculate new metrics
      const maxWeight = Math.max(
        ...workoutData.sets.map((set) => parseFloat(set.weight) || 0),
      );
      const totalVolume = workoutData.sets.reduce(
        (sum, set) => sum + (set.weight * set.reps),
        0,
      );
      const maxReps = Math.max(
        ...workoutData.sets.map((set) => parseInt(set.reps, 10) || 0),
      );

      // Check for new PRs
      if (!currentPR || maxWeight > (currentPR.maxWeight || 0)) {
        newPRs.push({
          type: "Max Weight",
          value: maxWeight,
          unit: "kg",
          previous: currentPR?.maxWeight || 0,
          improvement: maxWeight - (currentPR?.maxWeight || 0),
        });
      }

      if (!currentPR || totalVolume > (currentPR.totalVolume || 0)) {
        newPRs.push({
          type: "Total Volume",
          value: totalVolume,
          unit: "kg",
          previous: currentPR?.totalVolume || 0,
          improvement: totalVolume - (currentPR?.totalVolume || 0),
        });
      }

      if (!currentPR || maxReps > (currentPR.maxReps || 0)) {
        newPRs.push({
          type: "Max Reps",
          value: maxReps,
          unit: "reps",
          previous: currentPR?.maxReps || 0,
          improvement: maxReps - (currentPR?.maxReps || 0),
        });
      }

      // Update PR record if any new PRs found
      if (newPRs.length > 0) {
        const updatedPR = {
          exerciseName,
          maxWeight: Math.max(maxWeight, currentPR?.maxWeight || 0),
          totalVolume: Math.max(totalVolume, currentPR?.totalVolume || 0),
          maxReps: Math.max(maxReps, currentPR?.maxReps || 0),
          lastUpdated: new Date().toISOString(),
          workoutId: workoutData.id || Date.now(),
        };

        const key = this.getPRKey(userId, exerciseName);
        localStorage.setItem(key, JSON.stringify(updatedPR));

        // Dispatch PR event for real-time updates
        window.dispatchEvent(
          new CustomEvent("newPRRecord", {
            detail: {
              userId,
              exerciseName,
              newPRs,
              updatedPR,
            },
          }),
        );

        return newPRs;
      }

      return [];
    } catch (error) {
      console.error("Error checking/updating PR:", error);
      return [];
    }
  }
}

export default PRService;

