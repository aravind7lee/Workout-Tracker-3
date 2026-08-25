import React, { useState, useEffect } from 'react';
import { 
  Trophy, Dumbbell, Activity, Flame, Calendar, TrendingUp, 
  Target, Award, RefreshCw, BarChart2, Info, Layers
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import api from '../utils/api';

export default function RealAnalyticsSection() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalMeals: 0,
    totalVolume: 0,
    totalDurationMinutes: 0,
    currentStreak: 0,
    xpPoints: 0
  });

  const [frequencyData, setFrequencyData] = useState([]);
  const [calorieData, setCalorieData] = useState([]);
  const [muscleData, setMuscleData] = useState([]);
  const [prs, setPrs] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('Barbell Bench Press');
  const [exerciseTrend, setExerciseTrend] = useState(null);
  const [trendLoading, setTrendLoading] = useState(false);

  useEffect(() => {
    loadAllRealAnalytics();
  }, []);

  useEffect(() => {
    if (selectedExercise) {
      fetchExerciseProgression(selectedExercise);
    }
  }, [selectedExercise]);

  const loadAllRealAnalytics = async () => {
    setLoading(true);
    try {
      const [statsRes, calRes, freqRes, muscRes, prsRes] = await Promise.all([
        api.get('/analytics/stats').catch(() => ({ data: {} })),
        api.get('/analytics/calories').catch(() => ({ data: {} })),
        api.get('/analytics/frequency').catch(() => ({ data: {} })),
        api.get('/analytics/muscles').catch(() => ({ data: {} })),
        api.get('/workouts/prs').catch(() => ({ data: {} }))
      ]);

      if (statsRes.data?.data) setStats(statsRes.data.data);
      if (calRes.data?.data) setCalorieData(calRes.data.data);
      if (freqRes.data?.data) setFrequencyData(freqRes.data.data);
      if (muscRes.data?.data) setMuscleData(muscRes.data.data);
      if (prsRes.data?.prs) {
        setPrs(prsRes.data.prs);
        if (prsRes.data.prs.length > 0 && prsRes.data.prs[0]._id) {
          setSelectedExercise(prsRes.data.prs[0]._id);
        }
      }
    } catch (err) {
      console.error('Error loading real analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExerciseProgression = async (name) => {
    setTrendLoading(true);
    try {
      const res = await api.get(`/workouts/exercise-history/${encodeURIComponent(name)}`);
      if (res.data?.success) {
        setExerciseTrend(res.data);
      }
    } catch (err) {
      console.warn(`Failed to fetch progression for ${name}:`, err.message);
    } finally {
      setTrendLoading(false);
    }
  };

  // Chart datasets
  const frequencyChartData = {
    labels: frequencyData.map(d => d.day),
    datasets: [
      {
        label: 'Workouts Logged',
        data: frequencyData.map(d => d.workouts),
        backgroundColor: '#10b981',
        borderRadius: 8
      }
    ]
  };

  const calorieChartData = {
    labels: calorieData.map(d => d.day || d.date),
    datasets: [
      {
        label: 'Calories (kcal)',
        data: calorieData.map(d => d.calories),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const muscleChartData = {
    labels: muscleData.map(m => m.muscle),
    datasets: [
      {
        data: muscleData.map(m => m.percentage),
        backgroundColor: muscleData.map(m => m.color || '#6b7280'),
        borderWidth: 2,
        borderColor: '#171717'
      }
    ]
  };

  const progressionChartData = exerciseTrend?.history?.length > 0 ? {
    labels: exerciseTrend.history.map(h => new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).reverse(),
    datasets: [
      {
        label: 'Max Weight (kg)',
        data: exerciseTrend.history.map(h => Math.max(...(h.sets?.map(s => s.weight) || [0]))).reverse(),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Estimated 1RM (kg)',
        data: exerciseTrend.history.map(h => {
          const maxSet = h.sets?.reduce((max, s) => (s.weight > max.weight ? s : max), { weight: 0, reps: 0 });
          return Math.round((maxSet?.weight || 0) * (1 + (maxSet?.reps || 0) / 30));
        }).reverse(),
        borderColor: '#3b82f6',
        borderDash: [5, 5],
        tension: 0.3
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#d4d4d4', font: { size: 12 } } }
    },
    scales: {
      x: { ticks: { color: '#a3a3a3' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#a3a3a3' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-6">
      {/* Real Metrics Overview Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-xl space-y-1">
          <span className="text-xs text-neutral-500 uppercase tracking-wider block font-semibold">Total Workouts</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.totalWorkouts || 0}</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Dumbbell className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-xl space-y-1">
          <span className="text-xs text-neutral-500 uppercase tracking-wider block font-semibold">Total Volume</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-black text-orange-400 font-mono">
              {(stats.totalVolume || 0).toLocaleString()} <span className="text-xs">kg</span>
            </span>
            <div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-xl space-y-1">
          <span className="text-xs text-neutral-500 uppercase tracking-wider block font-semibold">Active Time</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats.totalDurationMinutes || 0} <span className="text-xs">mins</span>
            </span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-xl space-y-1">
          <span className="text-xs text-neutral-500 uppercase tracking-wider block font-semibold">Current Streak</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {stats.currentStreak || 0} <span className="text-xs">days</span>
            </span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Consistency Progress Indicator Card */}
      <div className="p-6 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Weekly Consistency Progress</h3>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            {stats.totalWorkouts > 0 ? `${Math.min(100, Math.round((stats.totalWorkouts / 4) * 100))}%` : '0%'}
          </span>
        </div>
        <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
            style={{ width: `${Math.min(100, (stats.totalWorkouts / 4) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-neutral-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-neutral-500" />
          Target: 4 sessions per week. Calculated transparently as (Completed Sessions / Target).
        </p>
      </div>

      {/* Exercise Performance Progression & Estimated 1RM Explorer */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">Performance Progression</span>
            <h3 className="text-xl font-bold text-white">Exercise 1RM & Weight Progression</h3>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:border-orange-500"
            >
              {prs.length > 0 ? (
                prs.map(p => (
                  <option key={p._id} value={p._id}>{p._id}</option>
                ))
              ) : (
                <option value="Barbell Bench Press">Barbell Bench Press</option>
              )}
            </select>
          </div>
        </div>

        {/* 1RM Stat Highlights */}
        {exerciseTrend?.stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-neutral-950 border border-neutral-800/80 rounded-2xl text-center">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">Max Weight</span>
              <span className="text-lg font-black text-white font-mono">{exerciseTrend.stats.maxWeight} kg</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">Estimated 1RM</span>
              <span className="text-lg font-black text-orange-400 font-mono">{exerciseTrend.stats.estimated1RM} kg</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">Max Volume Session</span>
              <span className="text-lg font-black text-emerald-400 font-mono">{exerciseTrend.stats.maxVolume} kg</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">Total Sessions</span>
              <span className="text-lg font-black text-white font-mono">{exerciseTrend.stats.totalSessions}</span>
            </div>
          </div>
        )}

        {/* Progression Chart */}
        <div className="h-72 w-full pt-2">
          {trendLoading ? (
            <div className="h-full flex items-center justify-center text-xs text-neutral-500">Loading exercise history...</div>
          ) : progressionChartData ? (
            <Line data={progressionChartData} options={chartOptions} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-2 border border-dashed border-neutral-800 rounded-2xl p-6 text-center">
              <Dumbbell className="w-8 h-8 opacity-40" />
              <p className="text-xs">No historical workouts logged yet for <span className="text-white font-bold">{selectedExercise}</span>.</p>
              <p className="text-[10px] text-neutral-600">Log a session containing this exercise to generate real progression trends.</p>
            </div>
          )}
        </div>

        <div className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl flex items-center gap-2 text-xs text-neutral-400">
          <Info className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <span>
            <strong>Formula Note:</strong> Estimated 1RM is calculated using the established Epley Formula: <code className="text-orange-400">Weight × (1 + Reps/30)</code>.
          </span>
        </div>
      </div>

      {/* Grid of Frequency & Muscle Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workout Frequency */}
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Workout Frequency (Day of Week)</h3>
            <BarChart2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="h-60 w-full">
            {frequencyData.length > 0 ? (
              <Bar data={frequencyChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-neutral-500">No workout data available</div>
            )}
          </div>
        </div>

        {/* Muscle Distribution */}
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Muscle Group Distribution</h3>
            <Layers className="w-4 h-4 text-orange-400" />
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            {muscleData.length > 0 ? (
              <Doughnut 
                data={muscleChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { color: '#d4d4d4', font: { size: 11 } } } }
                }} 
              />
            ) : (
              <div className="text-xs text-neutral-500">No muscle group volume logged yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Authoritative Personal Records Table */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Personal Records (Verified)</h3>
          </div>
          <span className="text-xs text-neutral-500 font-mono">{prs.length} Records</span>
        </div>

        {prs.length === 0 ? (
          <div className="text-center py-10 text-neutral-500 border border-dashed border-neutral-800 rounded-2xl">
            No personal records found. Complete your first workout to derive PRs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-800">
                  <th className="pb-3 pl-3">Exercise Name</th>
                  <th className="pb-3">Max Weight</th>
                  <th className="pb-3">Max Reps</th>
                  <th className="pb-3 text-right pr-3">Achieved Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {prs.map((pr) => (
                  <tr key={pr._id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 pl-3 font-bold text-white">{pr._id}</td>
                    <td className="py-3 font-mono font-bold text-orange-400">{pr.maxWeight} kg</td>
                    <td className="py-3 font-mono text-emerald-400">{pr.maxReps} reps</td>
                    <td className="py-3 text-right pr-3 text-neutral-400 font-mono">
                      {new Date(pr.latestDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
