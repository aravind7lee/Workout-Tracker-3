import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dumbbell, Play, RefreshCw, Zap, Layers, Plus, Calendar, 
  ChevronRight, Award, Trash2, ArrowRight, Sparkles, Flame, 
  Clock, TrendingUp, ChevronLeft, CalendarDays, CheckCircle2, 
  Target, History, Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
import api from '../utils/api';
import { 
  getMuscleGroup, 
  getPrimaryMuscleGroup, 
  getMuscleGroupTheme, 
  getExerciseDisplayName 
} from '../utils/muscleGroupHelper';

const ACTIVE_SESSION_KEY = 'active_workout_session';

export default function StartWorkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOnline } = useRealTime();

  // Active Draft / In-Progress State
  const [activeDraft, setActiveDraft] = useState(null);
  const [lastWorkout, setLastWorkout] = useState(null);
  const [plans, setPlans] = useState([]);
  const [freestyleTitle, setFreestyleTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // History & Calendar States
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('monthly'); // 'daily' | 'weekly' | 'monthly' | 'yearly'
  
  // Calendar Navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    checkActiveDraft();
    fetchLaunchpadData();
    fetchAllWorkoutHistory();

    const handleWorkoutUpdate = () => {
      checkActiveDraft();
      fetchLaunchpadData();
      fetchAllWorkoutHistory();
    };

    window.addEventListener('workoutCompleted', handleWorkoutUpdate);
    window.addEventListener('realTimeStatsUpdate', handleWorkoutUpdate);
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutUpdate);
      window.removeEventListener('realTimeStatsUpdate', handleWorkoutUpdate);
    };
  }, []);

  const checkActiveDraft = () => {
    try {
      const savedDraft = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && (parsed.sessionState === 'ACTIVE' || (Array.isArray(parsed.exercises) && parsed.exercises.length > 0))) {
          setActiveDraft(parsed);
          return;
        }
      }
      setActiveDraft(null);
    } catch (e) {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
      setActiveDraft(null);
    }
  };

  const fetchLaunchpadData = async () => {
    setLoading(true);
    try {
      // Fetch user's last workout
      try {
        const lastRes = await api.get('/workouts?limit=1&status=completed');
        if (lastRes.data?.success && lastRes.data?.workouts?.length > 0) {
          const raw = lastRes.data.workouts[0];
          const rawEx = Array.isArray(raw.exercises) ? raw.exercises : [];
          const primaryMuscle = raw.category || raw.muscle || getPrimaryMuscleGroup(rawEx) || getMuscleGroup(raw.title);
          const displayName = getExerciseDisplayName(raw.title || rawEx[0]?.exerciseName || 'Workout Session');

          setLastWorkout({
            ...raw,
            displayName,
            primaryMuscle
          });
        }
      } catch (err) {
        // No previous workout found
      }

      // Fetch user's plans
      try {
        const plansRes = await api.get('/plans');
        if (plansRes.data?.success && Array.isArray(plansRes.data.plans)) {
          setPlans(plansRes.data.plans);
        }
      } catch (err) {
        console.warn('Failed to load plans:', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllWorkoutHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/workouts?limit=200&status=completed');
      const list = Array.isArray(res.data?.workouts) ? res.data.workouts : (Array.isArray(res.data) ? res.data : []);
      
      const normalized = list.map(w => {
        const rawEx = Array.isArray(w.exercises) ? w.exercises : [];
        const primaryMuscle = w.category || w.muscle || getPrimaryMuscleGroup(rawEx) || getMuscleGroup(w.title);
        const displayName = getExerciseDisplayName(w.title || rawEx[0]?.exerciseName || 'Workout Session');
        const completedDate = new Date(w.completedAt || w.date || w.createdAt || Date.now());

        const totalSets = rawEx.reduce((sum, ex) => sum + (Array.isArray(ex.sets) ? ex.sets.length : 0), 0);
        const totalReps = rawEx.reduce((sum, ex) => sum + (Array.isArray(ex.sets) ? ex.sets.reduce((s, set) => s + (Number(set.reps) || 0), 0) : 0), 0);
        const totalVolume = w.totalVolume || rawEx.reduce((sum, ex) => sum + (Array.isArray(ex.sets) ? ex.sets.reduce((s, set) => s + (Number(set.reps) || 0) * (Number(set.weight) || 0), 0) : 0), 0);

        return {
          ...w,
          id: w._id || w.id,
          displayName,
          primaryMuscle,
          completedDate,
          totalSets,
          totalReps,
          totalVolume,
          duration: w.durationMinutes ? w.durationMinutes * 60 : (w.duration || 0),
          caloriesBurned: w.calories || w.caloriesBurned || 0
        };
      });

      setAllWorkouts(normalized);
    } catch (err) {
      console.warn('Failed to fetch workout history for calendar:', err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Session Actions
  // ---------------------------------------------------------
  const handleResumeDraft = () => {
    navigate('/workout-session');
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    setActiveDraft(null);
  };

  const handleStartFreestyle = () => {
    const title = freestyleTitle.trim() || 'Freestyle Workout';
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    navigate('/workout-session', { state: { defaultTitle: title } });
  };

  const handleRepeatLastWorkout = (targetWorkout = lastWorkout) => {
    if (!targetWorkout) return;
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    navigate('/workout-session', { state: { repeatWorkout: targetWorkout } });
  };

  const handleStartPlan = (plan) => {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    navigate('/workout-session', { state: { workoutPlan: plan } });
  };

  // ---------------------------------------------------------
  // Calendar Calculations
  // ---------------------------------------------------------
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentYear, currentMonth]);

  const workoutDatesMap = useMemo(() => {
    const map = {};
    allWorkouts.forEach(w => {
      const d = w.completedDate;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(w);
    });
    return map;
  }, [allWorkouts]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Filtered Sessions for the active timeframe and selection
  const filteredSessions = useMemo(() => {
    if (allWorkouts.length === 0) return [];

    if (timeframe === 'daily') {
      const selKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
      return workoutDatesMap[selKey] || [];
    }

    if (timeframe === 'weekly') {
      const now = selectedDate.getTime();
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      return allWorkouts.filter(w => {
        const time = w.completedDate.getTime();
        return time >= oneWeekAgo && time <= now + (24 * 60 * 60 * 1000);
      });
    }

    if (timeframe === 'monthly') {
      return allWorkouts.filter(w => {
        const d = w.completedDate;
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });
    }

    if (timeframe === 'yearly') {
      return allWorkouts.filter(w => {
        return w.completedDate.getFullYear() === currentYear;
      });
    }

    return allWorkouts;
  }, [allWorkouts, timeframe, selectedDate, currentYear, currentMonth, workoutDatesMap]);

  // Aggregate Stats for Selected Period
  const periodStats = useMemo(() => {
    const totalCount = filteredSessions.length;
    const totalVolume = filteredSessions.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
    const totalDurationSeconds = filteredSessions.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalCalories = filteredSessions.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    return {
      totalCount,
      totalVolume,
      totalDurationMinutes: Math.round(totalDurationSeconds / 60),
      totalCalories
    };
  }, [filteredSessions]);

  // Calculate Active Streak
  const currentStreak = useMemo(() => {
    if (allWorkouts.length === 0) return 0;
    const uniqueDays = new Set(
      allWorkouts.map(w => `${w.completedDate.getFullYear()}-${w.completedDate.getMonth()}-${w.completedDate.getDate()}`)
    );

    let streak = 0;
    const checkDate = new Date();
    
    // Check if worked out today
    const todayKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
    if (!uniqueDays.has(todayKey)) {
      // Check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
      if (uniqueDays.has(key)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [allWorkouts]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-36 sm:pb-28 pt-2 sm:pt-4">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 space-y-4 sm:space-y-6">
        
        {/* =========================================================
            1. HEADER & GYM STREAK BANNER
           ========================================================= */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-1 text-orange-500 font-bold text-[9px] sm:text-xs uppercase tracking-wider">
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" /> Start Training
            </div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight truncate">
              Workout Launchpad
            </h1>
            <p className="text-[10px] sm:text-xs text-neutral-400 line-clamp-1">
              Start workouts, resume drafts, or track consistency.
            </p>
          </div>

          {/* Active Training Streak Tag */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-orange-500/20 via-neutral-900 to-neutral-900 border border-orange-500/30 rounded-xl sm:rounded-2xl shadow-lg shrink-0">
            <div className="p-1 sm:p-1.5 bg-orange-500 text-white rounded-lg sm:rounded-xl shadow-md shadow-orange-500/30">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            </div>
            <div>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-bold text-neutral-400 block leading-none">Streak</span>
              <span className="text-[11px] sm:text-xs md:text-sm font-black text-orange-400 font-mono leading-tight">
                {currentStreak}d Active
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================
            2. RESUME IN-PROGRESS SESSION (TOP PRIORITY)
           ========================================================= */}
        {activeDraft && (
          <div className="p-3.5 sm:p-5 bg-gradient-to-r from-orange-500/25 via-amber-500/15 to-neutral-900 border-2 border-orange-500 rounded-xl sm:rounded-3xl shadow-2xl space-y-3 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-lg shadow-orange-500/40 shrink-0">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 bg-orange-500 text-black font-black text-[8px] sm:text-[9px] uppercase tracking-widest rounded">
                      ⚡ In-Progress
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-orange-300 font-mono font-bold">
                      {activeDraft.elapsedSeconds ? `${Math.floor(activeDraft.elapsedSeconds / 60)}m logged` : 'Active'}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-base font-black text-white truncate mt-0.5">
                    {activeDraft.title || 'Freestyle Workout Session'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleDiscardDraft}
                  className="px-2.5 py-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-900/80 rounded-lg sm:rounded-xl transition-colors text-[10px] sm:text-xs font-bold flex items-center gap-1"
                  title="Discard Draft"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Discard</span>
                </button>
                <button
                  onClick={handleResumeDraft}
                  className="flex-1 sm:flex-initial px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-black rounded-lg sm:rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-1.5 transition-all text-[11px] sm:text-xs uppercase tracking-wider"
                >
                  <span>RESUME SESSION</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            3. REPEAT LAST WORKOUT QUICK CARD
           ========================================================= */}
        {lastWorkout && (
          <div className="p-3 sm:p-4 bg-neutral-900 border border-neutral-800 rounded-xl sm:rounded-2xl space-y-2.5 hover:border-neutral-700 transition-all shadow-lg">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-2 sm:p-2.5 bg-neutral-800 text-orange-500 rounded-xl shrink-0">
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] sm:text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                      Repeat Previous
                    </span>
                    <span className="px-1.5 py-0.2 bg-orange-500/10 text-orange-400 rounded text-[8px] sm:text-[9px] font-bold uppercase">
                      {lastWorkout.primaryMuscle}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-base font-black text-white truncate mt-0.5">
                    {lastWorkout.displayName}
                  </h3>
                  <span className="text-[9px] sm:text-[10px] text-neutral-400 block font-mono">
                    {new Date(lastWorkout.completedAt || lastWorkout.date || lastWorkout.createdAt).toLocaleDateString()} • {lastWorkout.exercises?.length || 0} Ex.
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleRepeatLastWorkout(lastWorkout)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-neutral-800 hover:bg-orange-500 text-white font-bold text-[10px] sm:text-xs rounded-lg sm:rounded-xl flex items-center gap-1 transition-all shadow-md shrink-0 whitespace-nowrap"
              >
                <span>Repeat</span> <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            4. START FREESTYLE WORKOUT
           ========================================================= */}
        <div className="p-3 sm:p-4 bg-neutral-900 border border-neutral-800 rounded-xl sm:rounded-2xl space-y-2.5 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl shrink-0">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">Freestyle Workout</h2>
              <p className="text-[9px] sm:text-[10px] text-neutral-400">Start an empty workout and add exercises on the fly.</p>
            </div>
          </div>

          <div className="flex gap-2 pt-0.5">
            <input
              type="text"
              placeholder="e.g. Upper Body, Chest Blast..."
              value={freestyleTitle}
              onChange={(e) => setFreestyleTitle(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
            <button
              onClick={handleStartFreestyle}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] sm:text-xs rounded-lg sm:rounded-xl shadow-md flex items-center justify-center gap-1 transition-all uppercase tracking-wider shrink-0"
            >
              <span>Start</span> <Play className="w-2.5 h-2.5 fill-current shrink-0" />
            </button>
          </div>
        </div>

        {/* =========================================================
            5. PROFESSIONAL GYM VIBE INTERACTIVE CALENDAR & TRACKER (MOBILE FIRST)
           ========================================================= */}
        <div className="p-3 sm:p-5 bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl sm:rounded-3xl space-y-4 shadow-xl">
          
          {/* Header & Mobile-First Segmented Control */}
          <div className="space-y-3 border-b border-neutral-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg sm:rounded-xl text-white shadow-md shrink-0">
                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-base md:text-lg font-black text-white tracking-tight truncate">
                  Session History & Calendar
                </h2>
                <p className="text-[9px] sm:text-[10px] text-neutral-400 line-clamp-1">
                  Track consistency and volume across timeframes.
                </p>
              </div>
            </div>

            {/* Responsive 4-Column Segmented Control */}
            <div className="grid grid-cols-4 bg-neutral-950 border border-neutral-800 p-1 rounded-xl gap-1">
              {[
                { key: 'daily', label: 'Daily' },
                { key: 'weekly', label: 'Weekly' },
                { key: 'monthly', label: 'Monthly' },
                { key: 'yearly', label: 'Yearly' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setTimeframe(tab.key)}
                  className={`py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-xs font-bold transition-all uppercase tracking-wider text-center ${
                    timeframe === tab.key
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Period Summary Stats Bento: Compact 4-Grid */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
            <div className="p-2 sm:p-3 bg-neutral-950 border border-neutral-800/80 rounded-lg sm:rounded-xl text-center">
              <span className="text-[7px] sm:text-[9px] text-neutral-400 font-bold uppercase tracking-wider block truncate">
                Workouts
              </span>
              <span className="text-xs sm:text-lg md:text-xl font-black text-white font-mono block">
                {periodStats.totalCount}
              </span>
            </div>

            <div className="p-2 sm:p-3 bg-neutral-950 border border-neutral-800/80 rounded-lg sm:rounded-xl text-center">
              <span className="text-[7px] sm:text-[9px] text-neutral-400 font-bold uppercase tracking-wider block truncate">
                Volume
              </span>
              <span className="text-xs sm:text-lg md:text-xl font-black text-orange-400 font-mono block truncate">
                {periodStats.totalVolume > 999 ? `${(periodStats.totalVolume / 1000).toFixed(1)}k` : periodStats.totalVolume} kg
              </span>
            </div>

            <div className="p-2 sm:p-3 bg-neutral-950 border border-neutral-800/80 rounded-lg sm:rounded-xl text-center">
              <span className="text-[7px] sm:text-[9px] text-neutral-400 font-bold uppercase tracking-wider block truncate">
                Time
              </span>
              <span className="text-xs sm:text-lg md:text-xl font-black text-blue-400 font-mono block truncate">
                {periodStats.totalDurationMinutes}m
              </span>
            </div>

            <div className="p-2 sm:p-3 bg-neutral-950 border border-neutral-800/80 rounded-lg sm:rounded-xl text-center">
              <span className="text-[7px] sm:text-[9px] text-neutral-400 font-bold uppercase tracking-wider block truncate">
                Calories
              </span>
              <span className="text-xs sm:text-lg md:text-xl font-black text-red-400 font-mono block truncate">
                {periodStats.totalCalories}
              </span>
            </div>
          </div>

          {/* Interactive Month Calendar Widget (Compact & Responsive) */}
          {(timeframe === 'monthly' || timeframe === 'daily') && (
            <div className="p-2.5 sm:p-4 bg-neutral-950 border border-neutral-800/80 rounded-xl sm:rounded-2xl space-y-2.5 sm:space-y-3.5">
              
              {/* Calendar Controls */}
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-base font-black text-white tracking-tight">
                    {monthNames[currentMonth]} {currentYear}
                  </span>
                  <button
                    onClick={handleGoToday}
                    className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-[8px] sm:text-[10px] font-bold text-orange-400 rounded transition-colors"
                  >
                    Today
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 sm:p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-md transition-colors"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 sm:p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-md transition-colors"
                    title="Next Month"
                  >
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              {/* Day-of-week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[8px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="py-0.5">{d}</div>
                ))}
              </div>

              {/* Calendar Days Grid: Compact Mobile Cells */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {/* Empty cells for leading days */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-7 sm:h-9 rounded-lg bg-neutral-900/20 opacity-20" />
                ))}

                {/* Actual Month Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateKey = `${currentYear}-${currentMonth}-${dayNum}`;
                  const dayWorkouts = workoutDatesMap[dateKey] || [];
                  const hasWorkout = dayWorkouts.length > 0;

                  const isSelected = 
                    selectedDate.getFullYear() === currentYear &&
                    selectedDate.getMonth() === currentMonth &&
                    selectedDate.getDate() === dayNum;

                  const isToday = 
                    new Date().getFullYear() === currentYear &&
                    new Date().getMonth() === currentMonth &&
                    new Date().getDate() === dayNum;

                  return (
                    <button
                      key={dayNum}
                      onClick={() => {
                        setSelectedDate(new Date(currentYear, currentMonth, dayNum));
                        if (timeframe !== 'daily') setTimeframe('daily');
                      }}
                      className={`h-7 sm:h-9 rounded-lg flex flex-col items-center justify-between p-1 transition-all relative ${
                        isSelected 
                          ? 'bg-orange-500 text-white font-black shadow-md shadow-orange-500/30 scale-105 z-10'
                          : hasWorkout
                          ? 'bg-gradient-to-b from-neutral-800 to-neutral-900 border border-orange-500/50 text-white hover:border-orange-500'
                          : isToday
                          ? 'bg-neutral-900 border border-neutral-700 text-orange-400'
                          : 'bg-neutral-900/50 hover:bg-neutral-800/60 text-neutral-400'
                      }`}
                    >
                      <span className="text-[9px] sm:text-xs font-mono font-bold leading-none">{dayNum}</span>
                      
                      {/* Compact Workout Indicator Dot */}
                      {hasWorkout && (
                        <div className="flex items-center justify-center">
                          <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-500 animate-pulse'}`} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sessions List for Selected Period */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-orange-500" />
                <span>
                  {timeframe === 'daily' && `${selectedDate.toLocaleDateString()}`}
                  {timeframe === 'weekly' && 'This Week'}
                  {timeframe === 'monthly' && `${monthNames[currentMonth]} ${currentYear}`}
                  {timeframe === 'yearly' && `${currentYear}`}
                </span>
                <span className="px-1.5 py-0.2 bg-neutral-800 text-neutral-300 rounded text-[9px] font-mono">
                  {filteredSessions.length}
                </span>
              </h3>
            </div>

            {historyLoading ? (
              <div className="text-center py-6 text-neutral-500 text-[10px]">Loading records...</div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-4 bg-neutral-950/60 border border-neutral-800/80 rounded-xl text-center space-y-1.5">
                <p className="text-[10px] text-neutral-400">No workout sessions logged for this day.</p>
                <button
                  onClick={handleStartFreestyle}
                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold rounded-lg shadow-md inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Train Today
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSessions.map((session, sIdx) => {
                  const theme = getMuscleGroupTheme(session.primaryMuscle);

                  return (
                    <div
                      key={session.id || sIdx}
                      className="p-2.5 sm:p-3.5 bg-neutral-950 border border-neutral-800/80 rounded-xl flex items-center justify-between gap-2 hover:border-neutral-700 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-orange-500 shrink-0">
                          <Dumbbell className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wide border ${theme.bg} ${theme.border} ${theme.text}`}>
                              {theme.icon} {theme.name}
                            </span>
                            <span className="text-[9px] text-neutral-400 font-mono truncate">
                              {session.completedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-black text-white truncate mt-0.5">
                            {session.displayName}
                          </h4>
                          <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-neutral-400 font-mono">
                            <span>{session.totalSets} Sets</span>
                            <span>•</span>
                            <span>{session.totalReps} Reps</span>
                            {session.totalVolume > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-orange-400">{session.totalVolume} kg</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => navigate(`/workout-details/${session.id}`, { state: { workout: session } })}
                          className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-[10px] sm:text-xs font-bold border border-neutral-800 transition-colors"
                        >
                          View →
                        </button>
                        <button
                          onClick={() => handleRepeatLastWorkout(session)}
                          className="p-1 sm:p-1.5 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white rounded-lg transition-colors"
                          title="Repeat Session"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================
            6. WORKOUT PLANS PRESETS
           ========================================================= */}
        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 shrink-0" />
              <h2 className="text-xs sm:text-base font-bold text-white">Your Workout Plans</h2>
            </div>
            <button
              onClick={() => navigate('/plans')}
              className="text-[10px] sm:text-xs text-orange-400 hover:underline font-semibold"
            >
              Manage Plans →
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4 text-neutral-500 text-[10px]">Loading plans...</div>
          ) : plans.length === 0 ? (
            <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl text-center space-y-1.5">
              <p className="text-[10px] text-neutral-400">No workout plans created yet</p>
              <button
                onClick={() => navigate('/plans')}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-bold rounded-lg transition-colors inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Create Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              {plans.map((plan) => (
                <div
                  key={plan._id || plan.id}
                  className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between gap-2.5 hover:border-orange-500/40 transition-all shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] font-bold text-orange-400 uppercase tracking-wider bg-orange-500/10 px-1.5 py-0.2 rounded border border-orange-500/20">
                      {plan.category || 'Plan'}
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-white mt-1 truncate">{plan.name}</h3>
                    <p className="text-[9px] text-neutral-400 font-mono">
                      {plan.exercises?.length || 0} Exercises
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartPlan(plan)}
                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 transition-colors shadow-sm shrink-0 uppercase tracking-wider"
                  >
                    Start <Play className="w-2.5 h-2.5 fill-current shrink-0" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
