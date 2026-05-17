import api from "../config/api";

class WorkoutSplitsService {
  // Get all workout splits with optional filtering
  async getAllSplits(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.category && filters.category !== "all") {
        params.append("category", filters.category);
      }

      if (filters.search) {
        params.append("search", filters.search);
      }

      const queryString = params.toString();
      const url = queryString
        ? `/workout-splits?${queryString}`
        : "/workout-splits";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching workout splits:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch workout splits",
      );
    }
  }

  // Get specific workout split by ID
  async getSplitById(splitId) {
    try {
      const response = await api.get(`/workout-splits/${splitId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching workout split:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch workout split",
      );
    }
  }

  // Get all available categories
  async getCategories() {
    try {
      const response = await api.get("/workout-splits/meta/categories");
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch categories",
      );
    }
  }

  // Add split to user favorites (requires authentication)
  async addToFavorites(splitId) {
    try {
      const response = await api.post("/workout-splits/favorite", { splitId });
      return response.data;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      throw new Error(
        error.response?.data?.message || "Failed to add to favorites",
      );
    }
  }

  // Remove split from user favorites (requires authentication)
  async removeFromFavorites(splitId) {
    try {
      const response = await api.delete(`/workout-splits/favorite/${splitId}`);
      return response.data;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      throw new Error(
        error.response?.data?.message || "Failed to remove from favorites",
      );
    }
  }

  // Get user's favorite splits (requires authentication)
  async getUserFavorites() {
    try {
      const response = await api.get("/workout-splits/favorites");
      return response.data;
    } catch (error) {
      console.error("Error fetching user favorites:", error);
      // Return empty array if not authenticated or no favorites
      return { success: true, data: [] };
    }
  }

  // Search splits by name or description
  async searchSplits(searchTerm) {
    try {
      const response = await api.get(
        `/workout-splits?search=${encodeURIComponent(searchTerm)}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error searching splits:", error);
      throw new Error(
        error.response?.data?.message || "Failed to search splits",
      );
    }
  }

  // Get splits by category
  async getSplitsByCategory(category) {
    try {
      const response = await api.get(`/workout-splits?category=${category}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching splits by category:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch splits by category",
      );
    }
  }

  // Get recommended splits based on user goals (mock implementation)
  async getRecommendedSplits(userGoals = {}) {
    try {
      // This would typically use user data to recommend splits
      // For now, we'll return popular splits based on goals
      let category = "all";

      if (userGoals.goal === "muscle_gain") {
        category = "bulking";
      } else if (userGoals.goal === "fat_loss") {
        category = "cutting";
      } else if (userGoals.goal === "body_recomp") {
        category = "recomp";
      } else if (userGoals.experience === "beginner") {
        category = "beginner";
      }

      return await this.getSplitsByCategory(category);
    } catch (error) {
      console.error("Error getting recommended splits:", error);
      throw new Error("Failed to get recommended splits");
    }
  }

  // Cache management for offline support
  getCachedSplits() {
    try {
      const cached = localStorage.getItem("workout_splits_cache");
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error reading cached splits:", error);
      return null;
    }
  }

  setCachedSplits(splits) {
    try {
      localStorage.setItem(
        "workout_splits_cache",
        JSON.stringify({
          data: splits,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      console.error("Error caching splits:", error);
    }
  }

  // Check if cached data is still valid (24 hours)
  isCacheValid() {
    try {
      const cached = this.getCachedSplits();
      if (!cached) return false;

      const twentyFourHours = 24 * 60 * 60 * 1000;
      return Date.now() - cached.timestamp < twentyFourHours;
    } catch (error) {
      return false;
    }
  }

  // Get splits with fallback to cache
  async getSplitsWithCache(filters = {}) {
    try {
      // Try to get fresh data
      const response = await this.getAllSplits(filters);

      // Cache the response
      this.setCachedSplits(response.data);

      return response;
    } catch (error) {
      // Fallback to cache if available
      const cached = this.getCachedSplits();
      if (cached && this.isCacheValid()) {
        console.log("Using cached workout splits data");
        return {
          success: true,
          data: cached.data,
          fromCache: true,
        };
      }

      // If no cache, return empty array instead of throwing
      console.log("API not available, using fallback data");
      return {
        success: true,
        data: [],
        fromFallback: true,
      };
    }
  }
}

export default new WorkoutSplitsService();
