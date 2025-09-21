// frontend/src/hooks/useNutrition.js
import { useState, useCallback } from 'react';
import api from '../utils/api';

export function useNutrition() {
  const [meals, setMeals] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, mealsCount: 0 });
  const [targets, setTargets] = useState({ 
    baselineCalories: 2000, 
    goalType: 'maintain',
    macroTargets: { protein: 150, carbs: 200, fat: 65 } 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [error, setError] = useState(null);

  // Load today's meals
  const loadMeals = useCallback(async () => {
    try {
      setIsLoading(true);
      const todayDate = new Date().toISOString().split('T')[0];
      
      const [mealsResponse, totalsResponse, targetsResponse] = await Promise.all([
        api.get(`/nutrition/meals?date=${todayDate}`),
        api.get(`/nutrition/meals/totals?date=${todayDate}`),
        api.get('/nutrition/users/me/targets')
      ]);

      if (mealsResponse.data.success) {
        setMeals(mealsResponse.data.data);
      }
      
      if (totalsResponse.data.success) {
        setTotals(totalsResponse.data.data);
      }
      
      if (targetsResponse.data.success) {
        const targetData = targetsResponse.data.data;
        setTargets({
          baselineCalories: targetData.baselineCalories || 2000,
          goalType: targetData.goalType || 'maintain',
          macroTargets: targetData.macroTargets || { protein: 150, carbs: 200, fat: 65 }
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading nutrition data:', err);
      setError(err.response?.data?.message || 'Failed to load nutrition data');
      
      // Set fallback data if API fails
      setMeals([]);
      setTotals({ calories: 0, protein: 0, carbs: 0, fat: 0, mealsCount: 0 });
      setTargets({ 
        baselineCalories: 2000, 
        goalType: 'maintain',
        macroTargets: { protein: 150, carbs: 200, fat: 65 } 
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Lookup nutrition for a food query
  const lookupNutrition = useCallback(async (query) => {
    try {
      setIsLookingUp(true);
      setError(null);
      
      const response = await api.post('/nutrition/lookup', { query });
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to lookup nutrition data';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLookingUp(false);
    }
  }, []);

  // Add meal with optimistic update
  const addMeal = useCallback(async (mealData) => {
    const optimisticId = `temp-${Date.now()}`;
    try {
      // Optimistic update
      const optimisticMeal = {
        _id: optimisticId,
        ...mealData,
        consumedAt: new Date().toISOString(),
        synced: false
      };
      
      setMeals(prev => [optimisticMeal, ...prev]);
      setTotals(prev => ({
        calories: prev.calories + mealData.calories,
        protein: Math.round((prev.protein + mealData.protein) * 10) / 10,
        carbs: Math.round((prev.carbs + mealData.carbs) * 10) / 10,
        fat: Math.round((prev.fat + mealData.fat) * 10) / 10,
        mealsCount: prev.mealsCount + 1
      }));

      // Send to server
      const response = await api.post('/nutrition/meals', mealData);
      
      if (response.data.success) {
        // Replace optimistic meal with real meal
        setMeals(prev => prev.map(meal => 
          meal._id === optimisticId ? response.data.data : meal
        ));
      }
      
      return response.data;
    } catch (err) {
      // Rollback optimistic update on error
      setMeals(prev => prev.filter(meal => meal._id !== optimisticId));
      setTotals(prev => ({
        calories: prev.calories - mealData.calories,
        protein: Math.round((prev.protein - mealData.protein) * 10) / 10,
        carbs: Math.round((prev.carbs - mealData.carbs) * 10) / 10,
        fat: Math.round((prev.fat - mealData.fat) * 10) / 10,
        mealsCount: prev.mealsCount - 1
      }));
      
      const errorMsg = err.response?.data?.message || 'Failed to add meal';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Delete meal with optimistic update
  const deleteMeal = useCallback(async (mealId) => {
    try {
      const mealToDelete = meals.find(m => m._id === mealId);
      
      if (!mealToDelete) {
        return;
      }

      // Optimistic update
      setMeals(prev => prev.filter(m => m._id !== mealId));
      setTotals(prev => ({
        calories: Math.max(0, prev.calories - (mealToDelete.calories || 0)),
        protein: Math.max(0, Math.round((prev.protein - (mealToDelete.protein || 0)) * 10) / 10),
        carbs: Math.max(0, Math.round((prev.carbs - (mealToDelete.carbs || 0)) * 10) / 10),
        fat: Math.max(0, Math.round((prev.fat - (mealToDelete.fat || 0)) * 10) / 10),
        mealsCount: Math.max(0, prev.mealsCount - 1)
      }));

      // Send to server
      const response = await api.delete(`/nutrition/meals/${mealId}`);
      
    } catch (err) {
      // Rollback on error
      await loadMeals();
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete meal';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [meals, loadMeals]);

  // Calculate remaining macros with safe defaults
  const remaining = {
    calories: (targets.baselineCalories || 2000) - (totals.calories || 0),
    protein: (targets.macroTargets?.protein || 150) - (totals.protein || 0),
    carbs: (targets.macroTargets?.carbs || 200) - (totals.carbs || 0),
    fat: (targets.macroTargets?.fat || 65) - (totals.fat || 0)
  };

  // Calculate progress percentages with safe defaults
  const progress = {
    calories: Math.min(((totals.calories || 0) / (targets.baselineCalories || 2000)) * 100, 100),
    protein: Math.min(((totals.protein || 0) / (targets.macroTargets?.protein || 150)) * 100, 100),
    carbs: Math.min(((totals.carbs || 0) / (targets.macroTargets?.carbs || 200)) * 100, 100),
    fat: Math.min(((totals.fat || 0) / (targets.macroTargets?.fat || 65)) * 100, 100)
  };

  return {
    // Data
    meals,
    totals,
    targets,
    remaining,
    progress,
    
    // Loading states
    isLoading,
    isLookingUp,
    
    // Error state
    error,
    
    // Actions
    loadMeals,
    lookupNutrition,
    addMeal,
    deleteMeal,
    
    // Clear error
    clearError: () => setError(null)
  };
}