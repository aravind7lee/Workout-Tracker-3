import React, { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Maximize2, Star, TrendingUp, X } from 'lucide-react';
import api from '../utils/api';

const views = { weight: ['Weight', 'bestWeight'], volume: ['Volume', 'totalVolume'], estimated1RM: ['Est. 1RM', 'estimated1RM'] };

export default function ExerciseProgressionChart({ exerciseName, compact = false }) {
  const [data, setData] = useState([]);
  const [view, setView] = useState('weight');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get(`/analytics/exercise-progression/${encodeURIComponent(exerciseName)}`)
      .then(({ data: response }) => active && setData((response.data || []).map((item) => ({ ...item, label: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }))))
      .catch(() => active && setData([]))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [exerciseName]);

  const chartData = useMemo(() => {
    let record = 0;
    return data.map((point) => { const value = Number(point[views[view][1]] || 0); const isPR = value > record; record = Math.max(record, value); return { ...point, isPR }; });
  }, [data, view]);

  const chart = (height) => loading ? <div className="grid h-full place-items-center text-xs text-neutral-400">Loading history…</div> : chartData.length ? (
    <ResponsiveContainer width="100%" height={height}><LineChart data={chartData} margin={{ left: -18, right: 12 }}><XAxis dataKey="label" stroke="#737373" tick={{ fontSize: 10 }} /><YAxis stroke="#737373" tick={{ fontSize: 10 }} /><Tooltip contentStyle={{ background: '#171717', border: '1px solid #404040', borderRadius: 10 }} /><Line type="monotone" dataKey={views[view][1]} stroke="#f97316" strokeWidth={compact ? 2 : 3} dot={(props) => { const { cx, cy, payload } = props; return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={payload.isPR ? 5 : 3} fill={payload.isPR ? '#facc15' : '#f97316'} stroke="#111" />; }} /></LineChart></ResponsiveContainer>
  ) : <div className="grid h-full place-items-center text-xs text-neutral-500">More completed sessions will build this trend.</div>;

  if (compact) return <div className="border-t border-neutral-800 px-4 py-3"><div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-neutral-400"><TrendingUp size={13} />Progress</span><button onClick={() => setOpen(true)} className="flex items-center gap-1 text-[11px] font-bold text-orange-400"><Maximize2 size={12} />View full history</button></div><div className="mt-2 h-16">{chart(64)}</div>{open && <div className="fixed inset-0 z-[10000] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}><div className="w-full max-w-3xl rounded-3xl border border-neutral-700 bg-neutral-950 p-5 shadow-2xl sm:p-7"><FullHeader name={exerciseName} view={view} setView={setView} close={() => setOpen(false)} />{chart(320)}</div></div>}</div>;

  return <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5"><FullHeader name={exerciseName} view={view} setView={setView} />{chart(320)}</section>;
}

function FullHeader({ name, view, setView, close }) {
  return <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-yellow-400"><Star size={13} />Personal-record markers</p><h2 className="text-xl font-black text-white">{name}</h2></div><div className="flex items-center gap-2"><div className="flex rounded-xl bg-neutral-900 p-1">{Object.entries(views).map(([key, [label]]) => <button key={key} onClick={() => setView(key)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${view === key ? 'bg-orange-500 text-white' : 'text-neutral-400'}`}>{label}</button>)}</div>{close && <button onClick={close} aria-label="Close" className="rounded-xl border border-neutral-700 p-2 text-neutral-300"><X size={18} /></button>}</div></div>;
}
