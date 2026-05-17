import { useState, useEffect, useCallback } from "react";
import nutritionApi from "../services/nutritionApi";
import { migrateToUserSpecificMeals } from "../utils/userSpecificMeals";
import {
  clearAllOldMealData,
  initializeEmptyUserMeals,
} from "../utils/clearOldMealData";

export const useRealTimeNutrition = () => {
  const [meals, setMeals] = useState([]);
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    mealsCount: 0,
  });
  const [targets, setTargets] = useState({
    baselineCalories: 2000,
    calories: 2000,
    goalType: "maintain",
    protein: 150,
    carbs: 200,
    fat: 65,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial data only if authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && token !== "null" && token !== "undefined") {
      // Only clear old data if no user-specific meals exist
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      if (currentUser) {
        const userMealKey = `recentMeals_${currentUser.id || currentUser._id}`;
        const existingUserMeals = localStorage.getItem(userMealKey);
        if (!existingUserMeals) {
          clearAllOldMealData();
          initializeEmptyUserMeals(currentUser.id || currentUser._id);
        }
      }

      loadNutritionData();
      loadTargets();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadNutritionData = async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Load from user-specific localStorage first
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      if (currentUser) {
        const userMealKey = `recentMeals_${currentUser.id || currentUser._id}`;
        const localMeals = JSON.parse(
          localStorage.getItem(userMealKey) || "[]",
        );
        setMeals(localMeals);

        // Calculate totals from local meals
        const localTotals = localMeals.reduce(
          (acc, meal) => ({
            calories: acc.calories + (meal.calories || 0),
            protein: acc.protein + (meal.protein || 0),
            carbs: acc.carbs + (meal.carbs || 0),
            fat: acc.fat + (meal.fat || 0),
            mealsCount: acc.mealsCount + 1,
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0, mealsCount: 0 },
        );

        setTotals(localTotals);
      }

      // Try to sync with backend
      const [mealsResult, totalsResult] = await Promise.all([
        nutritionApi.getMeals(),
        nutritionApi.getNutritionTotals(),
      ]);

      if (mealsResult.success) {
        setMeals(mealsResult.data);
        // Update user-specific localStorage
        if (currentUser) {
          const userMealKey = `recentMeals_${currentUser.id || currentUser._id}`;
          localStorage.setItem(userMealKey, JSON.stringify(mealsResult.data));
        }
      }

      if (totalsResult.success) {
        setTotals(totalsResult.data);
      }
    } catch (err) {
      console.error("Failed to load nutrition data:", err);
      if (err.response?.status !== 401) {
        setError("Failed to load nutrition data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadTargets = async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") {
      return;
    }

    try {
      const result = await nutritionApi.getNutritionTargets();
      if (result.success) {
        setTargets({
          baselineCalories: result.data.baselineCalories,
          calories:
            result.data.baselineCalories || result.data.calories || 2000,
          goalType: result.data.goalType,
          protein: result.data.macroTargets?.protein || 150,
          carbs: result.data.macroTargets?.carbs || 200,
          fat: result.data.macroTargets?.fat || 65,
        });
      }
    } catch (err) {
      console.error("Failed to load targets:", err);
    }
  };

  // Real-time food lookup
  const lookupFood = useCallback(async (query) => {
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") {
      throw new Error("Please log in to lookup food nutrition");
    }

    try {
      setError(null);
      console.log("🔍 Looking up food:", query);

      const result = await nutritionApi.lookupFood(query);

      if (result.success) {
        console.log("✅ Food lookup successful:", result.data);
        return result.data;
      } else {
        throw new Error("Food lookup failed");
      }
    } catch (err) {
      console.error("❌ Food lookup error:", err);
      if (err.response?.status === 401) {
        throw new Error("Please log in again to lookup food");
      }
      setError(`Failed to lookup "${query}". Using estimated values.`);

      // Return estimated nutrition with all required properties
      return {
        name: query || "Unknown Food",
        parsedName: query || "Unknown Food",
        calories: 100,
        protein: 5,
        carbs: 15,
        fat: 3,
        fiber: 2,
        sugar: 5,
        sodium: 50,
        servingText: "1 serving",
        servingGrams: 100,
        source: "estimated",
      };
    }
  }, []);

  // Add meal with real-time updates
  const addMeal = useCallback(async (mealData) => {
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") {
      throw new Error("Please log in to add meals");
    }

    try {
      setError(null);

      // Optimistic update
      const tempMeal = {
        ...mealData,
        id: `temp-${Date.now()}`,
        consumedAt: new Date().toISOString(),
        synced: false,
      };

      setMeals((prev) => [tempMeal, ...prev]);

      // Update totals optimistically
      setTotals((prev) => ({
        calories: prev.calories + (mealData.calories || 0),
        protein: Math.round((prev.protein + (mealData.protein || 0)) * 10) / 10,
        carbs: Math.round((prev.carbs + (mealData.carbs || 0)) * 10) / 10,
        fat: Math.round((prev.fat + (mealData.fat || 0)) * 10) / 10,
        mealsCount: prev.mealsCount + 1,
      }));

      // Save to user-specific localStorage immediately
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      if (currentUser) {
        const userMealKey = `recentMeals_${currentUser.id || currentUser._id}`;
        const existingMeals = JSON.parse(
          localStorage.getItem(userMealKey) || "[]",
        );
        const updatedMeals = [tempMeal, ...existingMeals];
        localStorage.setItem(userMealKey, JSON.stringify(updatedMeals));
        console.log(
          "💾 Meal saved to localStorage:",
          userMealKey,
          updatedMeals.length,
        );

        // Dispatch event immediately for Analytics
        window.dispatchEvent(
          new CustomEvent("mealAdded", {
            detail: {
              mealData: tempMeal,
              timestamp: new Date().toISOString(),
            },
          }),
        );
      }

      // Save to backend
      const result = await nutritionApi.addMeal(mealData);

      if (result.success) {
        // Replace temp meal with real meal and remove any duplicates
        setMeals((prev) => {
          const filtered = prev.filter((meal) => meal.id !== tempMeal.id);
          return [{ ...result.data, synced: true }, ...filtered];
        });

        // Update localStorage with real meal data
        if (currentUser) {
          const userMealKey = `recentMeals_${currentUser.id || currentUser._id}`;
          const existingMeals = JSON.parse(
            localStorage.getItem(userMealKey) || "[]",
          );
          const updatedMeals = existingMeals.map((meal) =>
            meal.id === tempMeal.id ? { ...result.data, synced: true } : meal,
          );
          localStorage.setItem(userMealKey, JSON.stringify(updatedMeals));
          console.log(
            "✅ Meal synced to localStorage:",
            userMealKey,
            updatedMeals.length,
          );
        }

        console.log("✅ Meal added successfully:", result.data);
      }

      return result;
    } catch (err) {
      console.error("❌ Failed to add meal:", err);

      // Revert optimistic update
      setMeals((prev) => prev.filter((meal) => meal.id !== tempMeal.id));
      setTotals((prev) => ({
        calories: prev.calories - (mealData.calories || 0),
        protein: Math.round((prev.protein - (mealData.protein || 0)) * 10) / 10,
        carbs: Math.round((prev.carbs - (mealData.carbs || 0)) * 10) / 10,
        fat: Math.round((prev.fat - (mealData.fat || 0)) * 10) / 10,
        mealsCount: prev.mealsCount - 1,
      }));

      // Revert localStorage and dispatch event
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      if (currentUser) {
        const userMealKey = `recentMeals_${currentUser.id || currentUser._id}`;
        const existingMeals = JSON.parse(
          localStorage.getItem(userMealKey) || "[]",
        );
        const updatedMeals = existingMeals.filter(
          (meal) => meal.id !== tempMeal.id,
        );
        localStorage.setItem(userMealKey, JSON.stringify(updatedMeals));

        // Dispatch event to refresh Analytics
        window.dispatchEvent(
          new CustomEvent("mealDeleted", {
            detail: {
              mealId: tempMeal.id,
              timestamp: new Date().toISOString(),
            },
          }),
        );
      }

      setError("Failed to add meal: " + err.message);
      throw err;
    }
  }, []);

  // Delete meal with real-time updates
  const deleteMeal = useCallback(
    async (mealId) => {
      const token = localStorage.getItem("token");
      if (!token || token === "null" || token === "undefined") {
        throw new Error("Please log in to delete meals");
      }

      try {
        setError(null);

        // Validate meal ID
        if (!mealId || mealId === "undefined") {
          throw new Error("Invalid meal ID");
        }

        // Find meal to delete
        const mealToDelete = meals.find(
          (meal) =>
            (meal._id && meal._id.toString() === mealId.toString()) ||
            (meal.id && meal.id.toString() === mealId.toString()),
        );

        if (!mealToDelete) {
          throw new Error("Meal not found");
        }

        // Optimistic update
        setMeals((prev) =>
          prev.filter(
            (meal) =>
              meal._id &&
              meal._id.toString() !== mealId.toString() &&
              meal.id &&
              meal.id.toString() !== mealId.toString(),
          ),
        );

        // Update totals optimistically
        setTotals((prev) => ({
          calories: Math.max(0, prev.calories - (mealToDelete.calories || 0)),
          protein: Math.max(
            0,
            Math.round((prev.protein - (mealToDelete.protein || 0)) * 10) / 10,
          ),
          carbs: Math.max(
            0,
            Math.round((prev.carbs - (mealToDelete.carbs || 0)) * 10) / 10,
          ),
          fat: Math.max(
            0,
            Math.round((prev.fat - (mealToDelete.fat || 0)) * 10) / 10,
          ),
          mealsCount: Math.max(0, prev.mealsCount - 1),
        }));

        // Update user-specific localStorage
        const currentUser = JSON.parse(localStorage.getItem("user") || "null");
        if (currentUser) {
          const userMealKey = `recentMeals_${currentUser.id || currentUser._id}`;
          const existingMeals = JSON.parse(
            localStorage.getItem(userMealKey) || "[]",
          );
          const updatedMeals = existingMeals.filter(
            (meal) => meal.id !== mealId && meal._id !== mealId,
          );
          localStorage.setItem(userMealKey, JSON.stringify(updatedMeals));
        }

        // Delete from backend
        await nutritionApi.deleteMeal(mealId);

        console.log("✅ Meal deleted successfully");

        // Dispatch event to notify Analytics
        window.dispatchEvent(
          new CustomEvent("mealDeleted", {
            detail: { mealId, timestamp: new Date().toISOString() },
          }),
        );
      } catch (err) {
        console.error("❌ Failed to delete meal:", err);

        // Revert optimistic update
        loadNutritionData();
        setError("Failed to delete meal: " + err.message);
        throw err;
      }
    },
    [meals, loadNutritionData],
  );

  // Refresh data
  const refresh = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token && token !== "null" && token !== "undefined") {
      loadNutritionData();
    }
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("token");
      if (!token || token === "null" || token === "undefined") {
        // Clear data when logged out
        setMeals([]);
        setTotals({ calories: 0, protein: 0, carbs: 0, fat: 0, mealsCount: 0 });
        setTargets({
          baselineCalories: 2000,
          calories: 2000,
          goalType: "maintain",
          protein: 150,
          carbs: 200,
          fat: 65,
        });
        setError(null);
        setIsLoading(false);

        // Clear user-specific meal data from localStorage
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith("recentMeals_")) {
            localStorage.removeItem(key);
          }
        });
      } else {
        // Reload data when logged in
        loadNutritionData();
        loadTargets();
      }
    };

    window.addEventListener("userLoggedOut", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("userLoggedOut", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  return {
    meals,
    totals,
    targets,
    isLoading,
    error,
    lookupFood,
    addMeal,
    deleteMeal,
    refresh,
    setError,
  };
};
