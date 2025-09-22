// Real-time nutrition service with backend integration
import api from '../utils/api';
import { realTimeService } from './realTimeService';

class NutritionServiceReal {
  constructor() {
    this.cache = new Map();
  }

  // Get all meals from backend
  async getMeals() {
    try {
      const response = await api.get('/meals');
      const meals = response.data;
      localStorage.setItem('recentMeals', JSON.stringify(meals));
      return meals;
    } catch (error) {
      return JSON.parse(localStorage.getItem('recentMeals') || '[]');
    }
  }

  // Log new meal
  async logMeal(mealData) {
    return realTimeService.logMeal(mealData);
  }

  // Update meal
  async updateMeal(id, mealData) {
    try {
      const response = await api.put(`/meals/${id}`, mealData);
      
      // Update local storage
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      const index = meals.findIndex(m => m.id === id || m._id === id);
      if (index !== -1) {
        meals[index] = response.data;
        localStorage.setItem('recentMeals', JSON.stringify(meals));
      }
      
      return response.data;
    } catch (error) {
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      const index = meals.findIndex(m => m.id === id || m._id === id);
      if (index !== -1) {
        meals[index] = { ...meals[index], ...mealData };
        localStorage.setItem('recentMeals', JSON.stringify(meals));
      }
      return mealData;
    }
  }

  // Delete meal
  async deleteMeal(id) {
    try {
      await api.delete(`/meals/${id}`);
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      const filtered = meals.filter(m => m.id !== id && m._id !== id);
      localStorage.setItem('recentMeals', JSON.stringify(filtered));
      return true;
    } catch (error) {
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      const filtered = meals.filter(m => m.id !== id && m._id !== id);
      localStorage.setItem('recentMeals', JSON.stringify(filtered));
      return true;
    }
  }

  // Search food database
  async searchFood(query) {
    try {
      const response = await api.get(`/nutrition/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      // Fallback to local food database
      return this.searchLocalFood(query);
    }
  }

  // Get nutrition goals
  async getNutritionGoals() {
    try {
      const response = await api.get('/nutrition/goals');
      const goals = response.data;
      localStorage.setItem('nutritionGoals', JSON.stringify(goals));
      return goals;
    } catch (error) {
      return JSON.parse(localStorage.getItem('nutritionGoals') || JSON.stringify({
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 65,
        fiber: 25,
        sugar: 50
      }));
    }
  }

  // Update nutrition goals
  async updateNutritionGoals(goals) {
    try {
      const response = await api.put('/nutrition/goals', goals);
      localStorage.setItem('nutritionGoals', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      localStorage.setItem('nutritionGoals', JSON.stringify(goals));
      return goals;
    }
  }

  // Get daily nutrition summary
  async getDailyNutrition(date = new Date().toISOString().split('T')[0]) {
    try {
      const response = await api.get(`/nutrition/daily?date=${date}`);
      return response.data;
    } catch (error) {
      return this.calculateDailyNutrition(date);
    }
  }

  // Get weekly nutrition trends
  async getWeeklyTrends() {
    try {
      const response = await api.get('/nutrition/trends/weekly');
      return response.data;
    } catch (error) {
      return this.calculateWeeklyTrends();
    }
  }

  // Calculate daily nutrition from local data
  calculateDailyNutrition(date) {
    const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
    const dayMeals = meals.filter(meal => {
      const mealDate = new Date(meal.consumedAt || meal.date).toISOString().split('T')[0];
      return mealDate === date;
    });

    return dayMeals.reduce((totals, meal) => ({
      calories: (totals.calories || 0) + (meal.calories || 0),
      protein: (totals.protein || 0) + (meal.protein || 0),
      carbs: (totals.carbs || 0) + (meal.carbs || 0),
      fat: (totals.fat || 0) + (meal.fat || 0),
      fiber: (totals.fiber || 0) + (meal.fiber || 0),
      sugar: (totals.sugar || 0) + (meal.sugar || 0)
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    });
  }

  // Calculate weekly trends from local data
  calculateWeeklyTrends() {
    const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayNutrition = this.calculateDailyNutrition(dateStr);
      last7Days.push({
        date: dateStr,
        ...dayNutrition
      });
    }
    
    return last7Days;
  }

  // Search local food database
  searchLocalFood(query) {
    const commonFoods = [
      { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, per: '100g' },
      { name: 'Brown Rice', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, per: '100g' },
      { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, per: '100g' },
      { name: 'Salmon', calories: 208, protein: 20, carbs: 0, fat: 13, per: '100g' },
      { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, per: '100g' },
      { name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fat: 11, per: '100g' },
      { name: 'Oats', calories: 389, protein: 17, carbs: 66, fat: 7, per: '100g' },
      { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, per: '100g' },
      { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, per: '100g' },
      { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 50, per: '100g' }
    ];

    return commonFoods.filter(food => 
      food.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Subscribe to real-time nutrition updates
  subscribeToUpdates(callback) {
    return realTimeService.subscribe('nutrition', callback);
  }

  // Get meal recommendations
  async getMealRecommendations(preferences = {}) {
    try {
      const response = await api.post('/nutrition/recommendations', preferences);
      return response.data;
    } catch (error) {
      return this.getLocalRecommendations(preferences);
    }
  }

  getLocalRecommendations(preferences) {
    const recommendations = [
      {
        name: 'Protein Power Bowl',
        calories: 450,
        protein: 35,
        carbs: 30,
        fat: 18,
        ingredients: ['Chicken breast', 'Quinoa', 'Broccoli', 'Avocado']
      },
      {
        name: 'Post-Workout Smoothie',
        calories: 320,
        protein: 25,
        carbs: 40,
        fat: 8,
        ingredients: ['Protein powder', 'Banana', 'Greek yogurt', 'Berries']
      },
      {
        name: 'Balanced Breakfast',
        calories: 380,
        protein: 20,
        carbs: 35,
        fat: 15,
        ingredients: ['Oats', 'Eggs', 'Berries', 'Nuts']
      }
    ];

    return recommendations;
  }
}

export const nutritionServiceReal = new NutritionServiceReal();
export default nutritionServiceReal;