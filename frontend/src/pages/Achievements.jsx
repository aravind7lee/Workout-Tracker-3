import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, Trophy } from 'lucide-react';
import AuthGuard from '../components/AuthGuard';
import api from '../utils/api';

const categories = ['All', 'Workout', 'Nutrition', 'Consistency', 'Social'];

export default function Achievements() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/achievements').then(({ data }) => setItems(data.achievements || [])).finally(() => setLoading(false)); }, []);
  const visible = useMemo(() => filter === 'All' ? items : items.filter((item) => item.category === filter), [items, filter]);
  return <AuthGuard><main className="min-h-screen bg-black px-4 pb-28 pt-8 text-white"><div className="mx-auto max-w-6xl"><header className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-yellow-500/15 via-neutral-900 to-neutral-950 p-6 sm:p-9"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-yellow-400"><Trophy size={16} />Grind milestones</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Achievements</h1><p className="mt-2 max-w-2xl text-sm text-neutral-400">Every badge is calculated from your saved workouts, nutrition, consistency, and progress data.</p></header>
  <div className="mb-6 flex flex-wrap gap-2">{categories.map((category) => <button key={category} onClick={() => setFilter(category)} className={`rounded-xl px-4 py-2 text-xs font-black ${filter === category ? 'bg-red-600 text-white' : 'border border-neutral-700 bg-neutral-900 text-neutral-300'}`}>{category}</button>)}</div>
  {loading ? <div className="py-20 text-center text-neutral-400">Loading achievements…</div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.map((item, index) => <motion.article key={item.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .04 }} className={`rounded-2xl border p-5 ${item.unlocked ? 'border-yellow-400/30 bg-gradient-to-br from-yellow-500/10 to-neutral-900' : 'border-neutral-800 bg-neutral-900/70 grayscale'}`}><div className="flex items-start justify-between"><span className="text-4xl">{item.badgeIcon}</span>{item.unlocked ? <Award className="text-yellow-400" /> : <Lock className="text-neutral-500" size={18} />}</div><h2 className="mt-4 text-lg font-black">{item.title}</h2><p className="mt-1 min-h-10 text-sm text-neutral-400">{item.description}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-800"><div className="h-full rounded-full bg-gradient-to-r from-red-500 to-yellow-400" style={{ width: `${item.percentage}%` }} /></div><div className="mt-2 flex justify-between text-[11px] font-bold text-neutral-400"><span>{item.progress}/{item.target}</span><span>{item.unlockedAt ? new Date(item.unlockedAt).toLocaleDateString() : `${item.percentage}%`}</span></div></motion.article>)}</div>}</div></main></AuthGuard>;
}
