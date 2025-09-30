import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class NutritionAPI {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Real-time nutrition lookup using Nutritionix API
  async lookupFood(query) {
    try {
      console.log('🔍 Looking up nutrition for:', query);
      
      const response = await this.api.post('/nutrition/lookup', { query });
      
      if (response.data.success && response.data.data) {
        // Ensure all required properties exist
        const safeData = {
          name: response.data.data.name || 'Unknown Food',
          parsedName: response.data.data.parsedName || response.data.data.name || 'Unknown Food',
          calories: response.data.data.calories || 0,
          protein: response.data.data.protein || 0,
          carbs: response.data.data.carbs || 0,
          fat: response.data.data.fat || 0,
          fiber: response.data.data.fiber || 0,
          sugar: response.data.data.sugar || 0,
          sodium: response.data.data.sodium || 0,
          servingText: response.data.data.servingText || '1 serving',
          servingGrams: response.data.data.servingGrams || 100,
          source: response.data.data.source || 'api',
          ...response.data.data
        };
        console.log('✅ Nutrition lookup successful:', safeData);
        return {
          success: true,
          data: safeData
        };
      } else {
        throw new Error(response.data.message || 'Lookup failed');
      }
    } catch (error) {
      console.error('❌ Nutrition lookup failed:', error);
      
      // Return fallback data for common foods
      const fallbackData = this.getFallbackNutrition(query);
      return {
        success: true,
        data: fallbackData,
        source: 'fallback'
      };
    }
  }

  // Get user's meals for a specific date
  async getMeals(date = null) {
    try {
      const params = date ? { date: date.toISOString().split('T')[0] } : {};
      const response = await this.api.get('/nutrition/meals', { params });
      
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Failed to fetch meals:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  }

  // Get nutrition totals for a specific date
  async getNutritionTotals(date = null) {
    try {
      const params = date ? { date: date.toISOString().split('T')[0] } : {};
      const response = await this.api.get('/nutrition/meals/totals', { params });
      
      return {
        success: true,
        data: response.data.data || { calories: 0, protein: 0, carbs: 0, fat: 0, mealsCount: 0 }
      };
    } catch (error) {
      console.error('Failed to fetch nutrition totals:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: { calories: 0, protein: 0, carbs: 0, fat: 0, mealsCount: 0 }
      };
    }
  }

  // Add a new meal
  async addMeal(mealData) {
    try {
      const response = await this.api.post('/nutrition/meals', {
        ...mealData,
        consumedAt: new Date().toISOString()
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Failed to add meal:', error);
      throw new Error(error.response?.data?.message || 'Failed to add meal');
    }
  }

  // Delete a meal
  async deleteMeal(mealId) {
    try {
      // Validate meal ID
      if (!mealId || mealId === 'undefined' || mealId === 'null') {
        throw new Error('Invalid meal ID provided');
      }
      
      console.log('🗑️ Deleting meal with ID:', mealId);
      
      const response = await this.api.delete(`/nutrition/meals/${mealId}`);
      
      console.log('✅ Meal deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete meal:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Meal not found');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid meal ID');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to delete meal');
      }
    }
  }

  // Get user's nutrition targets
  async getNutritionTargets() {
    try {
      const response = await this.api.get('/nutrition/users/me/targets');
      
      return {
        success: true,
        data: response.data.data || {
          baselineCalories: 2000,
          goalType: 'maintain',
          macroTargets: { protein: 150, carbs: 200, fat: 65 }
        }
      };
    } catch (error) {
      console.error('Failed to fetch nutrition targets:', error);
      return {
        success: false,
        data: {
          baselineCalories: 2000,
          goalType: 'maintain',
          macroTargets: { protein: 150, carbs: 200, fat: 65 }
        }
      };
    }
  }

  // Fallback nutrition data for common foods
  getFallbackNutrition(query) {
    const fallbackDatabase = {
      'chicken breast': { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingText: '100g', servingGrams: 100 },
      'chicken': { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingText: '100g', servingGrams: 100 },
      'rice': { name: 'White Rice', calories: 205, protein: 4.3, carbs: 45, fat: 0.4, servingText: '1 cup cooked', servingGrams: 150 },
      'white rice': { name: 'White Rice', calories: 205, protein: 4.3, carbs: 45, fat: 0.4, servingText: '1 cup cooked', servingGrams: 150 },
      'brown rice': { name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 1.8, servingText: '1 cup cooked', servingGrams: 150 },
      'eggs': { name: 'Eggs', calories: 70, protein: 6, carbs: 0.5, fat: 5, servingText: '1 large', servingGrams: 50 },
      'egg': { name: 'Egg', calories: 70, protein: 6, carbs: 0.5, fat: 5, servingText: '1 large', servingGrams: 50 },
      'banana': { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, servingText: '1 medium', servingGrams: 120 },
      'apple': { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, servingText: '1 medium', servingGrams: 150 },
      'oats': { name: 'Oats', calories: 307, protein: 10.7, carbs: 54.8, fat: 5.3, servingText: '1 cup dry', servingGrams: 90 },
      'salmon': { name: 'Salmon', calories: 208, protein: 25.4, carbs: 0, fat: 12.4, servingText: '100g', servingGrams: 100 },
      'tuna': { name: 'Tuna', calories: 144, protein: 30, carbs: 0, fat: 0.8, servingText: '100g', servingGrams: 100 },
      'broccoli': { name: 'Broccoli', calories: 25, protein: 3, carbs: 5, fat: 0.3, servingText: '1 cup', servingGrams: 90 },
      'spinach': { name: 'Spinach', calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, servingText: '1 cup', servingGrams: 30 },
      'greek yogurt': { name: 'Greek Yogurt', calories: 130, protein: 23, carbs: 9, fat: 0, servingText: '1 cup', servingGrams: 170 },
      'almonds': { name: 'Almonds', calories: 164, protein: 6, carbs: 6, fat: 14, servingText: '28g', servingGrams: 28 },
      'peanut butter': { name: 'Peanut Butter', calories: 188, protein: 8, carbs: 8, fat: 16, servingText: '2 tbsp', servingGrams: 32 }
    };

    const searchTerm = query.toLowerCase().trim();
    
    // Direct match
    if (fallbackDatabase[searchTerm]) {
      return {
        ...fallbackDatabase[searchTerm],
        parsedName: fallbackDatabase[searchTerm].name,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        source: 'fallback'
      };
    }

    // Partial match
    for (const [key, nutrition] of Object.entries(fallbackDatabase)) {
      if (searchTerm.includes(key) || key.includes(searchTerm)) {
        return {
          ...nutrition,
          parsedName: nutrition.name,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          source: 'fallback'
        };
      }
    }

    // Default fallback
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
}

export default new NutritionAPI();