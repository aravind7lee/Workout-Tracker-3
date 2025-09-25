// backend/services/foodDatabase.js
class FoodDatabase {
  constructor() {
    this.foods = this.initializeFoodDatabase();
  }

  initializeFoodDatabase() {
    return {
      // Animal Protein Sources
      'chicken breast': { name: 'Chicken breast', serving: '100g', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, category: 'animal_protein' },
      'chicken thigh': { name: 'Chicken thigh', serving: '100g', calories: 209, protein: 26, carbs: 0, fat: 10.9, fiber: 0, category: 'animal_protein' },
      'turkey breast': { name: 'Turkey breast', serving: '100g', calories: 135, protein: 29, carbs: 0, fat: 1.7, fiber: 0, category: 'animal_protein' },
      'salmon atlantic': { name: 'Salmon (Atlantic)', serving: '100g', calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0, category: 'animal_protein' },
      'tuna canned water': { name: 'Tuna canned in water', serving: '100g', calories: 116, protein: 26, carbs: 0, fat: 0.8, fiber: 0, category: 'animal_protein' },
      'sardines canned': { name: 'Sardines canned', serving: '100g', calories: 208, protein: 25, carbs: 0, fat: 11.5, fiber: 0, category: 'animal_protein' },
      'mackerel cooked': { name: 'Mackerel cooked', serving: '100g', calories: 205, protein: 19, carbs: 0, fat: 13, fiber: 0, category: 'animal_protein' },
      'beef steak lean': { name: 'Beef steak lean', serving: '100g', calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, category: 'animal_protein' },
      'ground beef lean': { name: 'Ground beef lean', serving: '100g', calories: 250, protein: 26, carbs: 0, fat: 16, fiber: 0, category: 'animal_protein' },
      'pork loin roasted': { name: 'Pork loin roasted', serving: '100g', calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0, category: 'animal_protein' },
      'egg large whole': { name: 'Egg large whole', serving: '1 large', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fiber: 0, category: 'animal_protein' },
      'egg whites': { name: 'Egg whites', serving: '100g', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0, category: 'animal_protein' },
      'greek yogurt plain nonfat': { name: 'Greek yogurt plain nonfat', serving: '1 cup', calories: 110, protein: 17, carbs: 6, fat: 1, fiber: 0, category: 'animal_protein' },
      'cottage cheese low fat': { name: 'Cottage cheese low fat', serving: '100g', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0, category: 'animal_protein' },
      'whey protein isolate': { name: 'Whey protein isolate', serving: '1 scoop', calories: 120, protein: 24, carbs: 2, fat: 1, fiber: 0, category: 'animal_protein' },

      // Plant-based Protein Sources
      'lentils cooked': { name: 'Lentils cooked', serving: '1 cup', calories: 230, protein: 18, carbs: 40, fat: 0.8, fiber: 15, category: 'plant_protein' },
      'chickpeas cooked': { name: 'Chickpeas cooked', serving: '1 cup', calories: 269, protein: 14.5, carbs: 45, fat: 4.2, fiber: 12.5, category: 'plant_protein' },
      'black beans cooked': { name: 'Black beans cooked', serving: '1 cup', calories: 227, protein: 15, carbs: 41, fat: 0.9, fiber: 15, category: 'plant_protein' },
      'kidney beans cooked': { name: 'Kidney beans cooked', serving: '1 cup', calories: 225, protein: 15, carbs: 40, fat: 0.9, fiber: 13, category: 'plant_protein' },
      'tofu firm': { name: 'Tofu firm', serving: '100g', calories: 85, protein: 10, carbs: 2, fat: 5, fiber: 1, category: 'plant_protein' },
      'tempeh': { name: 'Tempeh', serving: '100g', calories: 190, protein: 19, carbs: 9, fat: 11, fiber: 2, category: 'plant_protein' },
      'edamame shelled': { name: 'Edamame shelled', serving: '1 cup', calories: 188, protein: 18, carbs: 14, fat: 8, fiber: 8, category: 'plant_protein' },
      'quinoa cooked': { name: 'Quinoa cooked', serving: '1 cup', calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5, category: 'plant_protein' },
      'oats rolled raw': { name: 'Oats rolled raw', serving: '100g', calories: 389, protein: 16, carbs: 66, fat: 7, fiber: 10, category: 'plant_protein' },
      'almonds': { name: 'Almonds', serving: '1 oz', calories: 160, protein: 6, carbs: 6, fat: 14, fiber: 3.5, category: 'plant_protein' },
      'peanut butter': { name: 'Peanut butter', serving: '2 tbsp', calories: 188, protein: 8, carbs: 6, fat: 16, fiber: 2, category: 'plant_protein' },
      'chia seeds': { name: 'Chia seeds', serving: '2 tbsp', calories: 137, protein: 4.4, carbs: 12, fat: 8.6, fiber: 10, category: 'plant_protein' },
      'hemp seeds': { name: 'Hemp seeds', serving: '2 tbsp', calories: 170, protein: 10, carbs: 2, fat: 14, fiber: 1, category: 'plant_protein' },
      'seitan cooked': { name: 'Seitan cooked', serving: '100g', calories: 150, protein: 22, carbs: 6, fat: 2, fiber: 1, category: 'plant_protein' },

      // Carbohydrate-forward foods (fuel sources)
      'white rice cooked': { name: 'White rice cooked', serving: '1 cup', calories: 205, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6, category: 'carbohydrates' },
      'brown rice cooked': { name: 'Brown rice cooked', serving: '1 cup', calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, category: 'carbohydrates' },
      'oats cooked': { name: 'Oats cooked', serving: '1 cup', calories: 154, protein: 6, carbs: 27, fat: 3, fiber: 4, category: 'carbohydrates' },
      'whole wheat bread': { name: 'Whole wheat bread', serving: '1 slice', calories: 110, protein: 4, carbs: 20, fat: 1.5, fiber: 3, category: 'carbohydrates' },
      'white bread': { name: 'White bread', serving: '1 slice', calories: 100, protein: 3, carbs: 18, fat: 1, fiber: 1, category: 'carbohydrates' },
      'pasta cooked': { name: 'Pasta cooked', serving: '1 cup', calories: 210, protein: 7.5, carbs: 42, fat: 1.5, fiber: 2.5, category: 'carbohydrates' },
      'roti chapati': { name: 'Roti chapati', serving: '1 piece', calories: 120, protein: 3.3, carbs: 18, fat: 3, fiber: 2, category: 'carbohydrates' },
      'potato boiled': { name: 'Potato boiled', serving: '100g', calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, category: 'carbohydrates' },
      'sweet potato baked': { name: 'Sweet potato baked', serving: '100g', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, category: 'carbohydrates' },
      'corn kernels cooked': { name: 'Corn kernels cooked', serving: '1 cup', calories: 143, protein: 5.4, carbs: 31, fat: 2.2, fiber: 3.6, category: 'carbohydrates' },
      'banana medium': { name: 'Banana medium', serving: '1 medium', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3, category: 'carbohydrates' },
      'apple medium': { name: 'Apple medium', serving: '1 medium', calories: 85, protein: 0.4, carbs: 22, fat: 0.3, fiber: 4, category: 'carbohydrates' },
      'pineapple chunks': { name: 'Pineapple chunks', serving: '1 cup', calories: 82, protein: 0.9, carbs: 21.6, fat: 0.2, fiber: 2.3, category: 'carbohydrates' },

      // Dairy & Alternatives
      'greek yogurt': { name: 'Greek yogurt', serving: '1 cup', calories: 110, protein: 17, carbs: 6, fat: 1, fiber: 0, category: 'dairy' },
      'skimmed milk': { name: 'Skimmed milk', serving: '1 cup', calories: 83, protein: 8.3, carbs: 12, fat: 0.2, fiber: 0, category: 'dairy' },
      'whole milk': { name: 'Whole milk', serving: '1 cup', calories: 149, protein: 7.7, carbs: 11.7, fat: 7.9, fiber: 0, category: 'dairy' },
      'cottage cheese': { name: 'Cottage cheese', serving: '100g', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0, category: 'dairy' },
      'cheese slice': { name: 'Cheese slice', serving: '1 slice', calories: 113, protein: 7, carbs: 1, fat: 9, fiber: 0, category: 'dairy' },
      'whey protein': { name: 'Whey protein', serving: '1 scoop', calories: 120, protein: 25, carbs: 2, fat: 1, fiber: 0, category: 'dairy' },
      'soy milk': { name: 'Soy milk', serving: '1 cup', calories: 80, protein: 7, carbs: 4, fat: 4, fiber: 0, category: 'dairy' },
      'almond milk': { name: 'Almond milk', serving: '1 cup', calories: 39, protein: 1.5, carbs: 3.4, fat: 2.9, fiber: 0, category: 'dairy' },

      // Vegetables
      'broccoli': { name: 'Broccoli', serving: '1 cup', calories: 25, protein: 3, carbs: 5, fat: 0.3, fiber: 2.3, category: 'vegetables' },
      'spinach': { name: 'Spinach', serving: '1 cup raw', calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, fiber: 0.7, category: 'vegetables' },
      'kale': { name: 'Kale', serving: '1 cup raw', calories: 8, protein: 0.6, carbs: 1.4, fat: 0.1, fiber: 0.9, category: 'vegetables' },
      'carrots': { name: 'Carrots', serving: '1 medium', calories: 25, protein: 0.5, carbs: 6, fat: 0.1, fiber: 1.7, category: 'vegetables' },
      'bell pepper': { name: 'Bell pepper', serving: '1 medium', calories: 24, protein: 1, carbs: 7, fat: 0.3, fiber: 2.5, category: 'vegetables' },
      'tomatoes': { name: 'Tomatoes', serving: '1 medium', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, category: 'vegetables' },
      'onions': { name: 'Onions', serving: '1 medium', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, category: 'vegetables' },
      'cauliflower': { name: 'Cauliflower', serving: '1 cup', calories: 25, protein: 2, carbs: 5, fat: 0.3, fiber: 2.1, category: 'vegetables' },

      // Fruits
      'apple': { name: 'Apple', serving: '1 medium', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4, category: 'fruits' },
      'banana': { name: 'Banana', serving: '1 medium', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, category: 'fruits' },
      'orange': { name: 'Orange', serving: '1 medium', calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2, fiber: 3.1, category: 'fruits' },
      'blueberries': { name: 'Blueberries', serving: '1 cup', calories: 84, protein: 1.1, carbs: 21.5, fat: 0.5, fiber: 3.6, category: 'fruits' },
      'strawberries': { name: 'Strawberries', serving: '1 cup', calories: 49, protein: 1, carbs: 11.7, fat: 0.5, fiber: 3, category: 'fruits' },
      'grapes': { name: 'Grapes', serving: '1 cup', calories: 104, protein: 1.1, carbs: 27.3, fat: 0.2, fiber: 1.4, category: 'fruits' },
      'mango': { name: 'Mango', serving: '1 medium', calories: 135, protein: 1.1, carbs: 35, fat: 0.6, fiber: 3.7, category: 'fruits' },
      'pineapple': { name: 'Pineapple', serving: '1 cup', calories: 82, protein: 0.9, carbs: 21.6, fat: 0.2, fiber: 2.3, category: 'fruits' },
      'papaya': { name: 'Papaya', serving: '1 cup', calories: 62, protein: 0.7, carbs: 15.7, fat: 0.4, fiber: 2.5, category: 'fruits' },
      'watermelon': { name: 'Watermelon', serving: '1 cup', calories: 46, protein: 0.9, carbs: 11.5, fat: 0.2, fiber: 0.6, category: 'fruits' },

      // Nuts & Seeds
      'almonds': { name: 'Almonds', serving: '28g', calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, category: 'nuts_seeds' },
      'walnuts': { name: 'Walnuts', serving: '28g', calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, fiber: 1.9, category: 'nuts_seeds' },
      'cashews': { name: 'Cashews', serving: '28g', calories: 157, protein: 5.2, carbs: 8.6, fat: 12.4, fiber: 0.9, category: 'nuts_seeds' },
      'peanuts': { name: 'Peanuts', serving: '28g', calories: 161, protein: 7.3, carbs: 4.6, fat: 14, fiber: 2.4, category: 'nuts_seeds' },
      'chia seeds': { name: 'Chia seeds', serving: '2 tbsp', calories: 138, protein: 4.7, carbs: 12, fat: 8.7, fiber: 9.8, category: 'nuts_seeds' },
      'flax seeds': { name: 'Flax seeds', serving: '2 tbsp', calories: 151, protein: 5.2, carbs: 8.1, fat: 11.9, fiber: 7.6, category: 'nuts_seeds' },
      'pumpkin seeds': { name: 'Pumpkin seeds', serving: '28g', calories: 151, protein: 7, carbs: 5, fat: 13, fiber: 1.7, category: 'nuts_seeds' },
      'sunflower seeds': { name: 'Sunflower seeds', serving: '28g', calories: 164, protein: 5.8, carbs: 6.5, fat: 14.1, fiber: 2.4, category: 'nuts_seeds' },

      // Snacks & Condiments
      'almond butter': { name: 'Almond butter', serving: '2 tbsp', calories: 196, protein: 7.2, carbs: 7.4, fat: 18.3, fiber: 3.3, category: 'snacks' },
      'dark chocolate': { name: 'Dark chocolate', serving: '28g', calories: 155, protein: 2, carbs: 13, fat: 9, fiber: 3, category: 'snacks' },
      'protein bar': { name: 'Protein bar', serving: '1 bar', calories: 200, protein: 20, carbs: 20, fat: 6, fiber: 3, category: 'snacks' },
      'honey': { name: 'Honey', serving: '1 tbsp', calories: 64, protein: 0.1, carbs: 17.3, fat: 0, fiber: 0, category: 'snacks' },
      'olive oil': { name: 'Olive oil', serving: '1 tbsp', calories: 119, protein: 0, carbs: 0, fat: 13.5, fiber: 0, category: 'snacks' },
      'coconut oil': { name: 'Coconut oil', serving: '1 tbsp', calories: 121, protein: 0, carbs: 0, fat: 13.5, fiber: 0, category: 'snacks' },
      'butter': { name: 'Butter', serving: '1 tbsp', calories: 102, protein: 0.1, carbs: 0, fat: 11.5, fiber: 0, category: 'snacks' },

      // Beverages
      'black coffee': { name: 'Black coffee', serving: '1 cup', calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, category: 'beverages' },
      'green tea': { name: 'Green tea', serving: '1 cup', calories: 2, protein: 0.5, carbs: 0, fat: 0, fiber: 0, category: 'beverages' },
      'black tea': { name: 'Black tea', serving: '1 cup', calories: 2, protein: 0, carbs: 0.7, fat: 0, fiber: 0, category: 'beverages' },
      'fresh orange juice': { name: 'Fresh orange juice', serving: '1 cup', calories: 112, protein: 1.7, carbs: 25.8, fat: 0.5, fiber: 0.5, category: 'beverages' },
      'smoothie': { name: 'Smoothie', serving: '1 cup', calories: 150, protein: 5, carbs: 30, fat: 2, fiber: 4, category: 'beverages' },
      'sports drink': { name: 'Sports drink', serving: '1 bottle', calories: 80, protein: 0, carbs: 21, fat: 0, fiber: 0, category: 'beverages' }
    };
  }

