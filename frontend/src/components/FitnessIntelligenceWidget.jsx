import React, { useState, useEffect } from 'react';
import { 
  Zap, TrendingUp, AlertTriangle, Layers, Calendar, ChevronRight, 
  ArrowUpRight, Info, CheckCircle2, ShieldAlert, Dumbbell, Play, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function FitnessIntelligenceWidget() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntelligence();
  }, []);

  const fetchIntelligence = async () => {
    setLoading(true);
    try {
      const res = await api.get('/intelligence/recommendations');
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.warn('Failed to load fitness intelligence:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-neutral-900/80 border border-white/[0.08] rounded-3xl animate-pulse space-y-4">
        <div className="h-4 w-36 bg-neutral-800 rounded" />
        <div className="h-16 bg-neutral-800 rounded-2xl" />
      </div>
    );
  }

  const recommendations = data?.recommendations || [];
  const todayFocus = data?.todayFocus;

  return (
    <div className="space-y-6">
      {/* 1. What Should I Do Today Banner */}
      {todayFocus && (
        <div className="p-5 sm:p-6 bg-gradient-to-r from-red-600/20 via-neutral-900 to-neutral-900 border border-red-500/30 rounded-3xl shadow-xl space-y-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-400 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Today's Training Focus
            </div>
            {todayFocus.hasPlan && (
              <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase">
                Active Plan
              </span>
            )}
          </div>

          <div>
            <h3 className="text-xl font-black text-white tracking-wide">{todayFocus.recommendation}</h3>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">{todayFocus.reason}</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] text-neutral-400 font-mono">
              {todayFocus.lastWorkoutDate ? `Last session: ${new Date(todayFocus.lastWorkoutDate).toLocaleDateString()}` : 'No recent session'}
            </span>

            <button
              onClick={() => {
                if (todayFocus.planId) {
                  navigate(`/workout/${todayFocus.planId}`);
                } else {
                  navigate('/start-workout');
                }
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/25 inline-flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 min-h-[44px]"
            >
              Start Session <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Intelligence Recommendations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-red-500" />
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wide text-white">Fitness Intelligence Insights</h3>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            {recommendations.length} Active Insights
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-6 bg-neutral-900/60 border border-white/[0.06] rounded-3xl text-center space-y-2">
            <div className="w-10 h-10 bg-neutral-800 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">No Progression Alerts</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
              Log more completed workouts to generate deterministic progressive overload, plateau detection, and muscle balance insights.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => {
              const isOverload = rec.type === 'progressive_overload';
              const isPlateau = rec.type === 'plateau_detected';
              const isBalance = rec.type === 'muscle_balance';
              const isRecovery = rec.type === 'recovery_signal';

              return (
                <div
                  key={rec.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isOverload
                      ? 'bg-emerald-500/5 border-emerald-500/25'
                      : isPlateau
                      ? 'bg-amber-500/5 border-amber-500/25'
                      : isRecovery
                      ? 'bg-blue-500/5 border-blue-500/25'
                      : 'bg-neutral-900/80 border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-xl text-sm shrink-0 ${
                          isOverload
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isPlateau
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : isRecovery
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {isOverload && <TrendingUp className="w-4 h-4" />}
                        {isPlateau && <AlertTriangle className="w-4 h-4" />}
                        {isRecovery && <ShieldAlert className="w-4 h-4" />}
                        {isBalance && <Layers className="w-4 h-4" />}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                              rec.confidence === 'high'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {rec.confidence || 'rule'}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-neutral-200">{rec.recommendation}</p>

                        <p className="text-[11px] text-neutral-400 flex items-center gap-1.5 pt-1">
                          <Info className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                          <span><strong>Why:</strong> {rec.reason}</span>
                        </p>

                        {/* Suggested Actions if Plateau */}
                        {rec.suggestedActions && (
                          <div className="pt-2 space-y-1">
                            <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Suggested Options:</span>
                            <ul className="list-disc list-inside text-[11px] text-neutral-400 space-y-0.5">
                              {rec.suggestedActions.map((action, i) => (
                                <li key={i}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
