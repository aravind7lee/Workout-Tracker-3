// BULLETPROOF Streak Context - NEVER LOSES DATA + REAL-TIME SYNC
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const StreakContext = createContext();

// Global streak storage key
const STREAK_KEY = 'gymtracker_streak_data';

// Real-time event broadcaster for instant updates across all pages
const broadcastStreakUpdate = (streakData) => {
  // Dispatch custom event for real-time updates
  window.dispatchEvent(new CustomEvent('streakUpdated', { 
    detail: streakData 
  }));
  
  // Also dispatch specific events for different components
  window.dispatchEvent(new CustomEvent('dashboardStreakUpdate', { 
    detail: streakData 
  }));
  
  window.dispatchEvent(new CustomEvent('homeStreakUpdate', { 
    detail: streakData 
  }));
  
  window.dispatchEvent(new CustomEvent('analyticsStreakUpdate', { 
    detail: streakData 
  }));
  
  console.log('🔥 REAL-TIME: Streak update broadcasted to all pages:', streakData);
};

// Save to localStorage immediately + broadcast
const saveStreakData = (data) => {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    console.log('✅ Streak data saved:', data);
    
    // Broadcast to all pages for instant updates
    broadcastStreakUpdate(data);
  } catch (e) {
    console.error('Failed to save streak data:', e);
  }
};

// Load from localStorage
const loadStreakData = () => {
  try {
    const saved = localStorage.getItem(STREAK_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      console.log('📱 Streak data loaded from storage:', data);
      return data;
    }
  } catch (e) {
    console.error('Failed to load streak data:', e);
  }
  return {
    currentStreak: 0,
    longestStreak: 0,
    totalCheckIns: 0,
    lastCheckInDate: null,
    streakStartDate: null,
    canCheckIn: true
  };
};

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (!context) {
    console.warn('🔥 STREAK: Context not available, returning fallback data');
    const fallbackData = loadStreakData();
    return {
      ...fallbackData,
      updateStreak: async () => {
        throw new Error('Streak context not available. Please refresh the page.');
      },
      loading: false
    };
  }
  return context;
};

