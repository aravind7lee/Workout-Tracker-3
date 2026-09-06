// frontend/src/services/notificationService.js
// Production-grade Real-Time Web Push and In-App Notification Engine

class NotificationService {
  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'Notification' in window;
    this.reminderInterval = null;
    this.audioContext = null;
  }

  // Play crisp, subtle Apple-style audio chime using browser Web Audio API
  playChime() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioContextClass();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      // Two-tone bell harmonic (D5 -> A5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880.0, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Audio playback restrictions safely handled
    }
  }

  // Get current browser permission state
  getPermission() {
    if (!this.isSupported) return 'unsupported';
    return Notification.permission;
  }

  // Request native permission from browser
  async requestPermission() {
    if (!this.isSupported) {
      return { success: false, status: 'unsupported', message: 'Web Notifications are not supported in this browser.' };
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.playChime();
        this.sendSystemNotification('Notifications Enabled! 🔔', {
          body: 'GrindX Real-Time alerts are now connected to your device.',
          tag: 'grindx-welcome'
        });
        return { success: true, status: 'granted', message: 'Notifications enabled successfully!' };
      } else if (permission === 'denied') {
        return { 
          success: false, 
          status: 'denied', 
          message: 'Notifications are blocked in browser site settings. Please allow notifications in your address bar.' 
        };
      } else {
        return { success: false, status: 'default', message: 'Notification permission dismissed.' };
      }
    } catch (error) {
      return { success: false, status: 'error', message: error.message };
    }
  }

  // Send system push notification
  sendSystemNotification(title, options = {}) {
    if (!this.isSupported || Notification.permission !== 'granted') {
      // Fallback: emit in-app window event
      this.dispatchInAppEvent(title, options);
      return false;
    }

    try {
      this.playChime();
      const notification = new Notification(title, {
        body: options.body || '',
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag || 'grindx-alert',
        renotify: true,
        silent: false,
        ...options
      });

      notification.onclick = () => {
        window.focus();
        if (options.url) {
          window.location.href = options.url;
        }
        notification.close();
      };

      this.dispatchInAppEvent(title, options);
      return true;
    } catch {
      this.dispatchInAppEvent(title, options);
      return false;
    }
  }

  // Dispatch in-app notification event for UI toasts
  dispatchInAppEvent(title, options = {}) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('grindxNotification', {
          detail: {
            title,
            body: options.body || '',
            type: options.type || 'info',
            timestamp: new Date().toISOString()
          }
        })
      );
    }
  }

  // Trigger immediate test notification
  async testRealTimeNotification() {
    const perm = this.getPermission();
    if (perm !== 'granted') {
      const result = await this.requestPermission();
      if (!result.success) {
        return result;
      }
    }

    const success = this.sendSystemNotification('GrindX Real-Time Alert 🏋️', {
      body: 'Your live workout and nutrition notification engine is operational!',
      tag: 'grindx-test-alert'
    });

    return {
      success,
      status: 'sent',
      message: 'Real-time test notification delivered to your device!'
    };
  }

  // Start scheduled reminder loop based on user settings
  startReminderScheduler(notificationsConfig = {}) {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
    }

    // Check every 5 minutes
    this.reminderInterval = setInterval(() => {
      this.checkAndTriggerReminders(notificationsConfig);
    }, 5 * 60 * 1000);

    // Initial check
    this.checkAndTriggerReminders(notificationsConfig);
  }

  // Check reminder conditions
  checkAndTriggerReminders(config) {
    if (!config || !this.isSupported || Notification.permission !== 'granted') return;

    const now = new Date();
    const currentHour = now.getHours();
    const todayStr = now.toISOString().slice(0, 10);

    // Workout reminder: trigger between 17:00 and 20:00 if enabled and not yet triggered today
    if (config.workoutReminders && currentHour >= 17 && currentHour <= 20) {
      const lastSent = localStorage.getItem('grindx_last_workout_reminder');
      if (lastSent !== todayStr) {
        localStorage.setItem('grindx_last_workout_reminder', todayStr);
        this.sendSystemNotification('Time to Grind! 🏋️', {
          body: "Don't break your streak! Today's scheduled workout is waiting for you.",
          tag: 'grindx-workout-reminder',
          url: '/start-workout'
        });
      }
    }

    // Nutrition reminder: trigger around lunch (12:00 - 14:00) or dinner (19:00 - 21:00) if enabled
    if (config.mealReminders && ((currentHour >= 12 && currentHour <= 14) || (currentHour >= 19 && currentHour <= 21))) {
      const reminderKey = `grindx_meal_reminder_${todayStr}_${currentHour < 15 ? 'lunch' : 'dinner'}`;
      const lastSent = localStorage.getItem(reminderKey);
      if (!lastSent) {
        localStorage.setItem(reminderKey, 'true');
        this.sendSystemNotification('Fuel Your Gains! 🍽️', {
          body: "Log your recent meal to keep your daily macro and protein targets on track.",
          tag: 'grindx-nutrition-reminder',
          url: '/nutrition'
        });
      }
    }
  }

  // Stop scheduler
  stopReminderScheduler() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
