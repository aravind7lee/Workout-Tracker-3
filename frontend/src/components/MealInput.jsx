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

  const quickAdd = async (foodName) => {
    if (isLookingUp) return;
    try {
      console.log('Quick add submitting:', foodName);
      await onLookup(foodName);
      setQuery('');
    } catch (error) {
      console.error('Quick add failed:', error);
      setQuery(foodName); // Fallback to setting query
    }
  };

  return (
    <motion.div 
      data-meal-input
      className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-md border-2 border-slate-600/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl hover:shadow-green-500/10 transition-all duration-300 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Premium Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-orange-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-xl sm:text-2xl md:text-3xl">🍎</span>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">Add Food</h3>
            <p className="text-slate-300 font-medium text-sm sm:text-base">Track your nutrition intake</p>
          </div>
        </div>
      
        {/* Premium Quick Add Buttons */}
        <div className="mb-4 sm:mb-6">
          <p className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <span className="text-orange-400">⚡</span>
            Quick add:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {quickAddFoods.map((food) => (
              <motion.button
                key={food.name}
                onClick={() => quickAdd(food.name)}
                className="p-3 sm:p-4 bg-gradient-to-r from-slate-700/60 to-slate-600/60 hover:from-green-600/30 hover:to-emerald-600/30 rounded-lg sm:rounded-xl text-white transition-all duration-300 flex flex-col items-center gap-1 sm:gap-2 border border-slate-500/30 hover:border-green-500/50 backdrop-blur-sm hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/30 shadow-lg hover:shadow-green-500/20"
                disabled={isLookingUp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg sm:text-xl md:text-2xl">{food.emoji}</span>
                <span className="text-xs sm:text-sm font-medium text-center leading-tight">{food.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="relative">
            <div className="relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter food with quantity (e.g., 'chicken breast 150g', '2 eggs', '1 cup rice')"
                className="w-full p-3 sm:p-4 md:p-5 pl-10 sm:pl-12 md:pl-14 pr-4 sm:pr-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-2 border-slate-500/50 text-white placeholder-slate-300 text-sm sm:text-base md:text-lg font-medium focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 shadow-lg backdrop-blur-sm group-hover:shadow-green-500/10"
                id="nutrition-search-input"
                disabled={isLookingUp}
                maxLength={200}
              />
              <div className="absolute left-3 sm:left-4 md:left-5 top-1/2 transform -translate-y-1/2 text-green-400 text-base sm:text-lg md:text-xl">
                🔍
              </div>
            </div>
            <div className="text-xs sm:text-sm text-slate-300 mt-2 sm:mt-3 flex items-center gap-2">
              <span className="text-blue-400">💡</span>
              <span className="hidden sm:inline">Be specific with quantities for accurate nutrition data</span>
              <span className="sm:hidden">Be specific with quantities</span>
            </div>
          </div>
        
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-300 text-xs sm:text-sm bg-gradient-to-r from-red-600/20 to-red-700/20 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-red-500/30 backdrop-blur-sm flex items-center gap-2 sm:gap-3"
            >
              <span className="text-red-400 text-sm sm:text-lg">⚠️</span>
              <span>{error}</span>
            </motion.div>
          )}
        
          <motion.button
            type="submit"
            disabled={isLookingUp || !query.trim()}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 sm:py-4 md:py-5 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/30 shadow-2xl hover:shadow-green-500/20 text-sm sm:text-base md:text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLookingUp ? (
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border-2 sm:border-3 border-white border-t-transparent rounded-full"></div>
                <span className="hidden sm:inline">Analyzing nutrition...</span>
                <span className="sm:hidden">Analyzing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <span className="text-base sm:text-lg md:text-xl">🔍</span>
                <span className="hidden sm:inline">Lookup Nutrition</span>
                <span className="sm:hidden">Lookup</span>
              </div>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}