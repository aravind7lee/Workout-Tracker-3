import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, Dumbbell, Play, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function TodaysWorkoutCard() {
  const navigate = useNavigate();
  const [suggestion, setSuggestion] = useState(null);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => { api.get('/users/todays-workout').then(({ data }) => setSuggestion(data.suggestion)).catch(() => setSuggestion(null)); }, []);
  if (!suggestion) return null;
  const start = (workout) => navigate('/workout-session', { state: { workoutPlan: { name: workout.title, exercises: workout.exercises } } });
  return <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="overflow-hidden rounded-3xl border border-red-500/25 bg-gradient-to-br from-red-500/15 via-neutral-900 to-neutral-950 p-5 shadow-2xl sm:p-7"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-red-400"><Sparkles size={15} />Today’s recommendation</p><h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{suggestion.title}</h2><p className="mt-2 max-w-xl text-sm text-neutral-400">{suggestion.reason}</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-neutral-300"><span className="flex items-center gap-1 rounded-lg bg-neutral-800 px-2.5 py-1"><Clock size={13} />{suggestion.estimatedDuration} min</span><span className="rounded-lg bg-neutral-800 px-2.5 py-1 capitalize">{suggestion.difficulty}</span><span className="rounded-lg bg-neutral-800 px-2.5 py-1">{suggestion.exercises.length} exercises</span></div></div><button onClick={() => start(suggestion)} className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/20"><Play size={17} fill="currentColor" />Start this workout</button></div>
  <button onClick={() => setExpanded(!expanded)} className="mt-5 flex items-center gap-2 text-xs font-bold text-neutral-300">See alternatives <ChevronDown size={15} className={expanded ? 'rotate-180' : ''} /></button><AnimatePresence>{expanded && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="mt-4 grid gap-3 sm:grid-cols-3">{suggestion.alternatives.map((item) => <button key={item.title} onClick={() => start(item)} className="rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-left"><Dumbbell size={16} className="mb-2 text-orange-400" /><span className="block font-black text-white">{item.title}</span><span className="text-xs text-neutral-400">{item.estimatedDuration} min</span></button>)}</div></motion.div>}</AnimatePresence></motion.section>;
}
