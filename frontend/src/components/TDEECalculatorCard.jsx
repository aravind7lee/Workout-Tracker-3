import React, { useCallback, useEffect, useState } from 'react';
import { Calculator, RefreshCw, Utensils, Target, Flame, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { recalculateTDEE } from '../services/onboardingService';
import realTimeEvents from '../utils/realTimeEvents';

export default function TDEECalculatorCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [goal, setGoal] = useState('maintenance');

  const calculate = useCallback(async (targetGoal = goal) => {
    setLoading(true);
    setError('');
    try {
      const res = await recalculateTDEE({ goal: targetGoal });
      setData(res);

      const calculatedCalories = Math.round(res?.macros?.calories || res?.nutritionGoals?.dailyCalories || 0);
      const calculatedProtein = Math.round(res?.macros?.protein || res?.nutritionGoals?.dailyProtein || 150);
      const calculatedCarbs = Math.round(res?.macros?.carbs || res?.nutritionGoals?.dailyCarbs || 200);
      const calculatedFat = Math.round(res?.macros?.fat || res?.nutritionGoals?.dailyFat || 65);
      const currentGoal = res?.nutritionGoals?.goal || targetGoal;
      const normalizedGoalType = currentGoal === 'deficit' ? 'cut' : (currentGoal === 'maintenance' ? 'maintain' : currentGoal);

      // Dispatch real-time target update across the app
      realTimeEvents.dispatchTargetsUpdated({
        calories: calculatedCalories,
        baselineCalories: calculatedCalories,
        goalType: normalizedGoalType,
        protein: calculatedProtein,
        carbs: calculatedCarbs,
        fat: calculatedFat,
        bmr: Math.round(res?.bmr || 0),
        tdee: Math.round(res?.tdee || 0),
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Complete your fitness profile to calculate targets.');
    } finally {
      setLoading(false);
    }
  }, [goal]);

  useEffect(() => {
    calculate();
  }, []);

  const handleGoalChange = (newGoal) => {
    setGoal(newGoal);
    calculate(newGoal);
  };

  const calories = data?.macros?.calories || data?.nutritionGoals?.dailyCalories || 0;
  const currentGoal = data?.nutritionGoals?.goal || goal;
  const normalizedGoalType = currentGoal === 'deficit' ? 'cut' : (currentGoal === 'maintenance' ? 'maintain' : currentGoal);

  const goalDescriptions = {
    deficit: 'Deficit Target (-500 kcal)',
    maintenance: 'Maintenance Balance',
    bulk: 'Surplus Target (+500 kcal)',
  };

  const macros = [
    ['Protein', data?.macros?.protein || data?.nutritionGoals?.dailyProtein, '#ef4444'],
    ['Carbs', data?.macros?.carbs || data?.nutritionGoals?.dailyCarbs, '#f59e0b'],
    ['Fat', data?.macros?.fat || data?.nutritionGoals?.dailyFat, '#10b981'],
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="tdee-calculator-card rounded-3xl border border-gray-200 bg-white p-5 shadow-sm backdrop-blur-xl sm:p-6 dark:border-white/10 dark:bg-neutral-900/85 dark:shadow-2xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500/15 text-orange-500">
            <Calculator size={22} />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-orange-500">
              Personal fuel target
            </p>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              TDEE calculator
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Goal Switcher */}
          <div className="flex items-center rounded-xl bg-gray-100 p-1 dark:bg-neutral-800">
            {[
              { key: 'deficit', label: 'Cut', icon: Target },
              { key: 'maintenance', label: 'Maintain', icon: Scale },
              { key: 'bulk', label: 'Bulk', icon: Flame },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleGoalChange(key)}
                disabled={loading}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  currentGoal === key
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => calculate()}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Recalculate
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-orange-500/25 bg-orange-500/10 p-4 text-sm text-orange-600 dark:text-orange-300">
          {error}
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-[180px_1fr] items-center">
          {/* Calorie Target Dial */}
          <div
            className="relative mx-auto grid h-44 w-44 place-items-center rounded-full"
            style={{
              background: 'conic-gradient(#f97316 0 78%, rgba(200,200,200,0.3) 78% 100%)',
            }}
          >
            <div className="grid h-36 w-36 place-items-center rounded-full bg-white border border-gray-100 text-center shadow-inner dark:bg-neutral-950 dark:border-neutral-800">
              <div>
                <Utensils className="mx-auto mb-1 text-orange-500" size={18} />
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {loading ? '—' : Math.round(calories)}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                  kcal / day
                </p>
                <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  {normalizedGoalType}
                </span>
              </div>
            </div>
          </div>

          {/* Metrics & Breakdown */}
          <div className="grid content-center gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-200/80 bg-gray-50 p-3.5 dark:border-neutral-800/80 dark:bg-neutral-950/70">
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-medium">BMR (Basal Rate)</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">
                  {Math.round(data?.bmr || 0)} <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400">kcal</span>
                </p>
              </div>

              <div className="rounded-xl border border-gray-200/80 bg-gray-50 p-3.5 dark:border-neutral-800/80 dark:bg-neutral-950/70">
                <p className="text-xs text-gray-500 dark:text-neutral-400 font-medium">Maintenance TDEE</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">
                  {Math.round(data?.tdee || 0)} <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400">kcal</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {macros.map(([label, value, color]) => (
                <div
                  key={label}
                  className="rounded-xl border border-gray-200/80 bg-gray-50 p-3 dark:border-neutral-800 dark:bg-neutral-950/70"
                >
                  <span
                    className="mb-2 block h-1 rounded-full"
                    style={{ background: color }}
                  />
                  <p className="text-xs text-gray-500 dark:text-neutral-400 font-medium">{label}</p>
                  <p className="font-black text-gray-900 dark:text-white">
                    {Math.round(value || 0)}g
                  </p>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-gray-500 dark:text-neutral-400 flex items-center justify-between px-1">
              <span>Goal adjustment: <strong className="text-orange-500 capitalize">{goalDescriptions[currentGoal] || currentGoal}</strong></span>
              <span>Based on your profile metrics</span>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}
