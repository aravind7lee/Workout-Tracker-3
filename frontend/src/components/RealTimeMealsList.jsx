import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, Trash2, Copy, Coffee, Sun, Moon, Zap, Dumbbell, 
  Sparkles, Clock, AlertTriangle, Check 
} from "lucide-react";

export default function RealTimeMealsList({
  meals = [],
  isLoading = false,
  onDeleteMeal,
  onDuplicateMeal,
}) {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);

  const handleDelete = async (mealId) => {
    if (!mealId) return;
    try {
      setDeletingId(mealId);
      await onDeleteMeal(mealId);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleDuplicate = async (meal) => {
    const mId = meal._id || meal.id;
    try {
      setDuplicatingId(mId);
      await onDuplicateMeal?.(meal);
    } catch (err) {
      console.error("Duplicate failed:", err);
    } finally {
      setDuplicatingId(null);
    }
  };

  // Group meals by period
  const periods = [
    { key: "breakfast", label: "Breakfast", icon: Coffee, color: "text-amber-400" },
    { key: "lunch", label: "Lunch", icon: Sun, color: "text-orange-400" },
    { key: "dinner", label: "Dinner", icon: Moon, color: "text-purple-400" },
    { key: "pre-workout", label: "Pre-Workout Fuel", icon: Zap, color: "text-yellow-400" },
    { key: "post-workout", label: "Post-Workout Anabolism", icon: Dumbbell, color: "text-blue-400" },
    { key: "snack", label: "Snacks & Drinks", icon: Sparkles, color: "text-emerald-400" },
  ];

  const grouped = periods.map((period) => {
    const periodMeals = meals.filter((m) => {
      const type = (m.mealType || "snack").toLowerCase();
      if (period.key === "snack") {
        return type === "snack" || !periods.some((p) => p.key === type);
      }
      return type === period.key;
    });

    const cals = periodMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
    const protein = periodMeals.reduce((acc, m) => acc + (m.protein || 0), 0);

    return {
      ...period,
      meals: periodMeals,
      cals: Math.round(cals),
      protein: Math.round(protein * 10) / 10,
    };
  });

  const totalLoggedMeals = meals.length;

  return (
    <div className="meals-list-card rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-900/90 p-4 sm:p-6 shadow-sm dark:shadow-xl backdrop-blur-xl space-y-5 text-gray-900 dark:text-white transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 dark:text-orange-400 shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <span>Today&apos;s Meal Log</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-mono font-bold">
                {totalLoggedMeals}
              </span>
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400">
              Chronological nutrition logs with macro subtotals
            </p>
          </div>
        </div>

        {totalLoggedMeals > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active</span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && totalLoggedMeals === 0 && (
        <div className="space-y-3 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && totalLoggedMeals === 0 && (
        <div className="text-center py-10 sm:py-12 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-neutral-500">
            <Utensils className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white">No meals logged for this date</h4>
            <p className="text-xs text-gray-500 dark:text-neutral-400 max-w-sm mx-auto mt-1">
              Search for ingredients, pick from quick-add foods, or tap &quot;Fast Macros&quot; above to log your intake!
            </p>
          </div>
        </div>
      )}

      {/* Grouped Meal Sections */}
      {totalLoggedMeals > 0 && (
        <div className="space-y-5">
          {grouped
            .filter((g) => g.meals.length > 0)
            .map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.key} className="space-y-2.5">
                  {/* Period Header */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <GroupIcon className={`w-4 h-4 ${group.color}`} />
                      <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                        {group.label}
                      </h4>
                      <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-mono">
                        ({group.meals.length})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono font-bold">
                      <span className="text-orange-500 dark:text-orange-400">{group.cals} kcal</span>
                      <span className="text-gray-300 dark:text-neutral-600">•</span>
                      <span className="text-blue-500 dark:text-blue-400">{group.protein}g protein</span>
                    </div>
                  </div>

                  {/* Meals List for this Period */}
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {group.meals.map((meal) => {
                        const mId = meal._id || meal.id;
                        const isConfirmingDelete = confirmDeleteId === mId;
                        const isDeletingThis = deletingId === mId;
                        const isDuplicatingThis = duplicatingId === mId;

                        const timeString = meal.consumedAt
                          ? new Date(meal.consumedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "";

                        return (
                          <motion.div
                            key={mId}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-3 sm:p-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-neutral-950/70 hover:bg-gray-100/80 dark:hover:bg-neutral-950 hover:border-orange-500/30 dark:hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                          >
                            {/* Meal Info */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate capitalize">
                                  {meal.name}
                                </h5>
                                {timeString && (
                                  <span className="text-[10px] text-gray-500 dark:text-neutral-500 flex items-center gap-0.5 font-mono">
                                    <Clock className="w-2.5 h-2.5" />
                                    {timeString}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-neutral-400 truncate">
                                {meal.servingText || "1 serving"}
                              </p>
                            </div>

                            {/* Macros & Actions */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              {/* Macro Pills */}
                              <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold">
                                <span className="px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-bold">
                                  {Math.round(meal.calories || 0)} kcal
                                </span>
                                <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                  {Math.round(meal.protein || 0)}g P
                                </span>
                                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                  {Math.round(meal.carbs || 0)}g C
                                </span>
                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  {Math.round(meal.fat || 0)}g F
                                </span>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-1">
                                {/* Duplicate / Eat Again */}
                                <button
                                  type="button"
                                  onClick={() => handleDuplicate(meal)}
                                  disabled={isDuplicatingThis}
                                  className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                  title="Eat Again / Duplicate"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete / Confirm Delete */}
                                {isConfirmingDelete ? (
                                  <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/60 border border-red-500/40 p-0.5 rounded-lg">
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(mId)}
                                      disabled={isDeletingThis}
                                      className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] rounded transition-colors"
                                    >
                                      {isDeletingThis ? "..." : "Delete"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="px-1.5 py-0.5 text-[10px] text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(mId)}
                                    className="p-1.5 rounded-lg border border-gray-200 dark:border-white/5 hover:border-red-500/30 bg-gray-100/60 dark:bg-white/[0.02] hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    title="Delete Meal"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
