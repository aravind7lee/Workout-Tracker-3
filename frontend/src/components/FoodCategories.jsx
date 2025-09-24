import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FoodCategories = ({ onFoodSelect, isLoading }) => {
  const [activeCategory, setActiveCategory] = useState('proteins');

  const foodCategories = {
    proteins: {
      icon: '🍳',
      title: 'Proteins (Meats & Eggs)',
      foods: [
        { name: 'Chicken breast', serving: '100g' },
        { name: 'Chicken thighs', serving: '100g' },
        { name: 'Turkey breast', serving: '100g' },
        { name: 'Salmon', serving: '100g' },
        { name: 'Tuna', serving: '100g' },
        { name: 'Sardines', serving: '100g' },
        { name: 'Mackerel', serving: '100g' },
        { name: 'Beef steak', serving: '100g' },
        { name: 'Ground beef lean', serving: '100g' },
        { name: 'Pork loin', serving: '100g' },
        { name: 'Eggs', serving: '1 large' },
        { name: 'Egg whites', serving: '3 whites' }
      ]
    },
    dairy: {
      icon: '🥛',
      title: 'Dairy & Alternatives',
      foods: [
        { name: 'Greek yogurt', serving: '1 cup' },
        { name: 'Skimmed milk', serving: '1 cup' },
        { name: 'Whole milk', serving: '1 cup' },
        { name: 'Cottage cheese', serving: '100g' },
        { name: 'Cheese slice', serving: '1 slice' },
        { name: 'Whey protein', serving: '1 scoop' },
        { name: 'Soy milk', serving: '1 cup' },
        { name: 'Almond milk', serving: '1 cup' }
      ]
    },
    vegetables: {
      icon: '🥦',
      title: 'Vegetables',
      foods: [
        { name: 'Broccoli', serving: '1 cup' },
        { name: 'Spinach', serving: '1 cup raw' },
        { name: 'Kale', serving: '1 cup raw' },
        { name: 'Carrots', serving: '1 medium' },
        { name: 'Bell pepper', serving: '1 medium' },
        { name: 'Tomatoes', serving: '1 medium' },
        { name: 'Onions', serving: '1 medium' },
        { name: 'Sweet potato', serving: '100g' },
        { name: 'Potato', serving: '100g' },
        { name: 'Cauliflower', serving: '1 cup' }
      ]
    },
    fruits: {
      icon: '🍎',
      title: 'Fruits',
      foods: [
        { name: 'Apple', serving: '1 medium' },
        { name: 'Banana', serving: '1 medium' },
        { name: 'Orange', serving: '1 medium' },
        { name: 'Blueberries', serving: '1 cup' },
        { name: 'Strawberries', serving: '1 cup' },
        { name: 'Grapes', serving: '1 cup' },
        { name: 'Mango', serving: '1 medium' },
        { name: 'Pineapple', serving: '1 cup' },
        { name: 'Papaya', serving: '1 cup' },
        { name: 'Watermelon', serving: '1 cup' }
      ]
    },
    carbs: {
      icon: '🍚',
      title: 'Carbohydrates & Grains',
      foods: [
        { name: 'White rice', serving: '1 cup cooked' },
        { name: 'Brown rice', serving: '1 cup cooked' },
        { name: 'Quinoa', serving: '1 cup cooked' },
        { name: 'Oats', serving: '1 cup' },
        { name: 'Whole wheat bread', serving: '1 slice' },
        { name: 'White bread', serving: '1 slice' },
        { name: 'Pasta', serving: '1 cup cooked' },
        { name: 'Roti chapati', serving: '1 piece' },
        { name: 'Corn', serving: '1 cup' },
        { name: 'Lentils', serving: '1 cup cooked' },
        { name: 'Chickpeas', serving: '1 cup cooked' },
        { name: 'Kidney beans', serving: '1 cup cooked' }
      ]
    },
    nuts: {
      icon: '🥜',
      title: 'Nuts & Seeds',
      foods: [
        { name: 'Almonds', serving: '28g' },
        { name: 'Walnuts', serving: '28g' },
        { name: 'Cashews', serving: '28g' },
        { name: 'Peanuts', serving: '28g' },
        { name: 'Chia seeds', serving: '2 tbsp' },
        { name: 'Flax seeds', serving: '2 tbsp' },
        { name: 'Pumpkin seeds', serving: '28g' },
        { name: 'Sunflower seeds', serving: '28g' }
      ]
    },
    snacks: {
      icon: '🍫',
      title: 'Snacks & Condiments',
      foods: [
        { name: 'Peanut butter', serving: '2 tbsp' },
        { name: 'Almond butter', serving: '2 tbsp' },
        { name: 'Dark chocolate', serving: '28g' },
        { name: 'Protein bar', serving: '1 bar' },
        { name: 'Honey', serving: '1 tbsp' },
        { name: 'Olive oil', serving: '1 tbsp' },
        { name: 'Coconut oil', serving: '1 tbsp' },
        { name: 'Butter', serving: '1 tbsp' }
      ]
    },
    beverages: {
      icon: '🥤',
      title: 'Beverages',
      foods: [
        { name: 'Black coffee', serving: '1 cup' },
        { name: 'Green tea', serving: '1 cup' },
        { name: 'Black tea', serving: '1 cup' },
        { name: 'Fresh orange juice', serving: '1 cup' },
        { name: 'Smoothie', serving: '1 cup' },
        { name: 'Sports drink', serving: '1 bottle' }
      ]
    }
  };

  const handleFoodClick = (food) => {
    const query = `${food.serving} ${food.name}`;
    onFoodSelect(query);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>🍽️</span> Quick Add Foods
      </h3>
      
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(foodCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === key
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className="mr-1">{category.icon}</span>
            {category.title.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Food Items Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2"
        >
          {foodCategories[activeCategory].foods.map((food, index) => (
            <motion.button
              key={`${activeCategory}-${index}`}
              onClick={() => handleFoodClick(food)}
              disabled={isLoading}
              className={`p-3 rounded-lg text-left transition-all border ${
                isLoading
                  ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-700/50 hover:bg-slate-600/50 text-white border-slate-600/50 hover:border-slate-500'
              }`}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              <div className="font-medium text-sm">{food.name}</div>
              <div className="text-xs text-slate-400 mt-1">{food.serving}</div>
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 text-xs text-slate-500 text-center">
        Click any food item to add it with real-time nutrition data from Nutritionix
      </div>
    </div>
  );
};

export default FoodCategories;