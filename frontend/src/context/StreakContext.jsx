// Real-Time Streak Context - Syncs across all pages instantly
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const StreakContext = createContext();

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (!context) {
    return { currentStreak: 0, longestStreak: 0, totalCheckIns: 0 }; // Fallback
  }
  return context;
};

export const StreakProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalCheckIns: 0,
    lastCheckInDate: null,
    streakStartDate: null,
    canCheckIn: true
  });
  const [loading, setLoading] = useState(false);

  // Real-time streak fetching from MongoDB
  const fetchStreakData = useCallback(async () => {
    if (!isAuthenticated() || !user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        const today = new Date().toISOString().split('T')[0];
        
        // Calculate real-time streak status
        let currentStreak = userData.currentStreak || 0;
        const lastCheckIn = userData.lastStreakCheckIn ? new Date(userData.lastStreakCheckIn).toISOString().split('T')[0] : null;
        
        // Check if streak is broken
        if (lastCheckIn) {
          const daysDiff = Math.floor((new Date() - new Date(lastCheckIn)) / (1000 * 60 * 60 * 24));
          if (daysDiff > 1) {
            currentStreak = 0;
          }
        }

        const newStreakData = {
          currentStreak,
          longestStreak: userData.longestStreak || 0,
          totalCheckIns: userData.totalCheckIns || 0,
          lastCheckInDate: lastCheckIn,
          streakStartDate: userData.streakStartDate ? new Date(userData.streakStartDate).toISOString().split('T')[0] : null,
          canCheckIn: lastCheckIn !== today
        };

        setStreakData(newStreakData);
        
        // Update localStorage as backup
        const streakKey = `gymtracker_streak_${user.id}`;
        localStorage.setItem(streakKey, JSON.stringify(newStreakData));
        
        console.log('✅ Real-time streak data loaded:', newStreakData);
      } else {
        // Fallback to localStorage
        loadFromLocalStorage();
      }
    } catch (error) {
      console.warn('Streak fetch failed, using localStorage:', error);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Fallback to localStorage
  const loadFromLocalStorage = useCallback(() => {
    if (!user) return;
    
    const streakKey = `gymtracker_streak_${user.id}`;
    const saved = localStorage.getItem(streakKey);
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const today = new Date().toISOString().split('T')[0];
        
        // Validate streak freshness
        let currentStreak = data.currentStreak || 0;
        if (data.lastCheckInDate) {
          const daysDiff = Math.floor((new Date() - new Date(data.lastCheckInDate)) / (1000 * 60 * 60 * 24));
          if (daysDiff > 1) {
            currentStreak = 0;
          }
        }

        setStreakData({
          currentStreak,
          longestStreak: data.longestStreak || 0,
          totalCheckIns: data.totalCheckIns || 0,
          lastCheckInDate: data.lastCheckInDate,
          streakStartDate: data.streakStartDate,
          canCheckIn: data.lastCheckInDate !== today
        });
      } catch (error) {
        console.error('Failed to parse streak data:', error);
      }
    }
  }, [user]);

  // Update streak after check-in
  const updateStreak = useCallback(async (newStreakData) => {
    setStreakData(newStreakData);
    
    // Broadcast update to all components
    window.dispatchEvent(new CustomEvent('streakUpdated', { 
      detail: newStreakData 
    }));
    
    // Update localStorage
    if (user) {
      const streakKey = `gymtracker_streak_${user.id}`;
      localStorage.setItem(streakKey, JSON.stringify(newStreakData));
    }
    
    // Sync to database
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentStreak: newStreakData.currentStreak,
          longestStreak: newStreakData.longestStreak,
          totalCheckIns: newStreakData.totalCheckIns,
          lastStreakCheckIn: new Date().toISOString(),
          streakStartDate: newStreakData.streakStartDate ? new Date(newStreakData.streakStartDate).toISOString() : null
        })
      });
      console.log('✅ Streak synced to database');
    } catch (error) {
      console.warn('Database sync failed:', error);
    }
  }, [user]);

  // Initialize on mount
  useEffect(() => {
    if (isAuthenticated() && user) {
      fetchStreakData();
    }
  }, [fetchStreakData, isAuthenticated, user]);

  // Listen for streak updates from other components
  useEffect(() => {
    const handleStreakUpdate = (event) => {
      setStreakData(event.detail);
    };

    window.addEventListener('streakUpdated', handleStreakUpdate);
    return () => window.removeEventListener('streakUpdated', handleStreakUpdate);
  }, []);

  // Periodic refresh every 5 minutes
  useEffect(() => {
    if (!isAuthenticated()) return;
    
    const interval = setInterval(fetchStreakData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchStreakData, isAuthenticated]);

  const value = {
    ...streakData,
    loading,
    fetchStreakData,
    updateStreak
  };

  return (
    <StreakContext.Provider value={value}>
      {children}
    </StreakContext.Provider>
  );
};