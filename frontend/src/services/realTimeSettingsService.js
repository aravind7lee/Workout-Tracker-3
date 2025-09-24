// frontend/src/services/realTimeSettingsService.js
import { onlineService } from './onlineService';

class RealTimeSettingsService {
  constructor() {
    this.isActive = false;
    this.syncInterval = null;
    this.eventListeners = new Map();
    this.lastSyncTime = null;
    this.settingsData = null;
    
    this.initializeRealTimeFeatures();
  }

  initializeRealTimeFeatures() {
    if (typeof window !== 'undefined') {
      this.onlineHandler = () => this.handleOnlineStatus(true);
      this.offlineHandler = () => this.handleOnlineStatus(false);
      
      window.addEventListener('online', this.onlineHandler);
      window.addEventListener('offline', this.offlineHandler);
    }
  }

  // Start real-time settings sync
  startRealTimeSync(intervalMs = 30000) {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🔄 Starting real-time settings sync...');
    
    // Initial sync
    this.performSync();
    
    // Set up interval sync
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, intervalMs);
    
    this.emitEvent('syncStarted', { timestamp: new Date().toISOString() });
  }

  // Stop real-time sync
  stopRealTimeSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    this.isActive = false;
    console.log('⏹️ Real-time settings sync stopped');
    
    this.emitEvent('syncStopped', { timestamp: new Date().toISOString() });
  }

  // Perform sync operation
  async performSync() {
    try {
      const isOnline = await onlineService.checkBackendStatus();
      if (!isOnline) {
        this.emitEvent('syncStatus', { status: 'offline', timestamp: new Date().toISOString() });
        return;
      }

      this.emitEvent('syncStatus', { status: 'syncing', timestamp: new Date().toISOString() });

      // Sync settings data
      await this.syncSettingsData();
      
      this.lastSyncTime = new Date().toISOString();
      
      this.emitEvent('syncStatus', { 
        status: 'synced', 
        timestamp: this.lastSyncTime
      });
      
    } catch (error) {
      console.error('Settings sync failed:', error);
      this.emitEvent('syncStatus', { 
        status: 'error', 
        error: error.message,
        timestamp: new Date().toISOString() 
      });
    }
  }

  // Sync settings data
  async syncSettingsData() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/users/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const settingsData = await response.json();
        this.settingsData = settingsData;
        
        this.emitEvent('settingsUpdated', { settings: settingsData });
        return settingsData;
      } else if (response.status === 404) {
        // Settings endpoint not found, return default settings
        console.log('Settings endpoint not available, using local settings');
        return this.getLocalSettings();
      }
    } catch (error) {
      console.error('Failed to sync settings data:', error);
    }
    return null;
  }

  // Update settings
  async updateSettings(settingsData) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/users/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsData)
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          this.settingsData = result.settings;
          
          // Update local storage
          localStorage.setItem('userSettings', JSON.stringify(result.settings));
          
          this.emitEvent('settingsUpdated', { settings: result.settings });
          
          // Trigger immediate sync
          setTimeout(() => this.performSync(), 1000);
          
          return { success: true, settings: result.settings };
        }
      } else if (response.status === 404) {
        // Settings endpoint not found, save locally
        console.log('Settings endpoint not available, saving locally');
        localStorage.setItem('userSettings', JSON.stringify(settingsData));
        this.settingsData = settingsData;
        this.emitEvent('settingsUpdated', { settings: settingsData });
        return { success: true, settings: settingsData };
      }
      
      throw new Error('Failed to update settings');
    } catch (error) {
      console.error('Settings update failed:', error);
      // Fallback to local save
      localStorage.setItem('userSettings', JSON.stringify(settingsData));
      this.settingsData = settingsData;
      this.emitEvent('settingsUpdated', { settings: settingsData });
      return { success: true, settings: settingsData };
    }
  }

  // Get real-time settings
  async getRealTimeSettings() {
    try {
      const isOnline = await onlineService.checkBackendStatus();
      if (isOnline) {
        const settings = await this.syncSettingsData();
        if (settings) return settings;
      }
      
      // Fallback to local settings
      const localSettings = this.getLocalSettings();
      return localSettings;
      
    } catch (error) {
      console.error('Failed to get real-time settings:', error);
      return this.getLocalSettings();
    }
  }

  // Get local settings as fallback
  getLocalSettings() {
    try {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
      
      // Default settings
      return {
        profile: {
          name: '',
          email: '',
          phone: '',
          location: ''
        },
        fitnessGoals: {
          goal: 'maintain',
          activityLevel: 'moderate',
          targetWeight: null,
          weeklyGoal: 3
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          workoutReminders: true,
          mealReminders: false,
          achievementAlerts: true
        },
        privacy: {
          profileVisibility: 'public',
          dataSharing: false,
          analyticsOptOut: false
        },
        preferences: {
          theme: 'dark',
          language: 'en',
          units: 'metric',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h'
        },
        data: {
          autoBackup: true,
          syncAcrossDevices: true,
          dataRetention: '1year'
        },
        lastSync: this.lastSyncTime,
        isRealTime: false
      };
    } catch (error) {
      console.error('Error loading local settings:', error);
      return this.getLocalSettings();
    }
  }

  // Handle network status changes
  handleOnlineStatus(isOnline) {
    this.emitEvent('networkStatusChanged', { isOnline, timestamp: new Date().toISOString() });
    
    if (isOnline) {
      console.log('🌐 Back online - syncing settings data...');
      setTimeout(() => this.performSync(), 2000);
    }
  }

  // Event system
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emitEvent(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      isActive: this.isActive,
      lastSyncTime: this.lastSyncTime,
      hasSettingsData: !!this.settingsData
    };
  }

  // Force sync
  async forceSync() {
    console.log('🔄 Force settings sync triggered...');
    await this.performSync();
  }

  // Cleanup method
  cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    if (typeof window !== 'undefined' && this.onlineHandler && this.offlineHandler) {
      window.removeEventListener('online', this.onlineHandler);
      window.removeEventListener('offline', this.offlineHandler);
    }
    
    this.eventListeners.clear();
    this.isActive = false;
  }
}

// Create singleton instance
export const realTimeSettingsService = new RealTimeSettingsService();
export default realTimeSettingsService;