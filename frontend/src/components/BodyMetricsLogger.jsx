import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ChevronDown, Minus, Plus, Ruler, Scale, X } from 'lucide-react';
import bodyMetricsService from '../services/bodyMetricsService';

const measurementFields = ['chest', 'waist', 'hips', 'biceps', 'thighs', 'neck'];

export default function BodyMetricsLogger({ onSaved, showSummary = false, initialWeight, initialBodyFat, height }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [latest, setLatest] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ weight: initialWeight || 70, bodyFatPercentage: '', measurements: {}, notes: '' });

  const loadLatest = async () => {
    try {
      const metric = await bodyMetricsService.latest();
      setLatest(metric);
      if (metric?.weight) setForm((current) => ({ ...current, weight: metric.weight }));
    } catch { /* empty history is a valid state */ }
  };

  useEffect(() => { loadLatest(); }, []);

  const adjustWeight = (delta) => setForm((current) => ({
    ...current,
    weight: Math.max(1, Math.round((Number(current.weight || 0) + delta) * 10) / 10)
  }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const metric = await bodyMetricsService.create(form);
      setLatest(metric);
      setOpen(false);
      window.dispatchEvent(new CustomEvent('bodyMetricLogged', { detail: metric }));
      onSaved?.(metric);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save your measurement.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-4 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/15 text-red-400"><Scale size={20} /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">Body metrics</p>
              <p className="font-black text-white">{showSummary && latest ? `${latest.weight} kg` : "Log today's weight"}</p>
              {showSummary && <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-400"><span>{latest ? new Date(latest.date).toLocaleDateString() : 'No entries yet'}</span>{(latest?.bodyFatPercentage ?? initialBodyFat) != null && <span>• {latest?.bodyFatPercentage ?? initialBodyFat}% body fat</span>}{height && (latest?.weight || initialWeight) && <span>• BMI {((latest?.weight || initialWeight) / ((height / 100) ** 2)).toFixed(1)}</span>}</div>}
            </div>
          </div>
          <button onClick={() => setOpen(true)} className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-red-500">
            {latest ? 'Add entry' : 'Log weight'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[10000] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
            <motion.form onSubmit={save} className="w-full max-w-lg rounded-3xl border border-white/10 bg-neutral-950 p-5 text-white shadow-2xl sm:p-7" initial={{ y: 24, scale: .97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: .97 }}>
              <div className="mb-6 flex items-start justify-between">
                <div><p className="text-xs font-bold uppercase tracking-[.18em] text-red-400">Progress check-in</p><h2 className="text-2xl font-black">Log body metrics</h2></div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-xl border border-neutral-700 p-2 text-neutral-300"><X size={18} /></button>
              </div>

              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-neutral-400">Weight (kg)</label>
              <div className="grid grid-cols-[48px_1fr_48px] gap-2">
                <button type="button" onClick={() => adjustWeight(-.1)} className="grid place-items-center rounded-xl border border-neutral-700 bg-neutral-900"><Minus /></button>
                <input required min="1" max="1000" step="0.1" type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="h-14 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-center text-2xl font-black text-white outline-none focus:border-red-500" />
                <button type="button" onClick={() => adjustWeight(.1)} className="grid place-items-center rounded-xl border border-neutral-700 bg-neutral-900"><Plus /></button>
              </div>

              <label className="mt-4 mb-2 block text-xs font-bold uppercase tracking-wide text-neutral-400">Body fat % <span className="font-normal normal-case">(optional)</span></label>
              <input min="0" max="100" step="0.1" type="number" value={form.bodyFatPercentage} onChange={(e) => setForm({ ...form, bodyFatPercentage: e.target.value })} className="h-11 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-white outline-none focus:border-red-500" />

              <button type="button" onClick={() => setExpanded(!expanded)} className="mt-4 flex w-full items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3 text-sm font-bold">
                <span className="flex items-center gap-2"><Ruler size={16} className="text-red-400" />Measurements (optional)</span><ChevronDown size={16} className={expanded ? 'rotate-180' : ''} />
              </button>
              <AnimatePresence>{expanded && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="grid grid-cols-2 gap-3 pt-3">{measurementFields.map((field) => <label key={field} className="text-xs capitalize text-neutral-400">{field} (cm)<input min="0" step="0.1" type="number" value={form.measurements[field] || ''} onChange={(e) => setForm({ ...form, measurements: { ...form.measurements, [field]: e.target.value } })} className="mt-1 h-10 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-white" /></label>)}</div></motion.div>}</AnimatePresence>
              {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
              <button disabled={saving} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 font-black text-white disabled:opacity-60"><Activity size={18} />{saving ? 'Saving…' : 'Save measurement'}</button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
