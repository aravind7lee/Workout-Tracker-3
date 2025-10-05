// USER-SPECIFIC Real-Time Streak Tracker - Professional Implementation
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useStreak } from '../context/StreakContext';
import { realTimeStreakSync } from '../services/realTimeStreakSync';
import streakCalculator from '../utils/streakCalculator';
import AuthGuard from '../components/AuthGuard';
import api from '../utils/api';

const CurrentStreakFixed = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const streakContext = useStreak();
  
  // Local state for UI
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalCheckIns: 0,
    canCheckIn: true,
    streakStartDate: null,
    lastCheckInDate: null
  });

  // Initialize USER-SPECIFIC streak data
  useEffect(() => {
    const initializeUserStreak = async () => {
      try {
        setLoading(true);
        
        if (!user?.id && !user?._id) {
          console.log('🔒 No authenticated user - showing zero streak data');
          setStreakData({
            currentStreak: 0,
            longestStreak: 0,
            totalCheckIns: 0,
            canCheckIn: true,
            streakStartDate: null,
            lastCheckInDate: null
          });
          setLoading(false);
          return;
        }

        const userId = user.id || user._id;
        console.log(`🔥 Initializing streak for user: ${userId}`);
        
        // Get user-specific streak data from calculator
        const userStreakStats = streakCalculator.getStreakStats(userId);
        console.log(`📊 User ${userId} streak stats:`, userStreakStats);
        
        setStreakData({
          currentStreak: userStreakStats.currentStreak || 0,
          longestStreak: userStreakStats.longestStreak || 0,
          totalCheckIns: userStreakStats.totalCheckIns || 0,
          canCheckIn: userStreakStats.canCheckIn !== false,
          streakStartDate: userStreakStats.streakStartDate || null,
          lastCheckInDate: userStreakStats.lastCheckInDate || null
        });

        // Try to sync with API if available
        if (isAuthenticated && isAuthenticated()) {
          try {
            const response = await api.get('/users/streak/status');
            if (response.data && response.data.currentStreak >= userStreakStats.currentStreak) {
              console.log('🔄 Updating with API data:', response.data);
              setStreakData({
                currentStreak: response.data.currentStreak || 0,
                longestStreak: response.data.longestStreak || 0,
                totalCheckIns: response.data.totalCheckIns || 0,
                canCheckIn: response.data.canCheckIn !== false,
                streakStartDate: response.data.streakStartDate || null,
                lastCheckInDate: response.data.lastCheckInDate || null
              });
            }
          } catch (apiError) {
            console.warn('⚠️ API sync failed, using local data:', apiError.message);
          }
        }
      } catch (error) {
        console.error('❌ Streak initialization error:', error);
        // Fallback to zero data for safety
        setStreakData({
          currentStreak: 0,
          longestStreak: 0,
          totalCheckIns: 0,
          canCheckIn: true,
          streakStartDate: null,
          lastCheckInDate: null
        });
      } finally {
        setLoading(false);
      }
    };

    initializeUserStreak();
  }, [user, isAuthenticated]);

  // Handle USER-SPECIFIC check-in
  const handleCheckIn = async () => {
    if (!streakData.canCheckIn || checkingIn) {
      console.log('🔥 Cannot check in:', { canCheckIn: streakData.canCheckIn, checkingIn });
      return;
    }

    if (!user?.id && !user?._id) {
      console.log('🔒 No authenticated user - cannot check in');
      setSuccessMessage('❌ Please log in to start your streak');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }

    try {
      setCheckingIn(true);
      setSuccessMessage('');
      
      const userId = user.id || user._id;
      console.log(`🔥 Starting check-in for user: ${userId}`);

      let result = null;

      // Strategy 1: Use streak calculator for user-specific check-in
      try {
        console.log('🔥 Trying user-specific calculator check-in...');
        result = await streakCalculator.performCheckIn(userId);
        console.log('✅ Calculator check-in successful:', result);
      } catch (calculatorError) {
        console.warn('🔥 Calculator check-in failed:', calculatorError.message);
      }

      // Strategy 2: Try context method if available
      if (!result && streakContext && typeof streakContext.updateStreak === 'function') {
        try {
          console.log('🔥 Trying context method...');
          result = await streakContext.updateStreak();
          console.log('✅ Context method successful:', result);
        } catch (contextError) {
          console.warn('🔥 Context method failed:', contextError.message);
        }
      }

      // Strategy 3: Try direct API call
      if (!result && isAuthenticated && isAuthenticated()) {
        try {
          console.log('🔥 Trying direct API call...');
          const response = await api.post('/users/streak/check-in');
          result = response.data;
          console.log('✅ Direct API successful:', result);
        } catch (apiError) {
          console.warn('🔥 Direct API failed:', apiError.message);
        }
      }

      // Strategy 4: Local fallback calculation
      if (!result) {
        console.log('🔥 Using local fallback calculation...');
        const today = new Date().toISOString().split('T')[0];
        const newStreak = streakData.currentStreak + 1;
        
        result = {
          currentStreak: newStreak,
          longestStreak: Math.max(streakData.longestStreak, newStreak),
          totalCheckIns: streakData.totalCheckIns + 1,
          lastCheckInDate: today,
          streakStartDate: streakData.streakStartDate || today,
          canCheckIn: false,
          message: `🔥 Day ${newStreak} - Keep Going! (Local Mode)`,
          local: true
        };
        
        // Save to user-specific localStorage
        streakCalculator.saveStreakData(result, userId);
        console.log('✅ Local fallback successful:', result);
      }

      // Update UI with result
      if (result) {
        const newStreakData = {
          currentStreak: result.currentStreak || streakData.currentStreak + 1,
          longestStreak: result.longestStreak || Math.max(streakData.longestStreak, result.currentStreak || streakData.currentStreak + 1),
          totalCheckIns: result.totalCheckIns || streakData.totalCheckIns + 1,
          lastCheckInDate: result.lastCheckInDate || new Date().toISOString().split('T')[0],
          streakStartDate: result.streakStartDate || streakData.streakStartDate || new Date().toISOString().split('T')[0],
          canCheckIn: false
        };
        
        setStreakData(newStreakData);

        // Update the real-time streak sync service
        realTimeStreakSync.updateStreakData(newStreakData);
        console.log('🔥 Updated realTimeStreakSync service with new data');

        // Dispatch real-time events for stats updates across ALL pages
        const streakEventData = {
          ...newStreakData,
          type: 'STREAK_UPDATED',
          userId: userId,
          source: 'current-streak-page',
          timestamp: new Date().toISOString()
        };
        
        // Dispatch to all page-specific events
        const events = [
          'streakUpdated',
          'homeStreakUpdate', 
          'dashboardStreakUpdate',
          'analyticsStreakUpdate'
        ];
        
        events.forEach(eventName => {
          window.dispatchEvent(new CustomEvent(eventName, { 
            detail: streakEventData
          }));
        });
        
        console.log('📡 Dispatched streak events to all pages:', streakEventData);
        
        // Force refresh streak stats across all pages
        if (window.forceStreakStatsRefresh) {
          setTimeout(() => {
            window.forceStreakStatsRefresh();
            console.log('🔄 Forced streak stats refresh across all pages');
          }, 500);
        }

        const message = result.message || `🔥 Day ${result.currentStreak} - Keep Going!`;
        const syncStatus = result.local ? '💾 Saved Locally' : '✅ Synced to Database';
        setSuccessMessage(`${message} ${syncStatus}`);
        
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        throw new Error('All check-in strategies failed');
      }

    } catch (error) {
      console.error('❌ Check-in failed:', error);
      setSuccessMessage('❌ Check-in failed, please try again');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setCheckingIn(false);
    }
  };

  const getStreakMotivation = () => {
    const { currentStreak } = streakData;
    if (currentStreak === 0) return "Ready to start your journey? 💪";
    if (currentStreak < 7) return `${currentStreak} days strong! Building momentum! 🔥`;
    if (currentStreak < 30) return `${currentStreak} days! You're on fire! 🚀`;
    return `${currentStreak} days! You're unstoppable! ⚡`;
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading your streak data...</div>
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
                  Your Streak Tracker
                  <span className="ml-3 text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                    🔴 USER-SPECIFIC
                  </span>
                </h1>
                <p className="text-white/90 text-sm sm:text-base">
                  {getStreakMotivation()}
                </p>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-4xl sm:text-6xl font-bold text-white">
                  {streakData.currentStreak}
                </div>
                <div className="text-white/80 text-sm sm:text-base">
                  {streakData.currentStreak === 0 ? 'Start Today' : `Day${streakData.currentStreak !== 1 ? 's' : ''}`}
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

          {/* Check-in Button */}
          <div className="text-center mb-8">
            <button
              onClick={handleCheckIn}
              disabled={!streakData.canCheckIn || checkingIn}
              className={`
                px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl
                ${
                  streakData.canCheckIn && !checkingIn
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
              ) : streakData.canCheckIn ? (
                `🔥 START DAY ${streakData.currentStreak + 1} STREAK`
              ) : (
                '✅ Checked In Today - Come Back Tomorrow!'
              )}
            </button>
            
            {!streakData.canCheckIn && (
              <p className="text-green-400 text-sm mt-3">
                Streak secured for today! Return tomorrow to continue your journey! 🚀
              </p>
            )}
            
            <div className="mt-2 text-xs text-slate-400">
              User-specific tracking • Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Stats Grid */}
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
                  }`}>Your Current Streak</h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Active days</p>
                </div>
              </div>
              <div className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
              }`}>
                {streakData.currentStreak} days
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
                  }`}>Your Best Streak</h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Personal record</p>
                </div>
              </div>
              <div className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                {streakData.longestStreak} days
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
                  }`}>Your Total Check-ins</h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>All time</p>
                </div>
              </div>
              <div className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {streakData.totalCheckIns}
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
                  }`}>Your Streak Age</h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Days since start</p>
                </div>
              </div>
              <div className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                {streakData.streakStartDate && streakData.currentStreak > 0
                  ? Math.floor((new Date() - new Date(streakData.streakStartDate)) / (1000 * 60 * 60 * 24)) + 1
                  : streakData.currentStreak} days
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gray-800 text-white p-4 rounded-lg text-xs">
            <h4 className="font-bold mb-2">👤 User-Specific Streak Tracking</h4>
            <div>User ID: {user?.id || user?._id || 'Not logged in'}</div>
            <div>User Name: {user?.name || user?.email || 'Anonymous'}</div>
            <div>Can Check In: {streakData.canCheckIn ? 'Yes' : 'No'}</div>
            <div>Last Check In: {streakData.lastCheckInDate || 'Never'}</div>
            <div>Today: {new Date().toISOString().split('T')[0]}</div>
            <div className="mt-2 text-green-400">✅ All data is user-specific - no fake/global streaks!</div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default CurrentStreakFixed;