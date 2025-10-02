// FIXED Real-Time Streak Tracker - Professional Implementation
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useStreak } from '../context/StreakContext';
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

  // Initialize streak data
  useEffect(() => {
    const initializeStreak = async () => {
      try {
        setLoading(true);
        
        // First, try to get data from context
        if (streakContext && typeof streakContext === 'object') {
          console.log('🔥 Using context data:', streakContext);
          setStreakData({
            currentStreak: streakContext.currentStreak || 0,
            longestStreak: streakContext.longestStreak || 0,
            totalCheckIns: streakContext.totalCheckIns || 0,
            canCheckIn: streakContext.canCheckIn !== undefined ? streakContext.canCheckIn : true,
            streakStartDate: streakContext.streakStartDate || null,
            lastCheckInDate: streakContext.lastCheckInDate || null
          });
        }

        // If authenticated, try to fetch from API
        if (isAuthenticated && isAuthenticated()) {
          try {
            const response = await api.get('/users/streak/status');
            if (response.data) {
              console.log('🔥 API data received:', response.data);
              setStreakData({
                currentStreak: response.data.currentStreak || 0,
                longestStreak: response.data.longestStreak || 0,
                totalCheckIns: response.data.totalCheckIns || 0,
                canCheckIn: response.data.canCheckIn !== undefined ? response.data.canCheckIn : true,
                streakStartDate: response.data.streakStartDate || null,
                lastCheckInDate: response.data.lastCheckInDate || null
              });
            }
          } catch (apiError) {
            console.warn('🔥 API failed, using context/local data:', apiError.message);
          }
        }
      } catch (error) {
        console.error('🔥 Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeStreak();
  }, [streakContext, isAuthenticated]);

  // Handle check-in with multiple fallback strategies
  const handleCheckIn = async () => {
    if (!streakData.canCheckIn || checkingIn) {
      console.log('🔥 Cannot check in:', { canCheckIn: streakData.canCheckIn, checkingIn });
      return;
    }

    try {
      setCheckingIn(true);
      setSuccessMessage('');
      
      console.log('🔥 Starting check-in process...');

      let result = null;

      // Strategy 1: Try context method first
      if (streakContext && typeof streakContext.updateStreak === 'function') {
        try {
          console.log('🔥 Trying context method...');
          result = await streakContext.updateStreak();
          console.log('✅ Context method successful:', result);
        } catch (contextError) {
          console.warn('🔥 Context method failed:', contextError.message);
        }
      }

      // Strategy 2: Try direct API call if context failed
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

      // Strategy 3: Local fallback calculation
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
        
        // Save to localStorage
        localStorage.setItem('gymtracker_streak_data', JSON.stringify(result));
        console.log('✅ Local fallback successful:', result);
      }

      // Update UI with result
      if (result) {
        setStreakData({
          currentStreak: result.currentStreak || streakData.currentStreak + 1,
          longestStreak: result.longestStreak || Math.max(streakData.longestStreak, result.currentStreak || streakData.currentStreak + 1),
          totalCheckIns: result.totalCheckIns || streakData.totalCheckIns + 1,
          lastCheckInDate: result.lastCheckInDate || new Date().toISOString().split('T')[0],
          streakStartDate: result.streakStartDate || streakData.streakStartDate || new Date().toISOString().split('T')[0],
          canCheckIn: false
        });

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
          <div className="text-white text-xl">Loading streak data...</div>
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
                  <span className="ml-3 text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                    🔴 LIVE
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
              Real-time sync • Last updated: {new Date().toLocaleTimeString()}
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
                  }`}>Current Streak</h3>
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
                  }`}>Best Streak</h3>
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
                  }`}>Total Check-ins</h3>
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
                  }`}>Streak Age</h3>
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

          {/* Debug Info */}
          <div className="bg-gray-800 text-white p-4 rounded-lg text-xs">
            <h4 className="font-bold mb-2">🔧 Debug Info</h4>
            <div>Context Available: {streakContext ? 'Yes' : 'No'}</div>
            <div>User Authenticated: {isAuthenticated && isAuthenticated() ? 'Yes' : 'No'}</div>
            <div>Can Check In: {streakData.canCheckIn ? 'Yes' : 'No'}</div>
            <div>Last Check In: {streakData.lastCheckInDate || 'None'}</div>
            <div>Today: {new Date().toISOString().split('T')[0]}</div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default CurrentStreakFixed;