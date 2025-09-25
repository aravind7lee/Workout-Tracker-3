// backend/services/nutritionService.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import foodDatabase from './foodDatabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NutritionService {
  constructor() {
    this.cache = new Map(); // In-memory cache (use Redis in production)
    this.fallbackData = this.loadFallbackData();
  }

  loadFallbackData() {
    // Comprehensive fallback nutrition database
    return {
      'egg': { parsedName: 'egg', servingText: '1 large', servingGrams: 50, calories: 70, protein: 6, carbs: 0.5, fat: 5, fiber: 0, sugar: 0.5, sodium: 70 },
      'eggs': { parsedName: 'eggs', servingText: '2 large', servingGrams: 100, calories: 140, protein: 12, carbs: 1, fat: 10, fiber: 0, sugar: 1, sodium: 140 },
      'chicken breast': { parsedName: 'chicken breast', servingText: '100 g', servingGrams: 100, calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
      'chicken': { parsedName: 'chicken breast', servingText: '100 g', servingGrams: 100, calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
      'rice': { parsedName: 'white rice', servingText: '1 cup cooked', servingGrams: 158, calories: 205, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6, sugar: 0.1, sodium: 2 },
      'white rice': { parsedName: 'white rice', servingText: '1 cup cooked', servingGrams: 158, calories: 205, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6, sugar: 0.1, sodium: 2 },
      'banana': { parsedName: 'banana', servingText: '1 medium', servingGrams: 118, calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugar: 14, sodium: 1 },
      'apple': { parsedName: 'apple', servingText: '1 medium', servingGrams: 182, calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4, sugar: 19, sodium: 2 },
      'oats': { parsedName: 'oats', servingText: '1 cup dry', servingGrams: 81, calories: 307, protein: 10.7, carbs: 54.8, fat: 5.3, fiber: 8.2, sugar: 0.8, sodium: 4 },
      'bread': { parsedName: 'bread', servingText: '1 slice', servingGrams: 28, calories: 79, protein: 2.3, carbs: 14.2, fat: 1.2, fiber: 0.8, sugar: 1.4, sodium: 149 },
      'milk': { parsedName: 'milk', servingText: '1 cup', servingGrams: 244, calories: 149, protein: 7.7, carbs: 11.7, fat: 7.9, fiber: 0, sugar: 12.3, sodium: 105 },
      'yogurt': { parsedName: 'yogurt', servingText: '1 cup', servingGrams: 245, calories: 149, protein: 8.5, carbs: 11.4, fat: 8, fiber: 0, sugar: 11.4, sodium: 113 },
      'salmon': { parsedName: 'salmon', servingText: '100 g', servingGrams: 100, calories: 208, protein: 25.4, carbs: 0, fat: 12.4, fiber: 0, sugar: 0, sodium: 59 },
      'tuna': { parsedName: 'tuna', servingText: '100 g', servingGrams: 100, calories: 144, protein: 30, carbs: 0, fat: 0.8, fiber: 0, sugar: 0, sodium: 39 },
      'beef': { parsedName: 'beef', servingText: '100 g', servingGrams: 100, calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 72 },
      'pasta': { parsedName: 'pasta', servingText: '1 cup cooked', servingGrams: 140, calories: 220, protein: 8, carbs: 44, fat: 1.1, fiber: 2.5, sugar: 1.1, sodium: 1 },
      'potato': { parsedName: 'potato', servingText: '1 medium', servingGrams: 173, calories: 161, protein: 4.3, carbs: 36.6, fat: 0.2, fiber: 3.8, sugar: 1.6, sodium: 8 },
      'broccoli': { parsedName: 'broccoli', servingText: '1 cup', servingGrams: 91, calories: 25, protein: 3, carbs: 5, fat: 0.3, fiber: 2.3, sugar: 1.5, sodium: 33 },
      'spinach': { parsedName: 'spinach', servingText: '1 cup', servingGrams: 30, calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, fiber: 0.7, sugar: 0.1, sodium: 24 },
      'cheese': { parsedName: 'cheese', servingText: '1 oz', servingGrams: 28, calories: 113, protein: 7, carbs: 1, fat: 9, fiber: 0, sugar: 0.5, sodium: 186 },
      'peanut butter': { parsedName: 'peanut butter', servingText: '2 tbsp', servingGrams: 32, calories: 188, protein: 8, carbs: 8, fat: 16, fiber: 2.6, sugar: 3.4, sodium: 147 },
      'almonds': { parsedName: 'almonds', servingText: '1 oz', servingGrams: 28, calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, sugar: 1.2, sodium: 1 },
      'avocado': { parsedName: 'avocado', servingText: '1 medium', servingGrams: 201, calories: 322, protein: 4, carbs: 17, fat: 29, fiber: 13.5, sugar: 1.3, sodium: 14 },
      'orange': { parsedName: 'orange', servingText: '1 medium', servingGrams: 154, calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2, fiber: 3.1, sugar: 12.2, sodium: 0 },
      'strawberries': { parsedName: 'strawberries', servingText: '1 cup', servingGrams: 152, calories: 49, protein: 1, carbs: 11.7, fat: 0.5, fiber: 3, sugar: 7.4, sodium: 2 },
      'blueberries': { parsedName: 'blueberries', servingText: '1 cup', servingGrams: 148, calories: 84, protein: 1.1, carbs: 21.5, fat: 0.5, fiber: 3.6, sugar: 15, sodium: 1 },
      'quinoa': { parsedName: 'quinoa', servingText: '1 cup cooked', servingGrams: 185, calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5.2, sugar: 1.6, sodium: 13 },
      'sweet potato': { parsedName: 'sweet potato', servingText: '1 medium', servingGrams: 128, calories: 112, protein: 2, carbs: 26, fat: 0.1, fiber: 3.9, sugar: 5.4, sodium: 7 },
      'turkey': { parsedName: 'turkey', servingText: '100 g', servingGrams: 100, calories: 189, protein: 29, carbs: 0, fat: 7.4, fiber: 0, sugar: 0, sodium: 70 },
      'pork': { parsedName: 'pork', servingText: '100 g', servingGrams: 100, calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0, sugar: 0, sodium: 62 },
      'shrimp': { parsedName: 'shrimp', servingText: '100 g', servingGrams: 100, calories: 99, protein: 18, carbs: 0.9, fat: 1.7, fiber: 0, sugar: 0, sodium: 111 },
      'tofu': { parsedName: 'tofu', servingText: '100 g', servingGrams: 100, calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.6, sodium: 7 },
      'lentils': { parsedName: 'lentils', servingText: '1 cup cooked', servingGrams: 198, calories: 230, protein: 18, carbs: 40, fat: 0.8, fiber: 15.6, sugar: 3.6, sodium: 4 },
      'black beans': { parsedName: 'black beans', servingText: '1 cup cooked', servingGrams: 172, calories: 227, protein: 15, carbs: 41, fat: 0.9, fiber: 15, sugar: 0.6, sodium: 2 },
      'greek yogurt': { parsedName: 'greek yogurt', servingText: '1 cup', servingGrams: 245, calories: 130, protein: 23, carbs: 9, fat: 0, fiber: 0, sugar: 9, sodium: 65 },
      'cottage cheese': { parsedName: 'cottage cheese', servingText: '1 cup', servingGrams: 226, calories: 206, protein: 28, carbs: 6, fat: 6, fiber: 0, sugar: 6, sodium: 746 },
      'olive oil': { parsedName: 'olive oil', servingText: '1 tbsp', servingGrams: 14, calories: 119, protein: 0, carbs: 0, fat: 13.5, fiber: 0, sugar: 0, sodium: 0 },
      'butter': { parsedName: 'butter', servingText: '1 tbsp', servingGrams: 14, calories: 102, protein: 0.1, carbs: 0, fat: 11.5, fiber: 0, sugar: 0, sodium: 91 },
      'honey': { parsedName: 'honey', servingText: '1 tbsp', servingGrams: 21, calories: 64, protein: 0.1, carbs: 17.3, fat: 0, fiber: 0, sugar: 17.2, sodium: 1 },
      'dark chocolate': { parsedName: 'dark chocolate', servingText: '1 oz', servingGrams: 28, calories: 155, protein: 2, carbs: 13, fat: 9, fiber: 3, sugar: 7, sodium: 6 },
      'green tea': { parsedName: 'green tea', servingText: '1 cup', servingGrams: 245, calories: 2, protein: 0.5, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 2 },
      'coffee': { parsedName: 'coffee', servingText: '1 cup', servingGrams: 237, calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 5 },
      'water': { parsedName: 'water', servingText: '1 cup', servingGrams: 237, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
    };
  }

  normalizeQuery(query) {
    return query.toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[^\w\s]/g, '');
  }

  parseQuantity(query) {
    // Extract quantity and unit from query
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(g|grams?|kg|kilograms?)/i,
      /(\d+(?:\.\d+)?)\s*(cups?|cup)/i,
      /(\d+(?:\.\d+)?)\s*(oz|ounces?|lbs?|pounds?)/i,
      /(\d+(?:\.\d+)?)\s*(pieces?|items?|whole)/i,
      /^(\d+(?:\.\d+)?)\s+/i // number at start
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match) {
        return {
          quantity: parseFloat(match[1]),
          unit: match[2] || 'piece',
          cleanQuery: query.replace(match[0], '').trim()
        };
      }
    }

    return {
      quantity: 1,
      unit: 'serving',
      cleanQuery: query
    };
  }

  async lookupNutritionix(query) {
    try {
      const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
        method: 'POST',
        headers: {
          'x-app-id': process.env.NUTRITIONIX_APP_ID,
          'x-app-key': process.env.NUTRITIONIX_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query,
          timezone: 'US/Eastern'
        })
      });

      if (!response.ok) {
        throw new Error(`Nutritionix API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseNutritionixResponse(data, query);
    } catch (error) {
      console.error('Nutritionix lookup failed:', error.message);
      throw error;
    }
  }

  parseNutritionixResponse(data, originalQuery) {
    const foods = data.foods || [];
    
    return foods.map(food => {
      const servingGrams = food.serving_weight_grams || 100;
      const servingQty = food.serving_qty || 1;
      const servingUnit = food.serving_unit || 'serving';

      return {
        parsedName: food.food_name,
        servingText: `${servingQty} ${servingUnit}`,
        servingGrams: servingGrams,
        multiplier: 1,
        calories: Math.round(food.nf_calories || 0),
        protein: Math.round((food.nf_protein || 0) * 10) / 10,
        carbs: Math.round((food.nf_total_carbohydrate || 0) * 10) / 10,
        fat: Math.round((food.nf_total_fat || 0) * 10) / 10,
        fiber: Math.round((food.nf_dietary_fiber || 0) * 10) / 10,
        sugar: Math.round((food.nf_sugars || 0) * 10) / 10,
        sodium: Math.round((food.nf_sodium || 0) * 10) / 10,
        source: 'nutritionix',
        meta: {
          nix_brand_name: food.nix_brand_name,
          nix_item_name: food.nix_item_name,
          photo: food.photo?.thumb
        }
      };
    });
  }

  getFallbackNutrition(query) {
    const normalized = this.normalizeQuery(query);
    const results = [];
    
    // Try food database first
    const dbResults = foodDatabase.searchFood(normalized);
    if (dbResults.length > 0) {
      for (const food of dbResults) {
        results.push({
          parsedName: food.name,
          servingText: food.serving,
          servingGrams: this.getServingGrams(food.serving),
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber,
          sugar: 0,
          sodium: 0,
          source: 'database',
          multiplier: 1,
          category: food.category
        });
      }
      return results.slice(0, 3);
    }
    
    // Fallback to original data
    if (this.fallbackData[normalized]) {
      results.push({
        ...this.fallbackData[normalized],
        source: 'fallback',
        multiplier: 1
      });
    }
    
    // Partial matches in fallback data
    for (const [key, nutrition] of Object.entries(this.fallbackData)) {
      if (key !== normalized && (normalized.includes(key) || key.includes(normalized))) {
        results.push({
          ...nutrition,
          source: 'fallback',
          multiplier: 1
        });
      }
    }
    
    // If no matches, return a generic food item
    if (results.length === 0) {
      results.push({
        parsedName: normalized || 'unknown food',
        servingText: '1 serving',
        servingGrams: 100,
        calories: 150,
        protein: 5,
        carbs: 20,
        fat: 5,
        fiber: 2,
        sugar: 5,
        sodium: 50,
        source: 'generic',
        multiplier: 1
      });
    }
    
    return results.slice(0, 3);
  }

  getServingGrams(servingText) {
    const serving = servingText.toLowerCase();
    if (serving.includes('100g')) return 100;
    if (serving.includes('1 cup')) return 200;
    if (serving.includes('1 large')) return 50;
    if (serving.includes('1 medium')) return 150;
    if (serving.includes('1 slice')) return 30;
    if (serving.includes('1 piece')) return 40;
    if (serving.includes('1 oz')) return 28;
    if (serving.includes('2 tbsp')) return 30;
    if (serving.includes('1 scoop')) return 30;
    return 100;
  }

  scaleNutrition(nutrition, targetGrams) {
    const scale = targetGrams / nutrition.servingGrams;
    
    return {
      ...nutrition,
      servingText: `${targetGrams} g`,
      servingGrams: targetGrams,
      multiplier: scale,
      calories: Math.round(nutrition.calories * scale),
      protein: Math.round(nutrition.protein * scale * 10) / 10,
      carbs: Math.round(nutrition.carbs * scale * 10) / 10,
      fat: Math.round(nutrition.fat * scale * 10) / 10,
      fiber: Math.round(nutrition.fiber * scale * 10) / 10,
      sugar: Math.round(nutrition.sugar * scale * 10) / 10,
      sodium: Math.round(nutrition.sodium * scale * 10) / 10
    };
  }

  async lookup(query) {
    const cacheKey = this.normalizeQuery(query);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log('🎯 Cache hit for:', query);
      return {
        ok: true,
        cached: true,
        items: this.cache.get(cacheKey)
      };
    }

    let items = null;
    let source = 'unknown';

    try {
      // Try Nutritionix first
      items = await this.lookupNutritionix(query);
      source = 'nutritionix';
    } catch (error) {
      console.log('Nutritionix failed, using fallback data...');
      
      // Use fallback data
      items = this.getFallbackNutrition(query);
      source = 'fallback';
    }

    // Always ensure we have at least one result
    if (!items || items.length === 0) {
      console.log('No items found, creating generic result for:', query);
      const parsed = this.parseQuantity(query);
      items = [{
        parsedName: parsed.cleanQuery || query,
        servingText: '1 serving',
        servingGrams: 100,
        calories: 150,
        protein: 5,
        carbs: 20,
        fat: 5,
        fiber: 2,
        sugar: 5,
        sodium: 50,
        source: 'estimated',
        multiplier: 1
      }];
      source = 'estimated';
    }

    // Cache the result
    this.cache.set(cacheKey, items);
    
    // Set cache expiry (24 hours)
    setTimeout(() => {
      this.cache.delete(cacheKey);
    }, 24 * 60 * 60 * 1000);

    console.log(`✅ Nutrition lookup successful (${source}):`, query);

    return {
      ok: true,
      cached: false,
      source: source,
      items: items
    };
  }
}

export default new NutritionService();