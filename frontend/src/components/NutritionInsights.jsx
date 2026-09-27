import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sunrise, Utensils, BicepsFlexed, Apple, Clock, Droplets, 
  Target, TrendingUp, Brain, Lightbulb, Sparkles, AlertCircle, ChevronDown, ChevronUp 
} from 'lucide-react';

export default function NutritionInsights({
  totals = {},
  targets = {},
  meals = [],
  customCalorieTarget,
  waterIntake = 0,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentCalorieTarget = customCalorieTarget || targets.calories || 2000;
  const currentProteinTarget = targets.protein || 150;
  const currentCarbTarget = targets.carbs || 200;
  const currentFatTarget = targets.fat || 65;

  const analytics = useMemo(() => {
    const hour = currentTime.getHours();
    const caloriesRemaining = Math.max(0, currentCalorieTarget - (totals.calories || 0));
    const proteinDeficit = Math.max(0, currentProteinTarget - (totals.protein || 0));
    const carbDeficit = Math.max(0, currentCarbTarget - (totals.carbs || 0));
    const fatDeficit = Math.max(0, currentFatTarget - (totals.fat || 0));

    // Meal timing analysis
    const hasMeals = Array.isArray(meals) && meals.length > 0;
    let hoursSinceLastMeal = null;
    let lastMealTimeLabel = "None yet";

    if (hasMeals) {
      const timestamps = meals.map((m) => new Date(m.consumedAt || Date.now()).getTime());
      const latestTime = Math.max(...timestamps);
      const diffMs = Math.max(0, Date.now() - latestTime);
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      hoursSinceLastMeal = diffHours;
      lastMealTimeLabel = `${diffHours}h`;
    }

    const currentPeriod = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

    return {
      caloriesRemaining,
      proteinDeficit,
      carbDeficit,
      fatDeficit,
      hasMeals,
      hoursSinceLastMeal,
      lastMealTimeLabel,
      currentPeriod,
    };
  }, [totals, targets, meals, currentCalorieTarget, currentProteinTarget, currentCarbTarget, currentFatTarget, currentTime]);

  const recommendations = useMemo(() => {
    const recs = [];
    const {
      caloriesRemaining,
      proteinDeficit,
      carbDeficit,
      fatDeficit,
      hasMeals,
      hoursSinceLastMeal,
      currentPeriod,
    } = analytics;

    // 1. First meal / morning recommendation
    if (!hasMeals) {
      recs.push({
        type: "timing",
        priority: "high",
        icon: <Sunrise className="w-5 h-5 text-amber-500" />,
        title: "Kickstart Muscle Protein Synthesis",
        message: "No meals logged yet today. Start with high-protein fuel (eggs, oats, Greek yogurt, or a protein shake) to ignite energy.",
        accent: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-300",
      });
    }

    // 2. Protein Deficit Warning
    if (proteinDeficit > 25) {
      recs.push({
        type: "macro",
        priority: "high",
        icon: <BicepsFlexed className="w-5 h-5 text-rose-500" />,
        title: "Protein Threshold Deficit",
        message: `You need ${Math.round(proteinDeficit)}g more protein to hit optimal muscle repair targets. Consider chicken breast, canned tuna, or whey isolate.`,
        accent: "border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-300",
      });
    }

    // 3. Evening Calorie Deficit
    if (caloriesRemaining > 400 && currentPeriod === "evening") {
      recs.push({
        type: "calories",
        priority: "medium",
        icon: <Apple className="w-5 h-5 text-emerald-500" />,
        title: "Sufficient Energy Budget Remaining",
        message: `You have ${Math.round(caloriesRemaining)} kcal left. Add a nutrient-dense dinner with complex carbs to replenish glycogen before tomorrow's workout.`,
        accent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300",
      });
    }

    // 4. Time Since Last Meal (only if meals have actually been logged)
    if (hasMeals && hoursSinceLastMeal !== null && hoursSinceLastMeal >= 4) {
      recs.push({
        type: "timing",
        priority: "medium",
        icon: <Clock className="w-5 h-5 text-blue-500" />,
        title: "Anabolic Window Refueling",
        message: `It has been ${hoursSinceLastMeal} hours since your last meal. An amino acid boost or balanced snack will sustain anti-catabolic signaling.`,
        accent: "border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-300",
      });
    }

    // 5. Hydration Check
    if (waterIntake < 1500) {
      recs.push({
        type: "hydration",
        priority: "medium",
        icon: <Droplets className="w-5 h-5 text-cyan-500" />,
        title: "Intracellular Hydration Alert",
        message: "Water volume is currently below 1.5L. Drink a large shaker of water to maintain intramuscular pump and cognitive alertness.",
        accent: "border-cyan-500/30 bg-cyan-500/10 text-cyan-900 dark:text-cyan-300",
      });
    }

    return recs;
  }, [analytics, waterIntake]);

  return (
    <div className="nutrition-insights-card rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-900/90 p-4 sm:p-6 shadow-sm dark:shadow-xl backdrop-blur-xl space-y-4 sm:space-y-6 text-gray-900 dark:text-white transition-colors">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-red-600/25 shrink-0">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
              <span>Smart Nutrition Assistant</span>
            </h3>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400">
              <span className="font-mono">{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              <span>•</span>
              <span className="capitalize text-orange-600 dark:text-orange-400 font-semibold">{analytics.currentPeriod}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowRecommendations(!showRecommendations)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-neutral-300 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          {showRecommendations ? "Hide" : "Show"} Tips
          {showRecommendations ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 4 Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Calories Left */}
        <div className="bg-gray-50 dark:bg-neutral-950/70 border border-gray-200 dark:border-white/5 rounded-xl p-3 text-center">
          <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-mono">
            {Math.round(analytics.caloriesRemaining)}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400 font-medium mt-0.5">
            Calories Left
          </div>
        </div>

        {/* Protein Needed */}
        <div className="bg-gray-50 dark:bg-neutral-950/70 border border-gray-200 dark:border-white/5 rounded-xl p-3 text-center">
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {Math.round(analytics.proteinDeficit)}g
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400 font-medium mt-0.5">
            Protein Needed
          </div>
        </div>

        {/* Hydration */}
        <div className="bg-gray-50 dark:bg-neutral-950/70 border border-gray-200 dark:border-white/5 rounded-xl p-3 text-center">
          <div className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
            {waterIntake.toLocaleString()}ml
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400 font-medium mt-0.5">
            Water Logged
          </div>
        </div>

        {/* Since Last Meal */}
        <div className="bg-gray-50 dark:bg-neutral-950/70 border border-gray-200 dark:border-white/5 rounded-xl p-3 text-center">
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {analytics.hasMeals ? analytics.lastMealTimeLabel : "0h"}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400 font-medium mt-0.5">
            {analytics.hasMeals ? "Since Last Meal" : "Awaiting 1st Meal"}
          </div>
        </div>
      </div>

      {/* Recommendations Cards */}
      <AnimatePresence>
        {showRecommendations && recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2.5"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Smart Athletic Recommendations:</span>
            </div>

            <div className="space-y-2">
              {recommendations.slice(0, 3).map((rec, index) => (
                <motion.div
                  key={`${rec.title}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3.5 rounded-xl border ${rec.accent} flex items-start gap-3 backdrop-blur-md`}
                >
                  <div className="shrink-0 mt-0.5">{rec.icon}</div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                      {rec.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-gray-700 dark:text-neutral-300 mt-0.5 leading-relaxed">
                      {rec.message}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
