// frontend/src/pages/StreakHistory.jsx
// Ultra-Premium Multi-Timeframe Workout Streak & Activity Analytics Dashboard (Mobile First)

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Trophy, 
  Calendar, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft,
  Sparkles,
  Award,
  BarChart3,
  CalendarDays,
  Target,
  Dumbbell,
  Shield,
  Activity,
  Layers,
  Filter,
  Check,
  Search,
  RefreshCw,
  FlameKindling,
  Timer,
  Crown,
  Rocket,
  Gem,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRealTimeStreak } from '../hooks/useRealTimeStreak';
import api from '../utils/api';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function StreakHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    streak,
    longestStreak,
    totalCheckIns,
    isActiveToday,
    canCheckIn,
    checkIn,
    isCheckingIn
  } = useRealTimeStreak();

  // Navigation & Filter States
  const [timeframe, setTimeframe] = useState('monthly'); // 'daily' | 'weekly' | 'monthly' | 'yearly'
  const [historyData, setHistoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Calendar State for Monthly View
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [selectedDayObj, setSelectedDayObj] = useState(() => new Date());

  // Fetch detailed history from MongoDB
  const fetchHistory = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await api.get('/users/streak-details');
      if (res.data && res.data.success) {
        setHistoryData(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch detailed streak history:', err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchHistory(false);
  };

  const handleManualCheckIn = async () => {
    if (isCheckingIn) return;
    const res = await checkIn();
    if (res?.success) {
      setShowCelebration(true);
      setFeedbackMessage(res.message || `🔥 Day ${res.currentStreak || streak + 1} Logged!`);
      fetchHistory(false);
      setTimeout(() => setShowCelebration(false), 4500);
    }
  };

  // Build active dates map (YYYY-M-D) matching exact local date parts
  const activeDateDetailsMap = useMemo(() => {
    const map = new Map();
    const toKey = (d) => {
      if (!d) return '';
      const obj = new Date(d);
      if (isNaN(obj.getTime())) return '';
      const year = obj.getFullYear();
      const month = obj.getMonth();
      const day = obj.getDate();
      return `${year}-${month}-${day}`;
    };

    // 1. From backend streak history
    if (historyData?.streakHistory && Array.isArray(historyData.streakHistory)) {
      historyData.streakHistory.forEach(h => {
        const k = toKey(h.date);
        if (k) {
          map.set(k, {
            type: 'check_in',
            title: `Streak Day ${h.streakDay || 1}`,
            date: new Date(h.date),
            tier: h.tier || 'Beginner'
          });
        }
      });
    }

    // 2. From backend completed workouts
    if (historyData?.workouts && Array.isArray(historyData.workouts)) {
      historyData.workouts.forEach(w => {
        const k = toKey(w.date);
        if (k) {
          const existing = map.get(k);
          map.set(k, {
            type: 'workout',
            title: w.name || 'Workout Session',
            date: new Date(w.date),
            duration: w.duration,
            calories: w.calories,
            streakDay: existing?.streakDay || streak || 1
          });
        }
      });
    }

    // 3. Fallback: If streak > 0, backfill the last 'streak' consecutive days so calendar always reflects the active streak
    if (streak > 0) {
      const today = new Date();
      for (let i = 0; i < Math.min(streak, 365); i++) {
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - i);
        const k = toKey(pastDate);
        if (k && !map.has(k)) {
          map.set(k, {
            type: 'check_in',
            title: `Streak Day ${Math.max(1, streak - i)}`,
            date: pastDate,
            tier: 'Beginner'
          });
        }
      }
    }

    // 4. Guarantee today's active date if active today or streak >= 1
    if (isActiveToday || streak > 0) {
      const todayK = toKey(new Date());
      if (!map.has(todayK)) {
        map.set(todayK, {
          type: 'check_in',
          title: `Streak Day ${Math.max(1, streak)}`,
          date: new Date(),
          tier: 'Beginner'
        });
      }
    }

    return map;
  }, [historyData, isActiveToday, streak]);

  // Calendar calculations for Monthly View
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setSelectedDayObj(now);
  };

  const activeDaysInMonth = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const k = `${currentYear}-${currentMonth}-${d}`;
      if (activeDateDetailsMap.has(k)) {
        count++;
      }
    }
    return count;
  }, [activeDateDetailsMap, daysInMonth, currentMonth, currentYear]);

  // Selected Day Key & Details
  const selectedDayKey = useMemo(() => {
    const y = selectedDayObj.getFullYear();
    const m = selectedDayObj.getMonth();
    const d = selectedDayObj.getDate();
    return `${y}-${m}-${d}`;
  }, [selectedDayObj]);

  const selectedDayInfo = activeDateDetailsMap.get(selectedDayKey);

  // Generate Chronological Timeline for Daily View
  const dailyTimelineLogs = useMemo(() => {
    const list = [];
    if (historyData?.streakHistory && Array.isArray(historyData.streakHistory)) {
      historyData.streakHistory.forEach(entry => {
        const dObj = new Date(entry.date);
        list.push({
          id: entry._id || `streak-${dObj.getTime()}`,
          type: 'check_in',
          title: `Streak Check-In (Day ${entry.streakDay || 1})`,
          date: dObj,
          tier: entry.tier || 'Beginner',
          tag: 'Daily Streak',
          icon: Flame
        });
      });
    }

    if (historyData?.workouts && Array.isArray(historyData.workouts)) {
      historyData.workouts.forEach(w => {
        const dObj = new Date(w.date);
        list.push({
          id: w.id || `workout-${dObj.getTime()}`,
          type: 'workout',
          title: w.name || 'Workout Session',
          date: dObj,
          duration: w.duration ? `${w.duration} min` : 'Completed',
          calories: w.calories ? `${w.calories} kcal` : null,
          tag: 'Workout Completed',
          icon: Dumbbell
        });
      });
    }

    if (isActiveToday && list.length === 0) {
      list.push({
        id: 'today-active-log',
        type: 'check_in',
        title: `Streak Check-In (Day ${streak})`,
        date: new Date(),
        tier: 'Beginner',
        tag: 'Active Today',
        icon: Flame
      });
    }

    list.sort((a, b) => b.date - a.date);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return list.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.tag.toLowerCase().includes(q) ||
        item.date.toLocaleDateString().toLowerCase().includes(q)
      );
    }

    return list;
  }, [historyData, isActiveToday, streak, searchQuery]);

  // Generate Weekly Breakdown (Last 8 Weeks)
  const weeklyBreakdown = useMemo(() => {
    const weeks = [];
    const now = new Date();
    
    for (let w = 0; w < 8; w++) {
      const wEnd = new Date(now);
      wEnd.setDate(now.getDate() - (w * 7));
      const wStart = new Date(wEnd);
      wStart.setDate(wEnd.getDate() - 6);

      let trainedDays = 0;
      const daysArray = [];

      for (let d = 0; d < 7; d++) {
        const dayCheck = new Date(wStart);
        dayCheck.setDate(wStart.getDate() + d);
        const y = dayCheck.getFullYear();
        const m = dayCheck.getMonth();
        const dt = dayCheck.getDate();
        const k = `${y}-${m}-${dt}`;
        const hasAct = activeDateDetailsMap.has(k);
        if (hasAct) trainedDays++;

        daysArray.push({
          date: dayCheck,
          dayName: dayCheck.toLocaleDateString('en-US', { weekday: 'narrow' }),
          hasActivity: hasAct
        });
      }

      const percent = Math.round((trainedDays / 7) * 100);

      weeks.push({
        weekNumber: 8 - w,
        startDate: wStart,
        endDate: wEnd,
        trainedDays,
        percent,
        days: daysArray
      });
    }

    return weeks;
  }, [activeDateDetailsMap]);

  // Milestones with Vector Lucide Icon Mapping
  const milestoneConfigMap = {
    1: { icon: Target, color: 'text-rose-400', glow: 'from-rose-500/25 via-rose-600/10 to-transparent', border: 'border-rose-500/40' },
    3: { icon: Flame, color: 'text-orange-400', glow: 'from-orange-500/25 via-amber-500/10 to-transparent', border: 'border-orange-500/40' },
    7: { icon: Rocket, color: 'text-violet-400', glow: 'from-violet-500/25 via-indigo-500/10 to-transparent', border: 'border-violet-500/40' },
    14: { icon: Zap, color: 'text-amber-400', glow: 'from-amber-500/25 via-yellow-500/10 to-transparent', border: 'border-amber-500/40' },
    21: { icon: Dumbbell, color: 'text-emerald-400', glow: 'from-emerald-500/25 via-teal-500/10 to-transparent', border: 'border-emerald-500/40' },
    30: { icon: Trophy, color: 'text-yellow-400', glow: 'from-yellow-500/25 via-amber-500/10 to-transparent', border: 'border-yellow-500/40' },
    60: { icon: Crown, color: 'text-amber-300', glow: 'from-amber-500/25 via-orange-500/10 to-transparent', border: 'border-amber-500/40' },
    100: { icon: Gem, color: 'text-cyan-400', glow: 'from-cyan-500/25 via-blue-500/10 to-transparent', border: 'border-cyan-500/40' }
  };

  const milestones = [
    { days: 1, title: 'First Day', tier: 'Beginner', achieved: streak >= 1, progress: Math.min(streak, 1), progressPercent: Math.min(100, streak * 100) },
    { days: 3, title: '3 Day Fire', tier: 'Beginner', achieved: streak >= 3, progress: Math.min(streak, 3), progressPercent: Math.min(100, (streak / 3) * 100) },
    { days: 7, title: 'Week Warrior', tier: 'Beginner', achieved: streak >= 7, progress: Math.min(streak, 7), progressPercent: Math.min(100, (streak / 7) * 100) },
    { days: 14, title: '2 Week Power', tier: 'Intermediate', achieved: streak >= 14, progress: Math.min(streak, 14), progressPercent: Math.min(100, (streak / 14) * 100) },
    { days: 21, title: '3 Week Strong', tier: 'Intermediate', achieved: streak >= 21, progress: Math.min(streak, 21), progressPercent: Math.min(100, (streak / 21) * 100) },
    { days: 30, title: 'Monthly Master', tier: 'Intermediate', achieved: streak >= 30, progress: Math.min(streak, 30), progressPercent: Math.min(100, (streak / 30) * 100) },
    { days: 60, title: '2 Month King', tier: 'Advanced', achieved: streak >= 60, progress: Math.min(streak, 60), progressPercent: Math.min(100, (streak / 60) * 100) },
    { days: 100, title: 'Century Club', tier: 'Expert', achieved: streak >= 100, progress: Math.min(streak, 100), progressPercent: Math.min(100, (streak / 100) * 100) }
  ].map(m => ({
    ...m,
    ...(historyData?.milestones?.find(hm => hm.days === m.days) || {}),
    achieved: streak >= m.days,
    progress: Math.min(streak, m.days),
    iconConfig: milestoneConfigMap[m.days] || { icon: Award, color: 'text-orange-400', glow: 'from-orange-500/20 to-transparent', border: 'border-orange-500/30' }
  }));

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-orange-500 selection:text-white pb-40 sm:pb-28 overflow-x-hidden pt-2 sm:pt-4">
      {/* Background Ambient Lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-orange-500/15 via-amber-500/5 to-transparent blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5 sm:space-y-8">
        
        {/* ========================================================= */}
        {/* TOP HERO BANNER (PRESERVED EXACTLY AS REQUESTED) */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-900/90 via-[#111116] to-[#0d0d12] border border-orange-500/30 p-4 sm:p-7 shadow-2xl backdrop-blur-xl">
          {/* Subtle rim highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            {/* Left: Branding & Title */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer border border-white/10 shadow-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-[10px] sm:text-xs font-black text-orange-400">
                  <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                  <span>REAL-TIME STREAK TELEMETRY</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800/60 border border-neutral-700 text-[10px] sm:text-xs font-bold text-neutral-400">
                  <span>Athlete: {user?.name || 'Pro Athlete'}</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                <span>Streak & Activity Analytics</span>
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl font-medium leading-relaxed">
                Continuous workout tracking and consistency history synchronized across your profile in real-time.
              </p>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Refresh Streak Data"
                className="p-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
              </button>

              {canCheckIn && !isActiveToday ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleManualCheckIn}
                  disabled={isCheckingIn}
                  className="px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-orange-500/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 border border-orange-400/40"
                >
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-bounce" />
                  <span>{isCheckingIn ? 'Logging Streak...' : 'Log Workout Check-in'}</span>
                </motion.button>
              ) : (
                <div className="px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-black flex items-center gap-2 shadow-inner">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  <span>🔥 Streak Active Today</span>
                </div>
              )}

              <button
                onClick={() => navigate('/start-workout')}
                className="px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm uppercase tracking-wider border border-neutral-700 hover:border-orange-500/50 flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Zap className="w-4 h-4 text-orange-400" />
                <span className="hidden sm:inline">Start Workout</span>
                <span className="sm:hidden">Start</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Core Summary Metric Bento Cards (Mobile Responsive) */}
        {(() => {
          const displayLongest = longestStreak || (streak > 0 ? streak : 0);
          const displayTotalLogs = totalCheckIns || activeDateDetailsMap.size || (streak > 0 ? streak : 0);
          const displayActiveDays = Math.max(activeDaysInMonth, (currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear() && (streak > 0 || isActiveToday)) ? 1 : 0);
          const displayConsistency = Math.round((displayActiveDays / daysInMonth) * 100);

          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {/* Card 1: Current Streak */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#16161c] to-[#0c0c0e] border border-orange-500/40 p-3 sm:p-5 shadow-xl flex flex-col justify-between group hover:border-orange-500/70 transition-all">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[9px] sm:text-xs font-black text-neutral-400 uppercase tracking-wider">
                    Current Streak
                  </span>
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-md shadow-orange-500/10">
                    <Flame className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${streak > 0 ? 'animate-bounce text-orange-400' : 'text-neutral-500'}`} />
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-4xl font-black text-orange-400 font-mono tracking-tight flex items-baseline gap-1">
                    <span>{streak}</span>
                    <span className="text-[10px] sm:text-sm font-sans font-bold text-neutral-400">days active</span>
                  </div>
                  <span className="text-[9px] sm:text-xs text-neutral-400 font-medium mt-0.5 sm:mt-1 block truncate">
                    {isActiveToday || streak > 0 ? '🔥 Active today' : '⚡ Check-in available'}
                  </span>
                </div>
              </div>

              {/* Card 2: Longest Streak (PR) */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#16161c] to-[#0c0c0e] border border-neutral-800/80 p-3 sm:p-5 shadow-xl flex flex-col justify-between group hover:border-amber-500/50 transition-all">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[9px] sm:text-xs font-black text-neutral-400 uppercase tracking-wider">
                    Longest (PR)
                  </span>
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
                    <Trophy className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-4xl font-black text-amber-300 font-mono tracking-tight flex items-baseline gap-1">
                    <span>{displayLongest}</span>
                    <span className="text-[10px] sm:text-sm font-sans font-bold text-neutral-400">days PR</span>
                  </div>
                  <span className="text-[9px] sm:text-xs text-neutral-400 font-medium mt-0.5 sm:mt-1 block truncate">
                    All-time record
                  </span>
                </div>
              </div>

              {/* Card 3: Total Logs */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#16161c] to-[#0c0c0e] border border-neutral-800/80 p-3 sm:p-5 shadow-xl flex flex-col justify-between group hover:border-blue-500/50 transition-all">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[9px] sm:text-xs font-black text-neutral-400 uppercase tracking-wider">
                    Total Logs
                  </span>
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md shadow-blue-500/10">
                    <Target className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-4xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
                    <span>{displayTotalLogs}</span>
                    <span className="text-[10px] sm:text-sm font-sans font-bold text-neutral-400">sessions</span>
                  </div>
                  <span className="text-[9px] sm:text-xs text-neutral-400 font-medium mt-0.5 sm:mt-1 block truncate">
                    Verified logs
                  </span>
                </div>
              </div>

              {/* Card 4: Month Active Rate */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#16161c] to-[#0c0c0e] border border-neutral-800/80 p-3 sm:p-5 shadow-xl flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[9px] sm:text-xs font-black text-neutral-400 uppercase tracking-wider">
                    Consistency
                  </span>
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10">
                    <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight flex items-baseline gap-1">
                    <span>{displayConsistency}%</span>
                    <span className="text-[10px] sm:text-sm font-sans font-bold text-neutral-400">({displayActiveDays}/{daysInMonth}d)</span>
                  </div>
                  <span className="text-[9px] sm:text-xs text-neutral-400 font-medium mt-0.5 sm:mt-1 block truncate">
                    {monthNames[currentMonth]} {currentYear}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Multi-Timeframe Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-950/90 border border-neutral-800/80 rounded-2xl overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full sm:w-auto">
            {[
              { id: 'monthly', label: 'Monthly Calendar', icon: CalendarDays },
              { id: 'daily', label: 'Day-by-Day', icon: Clock },
              { id: 'weekly', label: 'Weekly Matrix', icon: Layers },
              { id: 'yearly', label: 'Yearly Overview', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = timeframe === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTimeframe(tab.id)}
                  className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-initial ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Search on Day-by-Day View */}
          {timeframe === 'daily' && (
            <div className="relative min-w-full sm:min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workout logs..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500/70"
              />
            </div>
          )}
        </div>

        {/* View Section 1: MONTHLY INTERACTIVE CALENDAR */}
        {timeframe === 'monthly' && (() => {
          const displayActiveDays = Math.max(activeDaysInMonth, (currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear() && (streak > 0 || isActiveToday)) ? 1 : 0);

          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
              {/* Calendar Main Matrix */}
              <div className="lg:col-span-2 bg-[#111116] border border-neutral-800/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xl space-y-3 sm:space-y-4">
                
                {/* Calendar Controls (Clean & Responsive Header) */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3 sm:pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-xl font-black text-white tracking-tight">
                      {monthNames[currentMonth]} {currentYear}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] sm:text-xs font-mono font-bold whitespace-nowrap">
                      🔥 {displayActiveDays} {displayActiveDays === 1 ? 'Day' : 'Days'} Active
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={handleGoToday}
                      className="px-2.5 py-1 sm:py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-[10px] sm:text-xs font-bold text-orange-400 border border-neutral-800 transition-colors"
                    >
                      Today
                    </button>
                    <button
                      onClick={handlePrevMonth}
                      className="p-1.5 sm:p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors border border-neutral-800"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-1.5 sm:p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors border border-neutral-800"
                      title="Next Month"
                    >
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                {/* Day-of-week Headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-black text-neutral-500 uppercase tracking-wider py-1">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                {/* Calendar Days Matrix */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {/* Empty cells for leading days */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-11 sm:h-14 rounded-xl bg-neutral-900/10 border border-neutral-900/20 opacity-20" />
                  ))}

                  {/* Actual Days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const key = `${currentYear}-${currentMonth}-${dayNum}`;
                    const hasActivity = activeDateDetailsMap.has(key);
                    const isSelected = 
                      selectedDayObj.getFullYear() === currentYear &&
                      selectedDayObj.getMonth() === currentMonth &&
                      selectedDayObj.getDate() === dayNum;

                    const isToday = 
                      new Date().getFullYear() === currentYear &&
                      new Date().getMonth() === currentMonth &&
                      new Date().getDate() === dayNum;

                    return (
                      <button
                        key={dayNum}
                        onClick={() => setSelectedDayObj(new Date(currentYear, currentMonth, dayNum))}
                        className={`h-11 sm:h-14 rounded-xl sm:rounded-2xl p-1 sm:p-2 flex flex-col justify-between items-center transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-gradient-to-br from-orange-500/40 via-orange-600/20 to-neutral-900 border-2 border-orange-500 shadow-md shadow-orange-500/30 scale-[1.04] z-10'
                            : hasActivity
                            ? 'bg-gradient-to-b from-orange-500/30 to-[#181822] border-2 border-orange-500/60 text-white shadow-md shadow-orange-500/20'
                            : isToday
                            ? 'bg-neutral-900 border-2 border-orange-500/70 text-white'
                            : 'bg-neutral-900/40 hover:bg-neutral-900/80 border border-neutral-800/40 text-neutral-400'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-[11px] sm:text-xs font-mono font-bold leading-none ${hasActivity || isSelected ? 'text-white' : 'text-neutral-400'}`}>
                            {dayNum}
                          </span>
                          {isToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse ml-auto" />
                          )}
                        </div>

                        {hasActivity ? (
                          <div className="flex items-center justify-center mt-auto">
                            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 animate-pulse" />
                          </div>
                        ) : (
                          <div className="w-1 h-1 rounded-full bg-neutral-800 mt-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Date Summary & Day Logs */}
              <div className="bg-[#111116] border border-neutral-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      <span>Date Inspector</span>
                    </h3>
                    <span className="text-xs font-mono font-bold text-orange-400">
                      {selectedDayObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {selectedDayInfo || (selectedDayObj.toDateString() === new Date().toDateString() && (streak > 0 || isActiveToday)) ? (
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 space-y-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/30 flex-shrink-0">
                          <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-base font-black text-white">
                            {selectedDayInfo?.title || `Streak Day ${streak}`}
                          </h4>
                          <span className="text-[11px] sm:text-xs text-orange-300 font-medium block">
                            Verified check-in recorded
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-orange-500/20">
                        <div>
                          <span className="text-neutral-400 block text-[9px] sm:text-[10px]">STATUS</span>
                          <span className="font-bold text-white text-[11px] sm:text-xs">🔥 Active Log</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[9px] sm:text-[10px]">TIME</span>
                          <span className="font-bold text-white text-[11px] sm:text-xs">
                            {selectedDayInfo?.date ? selectedDayInfo.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 sm:p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/60 text-center space-y-1.5">
                      <FlameKindling className="w-7 h-7 sm:w-8 sm:h-8 mx-auto text-neutral-600" />
                      <p className="text-xs font-bold text-neutral-400">No workout log recorded</p>
                      <p className="text-[10px] sm:text-[11px] text-neutral-500">Train today to add a new check-in.</p>
                    </div>
                  )}

                  {/* Monthly Adherence Stat Box */}
                  <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-neutral-400 uppercase text-[10px]">Month Adherence</span>
                      <span className="text-orange-400 font-mono text-[11px]">{displayActiveDays} of {daysInMonth} Days ({Math.round((displayActiveDays / daysInMonth) * 100)}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (displayActiveDays / daysInMonth) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/start-workout')}
                  className="w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-white" />
                  <span>Start Workout Today</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* View Section 2: DAY-BY-DAY CHRONOLOGICAL TIMELINE */}
        {timeframe === 'daily' && (
          <div className="bg-[#111116] border border-neutral-800/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <h3 className="text-sm sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                <span>Session Timeline</span>
              </h3>
              <span className="text-xs font-mono font-bold text-neutral-400 bg-neutral-900 px-2.5 py-0.5 rounded-full border border-neutral-800">
                {dailyTimelineLogs.length} Records
              </span>
            </div>

            <div className="divide-y divide-neutral-900/80">
              {dailyTimelineLogs.length > 0 ? (
                dailyTimelineLogs.map((log) => {
                  const Icon = log.icon || Flame;
                  return (
                    <div key={log.id} className="py-3 sm:py-4 flex items-center justify-between gap-3 group hover:bg-neutral-900/40 px-2 rounded-2xl transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                          log.type === 'check_in' 
                            ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/40 text-orange-400' 
                            : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 text-emerald-400'
                        }`}>
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-base font-black text-white leading-snug">
                            {log.title}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                            <span>{log.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span>•</span>
                            <span>{log.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {log.calories && (
                              <>
                                <span>•</span>
                                <span className="text-amber-400 font-mono font-bold">{log.calories}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border ${
                          log.type === 'check_in'
                            ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}>
                          <Check className="w-3 h-3" />
                          <span>{log.tag}</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-neutral-500 space-y-2">
                  <Flame className="w-10 h-10 mx-auto text-neutral-700 animate-pulse" />
                  <p className="font-bold text-xs sm:text-sm text-neutral-300">No workout logs matching query.</p>
                  <p className="text-[11px] text-neutral-500">Tap "Log Workout Check-in" above to record your active day!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Section 3: WEEKLY 8-WEEK MATRIX */}
        {timeframe === 'weekly' && (
          <div className="bg-[#111116] border border-neutral-800/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <h3 className="text-sm sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                <span>8-Week Matrix</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {weeklyBreakdown.map((wk) => (
                <div key={wk.weekNumber} className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-neutral-900/60 border border-neutral-800/80 space-y-3 hover:border-neutral-700 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs sm:text-base font-black text-white uppercase tracking-wider">
                        Week {wk.weekNumber}
                      </span>
                      <p className="text-[10px] sm:text-xs text-neutral-400">
                        {wk.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {wk.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm sm:text-base font-black text-orange-400 font-mono">
                        {wk.trainedDays}/7 Days
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-neutral-400 block font-mono font-bold">
                        {wk.percent}% Completed
                      </span>
                    </div>
                  </div>

                  {/* 7-day pill strip */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                    {wk.days.map((d, dIdx) => (
                      <div
                        key={dIdx}
                        className={`py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-center flex flex-col items-center justify-between gap-1 border transition-all ${
                          d.hasActivity
                            ? 'bg-orange-500/20 border-orange-500/40 text-orange-400 font-bold shadow-sm'
                            : 'bg-neutral-950/80 border-neutral-800/50 text-neutral-600'
                        }`}
                      >
                        <span className="text-[8px] sm:text-[9px] uppercase font-bold">{d.dayName}</span>
                        {d.hasActivity ? (
                          <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400 animate-pulse" />
                        ) : (
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-neutral-800" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Section 4: 12-MONTH ANNUAL HEATMAP */}
        {timeframe === 'yearly' && (
          <div className="bg-[#111116] border border-neutral-800/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <h3 className="text-sm sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                <span>{currentYear} Annual Consistency</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {monthNames.map((mName, mIdx) => {
                const totalDays = new Date(currentYear, mIdx + 1, 0).getDate();
                let mActive = 0;
                for (let d = 1; d <= totalDays; d++) {
                  if (activeDateDetailsMap.has(`${currentYear}-${mIdx}-${d}`)) {
                    mActive++;
                  }
                }
                const rate = Math.round((mActive / totalDays) * 100);

                return (
                  <div key={mName} className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-neutral-900/60 border border-neutral-800/80 space-y-2 hover:border-orange-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] sm:text-sm font-black text-white uppercase">{mName}</span>
                      <span className="text-[10px] sm:text-xs font-mono font-bold text-orange-400">{mActive}d</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${rate}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                      <span>{rate}% Active</span>
                      <span>{totalDays}d</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Milestone Progression Showcase (Mobile Responsive Grid) */}
        <div className="bg-[#111116] border border-neutral-800/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xl space-y-3.5">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
            <h3 className="text-xs sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-1.5 sm:gap-2">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              <span>Milestone Badges</span>
            </h3>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-400">
              {milestones.filter(m => m.achieved).length} of {milestones.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-2.5 sm:gap-3.5">
            {milestones.map((m) => {
              const IconComponent = m.iconConfig?.icon || Award;
              return (
                <div 
                  key={m.days}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-between text-center transition-all ${
                    m.achieved
                      ? 'bg-gradient-to-b from-orange-500/20 via-neutral-900 to-neutral-950 border-orange-500/50 shadow-lg shadow-orange-500/10'
                      : 'bg-neutral-900/40 border-neutral-800/60 opacity-60'
                  }`}
                >
                  <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center mb-1.5 shadow-md transition-all ${
                    m.achieved
                      ? `bg-gradient-to-br ${m.iconConfig?.glow || 'from-orange-500/20 to-transparent'} border ${m.iconConfig?.border || 'border-orange-500/30'} shadow-sm scale-105`
                      : 'bg-neutral-800/50 border border-neutral-700/30'
                  }`}>
                    <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${m.achieved ? (m.iconConfig?.color || 'text-orange-400') : 'text-neutral-500'}`} />
                  </div>
                  <div className="text-[11px] sm:text-xs font-black text-white leading-tight mb-0.5 truncate w-full">
                    {m.title}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-neutral-400 mb-2">
                    {m.days} Days
                  </span>

                  <span className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider ${
                    m.achieved ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {m.achieved ? 'Unlocked' : `${m.progress}/${m.days}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Floating Celebration Toast */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 p-3 sm:p-4 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-3 font-black text-xs sm:text-sm uppercase tracking-wide border border-white/20"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            <span>🔥 {feedbackMessage || 'Streak Logged Successfully!'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
