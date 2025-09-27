// BULLETPROOF Streak Context - NEVER LOSES DATA
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const StreakContext = createContext();

// Global streak storage key
const STREAK_KEY = 'gymtracker_streak_data';

// Save to localStorage immediately
const saveStreakData = (data) => {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    console.log('✅ Streak data saved:', data);
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
    return loadStreakData(); // Always return saved data
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

  // BULLETPROOF check-in - ALWAYS works
  const updateStreak = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const current = loadStreakData();
    
    // Check if already checked in today
    if (current.lastCheckInDate === today) {
      throw new Error('Already checked in today');
    }

    // Calculate new streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak = 1;
    let streakStartDate = today;
    
    if (current.lastCheckInDate === yesterdayStr) {
      // Continue streak
      newStreak = (current.currentStreak || 0) + 1;
      streakStartDate = current.streakStartDate || today;
    }
    
    const newData = {
      currentStreak: newStreak,
      longestStreak: Math.max(current.longestStreak || 0, newStreak),
      totalCheckIns: (current.totalCheckIns || 0) + 1,
      lastCheckInDate: today,
      streakStartDate,
      canCheckIn: false,
      message: `🔥 Day ${newStreak} - Streak Active!`
    };
    
    // Save immediately - NEVER lose this data
    updateStreakState(newData);
    
    // Try to sync to API in background
    try {
      await api.post('/users/streak/check-in');
      console.log('✅ Synced to database');
    } catch (error) {
      console.warn('Database sync failed, but local data saved:', error.message);
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
    
    if (current.lastCheckInDate) {
      const daysDiff = Math.floor((new Date() - new Date(current.lastCheckInDate)) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 1) {
        // Streak broken - reset
        const resetData = {
          ...current,
          currentStreak: 0,
          canCheckIn: true,
          streakStartDate: null
        };
        updateStreakState(resetData);
      } else {
        // Streak continues - update canCheckIn for next day
        const validData = {
          ...current,
          canCheckIn: current.lastCheckInDate !== today
        };
        updateStreakState(validData);
      }
    } else {
      // No previous check-in - can start streak
      const freshData = {
        ...current,
        canCheckIn: true
      };
      updateStreakState(freshData);
    }
  }, [updateStreakState]);

  // Initialize and validate on mount
  useEffect(() => {
    validateStreak();
    if (isAuthenticated() && user) {
      fetchStreakData();
    }
  }, [validateStreak, fetchStreakData, isAuthenticated, user]);

  // Save data whenever it changes
  useEffect(() => {
    saveStreakData(streakData);
  }, [streakData]);

  const value = {
    ...streakData,
    loading,
    updateStreak,
    refreshStreak: fetchStreakData
  };

  return (
    <StreakContext.Provider value={value}>
      {children}
    </StreakContext.Provider>
  );
};