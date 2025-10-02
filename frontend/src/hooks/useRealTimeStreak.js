// Real-Time Streak Hook - Use in any component for instant streak updates
import { useState, useEffect, useCallback } from 'react';
import { realTimeStreakSync } from '../services/realTimeStreakSync';
import streakCalculator from '../utils/streakCalculator';

export const useRealTimeStreak = () => {
  const [streakData, setStreakData] = useState(() => {
    // Initialize with validated data from calculator
    const calculatorData = streakCalculator.getStreakStats();
    const syncData = realTimeStreakSync.getCurrentStreakData();
    
    // Merge both sources, preferring calculator for validation
    return {
      ...syncData,
      ...calculatorData,
      lastUpdate: new Date().toISOString()
    };
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Subscribe to real-time updates and validate with calculator
  useEffect(() => {
    console.log('🔥 HOOK: Subscribing to real-time streak updates');
    
    const unsubscribe = realTimeStreakSync.subscribe((newData) => {
      console.log('🔥 HOOK: Received streak update:', newData);
      
      // Validate with calculator
      const calculatorData = streakCalculator.getStreakStats();
      
      // Merge data, preferring calculator for validation
      const mergedData = {
        ...newData,
        ...calculatorData,
        lastUpdate: new Date().toISOString(),
        syncSource: 'realtime'
      };
      
      setStreakData(mergedData);
      setLastUpdate(new Date());
    });

    // Initial validation
    refresh();

    // Cleanup subscription
    return () => {
      console.log('🔥 HOOK: Unsubscribing from streak updates');
      unsubscribe();
    };
  }, [refresh]);

  // Force refresh from server with calculator validation
  const forceSync = useCallback(async () => {
    setIsLoading(true);
    try {
      // First validate locally with calculator
      const calculatorData = streakCalculator.validateStreak();
      console.log('🎯 HOOK: Calculator validation:', calculatorData);
      
      // Then try server sync
      const success = await realTimeStreakSync.forceSyncFromServer();
      console.log('🚀 HOOK: Force sync result:', success);
      
      // Refresh with latest data
      refresh();
      
      return success;
    } catch (error) {
      console.error('❌ HOOK: Force sync error:', error);
      // Still refresh with calculator data
      refresh();
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refresh]);

  // Update streak using the calculator
  const updateStreak = useCallback(async () => {
    try {
      console.log('🔥 HOOK: Starting check-in process...');
      
      // Use the calculator for consistent check-in logic
      const calculatorResult = await streakCalculator.performCheckIn();
      console.log('🎯 HOOK: Calculator result:', calculatorResult);
      
      // Update via sync service (will broadcast to all components)
      realTimeStreakSync.updateStreakData(calculatorResult);
      
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
          const serverResponse = await response.json();
          console.log('✅ HOOK: Synced to database - Server response:', serverResponse);
          
          // Update with server data if different
          const syncedData = {
            ...calculatorResult,
            synced: true,
            serverMessage: serverResponse.message,
            serverStreak: serverResponse.currentStreak
          };
          
          realTimeStreakSync.updateStreakData(syncedData);
          return syncedData;
        } else {
          console.warn('⚠️ HOOK: Server returned error:', response.status);
          const failedSyncData = { ...calculatorResult, synced: false };
          realTimeStreakSync.updateStreakData(failedSyncData);
          return failedSyncData;
        }
      } catch (error) {
        console.warn('⚠️ HOOK: Database sync failed:', error.message);
        const offlineData = { ...calculatorResult, synced: false, error: error.message };
        realTimeStreakSync.updateStreakData(offlineData);
        return offlineData;
      }
    } catch (calculatorError) {
      console.error('❌ HOOK: Calculator check-in failed:', calculatorError);
      throw calculatorError;
    }
  }, []);

  // Get streak statistics using calculator
  const getStats = useCallback(() => {
    return streakCalculator.getStreakStats();
  }, []);

  // Manual refresh using calculator validation
  const refresh = useCallback(() => {
    const calculatorData = streakCalculator.getStreakStats();
    const syncData = realTimeStreakSync.getCurrentStreakData();
    
    // Merge data, preferring calculator for validation
    const refreshedData = {
      ...syncData,
      ...calculatorData,
      lastUpdate: new Date().toISOString()
    };
    
    setStreakData(refreshedData);
    setLastUpdate(new Date());
    
    console.log('🔄 HOOK: Refreshed streak data:', refreshedData);
  }, []);

  return {
    // Current streak data
    currentStreak: streakData.currentStreak || 0,
    longestStreak: streakData.longestStreak || 0,
    totalCheckIns: streakData.totalCheckIns || 0,
    lastCheckInDate: streakData.lastCheckInDate,
    streakStartDate: streakData.streakStartDate,
    canCheckIn: streakData.canCheckIn !== false,
    nextDay: streakData.nextDay || (streakData.currentStreak || 0) + 1,
    
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
    motivation: streakCalculator.getMotivationMessage(streakData.currentStreak || 0),
    buttonText: streakCalculator.getCheckInButtonText(streakData),
    
    // Debug info
    debugInfo: {
      ...streakCalculator.getDebugInfo(),
      hookStreakData: streakData,
      syncData: realTimeStreakSync.getCurrentStreakData()
    }
  };
};