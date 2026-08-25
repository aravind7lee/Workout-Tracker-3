// frontend/src/components/StreakWidget.jsx
// Professional Interactive Workout Streak & Calendar Component (Mobile First, High-End)

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Flame, 
  Trophy, 
  Calendar, 
  CheckCircle2, 
  Zap, 
  X, 
  Sparkles, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  History,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRealTimeStreak } from '../hooks/useRealTimeStreak';
import { useAuth } from '../context/AuthContext';
import { realTimeStreakService } from '../services/realTimeStreakService';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function StreakWidget({ className = "", compact = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    streak,
    longestStreak,
    totalCheckIns,
    isActiveToday,
    canCheckIn,
    weeklyProgress,
    streakHistory,
    checkIn,
    isCheckingIn
  } = useRealTimeStreak();

  const [isOpen, setIsOpen] = useState(() => realTimeStreakService.isModalOpen);
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Calendar Navigation State
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  useEffect(() => {
    const unsub = realTimeStreakService.subscribeToModal((openState) => {
      setIsOpen(openState);
    });
    return unsub;
  }, []);

  const openModal = (e) => {
    if (e) e.stopPropagation();
    realTimeStreakService.setModalOpen(true);
  };

  const closeModal = (e) => {
    if (e) e.stopPropagation();
    realTimeStreakService.setModalOpen(false);
  };

  const handleCheckInClick = async (e) => {
    if (e) e.stopPropagation();
    if (isCheckingIn) return;

    const res = await checkIn();
    if (res?.success) {
      setShowCelebration(true);
      setFeedbackMessage(res.message || `🔥 Day ${res.currentStreak || streak + 1} Logged!`);
      setTimeout(() => setShowCelebration(false), 4000);
    }
  };

  // Build active date set (YYYY-MM-DD) from streak history and current check-in
  const activeDatesMap = useMemo(() => {
    const map = new Set();
    const toKey = (d) => {
      if (!d) return '';
      const obj = new Date(d);
      if (isNaN(obj.getTime())) return '';
      return `${obj.getFullYear()}-${obj.getMonth()}-${obj.getDate()}`;
    };

    if (Array.isArray(streakHistory)) {
      streakHistory.forEach(h => {
        const k = toKey(h.date);
        if (k) map.add(k);
      });
    }

    if (streak > 0) {
      const today = new Date();
      for (let i = 0; i < Math.min(streak, 365); i++) {
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - i);
        map.add(toKey(pastDate));
      }
    }

    if (isActiveToday || streak > 0) {
      map.add(toKey(new Date()));
    }

    return map;
  }, [streakHistory, isActiveToday, streak]);

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = (e) => {
    if (e) e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    if (e) e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToday = (e) => {
    if (e) e.stopPropagation();
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today);
  };

  // Streak text
  const streakDisplay = streak > 0 ? `${streak}d Active` : '0d Active';

  // Count active days in current displayed month
  const activeDaysThisMonth = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (activeDatesMap.has(`${currentYear}-${currentMonth}-${d}`)) {
        count++;
      }
    }
    return Math.max(count, (currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear() && (streak > 0 || isActiveToday)) ? 1 : 0);
  }, [activeDatesMap, daysInMonth, currentMonth, currentYear, streak, isActiveToday]);

  // Selected date key
  const selectedKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
  const isSelectedActive = activeDatesMap.has(selectedKey) || (selectedDate.toDateString() === new Date().toDateString() && (streak > 0 || isActiveToday));
  const displayLongest = Math.max(longestStreak || 0, streak || 0, streak > 0 ? 1 : 0);

  // Portal Modal
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-[390px] sm:max-w-[440px] bg-gradient-to-b from-[#16161c] via-[#0f0f14] to-black border border-orange-500/50 rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(249,115,22,0.25)] overflow-hidden text-white max-h-[92vh] flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top ambient glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/25 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800/80 relative z-10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/40 border border-orange-400/30 flex-shrink-0">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    Workout Streak
                  </h3>
                  <p className="text-[10px] sm:text-xs text-neutral-400 font-medium leading-tight">
                    Consistency builds championship physique
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Middle Content */}
            <div className="overflow-y-auto overflow-x-hidden py-3 space-y-3.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden relative z-10 flex-1">
              
              {/* 2 Main Metric Cards: Current Streak & Longest Streak */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <div className="p-3 sm:p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 text-center flex flex-col justify-center shadow-inner">
                  <span className="text-[9px] sm:text-[11px] text-neutral-400 font-bold uppercase tracking-wider block mb-0.5">
                    Current Streak
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-orange-400 font-mono flex items-baseline justify-center gap-1">
                    <span>{streak}</span>
                    <span className="text-[11px] font-sans font-bold text-neutral-400">days</span>
                  </div>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 text-center flex flex-col justify-center shadow-inner">
                  <span className="text-[9px] sm:text-[11px] text-neutral-400 font-bold uppercase tracking-wider block mb-0.5">
                    Longest Streak
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono flex items-baseline justify-center gap-1">
                    <span>{displayLongest}</span>
                    <span className="text-[11px] font-sans font-bold text-neutral-400">days</span>
                  </div>
                </div>
              </div>

              {/* Interactive Calendar Widget (StartWorkout Style) */}
              <div className="p-2.5 sm:p-3.5 bg-neutral-950/90 border border-neutral-800/90 rounded-2xl space-y-2">
                {/* Calendar Controls */}
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-black text-white tracking-tight">
                      {monthNames[currentMonth]} {currentYear}
                    </span>
                    <button
                      type="button"
                      onClick={handleGoToday}
                      className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-[8px] sm:text-[10px] font-bold text-orange-400 rounded transition-colors"
                    >
                      Today
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded-full mr-1">
                      {activeDaysThisMonth} {activeDaysThisMonth === 1 ? 'Day' : 'Days'} Active
                    </span>
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-md transition-colors"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-md transition-colors"
                      title="Next Month"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Day-of-week Headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-[8px] sm:text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="py-0.5">{d}</div>
                  ))}
                </div>

                {/* Calendar Days Grid: Compact Mobile Cells */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                  {/* Empty cells for leading days */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-7 sm:h-8 rounded-lg bg-neutral-900/20 opacity-20" />
                  ))}

                  {/* Actual Month Days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateKey = `${currentYear}-${currentMonth}-${dayNum}`;
                    const hasActivity = activeDatesMap.has(dateKey) || (currentYear === new Date().getFullYear() && currentMonth === new Date().getMonth() && dayNum === new Date().getDate() && (streak > 0 || isActiveToday));

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
                        type="button"
                        onClick={() => setSelectedDate(new Date(currentYear, currentMonth, dayNum))}
                        className={`h-7 sm:h-8 rounded-lg flex flex-col items-center justify-between p-1 transition-all relative cursor-pointer ${
                          isSelected 
                            ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black shadow-md shadow-orange-500/40 scale-105 z-10'
                            : hasActivity
                            ? 'bg-gradient-to-b from-orange-500/30 to-[#181822] border border-orange-500/60 text-white shadow-sm shadow-orange-500/20'
                            : isToday
                            ? 'bg-neutral-900 border-2 border-orange-500/70 text-white'
                            : 'bg-neutral-900/50 hover:bg-neutral-800/60 text-neutral-400'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-[9px] sm:text-[10px] font-mono font-bold leading-none ${hasActivity || isSelected ? 'text-white' : 'text-neutral-400'}`}>{dayNum}</span>
                          {isToday && !isSelected && (
                            <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse ml-auto" />
                          )}
                        </div>
                        
                        {/* Activity Indicator */}
                        {hasActivity ? (
                          <div className="flex items-center justify-center mt-auto">
                            <Flame className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isSelected ? 'text-white' : 'text-orange-400 animate-pulse'}`} />
                          </div>
                        ) : (
                          <div className="w-0.5 h-0.5 rounded-full bg-neutral-800 mt-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Day Info Badge */}
                <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-400 font-medium px-0.5">
                  <span className="font-mono text-neutral-300">
                    {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className={`font-mono text-[10px] font-bold flex items-center gap-1 ${isSelectedActive ? 'text-orange-400' : 'text-neutral-500'}`}>
                    {isSelectedActive ? (
                      <>
                        <Flame className="w-3 h-3 text-orange-400" />
                        <span>Day {streak} Active Log</span>
                      </>
                    ) : (
                      <span>No workout log recorded</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="space-y-2 pt-2 border-t border-neutral-800/80 relative z-10 flex-shrink-0">
              {/* 1. Primary Check-in Button */}
              {canCheckIn && !isActiveToday && streak === 0 ? (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckInClick}
                  disabled={isCheckingIn}
                  className="w-full py-3 sm:py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-orange-500/35 hover:shadow-orange-500/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 border border-orange-400/40"
                >
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-bounce" />
                  <span>{isCheckingIn ? 'Logging Streak...' : 'Log Workout Check-in Today'}</span>
                </motion.button>
              ) : (
                <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-inner">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">
                    {feedbackMessage || `Streak Active Today (Day ${streak} Logged)`}
                  </span>
                </div>
              )}

              {/* 2. View Full History CTA Button */}
              <button
                type="button"
                onClick={() => {
                  closeModal();
                  navigate('/streak-history');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 hover:from-orange-500/20 hover:to-amber-500/20 text-orange-400 hover:text-orange-300 font-bold text-xs uppercase tracking-wider border border-orange-500/30 hover:border-orange-500/60 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <History className="w-3.5 h-3.5" />
                <span>View Full Streak & Activity History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* 3. Direct Start Workout CTA Button */}
              <button
                type="button"
                onClick={() => {
                  closeModal();
                  navigate('/start-workout');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs uppercase tracking-wider border border-neutral-700/60 hover:border-orange-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-orange-400" />
                <span>Start Workout Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Celebration Notification */}
            <AnimatePresence>
              {showCelebration && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  className="absolute inset-x-4 top-14 z-30 p-3 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white rounded-2xl shadow-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wide border border-white/20"
                >
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>{feedbackMessage || 'Streak Logged Successfully!'}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Capsule Badge (Exact match to reference image) */}
      <motion.button
        type="button"
        onClick={openModal}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`group relative inline-flex items-center gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-neutral-950/90 hover:bg-neutral-900 border border-orange-500/40 hover:border-orange-500/80 shadow-lg shadow-orange-500/10 backdrop-blur-md transition-all text-left cursor-pointer ${className}`}
        title={`Workout Streak: ${streak} Days Active`}
      >
        {/* Flame Squircle Icon */}
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/30 flex-shrink-0">
          <Flame className={`w-4 h-4 sm:w-5 sm:h-5 ${streak > 0 ? 'animate-bounce' : ''}`} />
          {isActiveToday && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-black rounded-full shadow-sm animate-pulse" />
          )}
        </div>

        {/* Text Details */}
        <div className="flex flex-col min-w-0 pr-1">
          <span className="text-[10px] sm:text-xs text-neutral-400 font-medium tracking-wide uppercase leading-tight">
            Streak
          </span>
          <span className="text-xs sm:text-sm font-black text-orange-400 tracking-wide leading-tight group-hover:text-orange-300 transition-colors truncate">
            {streakDisplay}
          </span>
        </div>

        {/* Subtle Ambient Pulse for Active Streak */}
        {streak > 0 && (
          <span className="absolute inset-0 rounded-2xl bg-orange-500/5 animate-pulse pointer-events-none" />
        )}
      </motion.button>

      {/* Render Modal via React Portal */}
      {typeof document !== 'undefined' && createPortal(modalContent, document.body)}
    </>
  );
}
