// Real-Time Streak Tracker with Context Integration
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useStreak } from '../context/StreakContext';
import AuthGuard from '../components/AuthGuard';

const CurrentStreak = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { currentStreak, longestStreak, totalCheckIns, canCheckIn, updateStreak, loading: streakLoading } = useStreak();
  
  const [localData, setLocalData] = useState({
    milestones: [],
    weeklyProgress: [],
    monthlyProgress: [],
    streakHistory: [],
    lastCheckInDate: null,
    streakStartDate: null
  });
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      initializeLocalData();
    }
  }, [user, currentStreak]);

  const initializeLocalData = async () => {
    try {
      setLoading(true);
      
      // Generate milestones and progress based on current streak from context
      const milestones = generateLifetimeMilestones(currentStreak);
      const streakKey = `gymtracker_streak_${user.id}`;
      const savedData = localStorage.getItem(streakKey);
      
      let checkInHistory = [];
      let streakHistory = [];
      let lastCheckInDate = null;
      let streakStartDate = null;
      
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          checkInHistory = data.checkInHistory || [];
          streakHistory = data.streakHistory || [];
          lastCheckInDate = data.lastCheckInDate;
          streakStartDate = data.streakStartDate;
        } catch (error) {
          console.error('Failed to parse saved streak data:', error);
        }
      }
      
      setLocalData({
        milestones,
        weeklyProgress: generateWeeklyProgress(checkInHistory),
        monthlyProgress: generateMonthlyProgress(checkInHistory),
        streakHistory,
        lastCheckInDate,
        streakStartDate
      });
      
    } catch (error) {
      console.error('Failed to initialize local data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLifetimeMilestones = (currentStreak) => {
    const baseMilestones = [
      { days: 1, emoji: '🎯', title: 'First Day', tier: 'Beginner' },
      { days: 3, emoji: '🔥', title: '3 Day Fire', tier: 'Beginner' },
      { days: 7, emoji: '🚀', title: 'Week Warrior', tier: 'Beginner' },
      { days: 14, emoji: '⚡', title: '2 Week Power', tier: 'Intermediate' },
      { days: 21, emoji: '💪', title: '3 Week Strong', tier: 'Intermediate' },
      { days: 30, emoji: '🏆', title: 'Monthly Master', tier: 'Intermediate' },
      { days: 45, emoji: '🌟', title: '45 Day Star', tier: 'Advanced' },
      { days: 60, emoji: '👑', title: '2 Month King', tier: 'Advanced' },
      { days: 90, emoji: '💎', title: '3 Month Diamond', tier: 'Expert' },
      { days: 100, emoji: '🏅', title: 'Century Club', tier: 'Expert' },
      { days: 150, emoji: '🔱', title: '150 Day Legend', tier: 'Master' },
      { days: 200, emoji: '⭐', title: '200 Day Elite', tier: 'Master' },
      { days: 365, emoji: '🌈', title: 'Year Champion', tier: 'Legendary' },
      { days: 500, emoji: '🦅', title: '500 Day Eagle', tier: 'Legendary' },
      { days: 730, emoji: '🏰', title: '2 Year Fortress', tier: 'Mythical' },
      { days: 1000, emoji: '🌌', title: '1000 Day Universe', tier: 'Mythical' }
    ];
    
    // Add dynamic milestones for higher streaks
    const dynamicMilestones = [];
    if (currentStreak > 1000) {
      const nextMilestone = Math.ceil(currentStreak / 500) * 500;
      dynamicMilestones.push({
        days: nextMilestone,
        emoji: '🌠',
        title: `${nextMilestone} Day Cosmic`,
        tier: 'Infinite'
      });
    }
    
    const allMilestones = [...baseMilestones, ...dynamicMilestones];
    
    return allMilestones.map(milestone => ({
      ...milestone,
      achieved: currentStreak >= milestone.days,
      progress: Math.min(currentStreak, milestone.days),
      remaining: Math.max(0, milestone.days - currentStreak),
      progressPercent: Math.min(100, (currentStreak / milestone.days) * 100)
    }));
  };

  const generateWeeklyProgress = (checkInHistory = []) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      weekDays.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        hasCheckIn: checkInHistory.includes(dateStr),
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isPast: date < new Date().setHours(0, 0, 0, 0)
      });
    }
    
    return weekDays;
  };

  const generateMonthlyProgress = (checkInHistory = []) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const monthDays = [];
    for (let day = 1; day <= endOfMonth.getDate(); day++) {
      const date = new Date(today.getFullYear(), today.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      
      monthDays.push({
        date: dateStr,
        day: day,
        hasCheckIn: checkInHistory.includes(dateStr),
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isPast: date < new Date().setHours(0, 0, 0, 0)
      });
    }
    
    return monthDays;
  };

  const handleRealTimeCheckIn = async () => {
    if (!canCheckIn || checkingIn) return;
    
    try {
      setCheckingIn(true);
      setSuccessMessage('');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      // Calculate new streak
      let newStreak = 1;
      let streakStartDate = todayStr;
      
      if (localData.lastCheckInDate) {
        const lastDate = new Date(localData.lastCheckInDate);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
          newStreak = currentStreak + 1;
          streakStartDate = localData.streakStartDate || todayStr;
        }
      }
      
      const newLongestStreak = Math.max(longestStreak, newStreak);
      const newTotalCheckIns = totalCheckIns + 1;
      
      // Update context with new streak data - this will sync to database and broadcast to all components
      await updateStreak({
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        totalCheckIns: newTotalCheckIns,
        lastCheckInDate: todayStr,
        streakStartDate,
        canCheckIn: false
      });
      
      // Update localStorage as backup
      const streakKey = `gymtracker_streak_${user.id}`;
      const localDataUpdate = {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        totalCheckIns: newTotalCheckIns,
        lastCheckInDate: todayStr,
        streakStartDate,
        checkInHistory: [...(localData.weeklyProgress.filter(d => d.hasCheckIn).map(d => d.date)), todayStr],
        streakHistory: [
          ...(localData.streakHistory || []),
          {
            date: today.toISOString(),
            streakDay: newStreak,
            xpEarned: 10
          }
        ]
      };
      localStorage.setItem(streakKey, JSON.stringify(localDataUpdate));
      
      // Update local data
      const updatedMilestones = generateLifetimeMilestones(newStreak);
      
      setLocalData(prev => ({
        ...prev,
        milestones: updatedMilestones,
        weeklyProgress: generateWeeklyProgress([...localDataUpdate.checkInHistory]),
        monthlyProgress: generateMonthlyProgress([...localDataUpdate.checkInHistory]),
        lastCheckInDate: todayStr,
        streakStartDate
      }));
      
      // Success message
      const streakDays = newStreak === 1 ? 'Day 1 - Streak Started!' : `Day ${newStreak} - Keep Going!`;
      setSuccessMessage(`🔥 ${streakDays} ✅ Real-time Update Active`);
      
      setTimeout(() => setSuccessMessage(''), 4000);
      
    } catch (error) {
      console.warn('Check-in error:', error);
      setSuccessMessage('❌ Check-in failed, please try again');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setCheckingIn(false);
    }
  };

  const getStreakMotivation = () => {
    if (currentStreak === 0) return "Ready to start your journey? 💪";
    if (currentStreak < 7) return `${currentStreak} days strong! Building momentum! 🔥`;
    if (currentStreak < 30) return `${currentStreak} days! You're on fire! 🚀`;
    if (currentStreak < 100) return `${currentStreak} days! Absolutely crushing it! ⚡`;
    return `${currentStreak} days! You're a legend! 👑`;
  };

  if (loading || streakLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading real-time streak data...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className={`min-h-screen transition-colors duration-200 ${
        theme === 'dark' 
          ? 'bg-gray-900 text-white' 
          : 'bg-gray-50 text-gray-900'
      }`}>
        {/* Header */}
        <div className={`px-4 py-6 sm:px-6 lg:px-8 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-orange-600 to-red-600'
            : 'bg-gradient-to-r from-orange-500 to-red-500'
        }`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <button
                  onClick={() => navigate('/analytics')}
                  className="text-orange-200 hover:text-white mb-2 flex items-center gap-2 text-sm sm:text-base"
                >
                  ← Back to Analytics
                </button>
                <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
                  Real-Time Streak Tracker
                </h1>
                <p className="text-white/90 text-sm sm:text-base">
                  {getStreakMotivation()}
                </p>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-4xl sm:text-6xl font-bold text-white">
                  {currentStreak}
                </div>
                <div className="text-white/80 text-sm sm:text-base">
                  {currentStreak === 0 ? 'Start Today' : `Day${currentStreak !== 1 ? 's' : ''}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Success Message */}
          {successMessage && (
            <div className={`px-4 py-3 rounded-lg mb-6 text-center animate-pulse border ${
              theme === 'dark'
                ? 'bg-green-500/20 border-green-500 text-green-200'
                : 'bg-green-100 border-green-400 text-green-800'
            }`}>
              {successMessage}
            </div>
          )}

          {/* Real-Time Check-in Button */}
          <div className="text-center mb-8">
            <button
              onClick={handleRealTimeCheckIn}
              disabled={!canCheckIn || checkingIn}
              className={`
                px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl
                ${
                  canCheckIn && !checkingIn
                    ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white animate-pulse'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {checkingIn ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing Check-in...
                </span>
              ) : canCheckIn ? (
                currentStreak === 0 
                  ? '🔥 START DAY 1 STREAK' 
                  : `🔥 CONTINUE DAY ${currentStreak + 1}`
              ) : (
                '✅ Checked In Today - Come Back Tomorrow!'
              )}
            </button>
            {!canCheckIn && (
              <p className="text-green-400 text-sm mt-3">
                Streak secured for today! Return tomorrow to continue your journey! 🚀
              </p>
            )}
          </div>

          {/* Real-Time Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`rounded-xl p-6 border ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30'
                : 'bg-gradient-to-br from-orange-100 to-red-100 border-orange-300'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">🔥</div>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Current Streak</h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Active days</p>
                </div>
              </div>
              <div className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
              }`}>
                {currentStreak} days
              </div>
            </div>

            <div className={`rounded-xl p-6 border ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                : 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-300'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">🏆</div>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Best Streak</h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Personal record</p>
                </div>
              </div>
              <div className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                {longestStreak} days
              </div>
            </div>

            <div className={`rounded-xl p-6 border ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30'
                : 'bg-gradient-to-br from-blue-100 to-purple-100 border-blue-300'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">📊</div>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Total Check-ins</h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>All time</p>
                </div>
              </div>
              <div className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {totalCheckIns}
              </div>
            </div>

            <div className={`rounded-xl p-6 border ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-green-500/20 to-teal-500/20 border-green-500/30'
                : 'bg-gradient-to-br from-green-100 to-teal-100 border-green-300'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">⏱️</div>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Streak Age</h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Days since start</p>
                </div>
              </div>
              <div className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                {localData.streakStartDate 
                  ? Math.floor((new Date() - new Date(localData.streakStartDate)) / (1000 * 60 * 60 * 24)) + 1
                  : 0} days
              </div>
            </div>
          </div>

          {/* This Week's Progress */}
          <div className={`rounded-xl p-6 border mb-8 ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <h3 className={`text-xl font-semibold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>This Week's Real-Time Progress</h3>
            <div className="grid grid-cols-7 gap-3">
              {localData.weeklyProgress.map((day, index) => (
                <div key={index} className="text-center">
                  <div className={`text-sm mb-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{day.day}</div>
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                    ${
                      day.isToday
                        ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white ring-4 ring-orange-300 animate-pulse'
                        : day.hasCheckIn
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                        : day.isPast
                        ? theme === 'dark' 
                          ? 'bg-red-500/30 text-red-300' 
                          : 'bg-red-200 text-red-600'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-400'
                        : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {day.hasCheckIn ? '✓' : day.dayNumber}
                  </div>
                  {day.isToday && (
                    <div className={`text-xs mt-1 font-medium ${
                      theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                    }`}>Today</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Lifetime Streak Milestones */}
          <div className={`rounded-xl p-6 border ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <h3 className={`text-xl font-semibold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Lifetime Streak Milestones</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {localData.milestones.slice(0, 12).map((milestone, index) => (
                <div key={index} className={`
                  p-4 rounded-lg border transition-all duration-300 transform hover:scale-105
                  ${
                    milestone.achieved
                      ? theme === 'dark'
                        ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500 text-green-200'
                        : 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-400 text-green-800'
                      : theme === 'dark'
                      ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 text-gray-300'
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 text-gray-700'
                  }
                `}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{milestone.emoji}</span>
                    <div>
                      <h4 className={`font-semibold ${
                        milestone.achieved
                          ? theme === 'dark' ? 'text-green-200' : 'text-green-800'
                          : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>{milestone.title}</h4>
                      <p className={`text-xs opacity-75 ${
                        milestone.achieved
                          ? theme === 'dark' ? 'text-green-300' : 'text-green-700'
                          : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>{milestone.tier}</p>
                      <p className={`text-xs ${
                        milestone.achieved
                          ? theme === 'dark' ? 'text-green-200' : 'text-green-800'
                          : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {milestone.achieved ? 'ACHIEVED!' : `${milestone.remaining} days to go`}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        milestone.achieved 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                          : 'bg-gradient-to-r from-orange-500 to-red-500'
                      }`}
                      style={{ width: `${milestone.progressPercent}%` }}
                    ></div>
                  </div>
                  <div className={`text-xs mt-1 text-right opacity-75 ${
                    milestone.achieved
                      ? theme === 'dark' ? 'text-green-300' : 'text-green-700'
                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {milestone.progress}/{milestone.days} days
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default CurrentStreak;