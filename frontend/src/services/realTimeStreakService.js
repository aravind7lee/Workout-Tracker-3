// frontend/src/services/realTimeStreakService.js
// Production-Grade Real-Time Streak Synchronization & Multi-User Persistence

import api from '../utils/api';

const toLocalDateKey = (d = new Date()) => {
  if (!d) return '';
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

class RealTimeStreakService {
  constructor() {
    this.listeners = new Set();
    this.modalListeners = new Set();
    this.isModalOpen = false;
    this.currentData = this.getInitialCache();
    this.initialized = false;
    this.isSyncing = false;

    if (typeof window !== 'undefined') {
      this.setupEventListeners();
    }
  }

  getData() {
    return this.currentData || this.getInitialCache();
  }

  getUserCacheKey() {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const id = user.id || user._id || user.email;
        if (id) return `gym_realtime_streak_${id}`;
      }
    } catch {}
    return 'gym_realtime_streak_guest';
  }

  getInitialCache() {
    const todayKey = toLocalDateKey(new Date());
    try {
      const key = this.getUserCacheKey();
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        const isActiveToday = parsed.lastCheckInDate === todayKey && parsed.currentStreak > 0;
        return {
          ...parsed,
          isActiveToday,
          canCheckIn: !isActiveToday
        };
      }
    } catch {}

    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCheckIns: 0,
      canCheckIn: true,
      isActiveToday: false,
      lastCheckInDate: null,
      streakStartDate: null,
      weeklyProgress: this.generateWeeklyProgress(0, false),
      streakHistory: [],
      milestones: [],
      isRealTime: true,
      lastSync: new Date().toISOString()
    };
  }

  setModalOpen(isOpen) {
    this.isModalOpen = Boolean(isOpen);
    this.modalListeners.forEach(cb => {
      try {
        cb(this.isModalOpen);
      } catch (err) {
        console.error('Error in modal listener:', err);
      }
    });
  }

  subscribeToModal(callback) {
    this.modalListeners.add(callback);
    callback(this.isModalOpen);
    return () => {
      this.modalListeners.delete(callback);
    };
  }

  setupEventListeners() {
    // Listen for workout completions anywhere in the app
    window.addEventListener('workoutCompleted', () => {
      this.syncStreak(true);
    });

    window.addEventListener('userLoggedIn', () => {
      this.currentData = this.getInitialCache();
      this.syncStreak(false);
    });

    window.addEventListener('userLoggedOut', () => {
      this.currentData = this.getInitialCache();
      this.notifyListeners();
    });

    window.addEventListener('realTimeStatsSync', (e) => {
      if (e.detail?.currentStreak !== undefined) {
        this.updateData({
          currentStreak: e.detail.currentStreak,
          longestStreak: Math.max(this.currentData.longestStreak || 0, e.detail.currentStreak)
        });
      }
    });

    // Cross-tab synchronization
    window.addEventListener('storage', (e) => {
      if (e.key === this.getUserCacheKey() && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          this.updateData(parsed, false);
        } catch {}
      }
    });
  }

  // Subscribe to real-time streak changes
  subscribe(callback) {
    this.listeners.add(callback);
    // Initial emit
    callback(this.currentData);

    if (!this.initialized) {
      this.initialized = true;
      this.syncStreak();
    }

    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb(this.currentData);
      } catch (err) {
        console.error('Error in streak listener:', err);
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('streakUpdated', { detail: this.currentData }));
    }
  }

  updateData(newData, persist = true) {
    const todayKey = toLocalDateKey(new Date());
    const updated = {
      ...this.currentData,
      ...newData,
      lastSync: new Date().toISOString()
    };

    // Calculate active today flag
    updated.isActiveToday = updated.lastCheckInDate === todayKey && updated.currentStreak > 0;
    updated.canCheckIn = !updated.isActiveToday;

    if (!updated.weeklyProgress || updated.weeklyProgress.length === 0) {
      updated.weeklyProgress = this.generateWeeklyProgress(updated.currentStreak, updated.isActiveToday);
    }

    this.currentData = updated;

    if (persist && typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.getUserCacheKey(), JSON.stringify(updated));
      } catch {}
    }

    this.notifyListeners();
  }

  // Fetch authoritative streak from backend API
  async syncStreak(forceCheckInIfEligible = false) {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.isSyncing = false;
        return;
      }

      if (forceCheckInIfEligible) {
        try {
          const checkInRes = await api.post('/users/streak/check-in');
          if (checkInRes.data?.success) {
            this.updateData({
              currentStreak: checkInRes.data.currentStreak,
              longestStreak: checkInRes.data.longestStreak,
              totalCheckIns: checkInRes.data.totalCheckIns,
              lastCheckInDate: checkInRes.data.lastCheckInDate,
              streakHistory: checkInRes.data.streakHistory || this.currentData.streakHistory,
              message: checkInRes.data.message
            });
            this.isSyncing = false;
            return;
          }
        } catch {}
      }

      const res = await api.get('/users/streak/status');
      if (res.data && res.data.success) {
        const streakData = res.data;
        const todayKey = toLocalDateKey(new Date());
        const isActiveToday = Boolean(streakData.isActiveToday || (streakData.lastCheckInDate === todayKey && (streakData.currentStreak || 0) > 0));
        const canCheckIn = Boolean(streakData.canCheckIn !== undefined ? streakData.canCheckIn : !isActiveToday);

        this.updateData({
          currentStreak: streakData.currentStreak ?? 0,
          longestStreak: streakData.longestStreak ?? streakData.currentStreak ?? 0,
          totalCheckIns: streakData.totalCheckIns ?? 0,
          canCheckIn: canCheckIn,
          isActiveToday: isActiveToday,
          lastCheckInDate: streakData.lastCheckInDate || (isActiveToday ? todayKey : null),
          streakStartDate: streakData.streakStartDate,
          weeklyProgress: streakData.weeklyProgress || this.generateWeeklyProgress(streakData.currentStreak, isActiveToday),
          streakHistory: streakData.streakHistory || [],
          milestones: streakData.milestones || [],
          isRealTime: true
        });
      }
    } catch (err) {
      console.warn('⚠️ Server streak fetch warning:', err.message);
    } finally {
      this.isSyncing = false;
    }
  }

  // Perform manual check-in with guaranteed persistence
  async checkIn() {
    const todayKey = toLocalDateKey(new Date());

    // If already active today, do not increment
    if (this.currentData.isActiveToday && (this.currentData.currentStreak || 0) > 0) {
      return { 
        success: true, 
        alreadyCheckedIn: true,
        message: `🔥 Streak Active Today (${this.currentData.currentStreak}d Logged)!`,
        ...this.currentData 
      };
    }

    const current = this.currentData.currentStreak || 0;
    const optimisticStreak = current === 0 ? 1 : current + 1;

    const optimisticHistory = Array.isArray(this.currentData.streakHistory) ? [...this.currentData.streakHistory] : [];
    if (!optimisticHistory.some(h => toLocalDateKey(h.date) === todayKey)) {
      optimisticHistory.push({ date: new Date(), streakDay: optimisticStreak, tier: 'Beginner' });
    }

    const uniqueCount = new Set(optimisticHistory.map(h => toLocalDateKey(h.date))).size;

    const optimisticData = {
      currentStreak: optimisticStreak,
      longestStreak: Math.max(this.currentData.longestStreak || 0, optimisticStreak),
      totalCheckIns: Math.max(uniqueCount, optimisticStreak),
      canCheckIn: false,
      isActiveToday: true,
      lastCheckInDate: todayKey,
      streakHistory: optimisticHistory,
      weeklyProgress: this.generateWeeklyProgress(optimisticStreak, true)
    };
    
    // Save locally immediately
    this.updateData(optimisticData, true);

    try {
      const res = await api.post('/users/streak/check-in');
      if (res.data?.success) {
        const updated = {
          currentStreak: res.data.currentStreak ?? optimisticStreak,
          longestStreak: res.data.longestStreak ?? optimisticData.longestStreak,
          totalCheckIns: res.data.totalCheckIns ?? optimisticData.totalCheckIns,
          canCheckIn: false,
          isActiveToday: true,
          lastCheckInDate: res.data.lastCheckInDate || todayKey,
          streakHistory: res.data.streakHistory || optimisticHistory,
          message: res.data.message || `🔥 Day ${res.data.currentStreak || optimisticStreak} Active!`,
          weeklyProgress: this.generateWeeklyProgress(res.data.currentStreak ?? optimisticStreak, true)
        };
        this.updateData(updated, true);
        return { success: true, ...updated };
      }
      return { success: true, ...optimisticData };
    } catch (err) {
      console.warn('⚠️ Check-in network fallback to local cache:', err.message);
      return { success: true, ...optimisticData };
    }
  }

  // Generate clean weekly progress structure
  generateWeeklyProgress(currentStreak = 0, isActiveToday = false) {
    const today = new Date();
    const todayKey = toLocalDateKey(today);
    const dayOfWeek = today.getDay(); // 0 = Sun, 6 = Sat
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);

    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dKey = toLocalDateKey(d);
      const isToday = dKey === todayKey;
      const isPast = d < today && !isToday;

      let completed = false;
      if (isToday) {
        completed = isActiveToday;
      } else if (isPast && currentStreak > 0) {
        const diffDays = Math.floor((today - d) / (1000 * 60 * 60 * 24));
        completed = diffDays < currentStreak;
      }

      result.push({
        date: dKey,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        completed,
        hasCheckIn: completed,
        isToday,
        isPast
      });
    }
    return result;
  }
}

export const realTimeStreakService = new RealTimeStreakService();
export default realTimeStreakService;
