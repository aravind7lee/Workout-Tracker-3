import { useState, useEffect, useCallback } from "react";
import nutritionApi from "../services/nutritionApi";
import { migrateToUserSpecificMeals } from "../utils/userSpecificMeals";
import {
  clearAllOldMealData,
  initializeEmptyUserMeals,
} from "../utils/clearOldMealData";

export const useRealTimeNutrition = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
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
    weight: 70,
  });
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal, setWaterGoal] = useState(3000);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to get current user ID
  const getCurrentUserId = () => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      return u?.id || u?._id || "guest";
    } catch {
      return "guest";
    }
  };

  // Load water intake for a date
  const loadWaterData = useCallback((dateStr = selectedDate) => {
    try {
      const uid = getCurrentUserId();
      const savedWater = localStorage.getItem(`water_${uid}_${dateStr}`);
      const savedGoal = localStorage.getItem(`water_goal_${uid}`);
      setWaterIntake(savedWater ? parseInt(savedWater, 10) || 0 : 0);
      if (savedGoal) {
        setWaterGoal(parseInt(savedGoal, 10) || 3000);
      }
    } catch (e) {
      console.warn("Could not load water data:", e);
    }
  }, [selectedDate]);

  // Log water intake
  const logWater = useCallback((deltaMl) => {
    try {
      const uid = getCurrentUserId();
      setWaterIntake((prev) => {
        const next = Math.max(0, prev + deltaMl);
        localStorage.setItem(`water_${uid}_${selectedDate}`, next.toString());
        window.dispatchEvent(
          new CustomEvent("waterUpdated", {
            detail: { amount: next, delta: deltaMl, date: selectedDate },
          })
        );
        return next;
      });
    } catch (e) {
      console.warn("Failed to save water log:", e);
    }
  }, [selectedDate]);

  const updateWaterGoal = useCallback((newGoal) => {
    try {
      const uid = getCurrentUserId();
      const goal = Math.max(500, Math.min(10000, parseInt(newGoal, 10) || 3000));
      setWaterGoal(goal);
      localStorage.setItem(`water_goal_${uid}`, goal.toString());
    } catch (e) {
      console.warn("Failed to set water goal:", e);
    }
  }, []);

  const loadNutritionData = useCallback(async (dateStr = selectedDate) => {
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      const uid = currentUser?.id || currentUser?._id;
      const todayStr = new Date().toISOString().split("T")[0];
      const isToday = dateStr === todayStr;

      if (currentUser && isToday) {
        const userMealKey = `recentMeals_${uid}`;
        const localMeals = JSON.parse(
          localStorage.getItem(userMealKey) || "[]",
        );
        if (Array.isArray(localMeals) && localMeals.length > 0) {
          setMeals(localMeals);
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
      }

      // Sync with backend with date parameter
      const [mealsResult, totalsResult] = await Promise.all([
        nutritionApi.getMeals(dateStr),
        nutritionApi.getNutritionTotals(dateStr),
      ]);

      if (mealsResult.success && Array.isArray(mealsResult.data)) {
        setMeals(mealsResult.data);
        if (currentUser && isToday) {
          const userMealKey = `recentMeals_${uid}`;
          localStorage.setItem(userMealKey, JSON.stringify(mealsResult.data));
        }
      }

      if (totalsResult.success && totalsResult.data) {
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
  }, [selectedDate]);

  const loadTargets = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") return;

    try {
      const result = await nutritionApi.getNutritionTargets();
      if (result.success && result.data) {
        if (result.achievements?.length) {
          window.dispatchEvent(
            new CustomEvent("achievementUnlocked", {
              detail: result.achievements,
            })
          );
        }
        setTargets((prev) => ({
          ...prev,
          baselineCalories: result.data.baselineCalories || 2000,
          calories: result.data.baselineCalories || result.data.calories || 2000,
          goalType: result.data.goalType || "maintain",
          protein: result.data.macroTargets?.protein || 150,
          carbs: result.data.macroTargets?.carbs || 200,
          fat: result.data.macroTargets?.fat || 65,
          weight: result.data.weight || prev.weight || 70,
        }));
      }
    } catch (err) {
      console.error("Failed to load targets:", err);
    }
  }, []);

  // Update date and reload both meals and water
  const changeDate = useCallback((newDateStr) => {
    setSelectedDate(newDateStr);
    loadNutritionData(newDateStr);
    loadWaterData(newDateStr);
  }, [loadNutritionData, loadWaterData]);

  // Initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && token !== "null" && token !== "undefined") {
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      if (currentUser) {
        const userMealKey = `recentMeals_${currentUser.id || currentUser._id}`;
        const existingUserMeals = localStorage.getItem(userMealKey);
        if (!existingUserMeals) {
          clearAllOldMealData();
          initializeEmptyUserMeals(currentUser.id || currentUser._id);
        }
      }

      loadNutritionData(selectedDate);
      loadTargets();
      loadWaterData(selectedDate);
    } else {
      setIsLoading(false);
    }

    const handleTargetsUpdated = (event) => {
      const updated = event.detail;
      if (updated) {
        setTargets((prev) => ({
          ...prev,
          baselineCalories:
            updated.calories || updated.baselineCalories || prev.baselineCalories,
          calories:
            updated.calories || updated.baselineCalories || prev.calories,
          goalType: updated.goalType || updated.goal || prev.goalType,
          protein:
            updated.protein || updated.macroTargets?.protein || prev.protein,
          carbs: updated.carbs || updated.macroTargets?.carbs || prev.carbs,
          fat: updated.fat || updated.macroTargets?.fat || prev.fat,
          weight: updated.weight || prev.weight || 70,
        }));
      }
    };

    window.addEventListener("nutritionTargetsUpdated", handleTargetsUpdated);
    return () => {
      window.removeEventListener("nutritionTargetsUpdated", handleTargetsUpdated);
    };
  }, []);

  // Real-time food lookup
  const lookupFood = useCallback(async (query) => {
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") {
      throw new Error("Please log in to lookup food nutrition");
    }

    try {
      setError(null);
      const result = await nutritionApi.lookupFood(query);

      if (result.success) {
        return result.data;
      } else {
        throw new Error("Food lookup failed");
      }
    } catch (err) {
      console.error("Food lookup error:", err);
      if (err.response?.status === 401) {
        throw new Error("Please log in again to lookup food");
      }
      setError(`Failed to lookup "${query}". Using estimated values.`);

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

  // Add meal with optimistic update and reliable state/storage sync
  const addMeal = useCallback(async (mealData) => {
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") {
      throw new Error("Please log in to add meals");
    }

    try {
      setError(null);

      const tempMeal = {
        ...mealData,
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        consumedAt: new Date().toISOString(),
        synced: false,
      };

      setMeals((prev) => [tempMeal, ...prev]);

      setTotals((prev) => ({
        calories: prev.calories + (mealData.calories || 0),
        protein: Math.round((prev.protein + (mealData.protein || 0)) * 10) / 10,
        carbs: Math.round((prev.carbs + (mealData.carbs || 0)) * 10) / 10,
        fat: Math.round((prev.fat + (mealData.fat || 0)) * 10) / 10,
        mealsCount: prev.mealsCount + 1,
      }));

      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      if (currentUser) {
        const userMealKey = `recentMeals_${currentUser.id || currentUser._id}`;
        const existingMeals = JSON.parse(
          localStorage.getItem(userMealKey) || "[]",
        );
        const updatedMeals = [tempMeal, ...existingMeals];
        localStorage.setItem(userMealKey, JSON.stringify(updatedMeals));

        window.dispatchEvent(
          new CustomEvent("mealAdded", {
            detail: {
              meal: tempMeal,
              totals: {
                calories: totals.calories + (mealData.calories || 0),
                protein: totals.protein + (mealData.protein || 0),
                carbs: totals.carbs + (mealData.carbs || 0),
                fat: totals.fat + (mealData.fat || 0),
              },
              timestamp: new Date().toISOString(),
            },
          }),
        );
      }

      // Backend sync
      try {
        const result = await nutritionApi.addMeal(mealData);
        if (result.success && result.data) {
          const syncedMeal = { ...result.data, synced: true };
          setMeals((prev) =>
            prev.map((m) => (m.id === tempMeal.id ? syncedMeal : m)),
          );

          if (currentUser) {
            const userMealKey = `recentMeals_${currentUser.id || currentUser._id}`;
            const currentStored = JSON.parse(
              localStorage.getItem(userMealKey) || "[]",
            );
            const updated = currentStored.map((m) =>
              m.id === tempMeal.id ? syncedMeal : m,
            );
            localStorage.setItem(userMealKey, JSON.stringify(updated));
          }

          if (result.achievements?.length) {
            window.dispatchEvent(
              new CustomEvent("achievementUnlocked", {
                detail: result.achievements,
              }),
            );
          }
        }
      } catch (backendErr) {
        console.warn("Backend addMeal delayed/offline:", backendErr.message);
      }
      return tempMeal;
    } catch (err) {
      console.error("Failed to add meal:", err);
      setError("Failed to add meal: " + err.message);
      throw err;
    }
  }, [totals]);

  // One-Tap Duplicate / Eat Again
  const duplicateMeal = useCallback(async (meal) => {
    if (!meal) return;
    const duplicatedData = {
      name: meal.name,
      parsedName: meal.parsedName || meal.name,
      mealType: meal.mealType || "snack",
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fat: meal.fat || 0,
      fiber: meal.fiber || 0,
      sugar: meal.sugar || 0,
      sodium: meal.sodium || 0,
      servingText: meal.servingText || "1 serving",
      servingGrams: meal.servingGrams || 100,
      source: "duplicate",
    };
    return await addMeal(duplicatedData);
  }, [addMeal]);

  // Fast Custom Macro Entry
  const addCustomMeal = useCallback(async (customData) => {
    const preparedData = {
      name: customData.name || "Custom Food",
      parsedName: customData.name || "Custom Food",
      mealType: customData.mealType || "snack",
      calories: Math.round(Number(customData.calories) || 0),
      protein: Math.round(Number(customData.protein) || 0),
      carbs: Math.round(Number(customData.carbs) || 0),
      fat: Math.round(Number(customData.fat) || 0),
      fiber: Math.round(Number(customData.fiber) || 0),
      servingText: customData.servingText || "1 portion",
      source: "custom-quick",
    };
    return await addMeal(preparedData);
  }, [addMeal]);

  // Delete meal with robust ID comparison
  const deleteMeal = useCallback(
    async (mealId) => {
      const token = localStorage.getItem("token");
      if (!token || token === "null" || token === "undefined") {
        throw new Error("Please log in to delete meals");
      }

      try {
        setError(null);
        if (!mealId || mealId === "undefined") {
          throw new Error("Invalid meal ID");
        }

        const mealToDelete = meals.find((meal) => {
          const mId = (meal._id || meal.id || "").toString();
          return mId === mealId.toString();
        });

        if (!mealToDelete) {
          throw new Error("Meal not found");
        }

        // Robust filter: drops only the target meal
        setMeals((prev) =>
          prev.filter((meal) => {
            const mId = (meal._id || meal.id || "").toString();
            return mId !== mealId.toString();
          }),
        );

        // Optimistically update totals
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

        // Update user-specific localStorage safely
        const currentUser = JSON.parse(localStorage.getItem("user") || "null");
        if (currentUser) {
          const userMealKey = `recentMeals_${currentUser.id || currentUser._id}`;
          const existingMeals = JSON.parse(
            localStorage.getItem(userMealKey) || "[]",
          );
          const updatedMeals = existingMeals.filter((meal) => {
            const mId = (meal._id || meal.id || "").toString();
            return mId !== mealId.toString();
          });
          localStorage.setItem(userMealKey, JSON.stringify(updatedMeals));
        }

        // Delete from backend if not a purely local temp ID
        if (!mealId.toString().startsWith("temp-")) {
          await nutritionApi.deleteMeal(mealId);
        }

        window.dispatchEvent(
          new CustomEvent("mealDeleted", {
            detail: { mealId, timestamp: new Date().toISOString() },
          }),
        );
      } catch (err) {
        console.error("Failed to delete meal:", err);
        loadNutritionData(selectedDate);
        setError("Failed to delete meal: " + err.message);
        throw err;
      }
    },
    [meals, selectedDate, loadNutritionData],
  );

  // Refresh data
  const refresh = useCallback(() => {
    loadNutritionData(selectedDate);
    loadWaterData(selectedDate);
  }, [selectedDate, loadNutritionData, loadWaterData]);

  // Auth cleanup
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("token");
      if (!token || token === "null" || token === "undefined") {
        setMeals([]);
        setTotals({ calories: 0, protein: 0, carbs: 0, fat: 0, mealsCount: 0 });
        setTargets({
          baselineCalories: 2000,
          calories: 2000,
          goalType: "maintain",
          protein: 150,
          carbs: 200,
          fat: 65,
          weight: 70,
        });
        setWaterIntake(0);
        setError(null);
        setIsLoading(false);
      } else {
        loadNutritionData(selectedDate);
        loadTargets();
        loadWaterData(selectedDate);
      }
    };

    window.addEventListener("userLoggedOut", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("userLoggedOut", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [selectedDate, loadNutritionData, loadTargets, loadWaterData]);

  return {
    selectedDate,
    changeDate,
    meals,
    totals,
    targets,
    waterIntake,
    waterGoal,
    logWater,
    updateWaterGoal,
    isLoading,
    error,
    lookupFood,
    addMeal,
    addCustomMeal,
    duplicateMeal,
    deleteMeal,
    refresh,
    setError,
  };
};
