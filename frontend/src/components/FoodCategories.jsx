import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import foodCategoriesService from '../services/foodCategoriesService';

const FoodCategories = ({ onFoodSelect, isLoading }) => {
  const [activeCategory, setActiveCategory] = useState('animalProteins');
  const [hoveredFood, setHoveredFood] = useState(null);
  const [foodCategories, setFoodCategories] = useState({});
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Load food categories on component mount - using static data only
  useEffect(() => {
    // Use static categories immediately to avoid 404 errors
    setCategoriesLoading(false);
    setFoodCategories(staticFoodCategories);
  }, []);

  const staticFoodCategories = {
    animalProteins: {
      icon: '🥩',
      title: 'Animal Proteins',
      foods: [
        { name: 'Chicken breast', serving: '100g', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
        { name: 'Chicken thigh', serving: '100g', calories: 209, protein: 26, carbs: 0, fat: 10.9, fiber: 0 },
        { name: 'Turkey breast', serving: '100g', calories: 135, protein: 29, carbs: 0, fat: 1.7, fiber: 0 },
        { name: 'Salmon Atlantic', serving: '100g', calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0 },
        { name: 'Tuna canned in water', serving: '100g', calories: 116, protein: 26, carbs: 0, fat: 0.8, fiber: 0 },
        { name: 'Sardines canned', serving: '100g', calories: 208, protein: 25, carbs: 0, fat: 11.5, fiber: 0 },
        { name: 'Mackerel cooked', serving: '100g', calories: 205, protein: 19, carbs: 0, fat: 13, fiber: 0 },
        { name: 'Beef steak lean', serving: '100g', calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 },
        { name: 'Ground beef lean', serving: '100g', calories: 250, protein: 26, carbs: 0, fat: 16, fiber: 0 },
        { name: 'Pork loin roasted', serving: '100g', calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0 },
        { name: 'Egg large whole', serving: '1 large', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fiber: 0 },
        { name: 'Egg whites', serving: '100g', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0 }
      ]
    },
    plantProteins: {
      icon: '🌱',
      title: 'Plant Proteins',
      foods: [
        { name: 'Lentils cooked', serving: '1 cup', calories: 230, protein: 18, carbs: 40, fat: 0.8, fiber: 15 },
        { name: 'Chickpeas cooked', serving: '1 cup', calories: 269, protein: 14.5, carbs: 45, fat: 4.2, fiber: 12.5 },
        { name: 'Black beans cooked', serving: '1 cup', calories: 227, protein: 15, carbs: 41, fat: 0.9, fiber: 15 },
        { name: 'Kidney beans cooked', serving: '1 cup', calories: 225, protein: 15, carbs: 40, fat: 0.9, fiber: 13 },
        { name: 'Tofu firm', serving: '100g', calories: 85, protein: 10, carbs: 2, fat: 5, fiber: 1 },
        { name: 'Tempeh', serving: '100g', calories: 190, protein: 19, carbs: 9, fat: 11, fiber: 2 },
        { name: 'Edamame shelled', serving: '1 cup', calories: 188, protein: 18, carbs: 14, fat: 8, fiber: 8 },
        { name: 'Quinoa cooked', serving: '1 cup', calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5 },
        { name: 'Oats rolled raw', serving: '100g', calories: 389, protein: 16, carbs: 66, fat: 7, fiber: 10 },
        { name: 'Seitan cooked', serving: '100g', calories: 150, protein: 22, carbs: 6, fat: 2, fiber: 1 }
      ]
    },
    dairy: {
      icon: '🥛',
      title: 'Dairy & Alternatives',
      foods: [
        { name: 'Greek yogurt', serving: '1 cup', calories: 110, protein: 17, carbs: 6, fat: 1, fiber: 0 },
        { name: 'Skimmed milk', serving: '1 cup', calories: 83, protein: 8.3, carbs: 12, fat: 0.2, fiber: 0 },
        { name: 'Whole milk', serving: '1 cup', calories: 149, protein: 7.7, carbs: 11.7, fat: 7.9, fiber: 0 },
        { name: 'Cottage cheese', serving: '100g', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0 },
        { name: 'Cheese slice', serving: '1 slice', calories: 113, protein: 7, carbs: 1, fat: 9, fiber: 0 },
        { name: 'Whey protein', serving: '1 scoop', calories: 120, protein: 25, carbs: 2, fat: 1, fiber: 0 },
        { name: 'Soy milk', serving: '1 cup', calories: 80, protein: 7, carbs: 4, fat: 4, fiber: 0 },
        { name: 'Almond milk', serving: '1 cup', calories: 39, protein: 1.5, carbs: 3.4, fat: 2.9, fiber: 0 }
      ]
    },
    vegetables: {
      icon: '🥦',
      title: 'Vegetables',
      foods: [
        { name: 'Broccoli', serving: '1 cup', calories: 25, protein: 3, carbs: 5, fat: 0.3, fiber: 2.3 },
        { name: 'Spinach', serving: '1 cup raw', calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, fiber: 0.7 },
        { name: 'Kale', serving: '1 cup raw', calories: 8, protein: 0.6, carbs: 1.4, fat: 0.1, fiber: 0.9 },
        { name: 'Carrots', serving: '1 medium', calories: 25, protein: 0.5, carbs: 6, fat: 0.1, fiber: 1.7 },
        { name: 'Bell pepper', serving: '1 medium', calories: 24, protein: 1, carbs: 7, fat: 0.3, fiber: 2.5 },
        { name: 'Tomatoes', serving: '1 medium', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
        { name: 'Onions', serving: '1 medium', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
        { name: 'Sweet potato', serving: '100g', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 },
        { name: 'Potato', serving: '100g', calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
        { name: 'Cauliflower', serving: '1 cup', calories: 25, protein: 2, carbs: 5, fat: 0.3, fiber: 2.1 }
      ]
    },
    fruits: {
      icon: '🍎',
      title: 'Fruits',
      foods: [
        { name: 'Apple', serving: '1 medium', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4 },
        { name: 'Banana', serving: '1 medium', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1 },
        { name: 'Orange', serving: '1 medium', calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2, fiber: 3.1 },
        { name: 'Blueberries', serving: '1 cup', calories: 84, protein: 1.1, carbs: 21.5, fat: 0.5, fiber: 3.6 },
        { name: 'Strawberries', serving: '1 cup', calories: 49, protein: 1, carbs: 11.7, fat: 0.5, fiber: 3 },
        { name: 'Grapes', serving: '1 cup', calories: 104, protein: 1.1, carbs: 27.3, fat: 0.2, fiber: 1.4 },
        { name: 'Mango', serving: '1 medium', calories: 135, protein: 1.1, carbs: 35, fat: 0.6, fiber: 3.7 },
        { name: 'Pineapple', serving: '1 cup', calories: 82, protein: 0.9, carbs: 21.6, fat: 0.2, fiber: 2.3 },
        { name: 'Papaya', serving: '1 cup', calories: 62, protein: 0.7, carbs: 15.7, fat: 0.4, fiber: 2.5 },
        { name: 'Watermelon', serving: '1 cup', calories: 46, protein: 0.9, carbs: 11.5, fat: 0.2, fiber: 0.6 }
      ]
    },
    nuts: {
      icon: '🥜',
      title: 'Nuts & Seeds',
      foods: [
        { name: 'Almonds', serving: '28g', calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5 },
        { name: 'Walnuts', serving: '28g', calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, fiber: 1.9 },
        { name: 'Cashews', serving: '28g', calories: 157, protein: 5.2, carbs: 8.6, fat: 12.4, fiber: 0.9 },
        { name: 'Peanuts', serving: '28g', calories: 161, protein: 7.3, carbs: 4.6, fat: 14, fiber: 2.4 },
        { name: 'Chia seeds', serving: '2 tbsp', calories: 138, protein: 4.7, carbs: 12, fat: 8.7, fiber: 9.8 },
        { name: 'Flax seeds', serving: '2 tbsp', calories: 151, protein: 5.2, carbs: 8.1, fat: 11.9, fiber: 7.6 },
        { name: 'Pumpkin seeds', serving: '28g', calories: 151, protein: 7, carbs: 5, fat: 13, fiber: 1.7 },
        { name: 'Sunflower seeds', serving: '28g', calories: 164, protein: 5.8, carbs: 6.5, fat: 14.1, fiber: 2.4 }
      ]
    },
    snacks: {
      icon: '🍫',
      title: 'Snacks & Condiments',
      foods: [
        { name: 'Peanut butter', serving: '2 tbsp', calories: 188, protein: 8, carbs: 8, fat: 16, fiber: 2.6 },
        { name: 'Almond butter', serving: '2 tbsp', calories: 196, protein: 7.2, carbs: 7.4, fat: 18.3, fiber: 3.3 },
        { name: 'Dark chocolate', serving: '28g', calories: 155, protein: 2, carbs: 13, fat: 9, fiber: 3 },
        { name: 'Protein bar', serving: '1 bar', calories: 200, protein: 20, carbs: 20, fat: 6, fiber: 3 },
        { name: 'Honey', serving: '1 tbsp', calories: 64, protein: 0.1, carbs: 17.3, fat: 0, fiber: 0 },
        { name: 'Olive oil', serving: '1 tbsp', calories: 119, protein: 0, carbs: 0, fat: 13.5, fiber: 0 },
        { name: 'Coconut oil', serving: '1 tbsp', calories: 121, protein: 0, carbs: 0, fat: 13.5, fiber: 0 },
        { name: 'Butter', serving: '1 tbsp', calories: 102, protein: 0.1, carbs: 0, fat: 11.5, fiber: 0 }
      ]
    },
    beverages: {
      icon: '🥤',
      title: 'Beverages',
      foods: [
        { name: 'Black coffee', serving: '1 cup', calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0 },
        { name: 'Green tea', serving: '1 cup', calories: 2, protein: 0.5, carbs: 0, fat: 0, fiber: 0 },
        { name: 'Black tea', serving: '1 cup', calories: 2, protein: 0, carbs: 0.7, fat: 0, fiber: 0 },
        { name: 'Fresh orange juice', serving: '1 cup', calories: 112, protein: 1.7, carbs: 25.8, fat: 0.5, fiber: 0.5 },
        { name: 'Smoothie', serving: '1 cup', calories: 150, protein: 5, carbs: 30, fat: 2, fiber: 4 },
        { name: 'Sports drink', serving: '1 bottle', calories: 80, protein: 0, carbs: 21, fat: 0, fiber: 0 }
      ]
    },
    carbs: {
      icon: '🍚',
      title: 'Carbohydrates (Fuel Sources)',
      foods: [
        { name: 'White rice cooked', serving: '1 cup', calories: 205, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6 },
        { name: 'Brown rice cooked', serving: '1 cup', calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5 },
        { name: 'Quinoa cooked', serving: '1 cup', calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5 },
        { name: 'Oats cooked', serving: '1 cup', calories: 154, protein: 6, carbs: 27, fat: 3, fiber: 4 },
        { name: 'Whole wheat bread', serving: '1 slice', calories: 110, protein: 4, carbs: 20, fat: 1.5, fiber: 3 },
        { name: 'White bread', serving: '1 slice', calories: 100, protein: 3, carbs: 18, fat: 1, fiber: 1 },
        { name: 'Pasta cooked', serving: '1 cup', calories: 210, protein: 7.5, carbs: 42, fat: 1.5, fiber: 2.5 },
        { name: 'Roti chapati', serving: '1 piece', calories: 120, protein: 3.3, carbs: 18, fat: 3, fiber: 2 },
        { name: 'Potato boiled', serving: '100g', calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
        { name: 'Sweet potato baked', serving: '100g', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 },
        { name: 'Corn kernels cooked', serving: '1 cup', calories: 143, protein: 5.4, carbs: 31, fat: 2.2, fiber: 3.6 },
        { name: 'Banana medium', serving: '1 medium', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3 },
        { name: 'Apple medium', serving: '1 medium', calories: 85, protein: 0.4, carbs: 22, fat: 0.3, fiber: 4 },
        { name: 'Pineapple chunks', serving: '1 cup', calories: 82, protein: 0.9, carbs: 21.6, fat: 0.2, fiber: 2.3 }
      ]
    },
    supplements: {
      icon: '🥤',
      title: 'Supplements',
      foods: [
        // Protein Powders
        { name: 'Whey Protein Isolate', serving: '1 scoop (30g)', calories: 110, protein: 25, carbs: 1, fat: 0.5, fiber: 0, type: 'protein' },
        { name: 'Whey Protein Concentrate', serving: '1 scoop (30g)', calories: 120, protein: 22, carbs: 3, fat: 2, fiber: 0, type: 'protein' },
        { name: 'Casein Protein', serving: '1 scoop (30g)', calories: 120, protein: 24, carbs: 2, fat: 1, fiber: 0, type: 'protein' },
        { name: 'Soy Protein Powder', serving: '1 scoop (30g)', calories: 120, protein: 23, carbs: 3, fat: 1.5, fiber: 0, type: 'protein' },
        { name: 'Pea Protein Powder', serving: '1 scoop (30g)', calories: 120, protein: 21, carbs: 2, fat: 2, fiber: 0, type: 'protein' },
        
        // Performance & Recovery
        { name: 'Creatine Monohydrate', serving: '5g', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, type: 'performance', description: 'ATP & Strength Booster' },
        { name: 'BCAA', serving: '5g', calories: 20, protein: 5, carbs: 0, fat: 0, fiber: 0, type: 'recovery', description: 'Muscle Recovery' },
        { name: 'Pre-Workout', serving: '1 scoop', calories: 10, protein: 0, carbs: 2, fat: 0, fiber: 0, type: 'performance', description: 'Energy & Focus' },
        { name: 'Glutamine', serving: '5g', calories: 20, protein: 5, carbs: 0, fat: 0, fiber: 0, type: 'recovery', description: 'Recovery & Gut Health' },
        
        // Vitamins & Minerals
        { name: 'Multivitamin', serving: '1 tablet', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, type: 'vitamin', description: '100% DV Nutrients' },
        { name: 'Vitamin D3', serving: '1 capsule (1000 IU)', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, type: 'vitamin', description: 'Bone & Immune Health' },
        { name: 'Omega-3 Fish Oil', serving: '1 softgel (1000mg)', calories: 10, protein: 0, carbs: 0, fat: 1, fiber: 0, type: 'vitamin', description: 'EPA & DHA ~300mg' },
        { name: 'Calcium Supplement', serving: '1 tablet', calories: 5, protein: 0, carbs: 0, fat: 0, fiber: 0, type: 'mineral', description: '~500mg Calcium' },
        { name: 'Magnesium', serving: '1 capsule', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, type: 'mineral', description: '~250mg Magnesium' }
      ]
    }
  };

  // Always use static categories to avoid backend dependency
  const currentCategories = staticFoodCategories;

  const handleFoodClick = (food) => {
    const query = `${food.serving} ${food.name}`;
    onFoodSelect(query);
  };

  const formatNutrition = (food) => {
    if (!food.calories) return null;
    return `${food.calories}cal | ${food.protein}g protein | ${food.carbs}g carbs | ${food.fat}g fat`;
  };

  return (
    <div className="bg-light-bg-soft dark:bg-dark-bg-soft backdrop-blur-premium border border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-light-card dark:shadow-dark-card transition-all duration-300 hover:shadow-lg dark:hover:shadow-dark-glow">
      <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4 flex items-center gap-2">
        <span>🍽️</span> Quick Add Foods
      </h3>
      
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categoriesLoading ? (
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-dark-bg-tertiary/50 h-10 w-24 rounded-lg" />
            ))}
          </div>
        ) : (
          Object.entries(currentCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeCategory === key
                ? 'bg-blue-600 dark:bg-dark-accent text-white shadow-lg dark:shadow-dark-glow'
                : 'bg-gray-100 dark:bg-dark-bg-secondary/60 text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-bg-secondary/80 hover:text-light-text-primary dark:hover:text-dark-text-primary border border-gray-200 dark:border-dark-border backdrop-blur-xs'
            }`}
          >
            <span className="mr-1">{category.icon}</span>
            {category.title.split(' ')[0]}
          </button>
          ))
        )}
      </div>

      {/* Food Items Grid */}
      <AnimatePresence mode="wait">
        {categoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-dark-bg-tertiary/50 h-20 rounded-lg" />
            ))}
          </div>
        ) : (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2"
          >
            {currentCategories[activeCategory]?.foods?.map((food, index) => (
            <motion.button
              key={`${activeCategory}-${index}`}
              onClick={() => handleFoodClick(food)}
              onMouseEnter={() => setHoveredFood(food)}
              onMouseLeave={() => setHoveredFood(null)}
              disabled={isLoading}
              className={`p-3 rounded-lg text-left transition-all duration-200 border relative group ${
                isLoading
                  ? 'bg-gray-100 dark:bg-dark-bg-secondary/50 text-gray-400 dark:text-dark-text-muted/50 cursor-not-allowed border-gray-200 dark:border-dark-border/50'
                  : 'bg-light-bg-primary dark:bg-dark-bg-secondary/70 hover:bg-gray-50 dark:hover:bg-dark-bg-secondary/90 text-light-text-primary dark:text-dark-text-primary border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-accent/50 hover:shadow-lg dark:hover:shadow-dark-glow/50 shadow-sm backdrop-blur-xs'
              }`}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              <div className="font-medium text-sm text-light-text-primary dark:text-dark-text-primary">{food.name}</div>
              <div className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">{food.serving}</div>
              {/* Smart nutrition display based on supplement type */}
              {activeCategory === 'supplements' ? (
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                  {food.type === 'protein' ? (
                    `${food.calories} cal • ${food.protein}g protein`
                  ) : food.description ? (
                    food.calories > 0 ? `${food.calories} cal • ${food.description}` : food.description
                  ) : (
                    food.calories > 0 ? `${food.calories} cal` : 'Supplement'
                  )}
                </div>
              ) : food.calories ? (
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                  {food.calories} cal • {food.protein}g protein
                </div>
              ) : null}
              
              {/* Nutrition Tooltip */}
              {hoveredFood === food && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-10 bottom-full left-0 mb-2 p-2 bg-light-bg-primary dark:bg-dark-bg-primary border border-gray-200 dark:border-dark-border rounded-lg shadow-xl dark:shadow-dark-card backdrop-blur-premium text-xs whitespace-nowrap"
                >
                  <div className="text-light-text-primary dark:text-dark-text-primary font-medium mb-1">{food.name}</div>
                  <div className="text-light-text-secondary dark:text-dark-text-secondary">
                    {activeCategory === 'supplements' ? (
                      <>
                        {food.description && (
                          <div className="text-purple-600 dark:text-purple-400 mb-1">{food.description}</div>
                        )}
                        {food.calories > 0 && <><span className="text-orange-600 dark:text-orange-400">{food.calories}</span> cal</>}
                        {food.protein > 0 && <>{food.calories > 0 ? ' • ' : ''}<span className="text-blue-600 dark:text-blue-400">{food.protein}g</span> protein</>}
                        {food.carbs > 0 && <> • <span className="text-green-600 dark:text-green-400">{food.carbs}g</span> carbs</>}
                        {food.fat > 0 && <> • <span className="text-yellow-600 dark:text-yellow-400">{food.fat}g</span> fat</>}
                      </>
                    ) : (
                      <>
                        <span className="text-orange-600 dark:text-orange-400">{food.calories}</span> cal • 
                        <span className="text-blue-600 dark:text-blue-400">{food.protein}g</span> protein • 
                        <span className="text-green-600 dark:text-green-400">{food.carbs}g</span> carbs • 
                        <span className="text-yellow-600 dark:text-yellow-400">{food.fat}g</span> fat
                        {food.fiber > 0 && (
                          <> • <span className="text-purple-600 dark:text-purple-400">{food.fiber}g</span> fiber</>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.button>
            )) || []}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 text-xs text-light-text-muted/80 dark:text-dark-text-muted/80 text-center">
        {categoriesLoading ? (
          <div className="animate-pulse bg-gray-200 dark:bg-dark-bg-tertiary/50 h-4 w-64 mx-auto rounded" />
        ) : (
          <>🔥 Real-time nutrition data • Hover for details • Click to add to your meal tracker</>
        )}
      </div>
    </div>
  );
};

export default FoodCategories;