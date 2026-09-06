import React, { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { ArrowDownRight, ArrowRight, ArrowUpRight, ChevronDown, FileBarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function WeeklyReportCard() {
  const navigate = useNavigate(); const [report, setReport] = useState(null); const [open, setOpen] = useState(true);
  useEffect(() => { api.get('/analytics/weekly-report').then(({ data }) => setReport(data.report)).catch(() => setReport(null)); }, []);
  if (!report) return null;
  const metrics = [['Workouts', report.workoutsCompleted, report.comparedToLastWeek.workouts], ['Volume', `${Math.round(report.totalVolume / 1000)}k`, report.comparedToLastWeek.volume], ['Protein/day', `${report.avgDailyProtein}g`, report.comparedToLastWeek.protein]];
  return <section className="rounded-3xl border border-white/10 bg-neutral-900/80 p-5 shadow-xl sm:p-6"><button className="flex w-full items-center justify-between text-left" onClick={() => setOpen(!open)}><div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-emerald-400"><FileBarChart size={15} />Weekly report</p><h2 className="text-xl font-black text-white">{report.period}</h2></div><ChevronDown className={`text-neutral-400 transition ${open ? 'rotate-180' : ''}`} /></button>{open && <div className="mt-5 grid gap-5 md:grid-cols-2"><div className="grid grid-cols-3 gap-2">{metrics.map(([label, value, comparison]) => { const up = !String(comparison).startsWith('-'); return <div key={label} className="rounded-xl bg-neutral-950 p-3"><p className="text-[10px] uppercase text-neutral-400">{label}</p><p className="text-xl font-black text-white">{value}</p><span className={`flex items-center text-[10px] font-bold ${up ? 'text-emerald-400' : 'text-red-400'}`}>{up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{comparison}</span></div>; })}</div><div className="h-28"><ResponsiveContainer width="100%" height="100%"><BarChart data={report.dayDistribution}><XAxis dataKey="day" hide /><Tooltip /><Bar dataKey="workouts" fill="#ef4444" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div><button onClick={() => navigate('/progress-report')} className="flex items-center gap-2 text-xs font-black text-red-400">View full report <ArrowRight size={14} /></button></div>}</section>;
}
