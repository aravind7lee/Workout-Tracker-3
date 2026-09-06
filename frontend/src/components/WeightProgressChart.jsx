import React, { useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Scale, TrendingUp } from 'lucide-react';
import bodyMetricsService from '../services/bodyMetricsService';

const ranges = [{ label: '30d', value: '30' }, { label: '90d', value: '90' }, { label: '1y', value: '365' }, { label: 'All', value: 'all' }];

export default function WeightProgressChart({ targetWeight }) {
  const [range, setRange] = useState('90');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const points = await bodyMetricsService.chart(range);
      setData(points.map((point) => ({ ...point, label: new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), target: targetWeight || null })));
    } catch { setData([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [range, targetWeight]);
  useEffect(() => { const refresh = () => load(); window.addEventListener('bodyMetricLogged', refresh); return () => window.removeEventListener('bodyMetricLogged', refresh); }, [range, targetWeight]);

  return (
    <section className="rounded-2xl border border-white/10 bg-neutral-900/80 p-4 shadow-xl backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400"><TrendingUp size={20} /></span><div><h2 className="font-black text-white">Weight progress</h2><p className="text-xs text-neutral-400">Your trend over time</p></div></div>
        <div className="flex rounded-xl bg-neutral-950 p-1">{ranges.map((item) => <button key={item.value} onClick={() => setRange(item.value)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${range === item.value ? 'bg-red-600 text-white' : 'text-neutral-400'}`}>{item.label}</button>)}</div>
      </div>
      <div className="h-56">
        {loading ? <div className="grid h-full place-items-center text-sm text-neutral-400">Loading progress…</div> : data.length ? (
          <ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ left: -16, right: 8 }}><XAxis dataKey="label" stroke="#737373" tick={{ fontSize: 11 }} /><YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#737373" tick={{ fontSize: 11 }} /><Tooltip contentStyle={{ background: '#171717', border: '1px solid #404040', borderRadius: 12 }} /><Line type="monotone" dataKey="weight" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} /><Line type="monotone" dataKey="target" stroke="#34d399" strokeDasharray="6 6" dot={false} /></LineChart></ResponsiveContainer>
        ) : <div className="grid h-full place-items-center rounded-xl border border-dashed border-neutral-700 text-center text-sm text-neutral-400"><div><Scale className="mx-auto mb-2 text-neutral-500" /><p>Log your first weight to start the chart.</p></div></div>}
      </div>
    </section>
  );
}
