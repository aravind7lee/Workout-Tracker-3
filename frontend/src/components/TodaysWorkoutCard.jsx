import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, Dumbbell, Play, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function TodaysWorkoutCard() {
  const navigate = useNavigate();
  const [suggestion, setSuggestion] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    api.get('/users/todays-workout')
      .then(({ data }) => setSuggestion(data.suggestion))
      .catch(() => setSuggestion(null));
  }, []);

  if (!suggestion) return null;

  const start = (workout) => {
    navigate('/workout-session', {
      state: {
        workoutPlan: {
          name: workout.title,
          exercises: workout.exercises,
        },
      },
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="overflow-hidden rounded-3xl border border-red-500/25 bg-gradient-to-br from-red-600/15 via-neutral-900 to-neutral-950 p-5 sm:p-7 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-red-400">
            <Sparkles size={15} />
            Today’s Recommendation
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white tracking-wide">
            {suggestion.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-neutral-300 leading-relaxed">
            {suggestion.reason}
          </p>
          <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs font-bold text-neutral-300">
            <span className="flex items-center gap-1.5 rounded-lg bg-neutral-800/80 border border-neutral-700/50 px-2.5 py-1">
              <Clock size={13} className="text-red-400" />
              {suggestion.estimatedDuration} min
            </span>
            <span className="rounded-lg bg-neutral-800/80 border border-neutral-700/50 px-2.5 py-1 capitalize">
              {suggestion.difficulty}
            </span>
            <span className="rounded-lg bg-neutral-800/80 border border-neutral-700/50 px-2.5 py-1">
              {suggestion.exercises.length} exercises
            </span>
          </div>
        </div>

        <button
          onClick={() => start(suggestion)}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-6 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-red-600/25 hover:scale-105 active:scale-95 transition-all min-h-[44px]"
        >
          <Play size={16} fill="currentColor" />
          Start This Workout
        </button>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
      >
        <span>See Alternatives</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {suggestion.alternatives?.map((item) => (
                <button
                  key={item.title}
                  onClick={() => start(item)}
                  className="rounded-2xl border border-white/[0.08] hover:border-red-500/40 bg-neutral-900/90 hover:bg-neutral-850 p-4 text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-md group"
                >
                  <Dumbbell size={18} className="mb-2 text-red-400 group-hover:scale-110 transition-transform" />
                  <span className="block font-black text-white text-sm uppercase tracking-wide truncate">
                    {item.title}
                  </span>
                  <span className="text-xs text-neutral-400 mt-0.5 block font-mono">
                    {item.estimatedDuration} min
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
