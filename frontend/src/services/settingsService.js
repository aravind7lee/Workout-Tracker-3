// Settings Service - Error-Free API Communication
import chromeErrorHandler from '../utils/chromeErrorHandler';

class SettingsService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE;
    this.retryAttempts = 5; // Increased retry attempts for MongoDB
    this.retryDelay = 2000; // Increased delay for better connection
    
    console.log('🏗️ Settings Service Initialized');
    console.log('🌐 Backend URL:', this.baseURL);
    console.log('🔄 Retry Attempts:', this.retryAttempts);
    console.log('⏱️ Retry Delay:', this.retryDelay + 'ms');
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Safe API call with retry logic and error handling - FORCE MongoDB Connection
  async safeApiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Force online mode for MongoDB sync
    if (!navigator.onLine) {
      throw new Error('Offline - will sync when online');
    }
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`🔄 Attempting MongoDB sync (${attempt}/${this.retryAttempts}):`, url);
        
        const response = await fetch(url, {
          ...options,
          headers: {
            ...this.getAuthHeaders(),
            ...options.headers
          }
        });

        console.log(`📡 Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          // Handle specific HTTP errors
          if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
          }
          if (response.status === 404) {
            console.warn('⚠️ Settings endpoint not found - checking backend deployment');
            throw new Error('Backend endpoint not available. Check deployment.');
          }
          if (response.status >= 500) {
            throw new Error(`Server error (${response.status}). Retrying...`);
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ MongoDB sync successful:', data);
        return data;
      } catch (error) {
        console.warn(`❌ API call attempt ${attempt} failed:`, error.message);
        
        // If it's the last attempt or a non-retryable error, throw
        if (attempt === this.retryAttempts || 
            error.message.includes('Authentication failed') ||
            error.message.includes('not found')) {
          throw error;
        }
        
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  // Load settings from MongoDB - PRIORITY MongoDB Connection
  async loadSettings() {
    console.log('🚀 Loading settings - Priority: MongoDB Global Sync');
    
    try {
      // PRIORITY: Try MongoDB first for global sync
      if (navigator.onLine && localStorage.getItem('token')) {
        try {
          console.log('🌐 Attempting MongoDB connection...');
          const mongoSettings = await this.safeApiCall('/users/settings');
          
          const globalSettings = {
            ...mongoSettings,
            lastSync: new Date().toISOString(),
            isRealTime: true,
            source: 'mongodb'
          };
          
          // Update localStorage with MongoDB data
          this.saveLocalSettings(globalSettings);
          
          console.log('✅ MongoDB Global Sync Successful!');
          return {
            settings: globalSettings,
            source: 'mongodb',
            status: 'synced'
          };
        } catch (mongoError) {
          console.warn('⚠️ MongoDB connection failed:', mongoError.message);
          
          // Fallback to local settings only if MongoDB fails
          const localSettings = this.getLocalSettings();
          return {
            settings: localSettings,
            source: 'local',
            status: 'offline',
            error: mongoError.message
          };
        }
      } else {
        console.warn('📱 Offline or not authenticated - using local settings');
        const localSettings = this.getLocalSettings();
        return {
          settings: localSettings,
          source: 'local',
          status: 'offline',
          error: 'Offline or not authenticated'
        };
      }
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
      
      // Return default settings if everything fails
      return {
        settings: this.getDefaultSettings(),
        source: 'default',
        status: 'error',
        error: error.message
      };
    }
  }

  // Save settings to MongoDB - FORCE Global Sync
  async saveSettings(settings) {
    console.log('💾 Saving settings - FORCE MongoDB Global Sync');
    
    try {
      // PRIORITY: Save to MongoDB first for global sync
      if (navigator.onLine && localStorage.getItem('token')) {
        try {
          console.log('🌐 Forcing MongoDB global save...');
          
          const result = await this.safeApiCall('/users/settings', {
            method: 'PUT',
            body: JSON.stringify({
              ...settings,
              lastSync: new Date().toISOString(),
              isRealTime: true
            })
          });
          
          // Save to localStorage after successful MongoDB save
          this.saveLocalSettings(settings);
          
          console.log('✅ MongoDB Global Save Successful!');
          return {
            success: true,
            source: 'mongodb',
            status: 'synced',
            data: result
          };
        } catch (mongoError) {
          console.warn('⚠️ MongoDB save failed:', mongoError.message);
          
          // Save locally as fallback
          this.saveLocalSettings(settings);
          
          return {
            success: true,
            source: 'local',
            status: 'offline',
            error: mongoError.message
          };
        }
      } else {
        console.warn('📱 Offline or not authenticated - saving locally');
        this.saveLocalSettings(settings);
        
        return {
          success: true,
          source: 'local',
          status: 'offline',
          error: 'Offline or not authenticated'
        };
      }
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
      
      return {
        success: false,
        source: 'none',
        status: 'error',
        error: error.message
      };
    }
  }

  // Get settings from localStorage
  getLocalSettings() {
    try {
      const saved = localStorage.getItem('userSettings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to parse local settings:', error);
    }
    
    return this.getDefaultSettings();
  }

  // Save settings to localStorage
  saveLocalSettings(settings) {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Failed to save local settings:', error);
      return false;
    }
  }

  // Get default settings
  getDefaultSettings() {
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
      lastSync: new Date().toISOString(),
      isRealTime: false
    };
  }

  // Auto-save with debouncing
  setupAutoSave(callback, delay = 1000) {
    let timeoutId;
    
    return (settings) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const result = await this.saveSettings(settings);
          if (callback) callback(result);
        } catch (error) {
          console.error('Auto-save failed:', error);
          if (callback) callback({ success: false, error: error.message });
        }
      }, delay);
    };
  }

  // Check if online
  isOnline() {
    return navigator.onLine;
  }

  // Sync settings when coming back online
  async syncWhenOnline(settings) {
    if (!this.isOnline()) {
      return { success: false, error: 'Offline' };
    }
    
    try {
      return await this.saveSettings(settings);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get sync status
  getSyncStatus(lastResult) {
    if (!this.isOnline()) {
      return {
        status: 'offline',
        icon: '📱',
        text: 'Offline Mode',
        color: 'text-yellow-300 bg-yellow-900/30'
      };
    }
    
    if (!lastResult) {
      return {
        status: 'ready',
        icon: '⚡',
        text: 'Ready',
        color: 'text-green-300 bg-green-900/30'
      };
    }
    
    switch (lastResult.status) {
      case 'synced':
        return {
          status: 'synced',
          icon: '🌐',
          text: 'MongoDB Connected',
          color: 'text-green-300 bg-green-900/30'
        };
      case 'syncing':
        return {
          status: 'syncing',
          icon: '🔄',
          text: 'Syncing...',
          color: 'text-blue-300 bg-blue-900/30'
        };
      case 'error':
        return {
          status: 'error',
          icon: '⚠️',
          text: 'Sync Error',
          color: 'text-red-300 bg-red-900/30'
        };
      default:
        return {
          status: 'offline',
          icon: '📱',
          text: 'Local Storage',
          color: 'text-yellow-300 bg-yellow-900/30'
        };
    }
  }
}

// Create singleton instance
const settingsService = new SettingsService();

export default settingsService;
export { SettingsService };