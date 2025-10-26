import { useState, useEffect, useCallback } from 'react';
import nutritionApi from '../services/nutritionApi';

export const useRealTimeNutrition = () => {
  const [meals, setMeals] = useState([]);
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    mealsCount: 0
  });
  const [targets, setTargets] = useState({
    baselineCalories: 2000,
    calories: 2000,
    goalType: 'maintain',
    protein: 150,
    carbs: 200,
    fat: 65
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    loadNutritionData();
    loadTargets();
  }, []);

  const loadNutritionData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [mealsResult, totalsResult] = await Promise.all([
        nutritionApi.getMeals(),
        nutritionApi.getNutritionTotals()
      ]);

      if (mealsResult.success) {
        setMeals(mealsResult.data);
      }

      if (totalsResult.success) {
        setTotals(totalsResult.data);
      }
    } catch (err) {
      console.error('Failed to load nutrition data:', err);
      setError('Failed to load nutrition data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTargets = async () => {
    try {
      const result = await nutritionApi.getNutritionTargets();
      if (result.success) {
        setTargets({
          baselineCalories: result.data.baselineCalories,
          calories: result.data.baselineCalories || result.data.calories || 2000,
          goalType: result.data.goalType,
          protein: result.data.macroTargets?.protein || 150,
          carbs: result.data.macroTargets?.carbs || 200,
          fat: result.data.macroTargets?.fat || 65
        });
      }
    } catch (err) {
      console.error('Failed to load targets:', err);
    }
  };

  // Real-time food lookup
  const lookupFood = useCallback(async (query) => {
    try {
      setError(null);
      console.log('🔍 Looking up food:', query);
      
      const result = await nutritionApi.lookupFood(query);
      
      if (result.success) {
        console.log('✅ Food lookup successful:', result.data);
        return result.data;
      } else {
        throw new Error('Food lookup failed');
      }
    } catch (err) {
      console.error('❌ Food lookup error:', err);
      setError(`Failed to lookup "${query}". Using estimated values.`);
      
      // Return estimated nutrition with all required properties
      return {
        name: query || 'Unknown Food',
        parsedName: query || 'Unknown Food',
        calories: 100,
        protein: 5,
        carbs: 15,
        fat: 3,
        fiber: 2,
        sugar: 5,
        sodium: 50,
        servingText: '1 serving',
        servingGrams: 100,
        source: 'estimated'
      };
    }
  }, []);

  // Add meal with real-time updates
  const addMeal = useCallback(async (mealData) => {
    try {
      setError(null);
      
      // Optimistic update
      const tempMeal = {
        ...mealData,
        id: `temp-${Date.now()}`,
        consumedAt: new Date().toISOString(),
        synced: false
      };
      
      setMeals(prev => [tempMeal, ...prev]);
      
      // Update totals optimistically
      setTotals(prev => ({
        calories: prev.calories + (mealData.calories || 0),
        protein: Math.round((prev.protein + (mealData.protein || 0)) * 10) / 10,
        carbs: Math.round((prev.carbs + (mealData.carbs || 0)) * 10) / 10,
        fat: Math.round((prev.fat + (mealData.fat || 0)) * 10) / 10,
        mealsCount: prev.mealsCount + 1
      }));

      // Save to backend
      const result = await nutritionApi.addMeal(mealData);
      
      if (result.success) {
        // Replace temp meal with real meal
        setMeals(prev => prev.map(meal => 
          meal.id === tempMeal.id 
            ? { ...result.data, synced: true }
            : meal
        ));
        
        console.log('✅ Meal added successfully:', result.data);
      }
      
      return result;
    } catch (err) {
      console.error('❌ Failed to add meal:', err);
      
      // Revert optimistic update
      setMeals(prev => prev.filter(meal => meal.id !== `temp-${Date.now()}`));
      setTotals(prev => ({
        calories: prev.calories - (mealData.calories || 0),
        protein: Math.round((prev.protein - (mealData.protein || 0)) * 10) / 10,
        carbs: Math.round((prev.carbs - (mealData.carbs || 0)) * 10) / 10,
        fat: Math.round((prev.fat - (mealData.fat || 0)) * 10) / 10,
        mealsCount: prev.mealsCount - 1
      }));
      
      setError('Failed to add meal: ' + err.message);
      throw err;
    }
  }, []);

  // Delete meal with real-time updates
  const deleteMeal = useCallback(async (mealId) => {
    try {
      setError(null);
      
      // Validate meal ID
      if (!mealId || mealId === 'undefined') {
        throw new Error('Invalid meal ID');
      }
      
      // Find meal to delete
      const mealToDelete = meals.find(meal => 
        (meal._id && meal._id.toString() === mealId.toString()) || 
        (meal.id && meal.id.toString() === mealId.toString())
      );
      
      if (!mealToDelete) {
        throw new Error('Meal not found');
      }

      // Optimistic update
      setMeals(prev => prev.filter(meal => 
        (meal._id && meal._id.toString() !== mealId.toString()) && 
        (meal.id && meal.id.toString() !== mealId.toString())
      ));
      
      // Update totals optimistically
      setTotals(prev => ({
        calories: Math.max(0, prev.calories - (mealToDelete.calories || 0)),
        protein: Math.max(0, Math.round((prev.protein - (mealToDelete.protein || 0)) * 10) / 10),
        carbs: Math.max(0, Math.round((prev.carbs - (mealToDelete.carbs || 0)) * 10) / 10),
        fat: Math.max(0, Math.round((prev.fat - (mealToDelete.fat || 0)) * 10) / 10),
        mealsCount: Math.max(0, prev.mealsCount - 1)
      }));

      // Delete from backend
      await nutritionApi.deleteMeal(mealId);
      
      console.log('✅ Meal deleted successfully');
    } catch (err) {
      console.error('❌ Failed to delete meal:', err);
      
      // Revert optimistic update
      loadNutritionData();
      setError('Failed to delete meal: ' + err.message);
      throw err;
    }
  }, [meals, loadNutritionData]);

  // Refresh data
  const refresh = useCallback(() => {
    loadNutritionData();
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
    setError
  };
};