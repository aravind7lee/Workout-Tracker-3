// backend/scripts/populateFoodDatabase.js
import mongoose from 'mongoose';
import Food from '../models/Food.js';
import dotenv from 'dotenv';

dotenv.config();

const comprehensiveFoodData = [
  // Animal Protein Sources
  { name: 'Chicken breast cooked skinless', serving: '100g', servingGrams: 100, calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, category: 'animal_protein', tags: ['lean', 'high-protein', 'poultry'], popularity: 95 },
  { name: 'Chicken thigh cooked skinless', serving: '100g', servingGrams: 100, calories: 209, protein: 26, carbs: 0, fat: 10.9, fiber: 0, category: 'animal_protein', tags: ['poultry', 'moderate-fat'], popularity: 85 },
  { name: 'Turkey breast roasted', serving: '100g', servingGrams: 100, calories: 135, protein: 29, carbs: 0, fat: 1.7, fiber: 0, category: 'animal_protein', tags: ['lean', 'high-protein', 'poultry'], popularity: 80 },
  { name: 'Salmon Atlantic cooked', serving: '100g', servingGrams: 100, calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0, category: 'animal_protein', tags: ['fish', 'omega-3', 'healthy-fats'], popularity: 90 },
  { name: 'Tuna canned in water drained', serving: '100g', servingGrams: 100, calories: 116, protein: 26, carbs: 0, fat: 0.8, fiber: 0, category: 'animal_protein', tags: ['fish', 'lean', 'high-protein', 'canned'], popularity: 85 },
  { name: 'Sardines canned drained', serving: '100g', servingGrams: 100, calories: 208, protein: 25, carbs: 0, fat: 11.5, fiber: 0, category: 'animal_protein', tags: ['fish', 'omega-3', 'calcium', 'canned'], popularity: 70 },
  { name: 'Mackerel cooked', serving: '100g', servingGrams: 100, calories: 205, protein: 19, carbs: 0, fat: 13, fiber: 0, category: 'animal_protein', tags: ['fish', 'omega-3', 'healthy-fats'], popularity: 65 },
  { name: 'Beef steak lean grilled', serving: '100g', servingGrams: 100, calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, category: 'animal_protein', tags: ['beef', 'red-meat', 'iron'], popularity: 80 },
  { name: 'Ground beef lean cooked', serving: '100g', servingGrams: 100, calories: 250, protein: 25, carbs: 0, fat: 16, fiber: 0, category: 'animal_protein', tags: ['beef', 'red-meat', 'versatile'], popularity: 85 },
  { name: 'Pork loin roasted', serving: '100g', servingGrams: 100, calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0, category: 'animal_protein', tags: ['pork', 'lean', 'high-protein'], popularity: 70 },
  { name: 'Egg large whole', serving: '1 large', servingGrams: 50, calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fiber: 0, category: 'animal_protein', tags: ['eggs', 'complete-protein', 'versatile'], popularity: 95 },
  { name: 'Egg whites', serving: '100g', servingGrams: 100, calories: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0, category: 'animal_protein', tags: ['eggs', 'lean', 'high-protein'], popularity: 80 },
  { name: 'Greek yogurt plain nonfat', serving: '1 cup', servingGrams: 170, calories: 110, protein: 17, carbs: 6, fat: 1, fiber: 0, category: 'animal_protein', tags: ['dairy', 'probiotics', 'high-protein'], popularity: 90 },
  { name: 'Cottage cheese low fat', serving: '100g', servingGrams: 100, calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0, category: 'animal_protein', tags: ['dairy', 'high-protein', 'calcium'], popularity: 75 },
  { name: 'Whey protein isolate', serving: '1 scoop', servingGrams: 30, calories: 120, protein: 24, carbs: 2, fat: 1, fiber: 0, category: 'animal_protein', tags: ['supplement', 'high-protein', 'fast-absorbing'], popularity: 85 },

  // Plant-based Protein Sources
  { name: 'Lentils cooked', serving: '1 cup', servingGrams: 198, calories: 230, protein: 18, carbs: 40, fat: 0.8, fiber: 15, category: 'plant_protein', tags: ['legumes', 'high-fiber', 'iron', 'folate'], popularity: 85 },
  { name: 'Chickpeas cooked', serving: '1 cup', servingGrams: 164, calories: 269, protein: 14.5, carbs: 45, fat: 4.2, fiber: 12.5, category: 'plant_protein', tags: ['legumes', 'high-fiber', 'versatile'], popularity: 80 },
  { name: 'Black beans cooked', serving: '1 cup', servingGrams: 172, calories: 227, protein: 15, carbs: 41, fat: 0.9, fiber: 15, category: 'plant_protein', tags: ['legumes', 'high-fiber', 'antioxidants'], popularity: 80 },
  { name: 'Kidney beans cooked', serving: '1 cup', servingGrams: 177, calories: 225, protein: 15, carbs: 40, fat: 0.9, fiber: 13, category: 'plant_protein', tags: ['legumes', 'high-fiber', 'iron'], popularity: 75 },
  { name: 'Tofu firm', serving: '100g', servingGrams: 100, calories: 85, protein: 10, carbs: 2, fat: 5, fiber: 1, category: 'plant_protein', tags: ['soy', 'versatile', 'calcium'], popularity: 75 },
  { name: 'Tempeh', serving: '100g', servingGrams: 100, calories: 190, protein: 19, carbs: 9, fat: 11, fiber: 2, category: 'plant_protein', tags: ['soy', 'fermented', 'probiotics'], popularity: 70 },
  { name: 'Edamame shelled cooked', serving: '1 cup', servingGrams: 155, calories: 188, protein: 18, carbs: 14, fat: 8, fiber: 8, category: 'plant_protein', tags: ['soy', 'complete-protein', 'folate'], popularity: 75 },
  { name: 'Quinoa cooked', serving: '1 cup', servingGrams: 185, calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5, category: 'plant_protein', tags: ['grain', 'complete-protein', 'gluten-free'], popularity: 85 },
  { name: 'Oats rolled raw', serving: '100g', servingGrams: 100, calories: 389, protein: 16, carbs: 66, fat: 7, fiber: 10, category: 'plant_protein', tags: ['grain', 'high-fiber', 'beta-glucan'], popularity: 90 },
  { name: 'Almonds raw', serving: '1 oz', servingGrams: 28, calories: 160, protein: 6, carbs: 6, fat: 14, fiber: 3.5, category: 'plant_protein', tags: ['nuts', 'healthy-fats', 'vitamin-e'], popularity: 90 },
  { name: 'Peanut butter natural', serving: '2 tbsp', servingGrams: 32, calories: 188, protein: 8, carbs: 6, fat: 16, fiber: 2, category: 'plant_protein', tags: ['nuts', 'spread', 'niacin'], popularity: 95 },
  { name: 'Chia seeds', serving: '2 tbsp', servingGrams: 28, calories: 137, protein: 4.4, carbs: 12, fat: 8.6, fiber: 10, category: 'plant_protein', tags: ['seeds', 'omega-3', 'high-fiber'], popularity: 80 },
  { name: 'Hemp seeds hulled', serving: '2 tbsp', servingGrams: 28, calories: 170, protein: 10, carbs: 2, fat: 14, fiber: 1, category: 'plant_protein', tags: ['seeds', 'complete-protein', 'omega-3'], popularity: 75 },
  { name: 'Seitan cooked', serving: '100g', servingGrams: 100, calories: 150, protein: 22, carbs: 6, fat: 2, fiber: 1, category: 'plant_protein', tags: ['wheat-gluten', 'high-protein', 'meat-substitute'], popularity: 65 },

  // Carbohydrate-forward foods (fuel sources)
  { name: 'White rice cooked', serving: '1 cup', servingGrams: 158, calories: 205, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6, category: 'carbohydrates', tags: ['grain', 'quick-energy', 'gluten-free'], popularity: 95 },
  { name: 'Brown rice cooked', serving: '1 cup', servingGrams: 195, calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, category: 'carbohydrates', tags: ['grain', 'whole-grain', 'fiber'], popularity: 85 },
  { name: 'Oats cooked', serving: '1 cup', servingGrams: 234, calories: 154, protein: 6, carbs: 27, fat: 3, fiber: 4, category: 'carbohydrates', tags: ['grain', 'breakfast', 'beta-glucan'], popularity: 90 },
  { name: 'Whole wheat bread', serving: '1 slice', servingGrams: 40, calories: 110, protein: 4, carbs: 20, fat: 1.5, fiber: 3, category: 'carbohydrates', tags: ['bread', 'whole-grain', 'fiber'], popularity: 85 },
  { name: 'White bread', serving: '1 slice', servingGrams: 35, calories: 100, protein: 3, carbs: 18, fat: 1, fiber: 1, category: 'carbohydrates', tags: ['bread', 'refined', 'quick-energy'], popularity: 80 },
  { name: 'Pasta cooked', serving: '1 cup', servingGrams: 140, calories: 210, protein: 7.5, carbs: 42, fat: 1.5, fiber: 2.5, category: 'carbohydrates', tags: ['pasta', 'versatile', 'energy'], popularity: 90 },
  { name: 'Roti chapati', serving: '1 piece', servingGrams: 40, calories: 120, protein: 3.3, carbs: 18, fat: 3, fiber: 2, category: 'carbohydrates', tags: ['flatbread', 'indian', 'whole-wheat'], popularity: 75 },
  { name: 'Potato boiled', serving: '100g', servingGrams: 100, calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, category: 'carbohydrates', tags: ['vegetable', 'potassium', 'versatile'], popularity: 90 },
  { name: 'Sweet potato baked', serving: '100g', servingGrams: 100, calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, category: 'carbohydrates', tags: ['vegetable', 'beta-carotene', 'sweet'], popularity: 85 },
  { name: 'Corn kernels cooked', serving: '1 cup', servingGrams: 164, calories: 143, protein: 5.4, carbs: 31, fat: 2.2, fiber: 3.6, category: 'carbohydrates', tags: ['vegetable', 'antioxidants', 'lutein'], popularity: 80 },
  { name: 'Banana medium', serving: '1 medium', servingGrams: 118, calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3, category: 'carbohydrates', tags: ['fruit', 'potassium', 'quick-energy'], popularity: 95 },
  { name: 'Apple medium', serving: '1 medium', servingGrams: 150, calories: 85, protein: 0.4, carbs: 22, fat: 0.3, fiber: 4, category: 'carbohydrates', tags: ['fruit', 'fiber', 'antioxidants'], popularity: 95 },
  { name: 'Pineapple chunks', serving: '1 cup', servingGrams: 165, calories: 82, protein: 0.9, carbs: 21.6, fat: 0.2, fiber: 2.3, category: 'carbohydrates', tags: ['fruit', 'vitamin-c', 'bromelain'], popularity: 80 },

  // Dairy & Alternatives
  { name: 'Skimmed milk', serving: '1 cup', servingGrams: 240, calories: 83, protein: 8.3, carbs: 12, fat: 0.2, fiber: 0, category: 'dairy', tags: ['low-fat', 'calcium', 'protein'], popularity: 85 },
  { name: 'Whole milk', serving: '1 cup', servingGrams: 240, calories: 149, protein: 7.7, carbs: 11.7, fat: 7.9, fiber: 0, category: 'dairy', tags: ['calcium', 'vitamin-d'], popularity: 90 },
  { name: 'Cheese slice', serving: '1 slice', servingGrams: 20, calories: 113, protein: 7, carbs: 1, fat: 9, fiber: 0, category: 'dairy', tags: ['calcium', 'protein'], popularity: 85 },
  { name: 'Soy milk', serving: '1 cup', servingGrams: 240, calories: 80, protein: 7, carbs: 4, fat: 4, fiber: 0, category: 'dairy', tags: ['plant-based', 'protein'], popularity: 75 },
  { name: 'Almond milk', serving: '1 cup', servingGrams: 240, calories: 39, protein: 1.5, carbs: 3.4, fat: 2.9, fiber: 0, category: 'dairy', tags: ['plant-based', 'low-calorie'], popularity: 80 },

  // Vegetables
  { name: 'Broccoli', serving: '1 cup', servingGrams: 90, calories: 25, protein: 3, carbs: 5, fat: 0.3, fiber: 2.3, category: 'vegetables', tags: ['cruciferous', 'vitamin-c', 'fiber'], popularity: 85 },
  { name: 'Spinach raw', serving: '1 cup', servingGrams: 30, calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, fiber: 0.7, category: 'vegetables', tags: ['leafy-green', 'iron', 'folate'], popularity: 80 },
  { name: 'Kale raw', serving: '1 cup', servingGrams: 50, calories: 8, protein: 0.6, carbs: 1.4, fat: 0.1, fiber: 0.9, category: 'vegetables', tags: ['superfood', 'vitamin-k', 'antioxidants'], popularity: 75 },
  { name: 'Carrots', serving: '1 medium', servingGrams: 60, calories: 25, protein: 0.5, carbs: 6, fat: 0.1, fiber: 1.7, category: 'vegetables', tags: ['beta-carotene', 'vitamin-a'], popularity: 90 },
  { name: 'Bell pepper', serving: '1 medium', servingGrams: 120, calories: 24, protein: 1, carbs: 7, fat: 0.3, fiber: 2.5, category: 'vegetables', tags: ['vitamin-c', 'antioxidants'], popularity: 80 },
  { name: 'Tomatoes', serving: '1 medium', servingGrams: 100, calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, category: 'vegetables', tags: ['lycopene', 'vitamin-c'], popularity: 90 },
  { name: 'Onions', serving: '1 medium', servingGrams: 100, calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, category: 'vegetables', tags: ['flavonoids', 'versatile'], popularity: 85 },
  { name: 'Cauliflower', serving: '1 cup', servingGrams: 100, calories: 25, protein: 2, carbs: 5, fat: 0.3, fiber: 2.1, category: 'vegetables', tags: ['cruciferous', 'low-carb'], popularity: 75 },

  // Fruits
  { name: 'Orange', serving: '1 medium', servingGrams: 130, calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2, fiber: 3.1, category: 'fruits', tags: ['vitamin-c', 'citrus', 'fiber'], popularity: 90 },
  { name: 'Blueberries', serving: '1 cup', servingGrams: 150, calories: 84, protein: 1.1, carbs: 21.5, fat: 0.5, fiber: 3.6, category: 'fruits', tags: ['antioxidants', 'superfood'], popularity: 85 },
  { name: 'Strawberries', serving: '1 cup', servingGrams: 150, calories: 49, protein: 1, carbs: 11.7, fat: 0.5, fiber: 3, category: 'fruits', tags: ['vitamin-c', 'antioxidants'], popularity: 90 },
  { name: 'Grapes', serving: '1 cup', servingGrams: 150, calories: 104, protein: 1.1, carbs: 27.3, fat: 0.2, fiber: 1.4, category: 'fruits', tags: ['resveratrol', 'quick-energy'], popularity: 85 },
  { name: 'Mango', serving: '1 medium', servingGrams: 200, calories: 135, protein: 1.1, carbs: 35, fat: 0.6, fiber: 3.7, category: 'fruits', tags: ['vitamin-a', 'tropical'], popularity: 80 },
  { name: 'Papaya', serving: '1 cup', servingGrams: 140, calories: 62, protein: 0.7, carbs: 15.7, fat: 0.4, fiber: 2.5, category: 'fruits', tags: ['vitamin-c', 'digestive-enzymes'], popularity: 70 },
  { name: 'Watermelon', serving: '1 cup', servingGrams: 150, calories: 46, protein: 0.9, carbs: 11.5, fat: 0.2, fiber: 0.6, category: 'fruits', tags: ['hydrating', 'low-calorie'], popularity: 85 },

  // Nuts & Seeds
  { name: 'Walnuts', serving: '28g', servingGrams: 28, calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, fiber: 1.9, category: 'nuts_seeds', tags: ['omega-3', 'brain-health'], popularity: 80 },
  { name: 'Cashews', serving: '28g', servingGrams: 28, calories: 157, protein: 5.2, carbs: 8.6, fat: 12.4, fiber: 0.9, category: 'nuts_seeds', tags: ['magnesium', 'creamy'], popularity: 85 },
  { name: 'Peanuts', serving: '28g', servingGrams: 28, calories: 161, protein: 7.3, carbs: 4.6, fat: 14, fiber: 2.4, category: 'nuts_seeds', tags: ['niacin', 'affordable'], popularity: 90 },
  { name: 'Flax seeds', serving: '2 tbsp', servingGrams: 28, calories: 151, protein: 5.2, carbs: 8.1, fat: 11.9, fiber: 7.6, category: 'nuts_seeds', tags: ['omega-3', 'lignans'], popularity: 75 },
  { name: 'Pumpkin seeds', serving: '28g', servingGrams: 28, calories: 151, protein: 7, carbs: 5, fat: 13, fiber: 1.7, category: 'nuts_seeds', tags: ['zinc', 'magnesium'], popularity: 70 },
  { name: 'Sunflower seeds', serving: '28g', servingGrams: 28, calories: 164, protein: 5.8, carbs: 6.5, fat: 14.1, fiber: 2.4, category: 'nuts_seeds', tags: ['vitamin-e', 'selenium'], popularity: 75 },

  // Snacks & Condiments
  { name: 'Almond butter', serving: '2 tbsp', servingGrams: 32, calories: 196, protein: 7.2, carbs: 7.4, fat: 18.3, fiber: 3.3, category: 'snacks', tags: ['spread', 'vitamin-e'], popularity: 80 },
  { name: 'Dark chocolate', serving: '28g', servingGrams: 28, calories: 155, protein: 2, carbs: 13, fat: 9, fiber: 3, category: 'snacks', tags: ['antioxidants', 'flavonoids'], popularity: 85 },
  { name: 'Protein bar', serving: '1 bar', servingGrams: 60, calories: 200, protein: 20, carbs: 20, fat: 6, fiber: 3, category: 'snacks', tags: ['convenient', 'high-protein'], popularity: 80 },
  { name: 'Honey', serving: '1 tbsp', servingGrams: 21, calories: 64, protein: 0.1, carbs: 17.3, fat: 0, fiber: 0, category: 'snacks', tags: ['natural-sweetener', 'quick-energy'], popularity: 85 },
  { name: 'Olive oil', serving: '1 tbsp', servingGrams: 14, calories: 119, protein: 0, carbs: 0, fat: 13.5, fiber: 0, category: 'snacks', tags: ['healthy-fats', 'monounsaturated'], popularity: 90 },
  { name: 'Coconut oil', serving: '1 tbsp', servingGrams: 14, calories: 121, protein: 0, carbs: 0, fat: 13.5, fiber: 0, category: 'snacks', tags: ['mct', 'cooking'], popularity: 75 },
  { name: 'Butter', serving: '1 tbsp', servingGrams: 14, calories: 102, protein: 0.1, carbs: 0, fat: 11.5, fiber: 0, category: 'snacks', tags: ['saturated-fat', 'cooking'], popularity: 85 },

  // Beverages
  { name: 'Black coffee', serving: '1 cup', servingGrams: 240, calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, category: 'beverages', tags: ['caffeine', 'zero-calorie'], popularity: 95 },
  { name: 'Green tea', serving: '1 cup', servingGrams: 240, calories: 2, protein: 0.5, carbs: 0, fat: 0, fiber: 0, category: 'beverages', tags: ['antioxidants', 'catechins'], popularity: 85 },
  { name: 'Black tea', serving: '1 cup', servingGrams: 240, calories: 2, protein: 0, carbs: 0.7, fat: 0, fiber: 0, category: 'beverages', tags: ['caffeine', 'theaflavins'], popularity: 80 },
  { name: 'Fresh orange juice', serving: '1 cup', servingGrams: 240, calories: 112, protein: 1.7, carbs: 25.8, fat: 0.5, fiber: 0.5, category: 'beverages', tags: ['vitamin-c', 'natural-sugars'], popularity: 85 },
  { name: 'Smoothie mixed', serving: '1 cup', servingGrams: 250, calories: 150, protein: 5, carbs: 30, fat: 2, fiber: 4, category: 'beverages', tags: ['blended', 'customizable'], popularity: 80 },
  { name: 'Sports drink', serving: '1 bottle', servingGrams: 500, calories: 80, protein: 0, carbs: 21, fat: 0, fiber: 0, category: 'beverages', tags: ['electrolytes', 'hydration'], popularity: 75 }
];

async function populateFoodDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing food data
    await Food.deleteMany({});
    console.log('Cleared existing food data');

    // Insert comprehensive food data
    const insertedFoods = await Food.insertMany(comprehensiveFoodData);
    console.log(`Inserted ${insertedFoods.length} food items`);

    // Create indexes
    await Food.createIndexes();
    console.log('Created database indexes');

    console.log('Food database population completed successfully!');
    
    // Display summary by category
    const categories = await Food.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\nFood items by category:');
    categories.forEach(cat => {
      console.log(`${cat._id}: ${cat.count} items`);
    });

  } catch (error) {
    console.error('Error populating food database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the population script
populateFoodDatabase();