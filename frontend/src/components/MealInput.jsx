// frontend/src/components/MealInput.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Egg, Drumstick, Salad, Banana, Apple, Soup, Fish, Milk, 
  Zap, Search, Lightbulb, AlertTriangle, ArrowRight, Sparkles 
} from 'lucide-react';

export default function MealInput({ onLookup, isLookingUp, error }) {
  const [query, setQuery] = useState("");

  const quickAddFoods = [
    { name: "2 eggs", icon: <Egg className="w-4 h-4 text-amber-400" /> },
    { name: "chicken 100g", icon: <Drumstick className="w-4 h-4 text-orange-400" /> },
    { name: "1 cup rice", icon: <Salad className="w-4 h-4 text-emerald-400" /> },
    { name: "banana", icon: <Banana className="w-4 h-4 text-yellow-400" /> },
    { name: "apple", icon: <Apple className="w-4 h-4 text-red-400" /> },
    { name: "1 cup oats", icon: <Soup className="w-4 h-4 text-amber-300" /> },
    { name: "salmon 100g", icon: <Fish className="w-4 h-4 text-rose-400" /> },
    { name: "greek yogurt", icon: <Milk className="w-4 h-4 text-blue-400" /> },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLookingUp) return;
    try {
      await onLookup(query.trim());
      setQuery("");
    } catch (err) {
      console.error("MealInput lookup failed:", err);
    }
  };

  const quickAdd = async (foodName) => {
    if (isLookingUp) return;
    try {
      await onLookup(foodName);
      setQuery("");
    } catch (err) {
      console.error("Quick add failed:", err);
      setQuery(foodName);
    }
  };

  return (
    <motion.div
      data-meal-input="true"
      className="nutrition-tracker-card relative overflow-hidden bg-white dark:bg-neutral-900/90 border border-gray-200 dark:border-neutral-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 md:p-6 shadow-sm dark:shadow-xl space-y-3.5 sm:space-y-4"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500/10 border border-orange-500/30 rounded-lg sm:rounded-xl flex items-center justify-center text-orange-500 shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-wide">
              Smart Meal & Food Search
            </h3>
            <p className="text-[9px] sm:text-xs text-gray-500 dark:text-neutral-400">
              Natural language food tracking with instant macro breakdown
            </p>
          </div>
        </div>
      </div>

      {/* Quick Add Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-orange-400" />
          <span>Quick Add Popular Foods:</span>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5 sm:gap-2">
          {quickAddFoods.map((food) => (
            <button
              key={food.name}
              onClick={() => quickAdd(food.name)}
              disabled={isLookingUp}
              className="p-2 sm:p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-orange-500/40 rounded-lg sm:rounded-xl text-gray-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:border-neutral-800 dark:text-white flex items-center gap-1.5 transition-all active:scale-95 text-left disabled:opacity-50"
            >
              <div className="shrink-0">{food.icon}</div>
              <span className="text-[10px] sm:text-xs font-semibold truncate capitalize">
                {food.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 200g chicken breast with 1 cup brown rice"
            className="w-full bg-white dark:bg-neutral-950 border border-gray-300 dark:border-neutral-800 rounded-xl pl-9 sm:pl-10 pr-24 sm:pr-28 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors shadow-inner"
            disabled={isLookingUp}
            id="nutrition-search-input"
            maxLength={200}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500">
            <Search className="w-4 h-4" />
          </div>

          <button
            type="submit"
            disabled={isLookingUp || !query.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold text-[10px] sm:text-xs rounded-lg shadow-md flex items-center gap-1 transition-all uppercase tracking-wider"
          >
            {isLookingUp ? (
              <span className="animate-pulse">Searching...</span>
            ) : (
              <>
                <span>Lookup</span>
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </button>
        </div>

        {/* Tip / Feedback */}
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-neutral-400 px-1">
          <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
          <span>Tip: Specify amounts (e.g., &apos;100g&apos;, &apos;2 cups&apos;, &apos;1 tbsp&apos;) for accurate macros.</span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-[10px] sm:text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>
    </motion.div>
  );
}
