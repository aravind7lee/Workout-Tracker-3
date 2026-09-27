// frontend/src/components/NutritionPreviewModal.jsx - ULTRA MODERN RESPONSIVE PORTAL MODAL
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sunrise, Sun, Moon, Popcorn, Zap, Dumbbell, X, Check, 
  Flame, Utensils, Plus, Minus, Scale, PieChart, Sparkles,
  Wheat, Droplet, Apple, ShieldCheck
} from "lucide-react";

const MEAL_PERIODS = [
  { id: "breakfast", label: "Breakfast", icon: Sunrise, time: "Morning" },
  { id: "lunch", label: "Lunch", icon: Sun, time: "Midday" },
  { id: "dinner", label: "Dinner", icon: Moon, time: "Evening" },
  { id: "pre-workout", label: "Pre-Workout", icon: Zap, time: "Energy" },
  { id: "post-workout", label: "Post-Workout", icon: Dumbbell, time: "Recovery" },
  { id: "snack", label: "Snack", icon: Popcorn, time: "Anytime" },
];

export default function NutritionPreviewModal({
  isOpen,
  onClose,
  nutritionItems,
  onConfirm,
  isAdding,
}) {
  const [selectedItem, setSelectedItem] = useState(0);
  const [customGrams, setCustomGrams] = useState("");
  const [mealType, setMealType] = useState("snack");
  const [mounted, setMounted] = useState(() => typeof document !== "undefined");

  // Client-side portal mounting check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset custom grams & selected index when modal opens or item changes
  useEffect(() => {
    if (isOpen) {
      setCustomGrams("");
      setSelectedItem(0);
      setMealType("snack");
    }
  }, [isOpen, nutritionItems]);

  // Lock body scroll when modal is open
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
      if (e.key === "Escape" && isOpen && !isAdding) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isAdding, onClose]);

  if (!mounted) {
    return null;
  }

  const currentItem = (nutritionItems && nutritionItems[selectedItem]) || (nutritionItems && nutritionItems[0]) || null;

  // Intelligently parse default serving grams from object or servingText (e.g. "100g", "150g")
  const parsedGramsFromText = (() => {
    if (currentItem && typeof currentItem.servingText === "string") {
      const match = currentItem.servingText.match(/(\d+)\s*g/i);
      if (match) return parseInt(match[1], 10);
    }
    return null;
  })();

  const baseServingGrams = currentItem?.servingGrams || parsedGramsFromText || 100;

  const safeCurrentItem = currentItem ? {
    name: currentItem.name || "Unknown Food",
    parsedName: currentItem.parsedName || currentItem.name || "Unknown Food",
    calories: currentItem.calories || 0,
    protein: currentItem.protein || 0,
    carbs: currentItem.carbs || 0,
    fat: currentItem.fat || 0,
    fiber: currentItem.fiber || 0,
    sugar: currentItem.sugar || 0,
    sodium: currentItem.sodium || 0,
    servingText: currentItem.servingText || `${baseServingGrams}g`,
    servingGrams: baseServingGrams,
    ...currentItem,
  } : null;

  const activeGrams = customGrams ? parseFloat(customGrams) || baseServingGrams : baseServingGrams;

  function scaleNutrition(item, targetGrams) {
    if (!item) return null;
    const baseGrams = item.servingGrams || 100;
    const scale = (targetGrams && targetGrams > 0) ? targetGrams / baseGrams : 1;
    return {
      ...item,
      servingText: `${targetGrams} g`,
      servingGrams: targetGrams,
      multiplier: scale,
      calories: Math.round((item.calories || 0) * scale),
      protein: Math.round((item.protein || 0) * scale * 10) / 10,
      carbs: Math.round((item.carbs || 0) * scale * 10) / 10,
      fat: Math.round((item.fat || 0) * scale * 10) / 10,
      fiber: Math.round((item.fiber || 0) * scale * 10) / 10,
      sugar: Math.round((item.sugar || 0) * scale * 10) / 10,
      sodium: Math.round((item.sodium || 0) * scale * 10) / 10,
    };
  }

  const displayItem = safeCurrentItem
    ? (customGrams ? scaleNutrition(safeCurrentItem, activeGrams) : safeCurrentItem)
    : null;

  // Portion Ratio Adjustments
  const applyMultiplier = (mult) => {
    const calculatedGrams = Math.round(baseServingGrams * mult);
    setCustomGrams(calculatedGrams.toString());
  };

  const adjustGrams = (delta) => {
    const current = customGrams ? parseFloat(customGrams) || baseServingGrams : baseServingGrams;
    const nextVal = Math.max(10, Math.min(2500, Math.round(current + delta)));
    setCustomGrams(nextVal.toString());
  };

  // Macro Calorie Distribution
  const proteinCals = displayItem ? (displayItem.protein || 0) * 4 : 0;
  const carbsCals = displayItem ? (displayItem.carbs || 0) * 4 : 0;
  const fatCals = displayItem ? (displayItem.fat || 0) * 9 : 0;
  const totalMacroCals = proteinCals + carbsCals + fatCals;

  const proteinPct = totalMacroCals > 0 ? Math.round((proteinCals / totalMacroCals) * 100) : 0;
  const carbsPct = totalMacroCals > 0 ? Math.round((carbsCals / totalMacroCals) * 100) : 0;
  const fatPct = totalMacroCals > 0 ? Math.max(0, 100 - proteinPct - carbsPct) : 0;

  const handleConfirm = () => {
    if (!displayItem) return;
    const finalItem = {
      ...displayItem,
      mealType,
      rawQuery:
        safeCurrentItem?.meta?.originalQuery ||
        safeCurrentItem?.parsedName ||
        safeCurrentItem?.name,
    };
    onConfirm(finalItem);
    onClose();
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && displayItem && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          {/* Backdrop Click Dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
            onClick={!isAdding ? onClose : undefined}
          />

          {/* Modal Window Container - Centered, Constrained, Fluid Responsive */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg mx-auto bg-white dark:bg-[#12161f] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden text-slate-900 dark:text-white z-10 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Header (Fixed at top) */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between gap-3 bg-white/95 dark:bg-[#12161f]/95 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-orange-500/25 shrink-0">
                  <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider block">
                    Nutrition Confirmation
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight truncate">
                    Confirm Nutrition & Log
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                disabled={isAdding}
                title="Close modal"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-colors shrink-0 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 overscroll-contain">
              
              {/* Multiple Item Selector (if searched multi-food) */}
              {nutritionItems && nutritionItems.length > 1 && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                    Select Item ({nutritionItems.length} matched):
                  </label>
                  <select
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-orange-500 shadow-sm"
                  >
                    {nutritionItems.map((item, index) => (
                      <option key={index} value={index}>
                        {item.parsedName || item.name || "Unknown Food"} ({item.servingText || "1 serving"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Food Identity & Macro Breakdown Hero Card */}
              <div className="rounded-2xl p-4 sm:p-5 bg-slate-50/80 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-white/5 space-y-3.5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-base sm:text-xl text-slate-900 dark:text-white capitalize leading-snug truncate">
                      {displayItem.parsedName || displayItem.name}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mt-0.5 flex items-center gap-1.5">
                      <span>Serving:</span>
                      <strong className="text-orange-600 dark:text-orange-400 font-mono">
                        {displayItem.servingText || `${displayItem.servingGrams}g`}
                      </strong>
                    </p>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-black text-xs sm:text-sm shrink-0 flex items-center gap-1.5 shadow-sm">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>{Math.round(displayItem.calories || 0)} kcal</span>
                  </div>
                </div>

                {/* 4 Responsive Macro Blocks */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
                  {/* Calories */}
                  <div className="bg-white dark:bg-neutral-900 p-2 sm:p-2.5 rounded-xl border border-orange-500/20 shadow-sm">
                    <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider block">
                      Calories
                    </span>
                    <div className="font-mono font-black text-sm sm:text-lg text-slate-900 dark:text-white mt-0.5">
                      {Math.round(displayItem.calories || 0)}
                    </div>
                  </div>

                  {/* Protein */}
                  <div className="bg-white dark:bg-neutral-900 p-2 sm:p-2.5 rounded-xl border border-rose-500/25 shadow-sm">
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider block">
                      Protein
                    </span>
                    <div className="font-mono font-black text-sm sm:text-lg text-rose-600 dark:text-rose-400 mt-0.5">
                      {Math.round((displayItem.protein || 0) * 10) / 10}g
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="bg-white dark:bg-neutral-900 p-2 sm:p-2.5 rounded-xl border border-amber-500/25 shadow-sm">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block">
                      Carbs
                    </span>
                    <div className="font-mono font-black text-sm sm:text-lg text-amber-600 dark:text-amber-400 mt-0.5">
                      {Math.round((displayItem.carbs || 0) * 10) / 10}g
                    </div>
                  </div>

                  {/* Fat */}
                  <div className="bg-white dark:bg-neutral-900 p-2 sm:p-2.5 rounded-xl border border-emerald-500/25 shadow-sm">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block">
                      Fat
                    </span>
                    <div className="font-mono font-black text-sm sm:text-lg text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {Math.round((displayItem.fat || 0) * 10) / 10}g
                    </div>
                  </div>
                </div>

                {/* Dynamic Macro Ratio Bar */}
                {totalMacroCals > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-slate-200/80 dark:border-white/5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase">
                      <span>Calorie Distribution</span>
                      <span className="tabular-nums">
                        P: {proteinPct}% • C: {carbsPct}% • F: {fatPct}%
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-neutral-800 overflow-hidden flex">
                      <div style={{ width: `${proteinPct}%` }} className="bg-rose-500 h-full transition-all duration-300" title={`Protein: ${proteinPct}%`} />
                      <div style={{ width: `${carbsPct}%` }} className="bg-amber-500 h-full transition-all duration-300" title={`Carbs: ${carbsPct}%`} />
                      <div style={{ width: `${fatPct}%` }} className="bg-emerald-500 h-full transition-all duration-300" title={`Fat: ${fatPct}%`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Serving & Quantity Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-orange-500" />
                    <span>Adjust Portion Size (Grams)</span>
                  </label>
                  {customGrams && (
                    <button
                      type="button"
                      onClick={() => setCustomGrams("")}
                      className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline font-bold"
                    >
                      Reset ({baseServingGrams}g)
                    </button>
                  )}
                </div>

                {/* Stepper + Input */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustGrams(-25)}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 flex items-center justify-center font-bold text-base transition-colors shrink-0 active:scale-95"
                    title="Decrease 25g"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={customGrams}
                      onChange={(e) => setCustomGrams(e.target.value)}
                      placeholder={baseServingGrams.toString()}
                      min="1"
                      max="3000"
                      className="w-full text-center h-10 px-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono font-black text-base focus:outline-none focus:border-orange-500 shadow-inner"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-neutral-500 pointer-events-none">
                      grams
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => adjustGrams(25)}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 flex items-center justify-center font-bold text-base transition-colors shrink-0 active:scale-95"
                    title="Increase 25g"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Multiplier Chips */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { label: "0.5x", mult: 0.5 },
                    { label: "1.0x", mult: 1.0 },
                    { label: "1.5x", mult: 1.5 },
                    { label: "2.0x", mult: 2.0 },
                  ].map((chip) => {
                    const isMatch = activeGrams === Math.round(baseServingGrams * chip.mult);
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => applyMultiplier(chip.mult)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                          isMatch
                            ? "bg-orange-600 text-white shadow-md shadow-orange-600/30 scale-105"
                            : "bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-600 dark:text-neutral-400"
                        }`}
                      >
                        {chip.label} ({Math.round(baseServingGrams * chip.mult)}g)
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visual Meal Period Tiles (Replaced native select) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">
                  Select Meal Period:
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MEAL_PERIODS.map((period) => {
                    const Icon = period.icon;
                    const isSelected = mealType === period.id;

                    return (
                      <button
                        key={period.id}
                        type="button"
                        onClick={() => setMealType(period.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all active:scale-95 ${
                          isSelected
                            ? "bg-orange-500/15 border-orange-500 text-slate-900 dark:text-white ring-1 ring-orange-500 shadow-sm"
                            : "bg-slate-50 dark:bg-neutral-900 border-slate-200 dark:border-white/5 text-slate-700 dark:text-neutral-300 hover:border-slate-300 dark:hover:border-neutral-700"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-orange-500 text-white"
                              : "bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs block leading-tight truncate">
                            {period.label}
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-neutral-500 block truncate">
                            {period.time}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Micronutrients Optional Strip */}
              {(displayItem.fiber > 0 || displayItem.sugar > 0 || displayItem.sodium > 0) && (
                <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-neutral-900/60 border border-slate-200 dark:border-white/5 text-[11px] text-slate-600 dark:text-neutral-400 flex items-center justify-around flex-wrap gap-2">
                  <span>🌾 Fiber: <strong className="text-slate-900 dark:text-white">{displayItem.fiber || 0}g</strong></span>
                  <span>🍬 Sugar: <strong className="text-slate-900 dark:text-white">{displayItem.sugar || 0}g</strong></span>
                  <span>🧂 Sodium: <strong className="text-slate-900 dark:text-white">{displayItem.sodium || 0}mg</strong></span>
                </div>
              )}

            </div>

            {/* 3. Action Buttons Footer (Fixed at bottom) */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/90 dark:bg-[#12161f]/95 flex gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isAdding}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isAdding}
                className="flex-[2] py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 active:scale-[0.99] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full shrink-0" />
                    <span>Adding to Diary...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3] shrink-0" />
                    <span>Confirm & Log Meal</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