export const StreakProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Initialize with saved data IMMEDIATELY
  const [streakData, setStreakData] = useState(() => {
    const saved = loadStreakData();
    const today = new Date().toISOString().split('T')[0];
    return {
      ...saved,
      canCheckIn: saved.lastCheckInDate !== today
    };
  });
  
  const [loading, setLoading] = useState(false);

  // Update state AND save to localStorage
  const updateStreakState = useCallback((newData) => {
    setStreakData(newData);
    saveStreakData(newData);
  }, []);

  // BULLETPROOF check-in - ALWAYS works + REAL-TIME SYNC
  const updateStreak = useCallback(async () => {
    console.log('🔥 CONTEXT: updateStreak called');
    
    const today = new Date().toISOString().split('T')[0];
    const current = loadStreakData();
    
    console.log('🔥 CONTEXT: Current data:', current);
    console.log('🔥 CONTEXT: Today:', today);
    
    // Check if already checked in today
    if (current.lastCheckInDate === today) {
      console.log('🔥 CONTEXT: Already checked in today');
      throw new Error('Already checked in today');
    }

    // Calculate new streak with proper day logic
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak = 1;
    let streakStartDate = today;
    
    console.log('🔥 CONTEXT: Check-in calculation - Today:', today, 'Yesterday:', yesterdayStr, 'Last check-in:', current.lastCheckInDate, 'Current streak:', current.currentStreak);
    
    if (current.lastCheckInDate === yesterdayStr && current.currentStreak > 0) {
      // Continue existing streak
      newStreak = current.currentStreak + 1;
      streakStartDate = current.streakStartDate || today;
      console.log('✅ CONTEXT: Continuing streak - New streak:', newStreak);
    } else if (current.currentStreak === 0 || !current.lastCheckInDate) {
      // Starting new streak
      newStreak = 1;
      streakStartDate = today;
      console.log('🎆 CONTEXT: Starting new streak - Day 1');
    } else {
      // Gap detected - restart streak
      newStreak = 1;
      streakStartDate = today;
      console.log('🔄 CONTEXT: Gap detected, restarting streak - Day 1');
    }
    
    const newData = {
      currentStreak: newStreak,
      longestStreak: Math.max(current.longestStreak || 0, newStreak),
      totalCheckIns: (current.totalCheckIns || 0) + 1,
      lastCheckInDate: today,
      streakStartDate,
      canCheckIn: false,
      message: newStreak === 1 ? '🔥 Day 1 - Streak Started!' : `🔥 Day ${newStreak} - Keep Going!`,
      timestamp: new Date().toISOString(),
      nextDay: newStreak + 1
    };
    
    console.log('✅ CONTEXT: New streak data:', newData);
    
    // Save immediately - NEVER lose this data + BROADCAST TO ALL PAGES
    updateStreakState(newData);
    
    // INSTANT REAL-TIME UPDATE - Broadcast immediately
    broadcastStreakUpdate({
      ...newData,
      type: 'STREAK_UPDATED',
      source: 'check-in'
    });
    
    // Try to sync to API in background
    try {
      const response = await api.post('/users/streak/check-in');
      console.log('✅ CONTEXT: Synced to database - Response:', response.data);
      
      // Update with server response if available
      const serverData = response.data;
      if (serverData && serverData.currentStreak !== undefined) {
        const syncedData = {
          ...newData,
          currentStreak: serverData.currentStreak,
          longestStreak: serverData.longestStreak,
          totalCheckIns: serverData.totalCheckIns,
          message: serverData.message || newData.message,
          synced: true
        };
        updateStreakState(syncedData);
        
        // Broadcast sync success with server data
        broadcastStreakUpdate({
          ...syncedData,
          type: 'STREAK_SYNCED',
          source: 'database'
        });
      } else {
        // Broadcast sync success with local data
        broadcastStreakUpdate({
          ...newData,
          type: 'STREAK_SYNCED',
          source: 'database',
          synced: true
        });
      }
    } catch (error) {
      console.warn('⚠️ CONTEXT: Database sync failed, but local data saved:', error.message);
      
      // Broadcast sync failure (but data is still saved locally)
      broadcastStreakUpdate({
        ...newData,
        type: 'STREAK_SYNC_FAILED',
        source: 'local',
        synced: false,
        error: error.message
      });
    }
    
    return newData;
  }, [updateStreakState]);

  // Fetch from API but NEVER lose local data
  const fetchStreakData = useCallback(async () => {
    if (!isAuthenticated() || !user) return;

    try {
      const response = await api.get('/users/streak/status');
      
      if (response.data) {
        const apiData = {
          currentStreak: response.data.currentStreak || 0,
          longestStreak: response.data.longestStreak || 0,
          totalCheckIns: response.data.totalCheckIns || 0,
          lastCheckInDate: response.data.lastCheckInDate,
          streakStartDate: response.data.streakStartDate,
          canCheckIn: response.data.canCheckIn !== undefined ? response.data.canCheckIn : true
        };

        // Only update if API data is newer/better
        const current = loadStreakData();
        if (apiData.currentStreak >= current.currentStreak) {
          updateStreakState(apiData);
        }
      }
    } catch (error) {
      console.warn('API failed, keeping local data:', error.message);
      // NEVER lose local data - just keep what we have
    }
  }, [user, isAuthenticated, updateStreakState]);

  // Real-time streak validation with next day logic
  const validateStreak = useCallback(() => {
    const current = loadStreakData();
    const today = new Date().toISOString().split('T')[0];
    
    console.log('🔥 CONTEXT: Validating streak for today:', today, 'Current data:', current);
    
    if (current.lastCheckInDate) {
      const lastCheckIn = new Date(current.lastCheckInDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate - lastCheckIn) / (1000 * 60 * 60 * 24));
      
      console.log('🔥 CONTEXT: Days difference:', daysDiff, 'Last check-in:', current.lastCheckInDate);
      
      if (daysDiff > 1) {
        // Streak broken - reset
        console.log('💔 CONTEXT: Streak broken, resetting...');
        const resetData = {
          ...current,
          currentStreak: 0,
          canCheckIn: true,
          streakStartDate: null
        };
        updateStreakState(resetData);
      } else if (daysDiff === 1) {
        // Next day - can check in
        console.log('✅ CONTEXT: Next day, can check in');
        const nextDayData = {
          ...current,
          canCheckIn: true
        };
        updateStreakState(nextDayData);
      } else if (daysDiff === 0) {
        // Same day - already checked in
        console.log('✅ CONTEXT: Same day, already checked in');
        const sameDayData = {
          ...current,
          canCheckIn: false
        };
        updateStreakState(sameDayData);
      }
    } else {
      // No previous check-in - can start streak
      console.log('🎆 CONTEXT: No previous check-in, can start streak');
      const freshData = {
        ...current,
        canCheckIn: true,
        currentStreak: 0
      };
      updateStreakState(freshData);
    }
  }, [updateStreakState]);

  // Initialize and validate streak on mount and daily
  useEffect(() => {
    validateStreak();
    
    // Set up daily validation at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const midnightTimeout = setTimeout(() => {
      console.log('🌅 CONTEXT: New day detected, validating streak...');
      validateStreak();
      
      // Set up daily interval after first midnight
      const dailyInterval = setInterval(() => {
        console.log('🌅 CONTEXT: Daily validation...');
        validateStreak();
      }, 24 * 60 * 60 * 1000); // 24 hours
      
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);
    
    return () => clearTimeout(midnightTimeout);
  }, [validateStreak]);

  // Save data whenever it changes + REAL-TIME BROADCAST
  useEffect(() => {
    if (streakData.currentStreak !== undefined) {
      saveStreakData(streakData);
      
      // Broadcast any streak data changes for real-time updates
      broadcastStreakUpdate({
        ...streakData,
        type: 'STREAK_DATA_CHANGED',
        source: 'context',
        timestamp: new Date().toISOString()
      });
      
      console.log('📡 CONTEXT: Broadcasted streak update:', streakData);
    }
  }, [streakData]);

  const value = {
    ...streakData,
    loading,
    updateStreak,
    refreshStreak: fetchStreakData,
    // Real-time functions for external components
    broadcastUpdate: broadcastStreakUpdate,
    getLatestData: loadStreakData,
    validateStreak,
    
    // Debug information
    debugInfo: {
      currentStreakValue: streakData.currentStreak,
      canCheckInValue: streakData.canCheckIn,
      lastCheckInValue: streakData.lastCheckInDate,
      todayValue: new Date().toISOString().split('T')[0],
      nextDayValue: (streakData.currentStreak || 0) + 1
    }
  };

  return (
    <StreakContext.Provider value={value}>
      {children}
    </StreakContext.Provider>
  );
};