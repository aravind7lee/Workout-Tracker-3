import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NutritionAnalytics = ({ totals, targets, meals, customCalorieTarget }) => {
  const [timeframe, setTimeframe] = useState('today');
  const [showDetails, setShowDetails] = useState(false);
  const [historicalData, setHistoricalData] = useState([]);

  const currentCalorieTarget = customCalorieTarget || targets.calories || 2000;

  // Advanced analytics calculations
  const analytics = useMemo(() => {
    const totalMacroCalories = (totals.protein || 0) * 4 + (totals.carbs || 0) * 4 + (totals.fat || 0) * 9;
    const calorieAccuracy = totalMacroCalories > 0 ? ((totals.calories || 0) / totalMacroCalories) * 100 : 100;
    
    // Meal distribution analysis
    const mealCalories = meals.map(meal => meal.calories || 0);
    const avgMealSize = mealCalories.length > 0 ? mealCalories.reduce((a, b) => a + b, 0) / mealCalories.length : 0;
    const mealVariance = mealCalories.length > 1 ? 
      Math.sqrt(mealCalories.reduce((acc, cal) => acc + Math.pow(cal - avgMealSize, 2), 0) / mealCalories.length) : 0;

    // Nutrient density score (simplified)
    const proteinDensity = (totals.protein || 0) / Math.max(totals.calories || 1, 1) * 1000; // protein per 1000 calories
    const fiberDensity = (totals.fiber || 0) / Math.max(totals.calories || 1, 1) * 1000; // fiber per 1000 calories

    // Goal achievement score
    const proteinScore = Math.min(((totals.protein || 0) / (targets.protein || 150)) * 100, 100);
    const calorieScore = 100 - Math.abs(((totals.calories || 0) / currentCalorieTarget) * 100 - 100);
    const carbScore = Math.min(((totals.carbs || 0) / (targets.carbs || 200)) * 100, 100);
    const fatScore = Math.min(((totals.fat || 0) / (targets.fat || 65)) * 100, 100);
    const overallScore = (proteinScore + Math.max(calorieScore, 0) + carbScore + fatScore) / 4;

    // Timing analysis
    const mealTimes = meals.map(meal => new Date(meal.consumedAt || Date.now()).getHours());
    const earlyMeals = mealTimes.filter(hour => hour >= 6 && hour <= 10).length;
    const lateMeals = mealTimes.filter(hour => hour >= 20).length;

    return {
      calorieAccuracy: Math.min(calorieAccuracy, 120), // Cap at 120% for display
      avgMealSize: Math.round(avgMealSize),
      mealVariance: Math.round(mealVariance),
      proteinDensity: Math.round(proteinDensity * 10) / 10,
      fiberDensity: Math.round(fiberDensity * 10) / 10,
      overallScore: Math.round(overallScore),
      macroBalance: {
        protein: Math.round(proteinScore),
        calories: Math.round(Math.max(calorieScore, 0)),
        carbs: Math.round(carbScore),
        fat: Math.round(fatScore)
      },
      mealTiming: {
        early: earlyMeals,
        late: lateMeals,
        total: meals.length,
        distribution: mealTimes.length > 0 ? 'good' : 'poor'
      },
      trends: {
        improving: overallScore > 75,
        consistent: mealVariance < avgMealSize * 0.5,
        balanced: Math.abs(proteinScore - carbScore) < 20
      }
    };
  }, [totals, targets, meals, currentCalorieTarget]);

  // Generate insights based on analytics
  const insights = useMemo(() => {
    const insights = [];

    if (analytics.overallScore >= 90) {
      insights.push({
        type: 'success',
        icon: '🌟',
        title: 'Exceptional Day!',
        message: `Outstanding nutrition score of ${analytics.overallScore}%. You're crushing your goals!`,
        priority: 'high'
      });
    } else if (analytics.overallScore >= 75) {
      insights.push({
        type: 'good',
        icon: '👍',
        title: 'Great Progress',
        message: `Solid nutrition score of ${analytics.overallScore}%. Keep up the good work!`,
        priority: 'medium'
      });
    } else if (analytics.overallScore >= 50) {
      insights.push({
        type: 'warning',
        icon: '⚡',
        title: 'Room for Improvement',
        message: `Your score is ${analytics.overallScore}%. Focus on hitting your macro targets.`,
        priority: 'medium'
      });
    } else {
      insights.push({
        type: 'alert',
        icon: '🎯',
        title: 'Let\'s Improve',
        message: `Score: ${analytics.overallScore}%. Small changes can make a big difference!`,
        priority: 'high'
      });
    }

    if (analytics.proteinDensity < 25) {
      insights.push({
        type: 'tip',
        icon: '💪',
        title: 'Protein Density',
        message: 'Consider adding more protein-rich foods to increase protein density.',
        priority: 'low'
      });
    }

    if (analytics.mealTiming.late > 2) {
      insights.push({
        type: 'tip',
        icon: '🌙',
        title: 'Late Eating',
        message: 'Try to finish eating earlier in the evening for better digestion.',
        priority: 'low'
      });
    }

    if (analytics.trends.consistent) {
      insights.push({
        type: 'success',
        icon: '📊',
        title: 'Consistent Eating',
        message: 'Great job maintaining consistent meal sizes throughout the day!',
        priority: 'low'
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [analytics]);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-red-500';
    if (score >= 75) return 'text-red-700 dark:text-red-500';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (score >= 75) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    if (score >= 50) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
      {/* Analytics Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-indigo-200 dark:border-indigo-800 shadow-lg">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2.5 sm:gap-3 md:gap-4">
          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-red-800 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white text-base sm:text-lg md:text-xl">📈</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-light-text-primary dark:text-dark-text-primary uppercase tracking-wide leading-none">
                Nutrition Analytics
              </h3>
              <div className="text-[10px] sm:text-xs md:text-sm text-light-text-muted dark:text-dark-text-muted font-semibold mt-0.5">
                <span className="hidden sm:inline">Advanced insights into your nutrition patterns</span>
                <span className="sm:hidden">Advanced insights</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-light-bg-primary dark:bg-dark-bg-primary border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs md:text-sm text-light-text-primary dark:text-dark-text-primary focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 transition-all font-bold"
            >
              <option value="today">Today</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className={`rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 border shadow-xl ${getScoreBg(analytics.overallScore)}`}>
        <div className="text-center">
          <div className={`text-3xl sm:text-4xl md:text-5xl font-black ${getScoreColor(analytics.overallScore)} mb-1 sm:mb-2 leading-none`}>
            {analytics.overallScore}%
          </div>
          <div className="text-xs sm:text-sm md:text-base lg:text-lg font-black text-light-text-primary dark:text-dark-text-primary mb-0.5 sm:mb-1 uppercase tracking-wide">
            Overall Nutrition Score
          </div>
          <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-light-text-muted dark:text-dark-text-muted font-semibold">
            <span className="hidden sm:inline">Based on macro targets, timing, and consistency</span>
            <span className="sm:hidden">Macro targets & timing</span>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
        <div className="text-center p-2.5 sm:p-3 md:p-4 bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-lg sm:rounded-xl shadow-lg">
          <div className="text-base sm:text-lg md:text-xl font-black text-light-text-primary dark:text-dark-text-primary leading-none">
            {analytics.proteinDensity}g
          </div>
          <div className="text-[9px] sm:text-[10px] md:text-xs text-light-text-muted dark:text-dark-text-muted font-bold mt-1 uppercase tracking-wide">Protein/1000cal</div>
          <div className="text-[8px] sm:text-[9px] md:text-[10px] text-light-text-muted/70 dark:text-dark-text-muted/70 font-semibold mt-0.5">
            {analytics.proteinDensity >= 25 ? 'Excellent' : analytics.proteinDensity >= 20 ? 'Good' : 'Low'}
          </div>
        </div>
        
        <div className="text-center p-2.5 sm:p-3 md:p-4 bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-lg sm:rounded-xl shadow-lg">
          <div className="text-base sm:text-lg md:text-xl font-black text-light-text-primary dark:text-dark-text-primary leading-none">
            {analytics.avgMealSize}
          </div>
          <div className="text-[9px] sm:text-[10px] md:text-xs text-light-text-muted dark:text-dark-text-muted font-bold mt-1 uppercase tracking-wide">Avg Meal Size</div>
          <div className="text-[8px] sm:text-[9px] md:text-[10px] text-light-text-muted/70 dark:text-dark-text-muted/70 font-semibold mt-0.5">
            ±{analytics.mealVariance} calories
          </div>
        </div>
        
        <div className="text-center p-2.5 sm:p-3 md:p-4 bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-lg sm:rounded-xl shadow-lg">
          <div className="text-base sm:text-lg md:text-xl font-black text-light-text-primary dark:text-dark-text-primary leading-none">
            {Math.round(analytics.calorieAccuracy)}%
          </div>
          <div className="text-[9px] sm:text-[10px] md:text-xs text-light-text-muted dark:text-dark-text-muted font-bold mt-1 uppercase tracking-wide">Calorie Accuracy</div>
          <div className="text-[8px] sm:text-[9px] md:text-[10px] text-light-text-muted/70 dark:text-dark-text-muted/70 font-semibold mt-0.5">
            Macro vs Total
          </div>
        </div>
        
        <div className="text-center p-2.5 sm:p-3 md:p-4 bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-lg sm:rounded-xl shadow-lg">
          <div className="text-base sm:text-lg md:text-xl font-black text-light-text-primary dark:text-dark-text-primary leading-none">
            {analytics.mealTiming.total}
          </div>
          <div className="text-[9px] sm:text-[10px] md:text-xs text-light-text-muted dark:text-dark-text-muted font-bold mt-1 uppercase tracking-wide">Meals Today</div>
          <div className="text-[8px] sm:text-[9px] md:text-[10px] text-light-text-muted/70 dark:text-dark-text-muted/70 font-semibold mt-0.5">
            {analytics.mealTiming.early} early, {analytics.mealTiming.late} late
          </div>
        </div>
      </div>

      {/* Macro Balance Breakdown */}
      <div className="bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-lg">
        <h4 className="font-black text-xs sm:text-sm md:text-base text-light-text-primary dark:text-dark-text-primary mb-2.5 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2 uppercase tracking-wide">
          <span>⚖️</span> Macro Balance
        </h4>
        
        <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
          <div className="text-center p-2 sm:p-2.5 md:p-3 bg-white/50 dark:bg-neutral-900/50 rounded-lg shadow-md">
            <div className={`text-xl sm:text-2xl md:text-3xl font-black ${getScoreColor(analytics.macroBalance.protein)} leading-none`}>
              {analytics.macroBalance.protein}%
            </div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-red-700 dark:text-red-500 font-black mt-1 uppercase tracking-wider">Protein</div>
          </div>
          <div className="text-center p-2 sm:p-2.5 md:p-3 bg-white/50 dark:bg-neutral-900/50 rounded-lg shadow-md">
            <div className={`text-xl sm:text-2xl md:text-3xl font-black ${getScoreColor(analytics.macroBalance.calories)} leading-none`}>
              {analytics.macroBalance.calories}%
            </div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-green-600 dark:text-red-500 font-black mt-1 uppercase tracking-wider">Calories</div>
          </div>
          <div className="text-center p-2 sm:p-2.5 md:p-3 bg-white/50 dark:bg-neutral-900/50 rounded-lg shadow-md">
            <div className={`text-xl sm:text-2xl md:text-3xl font-black ${getScoreColor(analytics.macroBalance.carbs)} leading-none`}>
              {analytics.macroBalance.carbs}%
            </div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-yellow-600 dark:text-yellow-400 font-black mt-1 uppercase tracking-wider">Carbs</div>
          </div>
          <div className="text-center p-2 sm:p-2.5 md:p-3 bg-white/50 dark:bg-neutral-900/50 rounded-lg shadow-md">
            <div className={`text-xl sm:text-2xl md:text-3xl font-black ${getScoreColor(analytics.macroBalance.fat)} leading-none`}>
              {analytics.macroBalance.fat}%
            </div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-orange-600 dark:text-orange-400 font-black mt-1 uppercase tracking-wider">Fat</div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
        <h4 className="font-black text-xs sm:text-sm md:text-base text-light-text-primary dark:text-dark-text-primary flex items-center gap-1.5 sm:gap-2 uppercase tracking-wide">
          <span>🔍</span> Insights
        </h4>
        
        {insights.slice(0, showDetails ? insights.length : 3).map((insight, index) => (
          <motion.div
            key={`${insight.type}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border shadow-lg ${
              insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
              insight.type === 'good' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
              insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
              insight.type === 'alert' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
              'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
            }`}
          >
            <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
              <span className="text-lg sm:text-xl md:text-2xl flex-shrink-0">{insight.icon}</span>
              <div>
                <h5 className="font-black text-[10px] sm:text-xs md:text-sm text-light-text-primary dark:text-dark-text-primary uppercase tracking-wide leading-tight">
                  {insight.title}
                </h5>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-light-text-muted dark:text-dark-text-muted font-semibold mt-0.5">
                  {insight.message}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
        
        {insights.length > 3 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-center text-[10px] sm:text-xs md:text-sm text-indigo-600 dark:text-indigo-400 hover:underline py-1.5 sm:py-2 font-bold uppercase tracking-wide"
          >
            {showDetails ? 'Less' : `+${insights.length - 3} More`}
          </button>
        )}
      </div>

      {/* Trends */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/20 dark:to-blue-900/20 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
        <h4 className="font-black text-xs sm:text-sm md:text-base text-light-text-primary dark:text-dark-text-primary mb-2.5 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2 uppercase tracking-wide">
          <span>📊</span> Trends
        </h4>
        
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
          <div className={`text-center p-2 sm:p-2.5 md:p-3 rounded-lg shadow-md ${analytics.trends.improving ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
            <div className="text-base sm:text-lg md:text-xl">{analytics.trends.improving ? '📈' : '📊'}</div>
            <div className="text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-wider mt-0.5">
              {analytics.trends.improving ? 'Up' : 'Stable'}
            </div>
          </div>
          
          <div className={`text-center p-2 sm:p-2.5 md:p-3 rounded-lg shadow-md ${analytics.trends.consistent ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
            <div className="text-base sm:text-lg md:text-xl">{analytics.trends.consistent ? '🎯' : '📊'}</div>
            <div className="text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-wider mt-0.5">
              {analytics.trends.consistent ? 'Steady' : 'Variable'}
            </div>
          </div>
          
          <div className={`text-center p-2 sm:p-2.5 md:p-3 rounded-lg shadow-md ${analytics.trends.balanced ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
            <div className="text-base sm:text-lg md:text-xl">{analytics.trends.balanced ? '⚖️' : '📊'}</div>
            <div className="text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-wider mt-0.5">
              {analytics.trends.balanced ? 'Balanced' : 'Off'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionAnalytics;