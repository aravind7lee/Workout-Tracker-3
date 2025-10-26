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
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('ready');
  const [lastSyncResult, setLastSyncResult] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState({
    totalWorkouts: 0,
    totalMeals: 0,
    totalPlans: 0,
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
      mealReminders: user?.notifications?.mealReminders ?? false
    },
    privacy: {
      profileVisibility: user?.privacy?.profileVisibility || 'public',
      dataSharing: user?.privacy?.dataSharing || false,
      analyticsOptOut: user?.privacy?.analyticsOptOut || false
    },
    preferences: {
      theme: 'dark',
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

  const autoSave = useCallback(
    settingsService.setupAutoSave((result) => {
      setLastSyncResult(result);
      setSyncStatus(result.status || 'error');
    }),
    []
  );

  const loadRealTimeData = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
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

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setSyncStatus('loading');
        console.log('🚀 FORCE LOAD FROM MONGODB - Global Sync Priority');
        
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

    const handleOnline = () => {
      chromeErrorHandler.safeExecute(() => {
        console.log('🌐 Network back online - FORCE MongoDB reconnection');
        setIsOnline(true);
        setSyncStatus('syncing');
        setTimeout(() => {
          loadSettings();
        }, 2000);
        setTimeout(() => {
          loadRealTimeData();
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
    
    const handleWorkoutCompleted = () => {
      console.log('🏋️ Workout completed - refreshing real-time data');
      setTimeout(() => loadRealTimeData(), 1000);
    };
    
    const handleMealAdded = () => {
      console.log('🍽️ Meal added - refreshing real-time data');
      setTimeout(() => loadRealTimeData(), 1000);
    };
    
    const handlePlanCreated = () => {
      console.log('📋 Plan created - refreshing real-time data');
      setTimeout(() => loadRealTimeData(), 1000);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    window.addEventListener('mealAdded', handleMealAdded);
    window.addEventListener('planCreated', handlePlanCreated);
    
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
      
      if (settings.profile.name !== user?.name || settings.profile.email !== user?.email) {
        updateUser({
          ...user,
          name: settings.profile.name,
          email: settings.profile.email
        });
      }

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
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
      
      <div className="p-4 sm:p-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/50 rounded-xl sm:rounded-2xl">
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
    <div className="space-y-4 sm:space-y-6">
      <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-xl sm:rounded-2xl border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          <h3 className="text-lg sm:text-xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            🔔 NOTIFICATION CENTER
          </h3>
          <div className="px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
            REAL-TIME
          </div>
        </div>
        <p className="text-slate-300 text-sm sm:text-base">Professional gym notifications • Instant MongoDB sync • Cross-device alerts</p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {[
          {
            key: 'emailNotifications',
            title: 'Email Notifications',
            description: 'Receive workout updates and progress reports via email',
            icon: Mail,
            color: 'from-blue-500 to-cyan-500',
            emoji: '📧'
          },
          {
            key: 'pushNotifications',
            title: 'Push Notifications',
            description: 'Get instant workout alerts and reminders on your device',
            icon: Bell,
            color: 'from-yellow-500 to-orange-500',
            emoji: '🔔'
          },
          {
            key: 'workoutReminders',
            title: 'Workout Reminders',
            description: 'Daily gym reminders to stay consistent with your fitness goals',
            icon: Target,
            color: 'from-green-500 to-emerald-500',
            emoji: '🏋️'
          },
          {
            key: 'mealReminders',
            title: 'Nutrition Reminders',
            description: 'Smart reminders to log meals and track your nutrition intake',
            icon: Activity,
            color: 'from-purple-500 to-violet-500',
            emoji: '🍎'
          }
        ].map((notification) => {
          const isEnabled = settings.notifications[notification.key];
          
          return (
            <motion.div
              key={notification.key}
              whileHover={{ scale: 1.02 }}
              className={`relative overflow-hidden rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                isEnabled
                  ? `border-green-500/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 shadow-xl shadow-green-500/10`
                  : 'border-slate-600/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40'
              }`}
            >
              <div className="absolute inset-0 opacity-5">
                <div className={`w-full h-full bg-gradient-to-r ${notification.color}`}></div>
              </div>
              
              <div className="relative z-10 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className={`p-2 sm:p-3 rounded-xl transition-all flex-shrink-0 ${
                      isEnabled
                        ? `bg-gradient-to-r ${notification.color}/20 text-white shadow-lg border border-white/10`
                        : 'bg-slate-700/50 text-slate-400'
                    }`}>
                      <div className="text-xl sm:text-2xl">{notification.emoji}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h4 className="text-white font-bold text-sm sm:text-base">{notification.title}</h4>
                        {isEnabled && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30 w-fit">
                            ✅ ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{notification.description}</p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSettingChange('notifications', notification.key, !isEnabled)}
                    className={`relative w-14 h-7 sm:w-16 sm:h-8 rounded-full transition-all duration-300 flex-shrink-0 ${
                      isEnabled
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/25'
                        : 'bg-slate-600'
                    }`}
                  >
                    <motion.div
                      animate={{ x: isEnabled ? (window.innerWidth >= 640 ? 32 : 28) : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`absolute top-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-all ${
                        isEnabled ? 'bg-white shadow-md' : 'bg-slate-300'
                      }`}
                    />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl sm:rounded-2xl border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          <h3 className="text-lg sm:text-xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            📊 NOTIFICATION STATUS
          </h3>
          <div className="px-2 sm:px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full border border-blue-500/30">
            LIVE SYNC
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {Object.entries(settings.notifications).map(([key, enabled]) => {
            const labels = {
              emailNotifications: { name: 'Email', emoji: '📧' },
              pushNotifications: { name: 'Push', emoji: '🔔' },
              workoutReminders: { name: 'Workouts', emoji: '🏋️' },
              mealReminders: { name: 'Nutrition', emoji: '🍎' }
            };
            
            return (
              <motion.div 
                key={key} 
                className={`text-center p-3 sm:p-4 rounded-xl border transition-all ${
                  enabled 
                    ? 'bg-green-500/10 border-green-500/30 shadow-lg' 
                    : 'bg-slate-800/30 border-slate-600/30'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{labels[key]?.emoji}</div>
                <div className={`font-bold text-lg sm:text-xl mb-1 ${
                  enabled ? 'text-green-400' : 'text-red-400'
                }`}>
                  {enabled ? '✅' : '❌'}
                </div>
                <div className="text-slate-300 text-xs sm:text-sm font-medium">{labels[key]?.name}</div>
              </motion.div>
            );
          })}
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full border border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs sm:text-sm font-bold">Changes applied instantly • MongoDB real-time sync</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSettings = () => {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
              <div className="text-green-400 font-bold">{realTimeStats.totalMeals}</div>
              <div className="text-slate-300">Total Meals</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 font-bold">{realTimeStats.totalPlans}</div>
              <div className="text-slate-300">Total Plans</div>
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
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
    <div className="space-y-4 sm:space-y-6">
      {/* Enhanced Hero Header */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 via-transparent to-cyan-900/10"></div>
        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-3xl sm:text-4xl">⚙️</div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  💪 GYM SETTINGS
                </h1>
                <p className="text-slate-300 text-sm sm:text-base">Professional Configuration • Real-Time MongoDB Sync</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold ${statusDisplay.color}`}>
                <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                {statusDisplay.icon} {statusDisplay.text}
              </div>
              <div className="px-3 py-2 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full border border-blue-500/30">
                🔄 AUTO-SYNC
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button Section */}
      <div className="flex justify-center sm:justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-full shadow-xl shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 text-sm sm:text-base"
        >
          {isSaving ? (
            <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Save size={18} />
          )}
          <span>{isSaving ? '🔄 SYNCING TO MONGODB...' : '💾 SAVE TO CLOUD'}</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-xl sm:text-2xl">🎛️</div>
                <h3 className="font-black text-white text-sm sm:text-base" style={{ fontFamily: 'var(--font-heading)' }}>
                  CONTROL PANEL
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                  LIVE
                </div>
                <div className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full border border-blue-500/30">
                  MONGODB
                </div>
              </div>
            </div>
            <div className="space-y-1 sm:space-y-2 p-3 sm:p-4">
              {settingsTabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-4 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color}/20 border border-white/20 text-white shadow-lg backdrop-blur-sm`
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all ${
                    activeTab === tab.id ? 'bg-white/10 shadow-md' : 'bg-slate-700/50'
                  }`}>
                    <tab.icon size={16} />
                  </div>
                  <span className="font-bold text-xs sm:text-sm flex-1 text-left">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="text-white text-lg">▶</div>
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
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl"
          >
            <div className="absolute inset-0 opacity-5">
              <div className={`w-full h-full bg-gradient-to-r ${settingsTabs.find(tab => tab.id === activeTab)?.color}`}></div>
            </div>
            
            <div className="relative z-10 p-4 sm:p-6 lg:p-8">
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`p-3 sm:p-4 rounded-xl bg-gradient-to-r ${settingsTabs.find(tab => tab.id === activeTab)?.color}/20 border border-white/10 shadow-lg`}>
                      {React.createElement(settingsTabs.find(tab => tab.id === activeTab)?.icon, { size: 24, className: 'text-white' })}
                    </div>
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                          {settingsTabs.find(tab => tab.id === activeTab)?.label}
                        </h3>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30 animate-pulse w-fit">
                          🔥 LIVE
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">Professional Configuration • Real-Time MongoDB • Cross-Device Sync</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Last Sync</div>
                    <div className="text-xs sm:text-sm text-green-400 font-bold">
                      {realTimeStats.lastSync ? new Date(realTimeStats.lastSync).toLocaleTimeString() : 'Loading...'}
                    </div>
                  </div>
                </div>
                <div className={`h-1 bg-gradient-to-r ${settingsTabs.find(tab => tab.id === activeTab)?.color} rounded-full w-16 sm:w-24`}></div>
              </div>
              
              {renderTabContent()}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}