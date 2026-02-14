// frontend/src/pages/CardioAnalytics.jsx - Cardio Analytics & History
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const CardioAnalytics = () => {
  const [sessions, setSessions] = useState([]);
  const [period, setPeriod] = useState('week'); // week, month, year
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const ACTIVITY_ICONS = {
    walking: '🚶',
    running: '🏃',
    cycling: '🚴',
    swimming: '🏊'
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
      const [sessionsRes, statsRes] = await Promise.all([
        api.get(`/cardio?limit=50`),
        api.get(`/cardio/stats?period=${days}`)
      ]);

      if (sessionsRes.data.success) {
        setSessions(sessionsRes.data.sessions);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(() => ({ steps: 0, distance: 0, calories: 0 }));
    
    sessions.forEach(session => {
      const date = new Date(session.date);
      const dayIndex = date.getDay();
      data[dayIndex].steps += session.steps || 0;
      data[dayIndex].distance += session.distance || 0;
      data[dayIndex].calories += session.calories || 0;
    });

    return data.map((d, i) => ({ day: days[i], ...d }));
  };

  const weeklyData = getWeeklyData();
  const maxSteps = Math.max(...weeklyData.map(d => d.steps), 1);
  const stepGoal = 10000;
  const totalSteps = stats?.totalSessions > 0 ? sessions.reduce((sum, s) => sum + (s.steps || 0), 0) : 0;
  const goalProgress = Math.min((totalSteps / (stepGoal * 7)) * 100, 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading Analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-wider mb-2">
              📊 CARDIO ANALYTICS
            </h1>
            <p className="text-slate-400">Track your progress and achievements</p>
          </div>
          <a
            href="/dashboard"
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wide hover:scale-105 transition-all"
          >
            ← Back to Dashboard
          </a>
        </div>

        {/* Period Selector */}
        <div className="flex gap-3">
          {['week', 'month', 'year'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-3 rounded-xl font-bold uppercase tracking-wide transition-all ${
                period === p
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20"
          >
            <div className="text-slate-400 text-sm mb-2">TOTAL STEPS</div>
            <div className="text-4xl font-black text-white mb-2">{totalSteps.toLocaleString()}</div>
            <div className="text-green-400 text-sm">🎯 Goal: {stepGoal.toLocaleString()}/day</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20"
          >
            <div className="text-slate-400 text-sm mb-2">TOTAL DISTANCE</div>
            <div className="text-4xl font-black text-white mb-2">{stats?.totalDistance.toFixed(1)} km</div>
            <div className="text-blue-400 text-sm">📍 Keep moving!</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-orange-500/20"
          >
            <div className="text-slate-400 text-sm mb-2">TOTAL DURATION</div>
            <div className="text-4xl font-black text-white mb-2">{stats?.totalDuration} min</div>
            <div className="text-orange-400 text-sm">⏱️ {Math.floor(stats?.totalDuration / 60)}h {stats?.totalDuration % 60}m</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20"
          >
            <div className="text-slate-400 text-sm mb-2">CALORIES BURNED</div>
            <div className="text-4xl font-black text-white mb-2">{stats?.totalCalories}</div>
            <div className="text-purple-400 text-sm">🔥 {stats?.totalSessions} sessions</div>
          </motion.div>
        </div>

        {/* Weekly Progress Bar Chart */}
        <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl border border-cyan-500/20 p-6">
          <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-6">
            📈 WEEKLY STEPS
          </h3>
          <div className="flex items-end justify-between gap-4 h-64">
            {weeklyData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-white text-sm font-bold">{data.steps > 0 ? data.steps.toLocaleString() : ''}</div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.steps / maxSteps) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-lg min-h-[20px]"
                />
                <div className="text-slate-400 text-xs font-bold">{data.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Goal Progress Circle */}
        <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl border border-cyan-500/20 p-6">
          <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-6">
            🎯 WEEKLY GOAL PROGRESS
          </h3>
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="100"
                  stroke="rgba(148, 163, 184, 0.1)"
                  strokeWidth="20"
                  fill="none"
                />
                <motion.circle
                  cx="128"
                  cy="128"
                  r="100"
                  stroke="url(#gradient)"
                  strokeWidth="20"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 628" }}
                  animate={{ strokeDasharray: `${(goalProgress / 100) * 628} 628` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl font-black text-white">{Math.round(goalProgress)}%</div>
                <div className="text-slate-400 text-sm mt-2">of weekly goal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Breakdown */}
        {stats?.byActivity && Object.keys(stats.byActivity).length > 0 && (
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl border border-cyan-500/20 p-6">
            <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-6">
              🏃 ACTIVITY BREAKDOWN
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stats.byActivity).map(([activity, data]) => (
                <div key={activity} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-4xl">{ACTIVITY_ICONS[activity]}</div>
                    <div>
                      <div className="text-white font-bold capitalize">{activity}</div>
                      <div className="text-slate-400 text-sm">{data.count} sessions</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Distance:</span>
                      <span className="text-blue-400 font-bold">{data.distance.toFixed(1)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-orange-400 font-bold">{data.duration} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Calories:</span>
                      <span className="text-purple-400 font-bold">{data.calories} cal</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session History */}
        <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl border border-cyan-500/20 p-6">
          <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-6">
            📜 SESSION HISTORY
          </h3>
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No sessions yet. Start tracking to see your history!
              </div>
            ) : (
              sessions.map((session, index) => {
                const activity = ACTIVITY_ICONS[session.activityType];
                const date = new Date(session.date);
                return (
                  <motion.div
                    key={session._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-cyan-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{activity}</div>
                        <div>
                          <div className="text-white font-bold capitalize">{session.activityType}</div>
                          <div className="text-slate-400 text-sm">
                            {date.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-6 text-center">
                        {session.steps > 0 && (
                          <div>
                            <div className="text-green-400 text-xl font-bold">{session.steps.toLocaleString()}</div>
                            <div className="text-slate-500 text-xs">steps</div>
                          </div>
                        )}
                        <div>
                          <div className="text-blue-400 text-xl font-bold">{session.distance.toFixed(2)} km</div>
                          <div className="text-slate-500 text-xs">distance</div>
                        </div>
                        <div>
                          <div className="text-orange-400 text-xl font-bold">{session.duration} min</div>
                          <div className="text-slate-500 text-xs">duration</div>
                        </div>
                        <div>
                          <div className="text-purple-400 text-xl font-bold">{session.calories} cal</div>
                          <div className="text-slate-500 text-xs">burned</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardioAnalytics;
