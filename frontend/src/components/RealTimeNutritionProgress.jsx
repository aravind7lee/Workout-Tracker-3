import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RealTimeNutritionProgress = ({ 
  totals, 
  targets, 
  meals, 
  customCalorieTarget, 
  setCustomCalorieTarget 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('today');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Real-time calculations
  const currentCalorieTarget = customCalorieTarget || targets.calories || 2000;
  
  const progress = useMemo(() => ({
    calories: ((totals.calories || 0) / currentCalorieTarget) * 100,
    protein: ((totals.protein || 0) / (targets.protein || 150)) * 100,
    carbs: ((totals.carbs || 0) / (targets.carbs || 250)) * 100,
    fat: ((totals.fat || 0) / (targets.fat || 67)) * 100
  }), [totals, currentCalorieTarget, targets]);

  // Advanced metrics
  const metrics = useMemo(() => {
    const totalMacros = (totals.protein || 0) * 4 + (totals.carbs || 0) * 4 + (totals.fat || 0) * 9;
    const proteinCals = (totals.protein || 0) * 4;
    const carbCals = (totals.carbs || 0) * 4;
    const fatCals = (totals.fat || 0) * 9;

    return {
      macroDistribution: {
        protein: totalMacros > 0 ? (proteinCals / totalMacros) * 100 : 0,
        carbs: totalMacros > 0 ? (carbCals / totalMacros) * 100 : 0,
        fat: totalMacros > 0 ? (fatCals / totalMacros) * 100 : 0
      },
      caloriesRemaining: Math.max(0, currentCalorieTarget - (totals.calories || 0)),
      proteinPerKg: (totals.protein || 0) / 70, // Assuming 70kg body weight
      mealFrequency: meals.length,
      avgCaloriesPerMeal: meals.length > 0 ? (totals.calories || 0) / meals.length : 0,
      hydrationGoal: 2500, // ml
      currentHydration: 0 // This would come from hydration tracking
    };
  }, [totals, currentCalorieTarget, meals]);

  const getProgressColor = (percentage) => {
    if (percentage < 50) return 'from-red-500 to-red-600';
    if (percentage < 80) return 'from-yellow-500 to-orange-500';
    if (percentage <= 100) return 'from-green-500 to-emerald-600';
    return 'from-blue-500 to-indigo-600';
  };

  const getGoalGuidance = () => {
    const goalType = targets.goalType || 'maintain';
    const caloriesDiff = currentCalorieTarget - (totals.calories || 0);
    
    switch (goalType) {
      case 'cut':
        if (caloriesDiff > 200) return { 
          text: `${caloriesDiff} calories remaining - perfect for cutting!`, 
          color: 'text-green-400',
          icon: '🎯'
        };
        if (caloriesDiff > 0) return { 
          text: `${caloriesDiff} calories remaining - on track`, 
          color: 'text-yellow-400',
          icon: '⚡'
        };
        return { 
          text: `${Math.abs(caloriesDiff)} calories over target`, 
          color: 'text-red-400',
          icon: '⚠️'
        };
      
      case 'bulk':
        if (caloriesDiff < -200) return { 
          text: `${Math.abs(caloriesDiff)} calories over - excellent for bulking!`, 
          color: 'text-green-400',
          icon: '💪'
        };
        if (caloriesDiff < 0) return { 
          text: `${Math.abs(caloriesDiff)} calories over target`, 
          color: 'text-yellow-400',
          icon: '📈'
        };
        return { 
          text: `Need ${caloriesDiff} more calories for bulking`, 
          color: 'text-blue-400',
          icon: '🍽️'
        };
      
      case 'recomp':
        if (Math.abs(caloriesDiff) < 100) return { 
          text: 'Perfect for body recomposition!', 
          color: 'text-green-400',
          icon: '⚖️'
        };
        return { 
          text: `${Math.abs(caloriesDiff)} calories ${caloriesDiff > 0 ? 'under' : 'over'} target`, 
          color: 'text-yellow-400',
          icon: '🔄'
        };
      
      default:
        if (Math.abs(caloriesDiff) < 100) return { 
          text: 'Maintaining perfect calorie balance!', 
          color: 'text-green-400',
          icon: '✅'
        };
        return { 
          text: `${Math.abs(caloriesDiff)} calories ${caloriesDiff > 0 ? 'remaining' : 'over'}`, 
          color: 'text-blue-400',
          icon: '📊'
        };
    }
  };

  const guidance = getGoalGuidance();

  return (
    <div className="bg-light-bg-soft dark:bg-dark-bg-soft backdrop-blur-premium border border-gray-200 dark:border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-light-card dark:shadow-dark-card transition-all duration-300 hover:shadow-lg dark:hover:shadow-dark-glow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
            <span className="text-white text-base sm:text-lg">📊</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
              <span className="hidden sm:inline">Real-Time Nutrition Progress</span>
              <span className="sm:hidden">Nutrition Progress</span>
            </h3>
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="hidden sm:inline">Live tracking • {meals.length} meals today</span>
              <span className="sm:hidden">Live • {meals.length} meals</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md sm:rounded-lg hover:bg-blue-500/20 transition-all"
          >
            {showAdvanced ? 'Simple' : 'Advanced'}
          </button>
        </div>
      </div>

      {/* Goal Guidance */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-dark-bg-tertiary/30 dark:to-blue-900/20 rounded-lg sm:rounded-xl border border-gray-200 dark:border-dark-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-lg sm:text-2xl">{guidance.icon}</span>
            <div className={`font-medium text-sm sm:text-base ${guidance.color}`}>
              {guidance.text}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-light-text-muted dark:text-dark-text-muted">Target:</label>
            <select
              value={customCalorieTarget || targets.calories || 2000}
              onChange={(e) => setCustomCalorieTarget(parseInt(e.target.value))}
              className="bg-light-bg-primary dark:bg-dark-bg-primary border border-gray-300 dark:border-dark-border rounded px-2 py-1 text-xs sm:text-sm text-light-text-primary dark:text-dark-text-primary focus:border-blue-500 dark:focus:border-dark-accent focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-dark-accent/20 transition-all"
            >
              <option value={1600}>1600 cal</option>
              <option value={1800}>1800 cal</option>
              <option value={2000}>2000 cal</option>
              <option value={2200}>2200 cal</option>
              <option value={2300}>2300 cal</option>
              <option value={2500}>2500 cal</option>
              <option value={2800}>2800 cal</option>
              <option value={3000}>3000 cal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-4 sm:mb-6 p-1 bg-gray-100 dark:bg-dark-bg-tertiary/50 rounded-lg">
        {['overview', 'macros', 'insights'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-dark-bg-primary text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Main Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Calories */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-medium text-light-text-muted dark:text-dark-text-muted">Calories</span>
                  <span className="text-xs sm:text-sm font-bold text-light-text-primary dark:text-dark-text-primary">
                    {Math.round(totals.calories || 0)} / {currentCalorieTarget}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2 sm:h-3">
                    <motion.div 
                      className={`h-2 sm:h-3 rounded-full bg-gradient-to-r ${getProgressColor(progress.calories)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress.calories, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white drop-shadow-sm">
                      {Math.round(progress.calories)}%
                    </span>
                  </div>
                </div>
                <div className="text-xs text-center text-light-text-muted dark:text-dark-text-muted">
                  {metrics.caloriesRemaining} remaining
                </div>
              </div>

              {/* Protein */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">Protein</span>
                  <span className="text-xs sm:text-sm font-bold text-light-text-primary dark:text-dark-text-primary">
                    {Math.round((totals.protein || 0) * 10) / 10}g / {targets.protein || 150}g
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2 sm:h-3">
                    <motion.div 
                      className="h-2 sm:h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress.protein, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white drop-shadow-sm">
                      {Math.round(progress.protein)}%
                    </span>
                  </div>
                </div>
                <div className="text-xs text-center text-blue-600 dark:text-blue-400">
                  <span className="hidden sm:inline">{Math.round(metrics.proteinPerKg * 10) / 10}g/kg body weight</span>
                  <span className="sm:hidden">{Math.round(metrics.proteinPerKg * 10) / 10}g/kg</span>
                </div>
              </div>

              {/* Carbs */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">Carbs</span>
                  <span className="text-xs sm:text-sm font-bold text-light-text-primary dark:text-dark-text-primary">
                    {Math.round((totals.carbs || 0) * 10) / 10}g / {targets.carbs || 250}g
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2 sm:h-3">
                    <motion.div 
                      className="h-2 sm:h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress.carbs, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white drop-shadow-sm">
                      {Math.round(progress.carbs)}%
                    </span>
                  </div>
                </div>
                <div className="text-xs text-center text-green-600 dark:text-green-400">
                  Energy source
                </div>
              </div>

              {/* Fat */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-medium text-yellow-600 dark:text-yellow-400">Fat</span>
                  <span className="text-xs sm:text-sm font-bold text-light-text-primary dark:text-dark-text-primary">
                    {Math.round((totals.fat || 0) * 10) / 10}g / {targets.fat || 67}g
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2 sm:h-3">
                    <motion.div 
                      className="h-2 sm:h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress.fat, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white drop-shadow-sm">
                      {Math.round(progress.fat)}%
                    </span>
                  </div>
                </div>
                <div className="text-xs text-center text-yellow-600 dark:text-yellow-400">
                  Essential fats
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-lg">
                <div className="text-base sm:text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                  {metrics.mealFrequency}
                </div>
                <div className="text-xs text-light-text-muted dark:text-dark-text-muted">Meals Today</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-lg">
                <div className="text-base sm:text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                  {Math.round(metrics.avgCaloriesPerMeal)}
                </div>
                <div className="text-xs text-light-text-muted dark:text-dark-text-muted">
                  <span className="hidden sm:inline">Avg Cal/Meal</span>
                  <span className="sm:hidden">Avg/Meal</span>
                </div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-lg">
                <div className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                  {Math.round(metrics.macroDistribution.protein)}%
                </div>
                <div className="text-xs text-light-text-muted dark:text-dark-text-muted">Protein %</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-lg">
                <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                  {targets.goalType?.toUpperCase() || 'MAINTAIN'}
                </div>
                <div className="text-xs text-light-text-muted dark:text-dark-text-muted">Goal Type</div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'macros' && (
          <motion.div
            key="macros"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Macro Distribution Chart */}
            <div className="bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                Macro Distribution
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Protein</span>
                      <span className="text-sm font-bold">{Math.round(metrics.macroDistribution.protein)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2">
                      <motion.div 
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${metrics.macroDistribution.protein}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">Carbs</span>
                      <span className="text-sm font-bold">{Math.round(metrics.macroDistribution.carbs)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2">
                      <motion.div 
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${metrics.macroDistribution.carbs}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Fat</span>
                      <span className="text-sm font-bold">{Math.round(metrics.macroDistribution.fat)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2">
                      <motion.div 
                        className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${metrics.macroDistribution.fat}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Macro Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round((totals.protein || 0) * 4)}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Protein Calories</div>
                  <div className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
                    {Math.round(totals.protein || 0)}g × 4 cal/g
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.round((totals.carbs || 0) * 4)}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Carb Calories</div>
                  <div className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
                    {Math.round(totals.carbs || 0)}g × 4 cal/g
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {Math.round((totals.fat || 0) * 9)}
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Fat Calories</div>
                  <div className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
                    {Math.round(totals.fat || 0)}g × 9 cal/g
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* AI-Powered Insights */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                Smart Insights
              </h4>
              
              <div className="grid gap-4">
                {/* Protein Insight */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💪</span>
                    <div>
                      <div className="font-medium text-blue-700 dark:text-blue-300">Protein Status</div>
                      <div className="text-sm text-light-text-muted dark:text-dark-text-muted mt-1">
                        {progress.protein >= 100 
                          ? "Excellent! You've hit your protein target. Great for muscle maintenance and growth."
                          : progress.protein >= 80
                          ? `You're ${Math.round(100 - progress.protein)}% away from your protein goal. Consider adding lean protein sources.`
                          : "Low protein intake detected. Add protein-rich foods like chicken, fish, or legumes."
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calorie Balance Insight */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚖️</span>
                    <div>
                      <div className="font-medium text-green-700 dark:text-green-300">Calorie Balance</div>
                      <div className="text-sm text-light-text-muted dark:text-dark-text-muted mt-1">
                        {Math.abs(metrics.caloriesRemaining) < 100
                          ? "Perfect calorie balance! You're right on target for your goals."
                          : metrics.caloriesRemaining > 200
                          ? `You have ${metrics.caloriesRemaining} calories remaining. Consider a healthy snack.`
                          : "You're slightly over your calorie target. This is normal and okay occasionally."
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meal Timing Insight */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⏰</span>
                    <div>
                      <div className="font-medium text-purple-700 dark:text-purple-300">Meal Frequency</div>
                      <div className="text-sm text-light-text-muted dark:text-dark-text-muted mt-1">
                        {metrics.mealFrequency >= 4
                          ? "Great meal frequency! Regular eating helps maintain steady energy levels."
                          : metrics.mealFrequency >= 2
                          ? "Good meal frequency. Consider adding a healthy snack if you feel hungry."
                          : "Low meal frequency detected. Try to eat more regularly throughout the day."
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Macro Balance Insight */}
                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <div className="font-medium text-orange-700 dark:text-orange-300">Macro Balance</div>
                      <div className="text-sm text-light-text-muted dark:text-dark-text-muted mt-1">
                        {metrics.macroDistribution.protein >= 25
                          ? "Excellent protein ratio! This supports muscle maintenance and satiety."
                          : metrics.macroDistribution.protein >= 15
                          ? "Good protein ratio. Consider increasing slightly for better results."
                          : "Low protein ratio. Aim for 25-30% of calories from protein for optimal results."
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Trends */}
            <div className="bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                Today's Progress Summary
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-light-text-muted dark:text-dark-text-muted">Goal Achievement</span>
                  <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                    {Math.round((progress.calories + progress.protein + progress.carbs + progress.fat) / 4)}% Complete
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-light-text-muted dark:text-dark-text-muted">Best Macro</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {progress.protein >= Math.max(progress.carbs, progress.fat) ? 'Protein' :
                     progress.carbs >= progress.fat ? 'Carbs' : 'Fat'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-light-text-muted dark:text-dark-text-muted">Next Meal Suggestion</span>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {progress.protein < 80 ? 'High Protein' :
                     progress.carbs < 80 ? 'Complex Carbs' :
                     progress.fat < 80 ? 'Healthy Fats' : 'Balanced'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealTimeNutritionProgress;