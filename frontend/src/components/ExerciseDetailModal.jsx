import React, { useState, useEffect } from "react";
import { 
  X, Video, BookOpen, History, Calculator, Trophy, Dumbbell, 
  CheckCircle2, AlertCircle, Wind, Layers, Play, Loader2, ArrowRight
} from "lucide-react";
import api from "../utils/api";
import { getFormTips } from "../data/exerciseFormTips";

export default function ExerciseDetailModal({ exercise, currentPR, onClose, onStartWorkout, onQuickLog }) {
  const [activeTab, setActiveTab] = useState("guide"); // 'guide' | 'video' | 'history' | 'calc'
  
  // History state
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // 1RM Calculator state
  const [calcWeight, setCalcWeight] = useState(currentPR?.maxWeight ? String(currentPR.maxWeight) : "60");
  const [calcReps, setCalcReps] = useState(currentPR?.maxReps ? String(currentPR.maxReps) : "8");

  const formTips = getFormTips(exercise.name);

  // Fetch real workout history from MongoDB Atlas
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError("");
        const encoded = encodeURIComponent(exercise.name);
        const res = await api.get(`/workouts/exercise-history/${encoded}`);
        if (isMounted) {
          if (res.data?.success) {
            setHistoryData(res.data);
          } else {
            setHistoryData(null);
          }
        }
      } catch (err) {
        console.warn("Failed to load exercise history:", err);
        if (isMounted) setHistoryError("Could not load workout history.");
      } finally {
        if (isMounted) setHistoryLoading(false);
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [exercise.name]);

  // YouTube embed parser
  const getEmbedUrl = (url) => {
    if (!url) return "https://www.youtube.com/embed/rT7DgCr-3pg";
    if (url.includes("embed/")) return url;
    if (url.includes("watch?v=")) {
      const id = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return "https://www.youtube.com/embed/rT7DgCr-3pg";
  };

  // 1RM Brzycki Calculation
  const w = parseFloat(calcWeight) || 0;
  const r = parseInt(calcReps, 10) || 1;
  const estimated1RM = r === 1 ? w : Math.round(w * (36 / (37 - Math.min(r, 36))));

  const percentages = [
    { label: "100% (1RM)", pct: 1.0, reps: "1 rep", tag: "Max Effort" },
    { label: "95%", pct: 0.95, reps: "2 reps", tag: "Heavy Heavy" },
    { label: "90%", pct: 0.9, reps: "3-4 reps", tag: "Strength" },
    { label: "85%", pct: 0.85, reps: "5-6 reps", tag: "Power / Hypertrophy" },
    { label: "80%", pct: 0.8, reps: "7-8 reps", tag: "Hypertrophy Sweetspot" },
    { label: "75%", pct: 0.75, reps: "9-10 reps", tag: "Muscle Definition" },
    { label: "70%", pct: 0.7, reps: "11-12 reps", tag: "Endurance & Pump" },
    { label: "65%", pct: 0.65, reps: "13-15 reps", tag: "High Volume" },
  ];

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-neutral-800/80 pb-3 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 uppercase tracking-wider">
                {exercise.muscleName}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 capitalize">
                {exercise.type || "Compound"}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 capitalize">
                {exercise.difficulty || "All Levels"}
              </span>
              {currentPR?.maxWeight > 0 && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> PR: {currentPR.maxWeight} kg
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {exercise.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher - Responsive with No Word Wrapping */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-neutral-800 p-1 flex-shrink-0 gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("guide")}
            className={`flex-1 min-w-[70px] py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "guide"
                ? "bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Guide</span>
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`flex-1 min-w-[70px] py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "video"
                ? "bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Video className="w-3.5 h-3.5 shrink-0" />
            <span>Video</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 min-w-[80px] py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "history"
                ? "bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5 shrink-0" />
            <span>History ({historyData?.stats?.totalSessions || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("calc")}
            className={`flex-1 min-w-[70px] py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "calc"
                ? "bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Calculator className="w-3.5 h-3.5 shrink-0" />
            <span>1RM Calc</span>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* TAB 1: TECHNIQUE & FORM GUIDE */}
          {activeTab === "guide" && (
            <div className="space-y-4">
              {/* Target Specs Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
                  <span className="text-[9px] font-extrabold text-slate-400 dark:text-neutral-500 uppercase block">Equipment</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white capitalize">{exercise.equipment || "Barbell / Free Weight"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
                  <span className="text-[9px] font-extrabold text-slate-400 dark:text-neutral-500 uppercase block">Recommended Sets</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{exercise.sets || "3-4 Sets"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
                  <span className="text-[9px] font-extrabold text-slate-400 dark:text-neutral-500 uppercase block">Mechanics</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white capitalize">{exercise.type || "Compound"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
                  <span className="text-[9px] font-extrabold text-slate-400 dark:text-neutral-500 uppercase block">Primary Muscle</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{exercise.muscleName}</span>
                </div>
              </div>

              {/* Execution Form Tips */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Key Execution Cues & Form</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-neutral-300 pl-5 list-disc">
                  {formTips.formTips.map((tip, idx) => (
                    <li key={idx} className="leading-relaxed">{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Common Mistakes */}
              {formTips.commonMistakes && formTips.commonMistakes.length > 0 && (
                <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>Common Mistakes to Avoid</span>
                  </div>
                  <ul className="space-y-1 text-xs text-red-900 dark:text-neutral-300 pl-5 list-disc">
                    {formTips.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="leading-relaxed">{mistake}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Breathing & Rest Advice */}
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <Wind className="w-4 h-4 text-emerald-500" />
                  <span>Breathing & Mind-Muscle Cadence</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-neutral-300 leading-relaxed">
                  {formTips.breathingTip}
                </p>
                {formTips.restPeriodTip && (
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 italic">
                    Tip: {formTips.restPeriodTip}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: HD VIDEO GUIDE */}
          {activeTab === "video" && (
            <div className="space-y-3">
              <div className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden border border-slate-300 dark:border-neutral-800 bg-black shadow-lg">
                <iframe
                  src={getEmbedUrl(exercise.videoUrl)}
                  title={`${exercise.name} Technique Video`}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400 text-center">
                HD form walkthrough demonstrating setup, range of motion, and eccentric control.
              </p>
            </div>
          )}

          {/* TAB 3: REAL MONGO WORKOUT HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-3">
              {historyLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-neutral-500">
                  <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                  <span className="text-xs">Fetching personal history from MongoDB...</span>
                </div>
              ) : historyError ? (
                <div className="py-8 text-center text-xs text-red-500">
                  {historyError}
                </div>
              ) : !historyData || (historyData.history || []).length === 0 ? (
                <div className="py-10 text-center space-y-3 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
                  <Trophy className="w-8 h-8 text-slate-300 dark:text-neutral-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    No Recorded Sessions Yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
                    You haven't logged any sets for {exercise.name} yet. Quick log your first workout to start tracking your progressive overload!
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      if (onQuickLog) onQuickLog(exercise);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Quick Log First Set
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Lifetime Stat Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-neutral-500">Total Workouts</span>
                      <p className="text-base font-black text-slate-900 dark:text-white">{historyData.stats.totalSessions}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-neutral-500">Heaviest Weight</span>
                      <p className="text-base font-black text-red-600 dark:text-red-400">{historyData.stats.maxWeight} kg</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-neutral-500">Est. 1RM</span>
                      <p className="text-base font-black text-amber-500">{historyData.stats.estimated1RM} kg</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-neutral-500">Max Vol / Session</span>
                      <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{historyData.stats.maxVolume} kg</p>
                    </div>
                  </div>

                  {/* Past Session Logs List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">
                      Recent Workout Sessions
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {historyData.history.map((item, index) => (
                        <div
                          key={item.workoutId || index}
                          className="p-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800/80 rounded-xl space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {item.workoutTitle || "Workout Session"}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-neutral-400">
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {(item.sets || []).map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded bg-slate-200 dark:bg-neutral-800 text-[10px] font-bold text-slate-800 dark:text-neutral-200"
                              >
                                Set {sIdx + 1}: {s.weight}kg × {s.reps}
                              </span>
                            ))}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-neutral-500">
                            Session Total Volume: {item.totalVolume?.toLocaleString()} kg
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 1RM BRZYCKI CALCULATOR */}
          {activeTab === "calc" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  One-Rep Max Estimator (Brzycki Formula)
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase">Weight Lifted (kg)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 text-xs font-black rounded-lg bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase">Reps Completed</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={calcReps}
                      onChange={(e) => setCalcReps(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 text-xs font-black rounded-lg bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-red-600/10 to-amber-500/10 border border-red-500/20 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400">
                    Estimated 1-Rep Max
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {estimated1RM} kg
                  </div>
                </div>
              </div>

              {/* Percentage Breakdown */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                  Target Training Percentages
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {percentages.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{p.label}</span>
                        <span className="text-[9px] text-slate-500 dark:text-neutral-400">{p.tag}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-red-600 dark:text-red-400 block">
                          {Math.round(estimated1RM * p.pct)} kg
                        </span>
                        <span className="text-[9px] text-slate-400">{p.reps}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Launch Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-neutral-800/80 flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <button
            onClick={() => {
              onClose();
              if (onQuickLog) onQuickLog(exercise);
            }}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            Quick Log Set
          </button>
          <button
            onClick={() => {
              onClose();
              if (onStartWorkout) onStartWorkout(exercise);
            }}
            className="flex-1 py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start Training Session
          </button>
        </div>
      </div>
    </div>
  );
}
