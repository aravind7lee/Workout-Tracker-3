import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Sparkles, Check, Calculator, Dumbbell, Coffee, Sun, Moon } from "lucide-react";

export default function FastMacroModal({ isOpen, onClose, onAddMeal }) {
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState("snack");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [fiber, setFiber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !submitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen || !mounted) return null;

  const mealTypes = [
    { key: "breakfast", label: "Breakfast", icon: Coffee },
    { key: "lunch", label: "Lunch", icon: Sun },
    { key: "dinner", label: "Dinner", icon: Moon },
    { key: "pre-workout", label: "Pre-Workout", icon: Zap },
    { key: "post-workout", label: "Post-Workout", icon: Dumbbell },
    { key: "snack", label: "Snack", icon: Sparkles },
  ];

  // Calculated kcal from macros: P*4 + C*4 + F*9
  const pNum = parseFloat(protein) || 0;
  const cNum = parseFloat(carbs) || 0;
  const fNum = parseFloat(fat) || 0;
  const calculatedCals = Math.round(pNum * 4 + cNum * 4 + fNum * 9);

  const handleAutoFillCalories = () => {
    if (calculatedCals > 0) {
      setCalories(calculatedCals.toString());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const finalName = name.trim() || "Custom Meal";
    const finalCals = parseFloat(calories) || calculatedCals;

    if (!finalCals && !pNum && !cNum && !fNum) {
      setError("Please enter at least calories or protein/carbs/fat.");
      return;
    }

    try {
      setSubmitting(true);
      await onAddMeal({
        name: finalName,
        mealType,
        calories: finalCals,
        protein: pNum,
        carbs: cNum,
        fat: fNum,
        fiber: parseFloat(fiber) || 0,
        servingText: "1 custom portion",
        source: "fast-macro",
      });

      // Reset & close
      setName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setFiber("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to log meal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      {/* Backdrop Click Dismiss */}
      <div 
        className="fixed inset-0" 
        onClick={!submitting ? onClose : undefined} 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg mx-auto bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl overflow-y-auto max-h-[92vh] sm:max-h-[88vh] text-gray-900 dark:text-white transition-colors z-10 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                Fast Macro Log
              </h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400">
                Log home meals & custom macros directly
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Meal Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300 mb-1">
              Food / Meal Name
            </label>
            <input
              type="text"
              placeholder="e.g. Whey Shake, Steak & Sweet Potato"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-neutral-950 border border-gray-300 dark:border-neutral-800 rounded-xl text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:border-orange-500 font-medium"
              autoFocus
            />
          </div>

          {/* Meal Category */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300 mb-1.5">
              Meal Period
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {mealTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = mealType === type.key;
                return (
                  <button
                    type="button"
                    key={type.key}
                    onClick={() => setMealType(type.key)}
                    className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? "bg-orange-500/15 border-orange-500 text-orange-600 dark:text-orange-400 shadow-sm"
                        : "bg-gray-50 hover:bg-gray-100 dark:bg-neutral-950/70 border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] truncate">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Macro Inputs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Calories */}
            <div className="bg-gray-50 dark:bg-neutral-950/80 p-2.5 rounded-xl border border-gray-200 dark:border-neutral-800">
              <label className="block text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                placeholder={calculatedCals > 0 ? calculatedCals.toString() : "0"}
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-transparent text-gray-900 dark:text-white font-mono font-bold text-base focus:outline-none"
              />
            </div>

            {/* Protein */}
            <div className="bg-gray-50 dark:bg-neutral-950/80 p-2.5 rounded-xl border border-gray-200 dark:border-neutral-800">
              <label className="block text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                placeholder="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full bg-transparent text-gray-900 dark:text-white font-mono font-bold text-base focus:outline-none"
              />
            </div>

            {/* Carbs */}
            <div className="bg-gray-50 dark:bg-neutral-950/80 p-2.5 rounded-xl border border-gray-200 dark:border-neutral-800">
              <label className="block text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                placeholder="0"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full bg-transparent text-gray-900 dark:text-white font-mono font-bold text-base focus:outline-none"
              />
            </div>

            {/* Fat */}
            <div className="bg-gray-50 dark:bg-neutral-950/80 p-2.5 rounded-xl border border-gray-200 dark:border-neutral-800">
              <label className="block text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                Fat (g)
              </label>
              <input
                type="number"
                placeholder="0"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full bg-transparent text-gray-900 dark:text-white font-mono font-bold text-base focus:outline-none"
              />
            </div>
          </div>

          {/* Calorie Calculator Helper */}
          {calculatedCals > 0 && !calories && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs">
              <span className="text-gray-700 dark:text-neutral-300">
                Calculated from macros: <strong className="text-orange-600 dark:text-orange-400 font-mono">{calculatedCals} kcal</strong>
              </span>
              <button
                type="button"
                onClick={handleAutoFillCalories}
                className="px-2 py-0.5 rounded-md bg-orange-500 text-white font-bold text-[10px] hover:bg-orange-600 transition-colors"
              >
                Use Calculated
              </button>
            </div>
          )}

          {/* Submit & Cancel */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? "Logging..." : "Log Meal"}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
