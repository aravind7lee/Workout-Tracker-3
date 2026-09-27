import React, { useState, useEffect } from "react";
import { FolderPlus, Plus, Check, Loader2, Dumbbell, Sparkles, X } from "lucide-react";
import { onlineService } from "../services/onlineService";
import { useAuth } from "../context/AuthContext";

export default function LibraryPlanModal({ exercise, onClose, onSaved }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("existing"); // 'existing' | 'new'
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Plan customization options
  const [customSets, setCustomSets] = useState("3");
  const [customReps, setCustomReps] = useState("10");
  const [customWeight, setCustomWeight] = useState("20");

  // New plan fields
  const [newPlanName, setNewPlanName] = useState(`${exercise?.name || "Workout"} Plan`);
  const [newPlanDescription, setNewPlanDescription] = useState(`Built around ${exercise?.name || "exercises"}`);
  const [newPlanDifficulty, setNewPlanDifficulty] = useState("intermediate");

  // Load user's real plans from MongoDB
  useEffect(() => {
    let isMounted = true;
    const loadPlans = async () => {
      try {
        setLoading(true);
        const userPlans = await onlineService.getWorkoutPlans();
        if (isMounted) {
          setPlans(userPlans || []);
          if (userPlans && userPlans.length > 0) {
            setSelectedPlanId(userPlans[0]._id || userPlans[0].id);
          } else {
            setActiveTab("new");
          }
        }
      } catch (err) {
        console.error("Failed to load plans from backend:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToExistingPlan = async () => {
    if (!selectedPlanId) {
      setErrorMessage("Please select a target plan.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const planToUpdate = plans.find(
        (p) => (p._id || p.id).toString() === selectedPlanId.toString()
      );

      if (!planToUpdate) {
        throw new Error("Selected plan not found");
      }

      // Check if already in plan
      const existingExercises = planToUpdate.exercises || [];
      const alreadyExists = existingExercises.some(
        (ex) =>
          ex.name?.toLowerCase() === exercise.name?.toLowerCase() ||
          (ex.id && ex.id === exercise.id)
      );

      const exerciseData = {
        name: exercise.name,
        sets: `${customSets} sets`,
        reps: `${customReps} reps`,
        weight: `${customWeight} kg`,
        category: exercise.muscleName || exercise.category || "General",
        muscle: exercise.muscleName || "Full Body",
        difficulty: exercise.difficulty || "intermediate",
        notes: `Added from Exercise Library`
      };

      let updatedExercises;
      if (alreadyExists) {
        // Update the existing exercise in the plan
        updatedExercises = existingExercises.map((ex) =>
          ex.name?.toLowerCase() === exercise.name?.toLowerCase()
            ? { ...ex, ...exerciseData }
            : ex
        );
      } else {
        updatedExercises = [...existingExercises, exerciseData];
      }

      const updatedPayload = {
        ...planToUpdate,
        exercises: updatedExercises,
        updatedAt: new Date().toISOString()
      };

      const result = await onlineService.updateWorkoutPlan(
        planToUpdate._id || planToUpdate.id,
        updatedPayload
      );

      setSuccessMessage(`Added "${exercise.name}" to ${planToUpdate.name}!`);

      // Trigger app-wide sync events
      window.dispatchEvent(
        new CustomEvent("planUpdated", {
          detail: { planId: planToUpdate._id || planToUpdate.id, plan: result || updatedPayload }
        })
      );

      setTimeout(() => {
        if (onSaved) onSaved(result || updatedPayload);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Error adding exercise to plan:", err);
      setErrorMessage(err.message || "Failed to update plan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateNewPlan = async () => {
    if (!newPlanName.trim()) {
      setErrorMessage("Please enter a name for the new plan.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const newPlanPayload = {
        name: newPlanName.trim(),
        description: newPlanDescription.trim(),
        category: exercise.muscleName || "General",
        metadata: {
          difficulty: newPlanDifficulty,
          createdBy: user?.name || "Athlete",
          targetMuscleGroups: [exercise.muscleName || "General"]
        },
        exercises: [
          {
            name: exercise.name,
            sets: `${customSets} sets`,
            reps: `${customReps} reps`,
            weight: `${customWeight} kg`,
            category: exercise.muscleName || "General",
            muscle: exercise.muscleName || "Full Body",
            difficulty: exercise.difficulty || "intermediate",
            notes: "Created from Exercise Library"
          }
        ]
      };

      const createdPlan = await onlineService.saveWorkoutPlan(newPlanPayload);

      setSuccessMessage(`Created plan "${newPlanName}" with ${exercise.name}!`);

      window.dispatchEvent(
        new CustomEvent("planCreated", {
          detail: { plan: createdPlan || newPlanPayload }
        })
      );

      setTimeout(() => {
        if (onSaved) onSaved(createdPlan);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Error creating plan:", err);
      setErrorMessage(err.message || "Failed to create new plan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-neutral-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                Workout Routine Builder
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                Add to Workout Plan
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Exercise Summary Card */}
        <div className="p-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold uppercase text-orange-500">
              {exercise?.muscleName} • {exercise?.type || "Compound"}
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {exercise?.name}
            </h4>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 capitalize">
            {exercise?.difficulty || "All Levels"}
          </span>
        </div>

        {/* Custom Targets: Sets, Reps, Weight */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-neutral-300">
            Target Workout Volume
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[9px] font-bold text-slate-500 dark:text-neutral-400 uppercase">Sets</span>
              <input
                type="number"
                min="1"
                max="20"
                value={customSets}
                onChange={(e) => setCustomSets(e.target.value)}
                className="w-full mt-0.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-500 dark:text-neutral-400 uppercase">Reps / Set</span>
              <input
                type="number"
                min="1"
                max="100"
                value={customReps}
                onChange={(e) => setCustomReps(e.target.value)}
                className="w-full mt-0.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-500 dark:text-neutral-400 uppercase">Weight (kg)</span>
              <input
                type="number"
                min="0"
                max="500"
                step="0.5"
                value={customWeight}
                onChange={(e) => setCustomWeight(e.target.value)}
                className="w-full mt-0.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-neutral-800 p-1">
          <button
            onClick={() => setActiveTab("existing")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "existing"
                ? "bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            Existing Plan ({plans.length})
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "new"
                ? "bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Create New Plan
          </button>
        </div>

        {/* Success or Error Banners */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-xl text-red-800 dark:text-red-300 text-xs font-bold">
            {errorMessage}
          </div>
        )}

        {/* Tab 1: Existing Plans */}
        {activeTab === "existing" && (
          <div className="space-y-3">
            {loading ? (
              <div className="py-6 flex flex-col items-center justify-center text-slate-400 dark:text-neutral-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                <span className="text-xs">Loading plans from MongoDB...</span>
              </div>
            ) : plans.length === 0 ? (
              <div className="py-6 text-center space-y-2 bg-slate-50 dark:bg-neutral-950 rounded-xl border border-slate-200 dark:border-neutral-800 p-4">
                <p className="text-xs text-slate-600 dark:text-neutral-400">
                  You don't have any saved workout plans in your account yet.
                </p>
                <button
                  onClick={() => setActiveTab("new")}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-500 text-white"
                >
                  Create Your First Plan
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {plans.map((plan) => {
                  const planId = plan._id || plan.id;
                  const isSelected = selectedPlanId.toString() === planId.toString();
                  const exCount = (plan.exercises || []).length;

                  return (
                    <div
                      key={planId}
                      onClick={() => setSelectedPlanId(planId)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-orange-500/10 dark:bg-orange-500/15 border-orange-500 text-orange-950 dark:text-white"
                          : "bg-slate-50 dark:bg-neutral-950 border-slate-200 dark:border-neutral-800/80 hover:border-slate-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {plan.name}
                        </h5>
                        <p className="text-[10px] text-slate-500 dark:text-neutral-400">
                          {exCount} exercise{exCount === 1 ? "" : "s"} • {plan.category || "Routine"}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-orange-500 bg-orange-500 text-white"
                            : "border-slate-300 dark:border-neutral-700"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              disabled={submitting || plans.length === 0}
              onClick={handleAddToExistingPlan}
              className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving to Routine...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Add to Selected Plan
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab 2: Create New Plan */}
        {activeTab === "new" && (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-neutral-300 uppercase">
                Plan Name
              </label>
              <input
                type="text"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                placeholder="e.g. Chest & Triceps Hypertrophy"
                className="w-full mt-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-neutral-300 uppercase">
                Plan Description (Optional)
              </label>
              <input
                type="text"
                value={newPlanDescription}
                onChange={(e) => setNewPlanDescription(e.target.value)}
                placeholder="e.g. 4-day split focus on chest growth"
                className="w-full mt-1 px-3 py-2 text-xs font-medium rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-neutral-300 uppercase">
                Difficulty
              </label>
              <select
                value={newPlanDifficulty}
                onChange={(e) => setNewPlanDifficulty(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <button
              disabled={submitting}
              onClick={handleCreateNewPlan}
              className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating in MongoDB...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Plan & Save Exercise
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
