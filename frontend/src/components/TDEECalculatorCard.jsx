import React, { useCallback, useEffect, useState } from 'react';
import { Calculator, RefreshCw, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import { recalculateTDEE } from '../services/onboardingService';

export default function TDEECalculatorCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const calculate = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await recalculateTDEE()); }
    catch (err) { setError(err.response?.data?.message || err.message || 'Complete your fitness profile to calculate targets.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { calculate(); }, [calculate]);
  const calories = data?.macros?.calories || data?.nutritionGoals?.dailyCalories || 0;
  const macros = [
    ['Protein', data?.macros?.protein || data?.nutritionGoals?.dailyProtein, '#ef4444'],
    ['Carbs', data?.macros?.carbs || data?.nutritionGoals?.dailyCarbs, '#f59e0b'],
    ['Fat', data?.macros?.fat || data?.nutritionGoals?.dailyFat, '#10b981']
  ];

  return (
    <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl border border-white/10 bg-neutral-900/85 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500/15 text-orange-400"><Calculator size={22} /></span><div><p className="text-xs font-black uppercase tracking-[.16em] text-orange-400">Personal fuel target</p><h2 className="text-xl font-black text-white">TDEE calculator</h2></div></div>
        <button onClick={calculate} disabled={loading} className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-bold text-neutral-200"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} />Recalculate</button>
      </div>
      {error ? <div className="mt-5 rounded-xl border border-orange-500/25 bg-orange-500/10 p-4 text-sm text-orange-300">{error}</div> : (
        <div className="mt-6 grid gap-5 md:grid-cols-[170px_1fr]">
          <div className="relative mx-auto grid h-40 w-40 place-items-center rounded-full" style={{ background: 'conic-gradient(#f97316 0 78%, rgba(115,115,115,.25) 78% 100%)' }}><div className="grid h-32 w-32 place-items-center rounded-full bg-neutral-950 text-center"><div><Utensils className="mx-auto mb-1 text-orange-400" size={18} /><p className="text-3xl font-black text-white">{loading ? '—' : Math.round(calories)}</p><p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">kcal / day</p></div></div></div>
          <div className="grid content-center gap-3">
            <div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-neutral-950/70 p-3"><p className="text-xs text-neutral-400">BMR</p><p className="text-xl font-black text-white">{Math.round(data?.bmr || 0)} kcal</p></div><div className="rounded-xl bg-neutral-950/70 p-3"><p className="text-xs text-neutral-400">Maintenance TDEE</p><p className="text-xl font-black text-white">{Math.round(data?.tdee || 0)} kcal</p></div></div>
            <div className="grid grid-cols-3 gap-2">{macros.map(([label, value, color]) => <div key={label} className="rounded-xl border border-neutral-800 p-3"><span className="mb-2 block h-1 rounded-full" style={{ background: color }} /><p className="text-xs text-neutral-400">{label}</p><p className="font-black text-white">{Math.round(value || 0)}g</p></div>)}</div>
          </div>
        </div>
      )}
    </motion.section>
  );
}
