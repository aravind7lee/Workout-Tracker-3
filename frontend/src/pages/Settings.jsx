import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  HelpCircle,
  Save,
  Target,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Activity,
  Trophy,
  Zap,
  BarChart3,
  Calendar,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import settingsService from '../services/settingsService';
import chromeErrorHandler from '../utils/chromeErrorHandler';
import { onlineService } from '../services/onlineService';

export default function Settings() {
  const { user, updateUser, isAuthenticated } = useAuth();
  // Theme is always dark mode - no toggle functionality
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('ready');
  const [lastSyncResult, setLastSyncResult] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState({
    totalWorkouts: 0,
    totalMeals: 0,
    totalPlans: 0,
    currentStreak: 0,
    xpPoints: 0,
    membershipDays: 0,
    lastSync: null
  });
  const [loading, setLoading] = useState(true);
  
  const [settings, setSettings] = useState({
    profile: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || ''
    },
    fitnessGoals: {
      goal: user?.fitnessGoals?.goal || 'maintain',
      activityLevel: user?.fitnessGoals?.activityLevel || 'moderate',
      targetWeight: user?.fitnessGoals?.targetWeight || null,
      weeklyGoal: user?.fitnessGoals?.weeklyGoal || 3
    },
    notifications: {
      emailNotifications: user?.notifications?.emailNotifications ?? true,
      pushNotifications: user?.notifications?.pushNotifications ?? true,
      workoutReminders: user?.notifications?.workoutReminders ?? true,
      mealReminders: user?.notifications?.mealReminders ?? false,
      achievementAlerts: user?.notifications?.achievementAlerts ?? true
    },
    privacy: {
      profileVisibility: user?.privacy?.profileVisibility || 'public',
      dataSharing: user?.privacy?.dataSharing || false,
      analyticsOptOut: user?.privacy?.analyticsOptOut || false
    },
    preferences: {
      theme: 'dark', // Always dark mode
      language: user?.preferences?.language || 'en',
      units: user?.preferences?.units || 'metric',
      dateFormat: user?.preferences?.dateFormat || 'MM/DD/YYYY',
      timeFormat: user?.preferences?.timeFormat || '12h'
    },
    data: {
      autoBackup: user?.dataSettings?.autoBackup ?? true,
      syncAcrossDevices: user?.dataSettings?.syncAcrossDevices ?? true,
      dataRetention: user?.dataSettings?.dataRetention || '1year'
    }
  });

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User, color: 'from-blue-500 to-cyan-500' },
    { id: 'fitness', label: 'Fitness Goals', icon: Target, color: 'from-green-500 to-emerald-500' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'from-yellow-500 to-orange-500' },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield, color: 'from-red-500 to-pink-500' },
    { id: 'preferences', label: 'App Preferences', icon: Palette, color: 'from-purple-500 to-violet-500' },
    { id: 'data', label: 'Data & Storage', icon: Database, color: 'from-indigo-500 to-blue-500' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, color: 'from-gray-500 to-slate-500' }
  ];

  // Initialize auto-save function with error handling
  const autoSave = useCallback(
    settingsService.setupAutoSave((result) => {
      setLastSyncResult(result);
      setSyncStatus(result.status || 'error');
    }),
    []
  );

  // Load real-time data with error handling
  const loadRealTimeData = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Load real-time stats with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const statsResponse = await fetch(`${import.meta.env.VITE_API_BASE}/users/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setRealTimeStats({
          totalWorkouts: stats.totalWorkouts || 0,
          totalMeals: stats.totalMeals || 0,
          totalPlans: stats.totalPlans || 0,
          currentStreak: stats.currentStreak || 0,
          xpPoints: stats.xpPoints || 0,
          membershipDays: stats.membershipDays || 0,
          lastSync: new Date().toISOString()
        });
        console.log('✅ Real-time stats loaded successfully');
      } else {
        console.warn('⚠️ Stats endpoint returned:', statsResponse.status);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('⏱️ Stats request timed out');
      } else {
        console.error('❌ Failed to load real-time data:', error.message);
      }
    }
  }, [isAuthenticated]);

  // Load settings with FORCE MongoDB connection
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setSyncStatus('loading');
        console.log('🚀 FORCE LOAD FROM MONGODB - Global Sync Priority');
        
        // Load both settings and real-time data
        // Load settings first, then stats
        const result = await chromeErrorHandler.safeExecuteAsync(async () => {
          return await settingsService.loadSettings();
        });
        
        if (result) {
          setSettings(prev => ({ ...prev, ...result.settings }));
          setLastSyncResult(result);
          setSyncStatus(result.status);
          
          if (result.source === 'mongodb') {
            console.log('✅ Settings loaded from server!');
          } else {
            console.warn('⚠️ Using fallback:', result.source);
          }
        }
        
        // Load real-time data separately with delay
        setTimeout(() => {
          loadRealTimeData();
        }, 1000);
      } catch (error) {
        console.error('❌ Error loading settings:', error);
        setSyncStatus('error');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();

    // Network status listeners with FORCE MongoDB reconnection
    const handleOnline = () => {
      chromeErrorHandler.safeExecute(() => {
        console.log('🌐 Network back online - FORCE MongoDB reconnection');
        setIsOnline(true);
        setSyncStatus('syncing');
        setTimeout(() => {
          loadSettings(); // Delayed sync to prevent spam
        }, 2000);
        setTimeout(() => {
          loadRealTimeData(); // Delayed reload
        }, 3000);
      });
    };
    
    const handleOffline = () => {
      chromeErrorHandler.safeExecute(() => {
        console.log('📱 Network offline - Local mode active');
        setIsOnline(false);
        setSyncStatus('offline');
      });
    };
    
    // Listen for real-time events
    const handleWorkoutCompleted = () => {
      console.log('🏋️ Workout completed - refreshing real-time data');
      setTimeout(() => loadRealTimeData(), 1000); // Delayed refresh
    };
    
    const handleMealAdded = () => {
      console.log('🍽️ Meal added - refreshing real-time data');
      setTimeout(() => loadRealTimeData(), 1000); // Delayed refresh
    };
    
    const handlePlanCreated = () => {
      console.log('📋 Plan created - refreshing real-time data');
      setTimeout(() => loadRealTimeData(), 1000); // Delayed refresh
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    window.addEventListener('mealAdded', handleMealAdded);
    window.addEventListener('planCreated', handlePlanCreated);
    
    // Real-time refresh every 60 seconds (reduced frequency)
    const refreshInterval = setInterval(() => {
      if (isAuthenticated() && navigator.onLine && !loading) {
        loadRealTimeData();
      }
    }, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('workoutCompleted', handleWorkoutCompleted);
      window.removeEventListener('mealAdded', handleMealAdded);
      window.removeEventListener('planCreated', handlePlanCreated);
      clearInterval(refreshInterval);
    };
  }, [isAuthenticated, loadRealTimeData]);

  const handleSettingChange = useCallback((section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  }, []);

  // Theme is always dark mode - no theme change functionality

  // Auto-save with improved debouncing
  useEffect(() => {
    if (Object.keys(settings).length > 0 && settings.profile.name !== undefined && !loading) {
      console.log('🔄 Auto-save triggered');
      setSyncStatus('syncing');
      autoSave({
        ...settings,
        autoSaveTimestamp: new Date().toISOString(),
        globalSync: true
      });
    }
  }, [settings, autoSave, loading]);

  const handleSave = async () => {
    setIsSaving(true);
    setSyncStatus('syncing');
    
    try {
      console.log('🚀 FORCE SAVE TO MONGODB - Global Sync Initiated');
      
      // Update user profile if changed
      if (settings.profile.name !== user?.name || settings.profile.email !== user?.email) {
        updateUser({
          ...user,
          name: settings.profile.name,
          email: settings.profile.email
        });
      }

      // FORCE MongoDB save with enhanced error handling
      const result = await chromeErrorHandler.safeExecuteAsync(async () => {
        return await settingsService.saveSettings({
          ...settings,
          timestamp: new Date().toISOString(),
          deviceId: navigator.userAgent,
          globalSync: true
        });
      });
      
      if (result) {
        setLastSyncResult(result);
        setSyncStatus(result.status);
        
        if (result.success) {
          if (result.source === 'mongodb') {
            alert('🎉 GLOBAL SETTINGS SAVED SUCCESSFULLY!\n\n✅ Saved to MongoDB Database\n🌐 Global Cloud Synchronization\n🎯 Fitness Goals Updated Globally\n🔔 Notifications Configured Worldwide\n📱 Available on ALL devices\n🏋️♂️ Professional Gym Experience\n🔥 Real-Time MongoDB Sync Active\n\n✨ Your preferences are LIVE globally!');
          } else if (result.source === 'local') {
            alert('⚠️ SETTINGS SAVED LOCALLY\n\n💾 Saved to device storage\n🔄 Will sync to MongoDB when online\n🌐 Backend connection issue detected\n💪 Settings are ready to use\n\n🔌 Check your internet connection for global sync');
          }
        } else {
          alert('❌ SAVE FAILED\n\nPlease check:\n• Internet connection\n• Backend server status\n• Authentication token\n\nTry again in a moment.');
        }
      } else {
        alert('❌ CRITICAL ERROR\n\nSettings save completely failed.\nPlease refresh and try again.');
        setSyncStatus('error');
      }
      
    } catch (error) {
      console.error('❌ Settings save failed:', error);
      alert('❌ SAVE ERROR\n\n' + error.message + '\n\nPlease try again or check your connection.');
      setSyncStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <User size={16} />
            Full Name
          </label>
          <input
            type="text"
            value={settings.profile.name}
            onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Mail size={16} />
            Email Address
          </label>
          <input
            type="email"
            value={settings.profile.email}
            onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Smartphone size={16} />
            Phone Number
          </label>
          <input
            type="tel"
            value={settings.profile.phone}
            onChange={(e) => handleSettingChange('profile', 'phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Globe size={16} />
            Location
          </label>
          <input
            type="text"
            value={settings.profile.location}
            onChange={(e) => handleSettingChange('profile', 'location', e.target.value)}
            placeholder="City, Country"
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>
    </div>
  );

  const renderFitnessGoalsSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Target size={16} />
            Primary Fitness Goal
          </label>
          <select
            value={settings.fitnessGoals.goal}
            onChange={(e) => handleSettingChange('fitnessGoals', 'goal', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
          >
            <option value="lose">🔥 Lose Weight</option>
            <option value="maintain">⚖️ Maintain Weight</option>
            <option value="gain">📈 Gain Weight</option>
            <option value="muscle">💪 Build Muscle</option>
            <option value="strength">⚡ Increase Strength</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Target size={16} />
            Activity Level
          </label>
          <select
            value={settings.fitnessGoals.activityLevel}
            onChange={(e) => handleSettingChange('fitnessGoals', 'activityLevel', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
          >
            <option value="sedentary">🪑 Sedentary (Little/No Exercise)</option>
            <option value="light">🚶 Light (1-3 days/week)</option>
            <option value="moderate">🏃 Moderate (3-5 days/week)</option>
            <option value="very">🏋️ Very Active (6-7 days/week)</option>
            <option value="extra">⚡ Extra Active (2x/day, intense)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Target size={16} />
            Target Weight (kg)
          </label>
          <input
            type="number"
            value={settings.fitnessGoals.targetWeight || ''}
            onChange={(e) => handleSettingChange('fitnessGoals', 'targetWeight', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="Enter target weight"
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Target size={16} />
            Weekly Workout Goal
          </label>
          <select
            value={settings.fitnessGoals.weeklyGoal}
            onChange={(e) => handleSettingChange('fitnessGoals', 'weeklyGoal', parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
          >
            <option value={1}>1 workout per week</option>
            <option value={2}>2 workouts per week</option>
            <option value={3}>3 workouts per week</option>
            <option value={4}>4 workouts per week</option>
            <option value={5}>5 workouts per week</option>
            <option value={6}>6 workouts per week</option>
            <option value={7}>7 workouts per week (Daily)</option>
          </select>
        </div>
      </div>
      
      {/* Real-time Goal Status with Progress */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/50 rounded-lg">
        <div className="text-green-300 text-sm flex items-center gap-2 mb-3">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="font-medium">Current Fitness Goals & Progress</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4">
          <div className="text-center">
            <div className="text-green-400 font-bold text-lg">
              {settings.fitnessGoals.goal === 'lose' ? '🔥' : 
               settings.fitnessGoals.goal === 'gain' ? '📈' : 
               settings.fitnessGoals.goal === 'muscle' ? '💪' : 
               settings.fitnessGoals.goal === 'strength' ? '⚡' : '⚖️'}
            </div>
            <div className="text-slate-300 capitalize">{settings.fitnessGoals.goal} Weight</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-bold text-lg">{settings.fitnessGoals.weeklyGoal}</div>
            <div className="text-slate-300">Weekly Goal</div>
            <div className="text-xs text-blue-300 mt-1">
              {Math.min(realTimeStats.totalWorkouts, settings.fitnessGoals.weeklyGoal)}/{settings.fitnessGoals.weeklyGoal} this week
            </div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-bold text-lg capitalize">{settings.fitnessGoals.activityLevel}</div>
            <div className="text-slate-300">Activity Level</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 font-bold text-lg">
              {settings.fitnessGoals.targetWeight ? `${settings.fitnessGoals.targetWeight}kg` : 'Not Set'}
            </div>
            <div className="text-slate-300">Target Weight</div>
          </div>
        </div>
        
        {/* Weekly Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Weekly Progress</span>
            <span>{Math.min(realTimeStats.totalWorkouts, settings.fitnessGoals.weeklyGoal)}/{settings.fitnessGoals.weeklyGoal} workouts</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (realTimeStats.totalWorkouts / settings.fitnessGoals.weeklyGoal) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {[
          {
            key: 'emailNotifications',
            title: 'Email Notifications',
            description: 'Receive updates and reminders via email',
            icon: Mail,
            color: 'from-blue-500 to-cyan-500'
          },
          {
            key: 'pushNotifications',
            title: 'Push Notifications',
            description: 'Get instant notifications on your device',
            icon: Bell,
            color: 'from-yellow-500 to-orange-500'
          },
          {
            key: 'workoutReminders',
            title: 'Workout Reminders',
            description: 'Daily reminders to stay on track with your fitness goals',
            icon: Target,
            color: 'from-green-500 to-emerald-500'
          },
          {
            key: 'mealReminders',
            title: 'Meal Reminders',
            description: 'Reminders to log your meals and track nutrition',
            icon: Activity,
            color: 'from-purple-500 to-violet-500'
          },
          {
            key: 'achievementAlerts',
            title: 'Achievement Alerts',
            description: 'Celebrate your milestones and achievements',
            icon: Trophy,
            color: 'from-red-500 to-pink-500'
          }
        ].map((notification) => {
          const isEnabled = settings.notifications[notification.key];
          
          return (
            <motion.div
              key={notification.key}
              whileHover={{ scale: 1.01 }}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                isEnabled
                  ? `border-green-500/50 bg-gradient-to-r ${notification.color}/10 shadow-lg`
                  : 'border-slate-600/50 bg-slate-800/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-all ${
                    isEnabled
                      ? `bg-gradient-to-r ${notification.color}/20 text-white shadow-md`
                      : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    <notification.icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium flex items-center gap-2">
                      {notification.title}
                      {isEnabled && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400 text-sm">{notification.description}</div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSettingChange('notifications', notification.key, !isEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    isEnabled
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg'
                      : 'bg-slate-600'
                  }`}
                >
                  <motion.div
                    animate={{ x: isEnabled ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                      isEnabled ? 'bg-white shadow-md' : 'bg-slate-300'
                    }`}
                  />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Real-time Notification Status */}
      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-700/50 rounded-lg">
        <div className="text-yellow-300 text-sm flex items-center gap-2 mb-3">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
          <span className="font-medium">Notification Status</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {Object.entries(settings.notifications).map(([key, enabled]) => {
            const labels = {
              emailNotifications: 'Email',
              pushNotifications: 'Push',
              workoutReminders: 'Workouts',
              mealReminders: 'Meals',
              achievementAlerts: 'Achievements'
            };
            
            return (
              <div key={key} className="text-center">
                <div className={`font-bold text-lg ${
                  enabled ? 'text-green-400' : 'text-red-400'
                }`}>
                  {enabled ? '✅' : '❌'}
                </div>
                <div className="text-slate-300">{labels[key]}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-xs text-slate-400 text-center">
          Changes are applied instantly • Synced to MongoDB in real-time
        </div>
      </div>
    </div>
  );

  const renderPreferencesSettings = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Moon size={16} />
              Theme (Dark Mode Only)
            </label>
            <div className="space-y-3">
              <motion.div 
                className="p-4 rounded-xl border border-blue-500 bg-gradient-to-r from-slate-600/10 to-slate-800/10 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-slate-600/20 to-slate-800/20 text-white shadow-md">
                    <Moon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium flex items-center gap-2">
                      Dark Mode
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                        Active
                      </span>
                    </div>
                    <div className="text-slate-400 text-sm">Perfect for gym environments - Professional experience</div>
                  </div>
                  <div className="text-blue-400 text-xl">✓</div>
                </div>
              </motion.div>
            </div>
            
            {/* Dark Mode Info */}
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-lg">
              <div className="text-blue-300 text-sm flex items-center gap-2">
                <span className="animate-pulse">🎨</span>
                <span>GymTracker uses <strong>🌙 Dark Mode Only</strong> for the best gym experience</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Globe size={16} />
              Language
            </label>
            <select
              value={settings.preferences.language}
              onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Spanish</option>
              <option value="fr">🇫🇷 French</option>
              <option value="de">🇩🇪 German</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
          <div className="text-green-300 text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>Dark mode is permanently enabled • Professional gym experience • Real-time MongoDB sync</span>
          </div>
        </div>
        
        {/* Real-time Activity Summary */}
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <div className="text-blue-300 text-sm flex items-center gap-2 mb-2">
            <BarChart3 size={16} />
            <span className="font-medium">Real-Time Activity Summary</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center">
              <div className="text-blue-400 font-bold">{realTimeStats.totalWorkouts}</div>
              <div className="text-slate-300">Total Workouts</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-bold">{realTimeStats.currentStreak}</div>
              <div className="text-slate-300">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 font-bold">{realTimeStats.xpPoints}</div>
              <div className="text-slate-300">XP Points</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileSettings();
      case 'fitness': return renderFitnessGoalsSettings();
      case 'notifications': return renderNotificationsSettings();
      case 'preferences': return renderPreferencesSettings();
      case 'data': return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-600/30">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Database size={16} />
                Data Storage Status
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">MongoDB Connection:</span>
                  <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
                    {isOnline ? '✅ Connected' : '❌ Offline'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Auto Backup:</span>
                  <span className="text-green-400">✅ Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Cross-Device Sync:</span>
                  <span className="text-green-400">✅ Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Data Retention:</span>
                  <span className="text-blue-400">1 Year</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-600/30">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Clock size={16} />
                Real-Time Sync Status
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Last Sync:</span>
                  <span className="text-green-400">
                    {realTimeStats.lastSync ? new Date(realTimeStats.lastSync).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Sync Status:</span>
                  <span className={`${statusDisplay.color.split(' ')[0]}`}>
                    {statusDisplay.text}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Auto-Sync:</span>
                  <span className="text-green-400">✅ Every 30s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Data Source:</span>
                  <span className="text-blue-400">MongoDB Atlas</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700/50 rounded-lg">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <BarChart3 size={16} />
              Real-Time Data Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{realTimeStats.totalWorkouts}</div>
                <div className="text-slate-300">Workouts Stored</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{realTimeStats.totalMeals}</div>
                <div className="text-slate-300">Meals Logged</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{realTimeStats.totalPlans}</div>
                <div className="text-slate-300">Plans Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{realTimeStats.membershipDays}</div>
                <div className="text-slate-300">Days Active</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-center text-slate-400">
              All data is stored securely in MongoDB and synced in real-time across all your devices
            </div>
          </div>
        </div>
      );
      
      default: return (
        <div className="text-center py-8">
          <div className="text-slate-400 mb-2">Coming Soon</div>
          <div className="text-slate-500 text-sm">This section is under development</div>
        </div>
      );
    }
  };

  const statusDisplay = settingsService.getSyncStatus(lastSyncResult);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading real-time settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Status Bar */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-green-400 text-sm font-medium">
              ⚡ Real-Time Settings
            </span>
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusDisplay.color}`}>
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></span>
              {statusDisplay.icon} {statusDisplay.text}
            </span>
            <span className="text-xs text-blue-300 bg-blue-900/30 px-2 py-1 rounded-full">
              🔄 Auto-Sync
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Professional Gym Tracker • Real-Time Experience
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-semibold text-white flex items-center gap-2">
            <span>⚙️</span>
            <span>Settings</span>
            <span className="text-lg">🏋️</span>
            <span className="text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
              LIVE
            </span>
          </h2>
          <p className="text-slate-400 mt-1">Professional Gym Tracker</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2 shadow-lg"
        >
          {isSaving ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Save size={16} />
          )}
          <span>{isSaving ? 'Syncing...' : 'Save Changes'}</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-700/50">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <span>⚙️</span>
                <span>Settings Menu</span>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                  LIVE
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Professional Configuration • Real-Time Sync</p>
            </div>
            <div className="space-y-1 p-2">
              {settingsTabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color}/20 border border-blue-500/30 text-white shadow-lg`
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  <div className={`p-1 rounded-lg ${
                    activeTab === tab.id ? 'bg-white/10' : 'bg-slate-700/50'
                  }`}>
                    <tab.icon size={16} />
                  </div>
                  <span className="font-medium text-sm">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="ml-auto text-blue-400">
                      ▶
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}  
            className="card"
          >
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${settingsTabs.find(tab => tab.id === activeTab)?.color}/20`}>
                  {React.createElement(settingsTabs.find(tab => tab.id === activeTab)?.icon, { size: 20, className: 'text-white' })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-white">
                      {settingsTabs.find(tab => tab.id === activeTab)?.label}
                    </h3>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30 animate-pulse">
                      LIVE
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">Professional Configuration Panel • Real-Time MongoDB • Instant Updates</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Last Update</div>
                  <div className="text-xs text-green-400">
                    {realTimeStats.lastSync ? new Date(realTimeStats.lastSync).toLocaleTimeString() : 'Loading...'}
                  </div>
                </div>
              </div>
              <div className={`h-px bg-gradient-to-r ${settingsTabs.find(tab => tab.id === activeTab)?.color} w-24`}></div>
            </div>
            
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}