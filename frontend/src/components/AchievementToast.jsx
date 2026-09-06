import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, X } from 'lucide-react';
import api from '../utils/api';

export default function AchievementToast() {
  const [queue, setQueue] = useState([]);
  const current = queue[0];
  const check = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const { data } = await api.get('/achievements');
      if (data.newlyUnlocked?.length) setQueue((items) => [...items, ...data.newlyUnlocked]);
    } catch { /* non-critical enhancement */ }
  }, []);

  useEffect(() => {
    check();
    const events = ['workoutCompleted', 'mealAdded', 'bodyMetricLogged', 'streakUpdated'];
    events.forEach((event) => window.addEventListener(event, check));
    const receive = (event) => setQueue((items) => [...items, ...(Array.isArray(event.detail) ? event.detail : [event.detail]).filter(Boolean)]);
    window.addEventListener('achievementUnlocked', receive);
    return () => { events.forEach((event) => window.removeEventListener(event, check)); window.removeEventListener('achievementUnlocked', receive); };
  }, [check]);
  useEffect(() => { if (!current) return undefined; const id = setTimeout(() => setQueue((items) => items.slice(1)), 5000); return () => clearTimeout(id); }, [current]);

  return <AnimatePresence>{current && <motion.aside initial={{ opacity: 0, y: -30, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 80 }} className="fixed right-4 top-24 z-[10001] w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-2xl border border-yellow-400/30 bg-neutral-950 p-4 text-white shadow-2xl shadow-yellow-500/20">
    <div className="pointer-events-none absolute inset-0">{Array.from({ length: 14 }).map((_, index) => <motion.i key={index} className="absolute h-1.5 w-1.5 rounded-full bg-yellow-400" initial={{ x: 180, y: 20, opacity: 1 }} animate={{ x: (index * 31) % 340, y: 130 + (index % 3) * 20, rotate: 180 }} transition={{ duration: 1.8, delay: index * .03 }} />)}</div>
    <div className="relative flex gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-yellow-400/15 text-2xl">{current.badgeIcon || <Award />}</span><div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-[.2em] text-yellow-400">Achievement unlocked</p><h3 className="text-lg font-black">{current.title}</h3><p className="text-xs text-neutral-400">{current.description}</p></div><button onClick={() => setQueue((items) => items.slice(1))} aria-label="Dismiss"><X size={16} /></button></div>
  </motion.aside>}</AnimatePresence>;
}
