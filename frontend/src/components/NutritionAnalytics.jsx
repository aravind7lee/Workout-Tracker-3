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
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-blue-600 dark:text-blue-400';
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
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">📈</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                Nutrition Analytics
              </h3>
              <div className="text-sm text-light-text-muted dark:text-dark-text-muted">
                Advanced insights into your nutrition patterns
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-light-bg-primary dark:bg-dark-bg-primary border border-gray-300 dark:border-dark-border rounded-lg px-3 py-1.5 text-sm text-light-text-primary dark:text-dark-text-primary focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 transition-all"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className={`rounded-xl p-6 border ${getScoreBg(analytics.overallScore)}`}>
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(analytics.overallScore)} mb-2`}>
            {analytics.overallScore}%
          </div>
          <div className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
            Overall Nutrition Score
          </div>
          <div className="text-sm text-light-text-muted dark:text-dark-text-muted">
            Based on macro targets, timing, and consistency
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-xl">
          <div className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
            {analytics.proteinDensity}g
          </div>
          <div className="text-sm text-light-text-muted dark:text-dark-text-muted">Protein/1000cal</div>
          <div className="text-xs text-light-text-muted/70 dark:text-dark-text-muted/70">
            {analytics.proteinDensity >= 25 ? 'Excellent' : analytics.proteinDensity >= 20 ? 'Good' : 'Low'}
          </div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-xl">
          <div className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
            {analytics.avgMealSize}
          </div>
          <div className="text-sm text-light-text-muted dark:text-dark-text-muted">Avg Meal Size</div>
          <div className="text-xs text-light-text-muted/70 dark:text-dark-text-muted/70">
            ±{analytics.mealVariance} calories
          </div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-xl">
          <div className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
            {Math.round(analytics.calorieAccuracy)}%
          </div>
          <div className="text-sm text-light-text-muted dark:text-dark-text-muted">Calorie Accuracy</div>
          <div className="text-xs text-light-text-muted/70 dark:text-dark-text-muted/70">
            Macro vs Total
          </div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-xl">
          <div className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
            {analytics.mealTiming.total}
          </div>
          <div className="text-sm text-light-text-muted dark:text-dark-text-muted">Meals Today</div>
          <div className="text-xs text-light-text-muted/70 dark:text-dark-text-muted/70">
            {analytics.mealTiming.early} early, {analytics.mealTiming.late} late
          </div>
        </div>
      </div>

      {/* Macro Balance Breakdown */}
      <div className="bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-xl p-6">
        <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-4 flex items-center gap-2">
          <span>⚖️</span> Macro Balance Scores
        </h4>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(analytics.macroBalance.protein)}`}>
              {analytics.macroBalance.protein}%
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Protein</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(analytics.macroBalance.calories)}`}>
              {analytics.macroBalance.calories}%
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Calories</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(analytics.macroBalance.carbs)}`}>
              {analytics.macroBalance.carbs}%
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Carbs</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(analytics.macroBalance.fat)}`}>
              {analytics.macroBalance.fat}%
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400">Fat</div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-3">
        <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
          <span>🔍</span> Analytics Insights
        </h4>
        
        {insights.slice(0, showDetails ? insights.length : 3).map((insight, index) => (
          <motion.div
            key={`${insight.type}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border ${
              insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
              insight.type === 'good' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
              insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
              insight.type === 'alert' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
              'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{insight.icon}</span>
              <div>
                <h5 className="font-medium text-light-text-primary dark:text-dark-text-primary">
                  {insight.title}
                </h5>
                <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                  {insight.message}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
        
        {insights.length > 3 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline py-2"
          >
            {showDetails ? 'Show Less' : `Show ${insights.length - 3} More Insights`}
          </button>
        )}
      </div>

      {/* Trends */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-4 flex items-center gap-2">
          <span>📊</span> Trend Analysis
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`text-center p-3 rounded-lg ${analytics.trends.improving ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
            <div className="text-lg">{analytics.trends.improving ? '📈' : '📊'}</div>
            <div className="text-sm font-medium">
              {analytics.trends.improving ? 'Improving' : 'Stable'}
            </div>
          </div>
          
          <div className={`text-center p-3 rounded-lg ${analytics.trends.consistent ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
            <div className="text-lg">{analytics.trends.consistent ? '🎯' : '📊'}</div>
            <div className="text-sm font-medium">
              {analytics.trends.consistent ? 'Consistent' : 'Variable'}
            </div>
          </div>
          
          <div className={`text-center p-3 rounded-lg ${analytics.trends.balanced ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
            <div className="text-lg">{analytics.trends.balanced ? '⚖️' : '📊'}</div>
            <div className="text-sm font-medium">
              {analytics.trends.balanced ? 'Balanced' : 'Unbalanced'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionAnalytics;