import React, { useEffect, useState } from 'react';
import { Award, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function AchievementsPreview() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/achievements').then(({ data }) => setItems((data.achievements || []).filter((item) => item.unlocked).sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt)).slice(0, 5))).catch(() => setItems([])); }, []);
  return <section className="rounded-3xl border border-yellow-400/20 bg-neutral-900/80 p-5 shadow-xl"><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 font-black text-white"><Award className="text-yellow-400" size={19} />Badges</h2><button onClick={() => navigate('/achievements')} className="flex items-center gap-1 text-xs font-bold text-yellow-400">View all <ArrowRight size={13} /></button></div>{items.length ? <div className="flex flex-wrap gap-3">{items.map((item) => <div key={item.title} title={item.description} className="grid h-14 w-14 place-items-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 text-2xl">{item.badgeIcon}</div>)}</div> : <p className="text-sm text-neutral-400">Your first unlocked badge will appear here.</p>}</section>;
}
