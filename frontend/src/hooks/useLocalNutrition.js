// Local nutrition hook - works without backend API
import { useState, useEffect } from 'react';

export function useLocalNutrition() {
  const [meals, setMeals] = useState([]);
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [targets, setTargets] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load data from localStorage
  const loadNutritionData = () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get meals from localStorage
      const storedMeals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      const storedTargets = JSON.parse(localStorage.getItem('nutritionTargets') || JSON.stringify(targets));
      
      // Filter meals for today
      const today = new Date().toDateString();
      const todayMeals = storedMeals.filter(meal => {
        const mealDate = new Date(meal.consumedAt || meal.date).toDateString();
        return mealDate === today;
      });

      setMeals(todayMeals);
      setTargets(storedTargets);

      // Calculate totals
      const calculatedTotals = todayMeals.reduce((acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fat: acc.fat + (meal.fat || 0)
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      setTotals(calculatedTotals);
    } catch (err) {
      setError('Failed to load nutrition data');
    } finally {
      setIsLoading(false);
    }
  };

  // Add meal
  const addMeal = (mealData) => {
    try {
      const newMeal = {
        id: Date.now(),
        ...mealData,
        consumedAt: new Date().toISOString(),
        createdByUser: true
      };

      const storedMeals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      const updatedMeals = [newMeal, ...storedMeals];
      
      localStorage.setItem('recentMeals', JSON.stringify(updatedMeals));
      
      // Trigger custom event for real-time updates
      window.dispatchEvent(new CustomEvent('mealAdded'));
      
      loadNutritionData();
      return newMeal;
    } catch (error) {
      setError('Failed to add meal');
      throw error;
    }
  };

  // Update targets
  const updateTargets = (newTargets) => {
    try {
      localStorage.setItem('nutritionTargets', JSON.stringify(newTargets));
      setTargets(newTargets);
    } catch (error) {
      setError('Failed to update targets');
      throw error;
    }
  };

  // Delete meal
  const deleteMeal = (mealId) => {
    try {
      const storedMeals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      const updatedMeals = storedMeals.filter(meal => meal.id !== mealId);
      
      localStorage.setItem('recentMeals', JSON.stringify(updatedMeals));
      loadNutritionData();
    } catch (error) {
      setError('Failed to delete meal');
      throw error;
    }
  };

  // Load data on mount and listen for changes
  useEffect(() => {
    loadNutritionData();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadNutritionData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mealAdded', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mealAdded', handleStorageChange);
    };
  }, []);

  return {
    meals,
    totals,
    targets,
    isLoading,
    error,
    addMeal,
    updateTargets,
    deleteMeal,
    refresh: loadNutritionData
  };
}