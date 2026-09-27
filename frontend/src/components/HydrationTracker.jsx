import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Plus, Minus, CheckCircle2, Sparkles, RefreshCw, Settings, Trophy } from "lucide-react";

export default function HydrationTracker({
  waterIntake = 0,
  waterGoal = 3000,
  onLogWater,
  onUpdateGoal,
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState(waterGoal.toString());

  const percentage = Math.min(150, Math.round((waterIntake / Math.max(1, waterGoal)) * 100));
  const isGoalMet = waterIntake >= waterGoal;

  const quickButtons = [
    { label: "+250 ml", amount: 250, desc: "Glass" },
    { label: "+500 ml", amount: 500, desc: "Shaker" },
    { label: "+750 ml", amount: 750, desc: "Gym Bottle" },
    { label: "+1000 ml", amount: 1000, desc: "Jug" },
  ];

  const handleSaveGoal = (e) => {
    e.preventDefault();
    const g = parseInt(customGoalInput, 10);
    if (g && g >= 500 && g <= 10000) {
      onUpdateGoal?.(g);
      setShowSettings(false);
    }
  };

  const getStatusMessage = () => {
    if (percentage >= 100) {
      return {
        text: "Hydration target unlocked! Peak cellular volume & endurance active.",
        color: "text-cyan-600 dark:text-cyan-400",
      };
    }
    if (percentage >= 70) {
      return {
        text: "Optimal fueling pace. Excellent nutrient transport & muscular recovery.",
        color: "text-emerald-600 dark:text-emerald-400",
      };
    }
    if (percentage >= 35) {
      return {
        text: "Steady hydration progress. Keep sipping to maximize training pump.",
        color: "text-blue-600 dark:text-blue-400",
      };
    }
    return {
      text: "Dehydration reduces lifting power by up to 15%. Log your next glass now!",
      color: "text-amber-600 dark:text-amber-400",
    };
  };

  const status = getStatusMessage();

  return (
    <motion.section
      id="hydration-tracker-section"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="hydration-tracker-card rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gradient-to-br dark:from-neutral-900/95 dark:via-neutral-900/90 dark:to-neutral-950 p-4 sm:p-6 shadow-sm dark:shadow-2xl relative overflow-hidden backdrop-blur-xl text-gray-900 dark:text-white transition-colors"
    >
      {/* Ambient water glow */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 shrink-0">
            <Droplets className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                Hydration Tracker
              </h3>
              {isGoalMet && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-cyan-500" /> Goal Hit
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              Live water intake & athletic fluid balance
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setCustomGoalInput(waterGoal.toString());
            setShowSettings(!showSettings);
          }}
          className="p-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
          title="Adjust Water Target"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Set Goal</span>
        </button>
      </div>

      {/* Goal Setting Drawer */}
      <AnimatePresence>
        {showSettings && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSaveGoal}
            className="mb-4 p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-950/80 border border-cyan-500/30 flex flex-wrap items-center gap-2 relative z-10"
          >
            <span className="text-xs font-bold text-gray-700 dark:text-neutral-300">Daily Water Target (ml):</span>
            <input
              type="number"
              min="500"
              max="10000"
              step="100"
              value={customGoalInput}
              onChange={(e) => setCustomGoalInput(e.target.value)}
              className="w-28 px-2.5 py-1 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="px-2.5 py-1 rounded-lg bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 text-xs hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Main Hydration Stats & Visual Progress Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center mb-5 relative z-10">
        
        {/* Metric summary */}
        <div className="md:col-span-4 bg-gray-50 dark:bg-neutral-950/60 border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-[10px] font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-widest mb-1">
            Current Water Volume
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white font-mono tracking-tight">
              {waterIntake.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">/ {waterGoal.toLocaleString()} ml</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-neutral-400 pt-2 border-t border-gray-200 dark:border-white/5">
            <span>Progress: <strong className="text-gray-900 dark:text-white">{percentage}%</strong></span>
            <span>Remaining: <strong className="text-cyan-600 dark:text-cyan-300">{Math.max(0, waterGoal - waterIntake)} ml</strong></span>
          </div>
        </div>

        {/* Dynamic Water Tube Progress Bar */}
        <div className="md:col-span-8 space-y-2">
          <div className="h-6 w-full bg-gray-100 dark:bg-neutral-950 border border-gray-200 dark:border-white/10 rounded-full p-1 relative overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, percentage)}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] relative"
            >
              {/* Subtle water wave shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </motion.div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-neutral-400 px-1">
            <span>0 ml</span>
            <span>{Math.round(waterGoal * 0.5).toLocaleString()} ml (50%)</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">{waterGoal.toLocaleString()} ml (Goal)</span>
          </div>
        </div>
      </div>

      {/* Quick Add Water Buttons */}
      <div className="space-y-2 relative z-10">
        <div className="text-[10px] font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-cyan-500" />
          <span>One-Tap Hydration Log:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {quickButtons.map((btn) => (
            <button
              key={btn.amount}
              onClick={() => onLogWater?.(btn.amount)}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 hover:bg-cyan-50 dark:bg-white/[0.03] dark:hover:bg-cyan-500/15 dark:hover:border-cyan-500/40 text-left transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400 mb-1">
                <span className="text-xs font-black group-hover:translate-x-0.5 transition-transform">
                  {btn.label}
                </span>
                <Plus className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
              </div>
              <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-medium">{btn.desc}</span>
            </button>
          ))}

          {/* Undo Button */}
          <button
            onClick={() => onLogWater?.(-250)}
            disabled={waterIntake <= 0}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 hover:bg-red-50 dark:bg-white/[0.02] dark:hover:bg-red-500/10 dark:hover:border-red-500/30 text-left transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-red-500 dark:text-red-400 mb-1">
              <span className="text-xs font-black">-250 ml</span>
              <Minus className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
            </div>
            <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-medium">Undo Glass</span>
          </button>
        </div>
      </div>

      {/* Real-Time Bio-Status Tip */}
      <div className="mt-4 pt-3.5 border-t border-gray-200 dark:border-white/5 flex items-center gap-2 text-xs relative z-10">
        <Droplets className="w-4 h-4 text-cyan-500 shrink-0" />
        <span className={status.color}>{status.text}</span>
      </div>
    </motion.section>
  );
}
