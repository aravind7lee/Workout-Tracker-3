// Real-Time Streak Hook - Use in any component for instant streak updates
import { useState, useEffect, useCallback } from 'react';
import { realTimeStreakSync } from '../services/realTimeStreakSync';

export const useRealTimeStreak = () => {
  const [streakData, setStreakData] = useState(() => {
    // Initialize with current data
    return realTimeStreakSync.getCurrentStreakData();
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Subscribe to real-time updates
  useEffect(() => {
    console.log('🔥 HOOK: Subscribing to real-time streak updates');
    
    const unsubscribe = realTimeStreakSync.subscribe((newData) => {
      console.log('🔥 HOOK: Received streak update:', newData);
      setStreakData(newData);
      setLastUpdate(new Date());
    });

    // Cleanup subscription
    return () => {
      console.log('🔥 HOOK: Unsubscribing from streak updates');
      unsubscribe();
    };
  }, []);

  // Force refresh from server
  const forceSync = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await realTimeStreakSync.forceSyncFromServer();
      console.log('🚀 HOOK: Force sync result:', success);
      return success;
    } catch (error) {
      console.error('❌ HOOK: Force sync error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update streak (for check-ins)
  const updateStreak = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const current = streakData;
    
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
      message: `🔥 Day ${newStreak} - Streak Active!`,
      timestamp: new Date().toISOString()
    };
    
    // Update via sync service (will broadcast to all components)
    realTimeStreakSync.updateStreakData(newData);
    
    // Try to sync to server in background
    try {
      const response = await fetch('/api/users/streak/check-in', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ HOOK: Synced to database');
        realTimeStreakSync.updateStreakData({ ...newData, synced: true });
      }
    } catch (error) {
      console.warn('⚠️ HOOK: Database sync failed:', error.message);
      realTimeStreakSync.updateStreakData({ ...newData, synced: false });
    }
    
    return newData;
  }, [streakData]);

  // Get streak statistics
  const getStats = useCallback(() => {
    return realTimeStreakSync.getStreakStats();
  }, []);

  // Manual refresh
  const refresh = useCallback(() => {
    const currentData = realTimeStreakSync.getCurrentStreakData();
    setStreakData(currentData);
    setLastUpdate(new Date());
  }, []);

  return {
    // Current streak data
    currentStreak: streakData.currentStreak || 0,
    longestStreak: streakData.longestStreak || 0,
    totalCheckIns: streakData.totalCheckIns || 0,
    lastCheckInDate: streakData.lastCheckInDate,
    streakStartDate: streakData.streakStartDate,
    canCheckIn: streakData.canCheckIn !== false,
    
    // Full data object
    streakData,
    
    // State
    isLoading,
    lastUpdate,
    
    // Actions
    updateStreak,
    forceSync,
    refresh,
    getStats,
    
    // Utilities
    isOnline: navigator.onLine,
    motivation: realTimeStreakSync.getMotivationMessage(streakData.currentStreak || 0)
  };
};