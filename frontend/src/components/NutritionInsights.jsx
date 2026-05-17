import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NutritionInsights = ({ totals, targets, meals, customCalorieTarget }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Update time every minute for time-based recommendations
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const currentCalorieTarget = customCalorieTarget || targets.calories || 2000;
  
  // Advanced analytics
  const analytics = useMemo(() => {
    const hour = currentTime.getHours();
    const caloriesRemaining = Math.max(0, currentCalorieTarget - (totals.calories || 0));
    const proteinDeficit = Math.max(0, (targets.protein || 150) - (totals.protein || 0));
    const carbDeficit = Math.max(0, (targets.carbs || 250) - (totals.carbs || 0));
    const fatDeficit = Math.max(0, (targets.fat || 67) - (totals.fat || 0));
    
    // Meal timing analysis
    const mealTimes = meals.map(meal => new Date(meal.consumedAt || Date.now()).getHours());
    const lastMealTime = mealTimes.length > 0 ? Math.max(...mealTimes) : 0;
    const hoursSinceLastMeal = hour - lastMealTime;
    
    // Hydration estimate (basic)
    const estimatedHydration = meals.length * 250; // 250ml per meal assumption
    const hydrationGoal = 2500;
    
    return {
      caloriesRemaining,
      proteinDeficit,
      carbDeficit,
      fatDeficit,
      hoursSinceLastMeal,
      estimatedHydration,
      hydrationGoal,
      mealTiming: {
        breakfast: mealTimes.some(t => t >= 6 && t <= 10),
        lunch: mealTimes.some(t => t >= 11 && t <= 14),
        dinner: mealTimes.some(t => t >= 17 && t <= 21),
        snacks: mealTimes.filter(t => (t >= 15 && t <= 16) || (t >= 21 && t <= 23)).length
      },
      currentPeriod: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
    };
  }, [totals, targets, meals, currentCalorieTarget, currentTime]);

  // Smart recommendations based on current state
  const recommendations = useMemo(() => {
    const recs = [];
    const { caloriesRemaining, proteinDeficit, carbDeficit, fatDeficit, hoursSinceLastMeal, currentPeriod } = analytics;

    // Time-based recommendations
    if (currentPeriod === 'morning' && !analytics.mealTiming.breakfast) {
      recs.push({
        type: 'timing',
        priority: 'high',
        icon: '🌅',
        title: 'Start Your Day Right',
        message: 'Consider having breakfast to kickstart your metabolism and energy levels.',
        action: 'Add breakfast meal'
      });
    }

    if (currentPeriod === 'afternoon' && !analytics.mealTiming.lunch) {
      recs.push({
        type: 'timing',
        priority: 'high',
        icon: '🍽️',
        title: 'Lunch Time',
        message: 'It\'s time for lunch! Your body needs fuel to maintain energy through the afternoon.',
        action: 'Add lunch meal'
      });
    }

    // Macro-specific recommendations
    if (proteinDeficit > 20) {
      recs.push({
        type: 'macro',
        priority: 'high',
        icon: '💪',
        title: 'Protein Boost Needed',
        message: `You need ${Math.round(proteinDeficit)}g more protein. Try chicken, fish, eggs, or protein powder.`,
        action: 'Add protein source'
      });
    }

    if (caloriesRemaining > 500 && currentPeriod === 'evening') {
      recs.push({
        type: 'calories',
        priority: 'medium',
        icon: '🍎',
        title: 'Fuel Up',
        message: `You have ${Math.round(caloriesRemaining)} calories remaining. Consider a balanced snack.`,
        action: 'Add healthy snack'
      });
    }

    if (hoursSinceLastMeal > 4 && hoursSinceLastMeal < 24) {
      recs.push({
        type: 'timing',
        priority: 'medium',
        icon: '⏰',
        title: 'Time for a Meal',
        message: `It's been ${hoursSinceLastMeal} hours since your last meal. Consider eating something.`,
        action: 'Add meal or snack'
      });
    }

    // Hydration reminder
    if (analytics.estimatedHydration < analytics.hydrationGoal * 0.6) {
      recs.push({
        type: 'hydration',
        priority: 'medium',
        icon: '💧',
        title: 'Stay Hydrated',
        message: 'Don\'t forget to drink water! Aim for 8-10 glasses throughout the day.',
        action: 'Drink water'
      });
    }

    // Goal-specific recommendations
    if (targets.goalType === 'cut' && (totals.calories || 0) > currentCalorieTarget * 0.9) {
      recs.push({
        type: 'goal',
        priority: 'low',
        icon: '🎯',
        title: 'Cutting Goal',
        message: 'You\'re close to your calorie limit. Focus on protein and vegetables for remaining meals.',
        action: 'Choose low-cal options'
      });
    }

    if (targets.goalType === 'bulk' && caloriesRemaining > 300) {
      recs.push({
        type: 'goal',
        priority: 'medium',
        icon: '📈',
        title: 'Bulking Goal',
        message: 'You need more calories for your bulking goal. Add calorie-dense healthy foods.',
        action: 'Add calorie-dense foods'
      });
    }

    return recs.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [analytics, targets, totals, currentCalorieTarget]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'timing': return 'text-red-800 dark:text-red-600';
      case 'macro': return 'text-red-700 dark:text-red-500';
      case 'calories': return 'text-green-600 dark:text-red-500';
      case 'hydration': return 'text-red-700 dark:text-red-500';
      case 'goal': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Status */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🧠</span>
            </div>
            <div>
              <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                Smart Nutrition Assistant
              </h3>
              <div className="text-sm text-light-text-muted dark:text-dark-text-muted">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {analytics.currentPeriod}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="px-3 py-1.5 text-sm bg-red-600/10 text-red-700 dark:text-red-500 rounded-lg hover:bg-red-600/20 transition-all"
          >
            {showRecommendations ? 'Hide' : 'Show'} Tips
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-lg">
          <div className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
            {Math.round(analytics.caloriesRemaining)}
          </div>
          <div className="text-xs text-light-text-muted dark:text-dark-text-muted">Calories Left</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-lg">
          <div className="text-lg font-bold text-red-700 dark:text-red-500">
            {Math.round(analytics.proteinDeficit)}g
          </div>
          <div className="text-xs text-light-text-muted dark:text-dark-text-muted">Protein Needed</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-lg">
          <div className="text-lg font-bold text-red-700 dark:text-red-500">
            {Math.round((analytics.estimatedHydration / analytics.hydrationGoal) * 100)}%
          </div>
          <div className="text-xs text-light-text-muted dark:text-dark-text-muted">Hydration</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-lg">
          <div className="text-lg font-bold text-red-800 dark:text-red-600">
            {analytics.hoursSinceLastMeal > 24 ? '24+' : analytics.hoursSinceLastMeal}h
          </div>
          <div className="text-xs text-light-text-muted dark:text-dark-text-muted">Since Last Meal</div>
        </div>
      </div>

      {/* Smart Recommendations */}
      <AnimatePresence>
        {showRecommendations && recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
              <span>💡</span> Smart Recommendations
            </h4>
            
            {recommendations.slice(0, 3).map((rec, index) => (
              <motion.div
                key={`${rec.type}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{rec.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-light-text-primary dark:text-dark-text-primary">
                        {rec.title}
                      </h5>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(rec.type)} bg-current/10`}>
                        {rec.type}
                      </span>
                    </div>
                    <p className="text-sm text-light-text-muted dark:text-dark-text-muted mb-2">
                      {rec.message}
                    </p>
                    <button className={`text-xs font-medium ${getTypeColor(rec.type)} hover:underline`}>
                      {rec.action} →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {recommendations.length > 3 && (
              <div className="text-center">
                <button className="text-sm text-red-700 dark:text-red-500 hover:underline">
                  View {recommendations.length - 3} more recommendations
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meal Timing Overview */}
      <div className="bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-xl p-4">
        <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-3 flex items-center gap-2">
          <span>📅</span> Today's Meal Pattern
        </h4>
        <div className="grid grid-cols-4 gap-2">
          <div className={`text-center p-2 rounded-lg ${analytics.mealTiming.breakfast ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
            <div className="text-sm font-medium">Breakfast</div>
            <div className="text-xs">{analytics.mealTiming.breakfast ? '✅' : '⏳'}</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${analytics.mealTiming.lunch ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
            <div className="text-sm font-medium">Lunch</div>
            <div className="text-xs">{analytics.mealTiming.lunch ? '✅' : '⏳'}</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${analytics.mealTiming.dinner ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
            <div className="text-sm font-medium">Dinner</div>
            <div className="text-xs">{analytics.mealTiming.dinner ? '✅' : '⏳'}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            <div className="text-sm font-medium">Snacks</div>
            <div className="text-xs">{analytics.mealTiming.snacks}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionInsights;