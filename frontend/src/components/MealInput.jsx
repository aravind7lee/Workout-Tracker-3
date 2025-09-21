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
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>🍎</span> Add Food
      </h3>
      
      {/* Quick Add Buttons */}
      <div className="mb-4">
        <p className="text-sm text-slate-400 mb-2">Quick add:</p>
        <div className="flex flex-wrap gap-2">
          {quickAddFoods.map((food) => (
            <button
              key={food.name}
              onClick={() => quickAdd(food.name)}
              className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 rounded-full text-sm text-white transition-colors flex items-center gap-1"
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
            className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            disabled={isLookingUp}
            maxLength={200}
          />
          <div className="text-xs text-slate-500 mt-1">
            Be specific with quantities for accurate nutrition data
          </div>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"
          >
            {error}
          </motion.div>
        )}
        
        <button
          type="submit"
          disabled={isLookingUp || !query.trim()}
          className="w-full btn bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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