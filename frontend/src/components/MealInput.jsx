// frontend/src/components/MealInput.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function MealInput({ onLookup, isLookingUp, error }) {
  const [query, setQuery] = useState('');

  const quickAddFoods = [
    { name: '2 eggs', emoji: '🥚' },
    { name: 'chicken breast 100g', emoji: '🍗' },
    { name: '1 cup rice', emoji: '🍚' },
    { name: 'banana', emoji: '🍌' },
    { name: 'apple', emoji: '🍎' },
    { name: '1 cup oats', emoji: '🥣' },
    { name: 'salmon 100g', emoji: '🐟' },
    { name: 'greek yogurt', emoji: '🥛' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLookingUp) return;
    
    try {
      console.log('MealInput submitting query:', query.trim());
      await onLookup(query.trim());
      setQuery('');
    } catch (error) {
      console.error('MealInput lookup failed:', error);
    }
  };

  const quickAdd = (foodName) => {
    setQuery(foodName);
  };

  return (
    <div 
      data-meal-input
      className="bg-light-bg-soft dark:bg-dark-bg-soft backdrop-blur-premium border border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-light-card dark:shadow-dark-card transition-all duration-300 hover:shadow-lg dark:hover:shadow-dark-glow"
    >
      <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4 flex items-center gap-2">
        <span>🍎</span> Add Food
      </h3>
      
      {/* Quick Add Buttons */}
      <div className="mb-4">
        <p className="text-sm text-light-text-muted dark:text-dark-text-muted mb-2">Quick add:</p>
        <div className="flex flex-wrap gap-2">
          {quickAddFoods.map((food) => (
            <button
              key={food.name}
              onClick={() => quickAdd(food.name)}
              className="px-3 py-1 bg-gray-100 dark:bg-dark-bg-secondary/60 hover:bg-gray-200 dark:hover:bg-dark-bg-secondary/80 rounded-full text-sm text-light-text-primary dark:text-dark-text-primary transition-all duration-200 flex items-center gap-1 border border-gray-200 dark:border-dark-border backdrop-blur-xs hover:shadow-sm dark:hover:shadow-dark-glow/30"
              disabled={isLookingUp}
            >
              <span>{food.emoji}</span>
              {food.name}
            </button>
          ))}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter food with quantity (e.g., 'chicken breast 150g', '2 eggs', '1 cup rice')"
            className="w-full p-3 rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary border border-gray-300 dark:border-dark-border text-light-text-primary dark:text-dark-text-primary placeholder-light-text-muted dark:placeholder-dark-text-muted focus:border-blue-500 dark:focus:border-dark-accent focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-dark-accent/20 transition-all backdrop-blur-xs"
            id="nutrition-search-input"
            disabled={isLookingUp}
            maxLength={200}
          />
          <div className="text-xs text-light-text-muted/80 dark:text-dark-text-muted/80 mt-1">
            Be specific with quantities for accurate nutrition data
          </div>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200 dark:border-red-500/20 backdrop-blur-xs"
          >
            {error}
          </motion.div>
        )}
        
        <button
          type="submit"
          disabled={isLookingUp || !query.trim()}
          className="w-full bg-blue-600 dark:bg-dark-accent hover:bg-blue-700 dark:hover:bg-dark-accent-hover text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg dark:hover:shadow-dark-glow focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-dark-accent/20"
        >
          {isLookingUp ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              Analyzing nutrition...
            </div>
          ) : (
            'Lookup Nutrition'
          )}
        </button>
      </form>
    </div>
  );
}