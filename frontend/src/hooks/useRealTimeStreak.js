// frontend/src/hooks/useRealTimeStreak.js
// Custom Hook for Real-Time Streak Tracking & Synchronized Updates

import { useState, useEffect, useCallback } from 'react';
import { realTimeStreakService } from '../services/realTimeStreakService';
import { useAuth } from '../context/AuthContext';

export function useRealTimeStreak() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState(() => {
    try {
      if (typeof realTimeStreakService?.getData === 'function') {
        return realTimeStreakService.getData();
      }
      return realTimeStreakService?.currentData || {
        currentStreak: 0,
        longestStreak: 0,
        totalCheckIns: 0,
        canCheckIn: true,
        isActiveToday: false,
        lastCheckInDate: null,
        streakStartDate: null,
        weeklyProgress: [],
        streakHistory: [],
        milestones: [],
        isRealTime: true
      };
    } catch {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalCheckIns: 0,
        canCheckIn: true,
        isActiveToday: false,
        lastCheckInDate: null,
        streakStartDate: null,
        weeklyProgress: [],
        streakHistory: [],
        milestones: [],
        isRealTime: true
      };
    }
  });
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  useEffect(() => {
    // Subscribe to real-time updates from the service
    const unsubscribe = realTimeStreakService.subscribe((data) => {
      setStreakData(data);
    });

    // When user logs in or changes, resync
    if (user) {
      realTimeStreakService.syncStreak();
    }

    return () => {
      unsubscribe();
    };
  }, [user]);

  const checkIn = useCallback(async () => {
    setIsCheckingIn(true);
    try {
      const res = await realTimeStreakService.checkIn();
      return res;
    } finally {
      setIsCheckingIn(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await realTimeStreakService.syncStreak();
  }, []);

  return {
    streak: streakData.currentStreak || 0,
    longestStreak: streakData.longestStreak || 0,
    totalCheckIns: streakData.totalCheckIns || 0,
    isActiveToday: Boolean(streakData.isActiveToday),
    canCheckIn: Boolean(streakData.canCheckIn),
    lastCheckInDate: streakData.lastCheckInDate,
    weeklyProgress: streakData.weeklyProgress || [],
    milestoneProgress: streakData.milestoneProgress || [],
    isRealTime: streakData.isRealTime !== false,
    lastSync: streakData.lastSync,
    checkIn,
    refresh,
    isCheckingIn
  };
}

export default useRealTimeStreak;
