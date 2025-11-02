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
    // Instead of triggering API lookup, pass the exact food data
    onFoodSelect(food);
  };

  const formatNutrition = (food) => {
    if (!food.calories) return null;
    return `${food.calories}cal | ${food.protein}g protein | ${food.carbs}g carbs | ${food.fat}g fat`;
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-md border-2 border-slate-600/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Premium Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-green-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-xl sm:text-2xl md:text-3xl">🍽️</span>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">Quick Add Foods</h3>
            <p className="text-slate-300 font-medium text-sm sm:text-base">Pre-loaded nutrition database</p>
          </div>
        </div>
      
        {/* Premium Category Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          {categoriesLoading ? (
            <div className="flex gap-2 sm:gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-slate-700/50 h-10 sm:h-12 w-20 sm:w-28 rounded-lg sm:rounded-xl" />
              ))}
            </div>
          ) : (
            Object.entries(currentCategories).map(([key, category]) => (
            <motion.button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 sm:px-4 md:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-1 sm:gap-2 ${
                activeCategory === key
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:shadow-orange-500/20 scale-105'
                  : 'bg-slate-700/60 hover:bg-slate-600/80 text-slate-300 hover:text-white border border-slate-500/30 hover:border-orange-500/50 backdrop-blur-sm hover:scale-105'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-sm sm:text-base md:text-lg">{category.icon}</span>
              <span className="hidden sm:inline">{category.title.split(' ')[0]}</span>
              <span className="sm:hidden">{category.title.split(' ')[0].slice(0, 4)}</span>
            </motion.button>
            ))
          )}
        </div>

        {/* Premium Food Items Grid */}
        <AnimatePresence mode="wait">
          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-700/50 h-20 sm:h-24 rounded-lg sm:rounded-xl" />
              ))}
            </div>
          ) : (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
            >
              {currentCategories[activeCategory]?.foods?.map((food, index) => (
              <motion.button
                key={`${activeCategory}-${index}`}
                onClick={() => handleFoodClick(food)}
                onMouseEnter={() => setHoveredFood(food)}
                onMouseLeave={() => setHoveredFood(null)}
                disabled={isLoading}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all duration-300 border-2 relative group overflow-hidden ${
                  isLoading
                    ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed border-slate-600/30'
                    : 'bg-gradient-to-br from-slate-700/80 to-slate-600/80 hover:from-orange-600/20 hover:to-red-600/20 text-white border-slate-500/50 hover:border-orange-500/50 backdrop-blur-sm hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-500/30 shadow-lg hover:shadow-orange-500/20'
                }`}
                whileHover={!isLoading ? { scale: 1.05, y: -2 } : {}}
                whileTap={!isLoading ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {/* Premium Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="font-bold text-xs sm:text-sm text-white mb-1 group-hover:text-orange-200 transition-colors duration-300 leading-tight">{food.name}</div>
                  <div className="text-xs text-slate-300 mb-1 sm:mb-2 font-medium">{food.serving}</div>
                  {/* Enhanced nutrition display */}
                  {activeCategory === 'supplements' ? (
                    <div className="text-xs font-semibold">
                      {food.type === 'protein' ? (
                        <span className="text-blue-300">
                          <span className="hidden sm:inline">{food.calories} cal • {food.protein}g protein</span>
                          <span className="sm:hidden">{food.calories}cal</span>
                        </span>
                      ) : food.description ? (
                        <span className="text-purple-300">
                          <span className="hidden sm:inline">
                            {food.calories > 0 ? `${food.calories} cal • ` : ''}{food.description}
                          </span>
                          <span className="sm:hidden">
                            {food.calories > 0 ? `${food.calories}cal` : 'Supp'}
                          </span>
                        </span>
                      ) : (
                        <span className="text-green-300">
                          <span className="hidden sm:inline">
                            {food.calories > 0 ? `${food.calories} cal` : 'Supplement'}
                          </span>
                          <span className="sm:hidden">
                            {food.calories > 0 ? `${food.calories}cal` : 'Supp'}
                          </span>
                        </span>
                      )}
                    </div>
                  ) : food.calories ? (
                    <div className="text-xs font-semibold">
                      <span className="text-orange-300">{food.calories} cal</span>
                      <span className="text-slate-400 hidden sm:inline"> • </span>
                      <span className="text-blue-300 hidden sm:inline">{food.protein}g protein</span>
                    </div>
                  ) : null}
              
                  {/* Premium Nutrition Tooltip */}
                  {hoveredFood === food && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute z-20 bottom-full left-0 mb-3 p-4 bg-gradient-to-br from-slate-800/95 to-slate-700/95 border-2 border-orange-500/30 rounded-2xl shadow-2xl backdrop-blur-md text-xs whitespace-nowrap"
                    >
                      <div className="text-white font-bold mb-2 flex items-center gap-2">
                        <span className="text-orange-400">📊</span>
                        {food.name}
                      </div>
                      <div className="space-y-1">
                        {activeCategory === 'supplements' ? (
                          <>
                            {food.description && (
                              <div className="text-purple-300 font-medium mb-2 text-xs">{food.description}</div>
                            )}
                            {food.calories > 0 && <div><span className="text-orange-300 font-semibold">{food.calories}</span> <span className="text-slate-300">cal</span></div>}
                            {food.protein > 0 && <div><span className="text-blue-300 font-semibold">{food.protein}g</span> <span className="text-slate-300">protein</span></div>}
                            {food.carbs > 0 && <div><span className="text-green-300 font-semibold">{food.carbs}g</span> <span className="text-slate-300">carbs</span></div>}
                            {food.fat > 0 && <div><span className="text-yellow-300 font-semibold">{food.fat}g</span> <span className="text-slate-300">fat</span></div>}
                          </>
                        ) : (
                          <>
                            <div><span className="text-orange-300 font-semibold">{food.calories}</span> <span className="text-slate-300">cal</span></div>
                            <div><span className="text-blue-300 font-semibold">{food.protein}g</span> <span className="text-slate-300">protein</span></div>
                            <div><span className="text-green-300 font-semibold">{food.carbs}g</span> <span className="text-slate-300">carbs</span></div>
                            <div><span className="text-yellow-300 font-semibold">{food.fat}g</span> <span className="text-slate-300">fat</span></div>
                            {food.fiber > 0 && <div><span className="text-purple-300 font-semibold">{food.fiber}g</span> <span className="text-slate-300">fiber</span></div>}
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            )) || []}
          </motion.div>
        )}
      </AnimatePresence>

        <div className="mt-4 sm:mt-6 text-center">
          {categoriesLoading ? (
            <div className="animate-pulse bg-slate-700/50 h-3 sm:h-4 w-60 sm:w-80 mx-auto rounded-lg" />
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <span className="text-orange-400">🔥</span>
                <span>Real-time nutrition data</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="hidden sm:inline">Hover for details</span>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="hidden sm:inline">Click to add to your meal tracker</span>
                <span className="sm:hidden">Tap to add foods</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FoodCategories;