  searchFood(query) {
    const normalizedQuery = query.toLowerCase().trim();
    const results = [];

    // Direct match
    if (this.foods[normalizedQuery]) {
      results.push({
        ...this.foods[normalizedQuery],
        source: 'database',
        confidence: 1.0
      });
    }

    // Partial matches
    for (const [key, food] of Object.entries(this.foods)) {
      if (key !== normalizedQuery && (
        key.includes(normalizedQuery) || 
        normalizedQuery.includes(key) ||
        food.name.toLowerCase().includes(normalizedQuery)
      )) {
        results.push({
          ...food,
          source: 'database',
          confidence: 0.8
        });
      }
    }

    return results.slice(0, 5); // Return top 5 matches
  }

  getFoodsByCategory(category) {
    return Object.values(this.foods).filter(food => food.category === category);
  }

  getAllCategories() {
    return ['animal_protein', 'plant_protein', 'carbohydrates', 'dairy', 'vegetables', 'fruits', 'nuts_seeds', 'snacks', 'beverages'];
  }

  getFoodNutrition(foodName) {
    const normalizedName = foodName.toLowerCase().trim();
    return this.foods[normalizedName] || null;
  }

  // Scale nutrition based on serving size
  scaleNutrition(food, multiplier) {
    return {
      ...food,
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier * 10) / 10,
      carbs: Math.round(food.carbs * multiplier * 10) / 10,
      fat: Math.round(food.fat * multiplier * 10) / 10,
      fiber: Math.round(food.fiber * multiplier * 10) / 10
    };
  }
}

export default new FoodDatabase();