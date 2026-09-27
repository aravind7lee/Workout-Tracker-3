import React, { useState } from "react";
import { 
  Dumbbell, Plus, Trash2, Trophy, Flame, Check, Loader2, X, Clock, Zap
} from "lucide-react";
import api from "../utils/api";
import { PRService } from "../services/prService";
import { useAuth } from "../context/AuthContext";

export default function QuickLogExerciseModal({ exercise, currentPR, onClose, onLogged }) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [sets, setSets] = useState([
    { id: 1, weight: currentPR?.maxWeight ? String(currentPR.maxWeight) : "20", reps: "10", rpe: "8", rest: "60" }
  ]);

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    setSets((prev) => [
      ...prev,
      {
        id: Date.now(),
        weight: lastSet ? lastSet.weight : "20",
        reps: lastSet ? lastSet.reps : "10",
        rpe: lastSet ? lastSet.rpe : "8",
        rest: "60"
      }
    ]);
  };

  const removeSet = (index) => {
    if (sets.length <= 1) return;
    setSets((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSet = (index, field, value) => {
    setSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  // Check if any set sets a new weight record
  const maxEnteredWeight = Math.max(...sets.map((s) => parseFloat(s.weight) || 0), 0);
  const isNewPR = currentPR?.maxWeight ? maxEnteredWeight > currentPR.maxWeight : maxEnteredWeight > 0;
  const totalVolume = sets.reduce(
    (acc, s) => acc + (parseFloat(s.weight) || 0) * (parseInt(s.reps, 10) || 0),
    0
  );

  const handleSaveWorkout = async () => {
    if (sets.length === 0) {
      setErrorMsg("Please add at least one set.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const formattedSets = sets.map((s, idx) => ({
        setNumber: idx + 1,
        weight: parseFloat(s.weight) || 0,
        reps: parseInt(s.reps, 10) || 0,
        rest: parseInt(s.rest, 10) || 60,
        rpe: parseFloat(s.rpe) || 8,
        completed: true
      }));

      const payload = {
        title: `Quick Log: ${exercise.name}`,
        exercises: [
          {
            exerciseName: exercise.name,
            sets: formattedSets
          }
        ],
        durationMinutes: Math.max(5, sets.length * 2),
        totalVolume: totalVolume,
        completed: true,
        date: new Date().toISOString()
      };

      const res = await api.post("/workouts", payload);

      if (res.data?.success || res.status === 200 || res.status === 201) {
        setSuccessMsg(isNewPR ? "🔥 BOOM! New Personal Record Logged!" : "Workout set logged successfully!");

        // Refresh authoritative PRs in background
        const updatedPRs = await PRService.fetchUserPRsFromAPI();

        // Dispatch app-wide event
        window.dispatchEvent(
          new CustomEvent("workoutLogged", {
            detail: { exerciseName: exercise.name, totalVolume, isNewPR }
          })
        );

        setTimeout(() => {
          if (onLogged) onLogged(updatedPRs);
          onClose();
        }, 1200);
      } else {
        throw new Error(res.data?.message || "Failed to log workout");
      }
    } catch (err) {
      console.error("Quick log error:", err);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to save workout set");
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
            <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                Instant Set Logger
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                Log {exercise.name}
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

        {/* PR & Stats Header Strip */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-neutral-400 block">
                Current Best PR
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {currentPR?.maxWeight ? `${currentPR.maxWeight} kg × ${currentPR.maxReps || 0} reps` : "No PR logged yet"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-neutral-400 block">
              Session Volume
            </span>
            <span className="text-xs font-black text-orange-600 dark:text-orange-400">
              {totalVolume.toLocaleString()} kg
            </span>
          </div>
        </div>

        {/* Aura New PR Alert */}
        {isNewPR && (
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/50 flex items-center gap-2 animate-pulse">
            <Flame className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs font-black text-amber-700 dark:text-amber-300">
              Aura Mode Active: Beating your previous best of {currentPR?.maxWeight || 0} kg!
            </span>
          </div>
        )}

        {/* Success / Error Messages */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-xl text-red-800 dark:text-red-300 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Sets Table */}
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-1 text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase px-1">
            <span className="col-span-2 text-center">Set</span>
            <span className="col-span-3 text-center">Kg</span>
            <span className="col-span-3 text-center">Reps</span>
            <span className="col-span-2 text-center">RPE</span>
            <span className="col-span-2 text-center">Del</span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {sets.map((set, index) => (
              <div
                key={set.id}
                className="grid grid-cols-12 gap-1.5 items-center p-1.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800"
              >
                <span className="col-span-2 text-center text-xs font-black text-slate-700 dark:text-neutral-300">
                  #{index + 1}
                </span>

                <div className="col-span-3">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={set.weight}
                    onChange={(e) => updateSet(index, "weight", e.target.value)}
                    className="w-full text-center h-8 sm:h-9 py-1 text-xs sm:text-sm font-black rounded-lg bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="col-span-3">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={set.reps}
                    onChange={(e) => updateSet(index, "reps", e.target.value)}
                    className="w-full text-center h-8 sm:h-9 py-1 text-xs sm:text-sm font-black rounded-lg bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={set.rpe}
                    onChange={(e) => updateSet(index, "rpe", e.target.value)}
                    className="w-full text-center h-8 sm:h-9 py-1 text-xs sm:text-sm font-bold rounded-lg bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="col-span-2 flex justify-center">
                  <button
                    onClick={() => removeSet(index)}
                    disabled={sets.length === 1}
                    className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addSet}
            className="w-full py-2 border border-dashed border-slate-300 dark:border-neutral-700 hover:border-slate-400 dark:hover:border-neutral-500 rounded-xl text-xs font-bold text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Another Set
          </button>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            disabled={submitting}
            onClick={handleSaveWorkout}
            className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging into MongoDB...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                Log Exercise & Update Records
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
