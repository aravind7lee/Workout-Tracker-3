// Real-Time Dashboard Component
import React, { useState, useEffect, useRef } from 'react';
import { onlineService } from '../services/onlineService';
import { realTimePlanService } from '../services/realTimePlanService';

export default function RealTimeDashboard({ className = '' }) {
  const [stats, setStats] = useState({
    totalPlans: 0,
    totalWorkouts: 0,
    syncedPlans: 0,
    unsyncedPlans: 0,
    syncPercentage: 100,
    lastSync: null,
    isRealTime: false
  });
  
  const [syncStatus, setSyncStatus] = useState('idle');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState(null);
  const updateInterval = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    loadInitialStats();
    setupRealTimeListeners();
    startRealTimeUpdates();

    return () => {
      cleanupListeners();
      if (updateInterval.current) clearInterval(updateInterval.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const loadInitialStats = async () => {
    try {
      const analytics = await realTimePlanService.getRealTimeAnalytics();
      if (analytics) {
        setStats(prev => ({
          ...prev,
          totalPlans: analytics.totalPlans || 0,
          totalWorkouts: analytics.totalWorkouts || 0,
          syncedPlans: analytics.sync?.syncedPlans || analytics.syncedPlans || 0,
          unsyncedPlans: analytics.sync?.unsyncedPlans || analytics.unsyncedPlans || 0,
          syncPercentage: analytics.sync?.syncPercentage || 100,
          lastSync: analytics.lastSync || analytics.sync?.lastSync,
          isRealTime: analytics.isRealTime !== false
        }));
        setLastUpdate(new Date().toISOString());
      }
    } catch (error) {
      console.error('Failed to load initial stats:', error);
      setStats({
        totalPlans: 0,
        totalWorkouts: 0,
        syncedPlans: 0,
        unsyncedPlans: 0,
        syncPercentage: 100,
        lastSync: null,
        isRealTime: false
      });
    }
  };

  const setupRealTimeListeners = () => {
    // Listen for real-time plan service events
    realTimePlanService.addEventListener('syncStatus', handleSyncStatus);
    realTimePlanService.addEventListener('analyticsUpdated', handleAnalyticsUpdate);
    realTimePlanService.addEventListener('planSynced', handlePlanSynced);

    // Listen for window events
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    window.addEventListener('planCreated', handlePlanEvent);
    window.addEventListener('planUpdated', handlePlanEvent);
    window.addEventListener('planDeleted', handlePlanEvent);
  };

  const cleanupListeners = () => {
    realTimePlanService.removeEventListener('syncStatus', handleSyncStatus);
    realTimePlanService.removeEventListener('analyticsUpdated', handleAnalyticsUpdate);
    realTimePlanService.removeEventListener('planSynced', handlePlanSynced);

    window.removeEventListener('online', handleOnlineStatus);
    window.removeEventListener('offline', handleOfflineStatus);
    window.removeEventListener('planCreated', handlePlanEvent);
    window.removeEventListener('planUpdated', handlePlanEvent);
    window.removeEventListener('planDeleted', handlePlanEvent);
  };

  const startRealTimeUpdates = () => {
    updateInterval.current = setInterval(async () => {
      if (isOnline) {
        try {
          const analytics = await realTimePlanService.getRealTimeAnalytics();
          if (analytics && !analytics.error) {
            setStats(prev => ({
              ...prev,
              totalPlans: analytics.totalPlans || prev.totalPlans,
              totalWorkouts: analytics.totalWorkouts || prev.totalWorkouts,
              syncedPlans: analytics.sync?.syncedPlans || analytics.syncedPlans || prev.syncedPlans,
              unsyncedPlans: analytics.sync?.unsyncedPlans || analytics.unsyncedPlans || prev.unsyncedPlans,
              syncPercentage: analytics.sync?.syncPercentage || prev.syncPercentage,
              lastSync: analytics.lastSync || analytics.sync?.lastSync || prev.lastSync,
              isRealTime: analytics.isRealTime !== false
            }));
            setLastUpdate(new Date().toISOString());
          }
        } catch (error) {
          console.error('Real-time update failed:', error);
        }
      }
    }, 30000); // Update every 30 seconds to reduce load
  };

  const handleSyncStatus = (statusData) => {
    setSyncStatus(statusData.status);
    
    if (statusData.status === 'synced') {
      // Trigger a smooth animation update
      animationRef.current = requestAnimationFrame(() => {
        loadInitialStats();
      });
    }
  };

  const handleAnalyticsUpdate = (analyticsData) => {
    setStats(prev => ({
      ...prev,
      ...analyticsData,
      isRealTime: true
    }));
    setLastUpdate(new Date().toISOString());
  };

  const handlePlanSynced = (syncData) => {
    setStats(prev => ({
      ...prev,
      syncedPlans: prev.syncedPlans + 1,
      unsyncedPlans: Math.max(0, prev.unsyncedPlans - 1),
      syncPercentage: prev.totalPlans ? Math.round(((prev.syncedPlans + 1) / prev.totalPlans) * 100) : 100
    }));
  };

  const handleOnlineStatus = () => {
    setIsOnline(true);
    setSyncStatus('syncing');
  };

  const handleOfflineStatus = () => {
    setIsOnline(false);
    setSyncStatus('offline');
  };

  const handlePlanEvent = (event) => {
    // Refresh stats when plans are created/updated/deleted
    setTimeout(() => loadInitialStats(), 1000);
  };

  const getSyncStatusDisplay = () => {
    switch (syncStatus) {
      case 'synced':
        return { icon: '✅', text: 'Synced', color: 'text-green-400', bgColor: 'bg-green-900/30', borderColor: 'border-green-700' };
      case 'syncing':
        return { icon: '🔄', text: 'Syncing...', color: 'text-blue-400', bgColor: 'bg-blue-900/30', borderColor: 'border-blue-700' };
      case 'offline':
        return { icon: '📱', text: 'Offline', color: 'text-orange-400', bgColor: 'bg-orange-900/30', borderColor: 'border-orange-700' };
      case 'error':
        return { icon: '❌', text: 'Error', color: 'text-red-400', bgColor: 'bg-red-900/30', borderColor: 'border-red-700' };
      default:
        return { icon: '⚡', text: 'Ready', color: 'text-slate-400', bgColor: 'bg-slate-800/30', borderColor: 'border-slate-700' };
    }
  };

  const statusDisplay = getSyncStatusDisplay();
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className={`bg-slate-800/60 border border-slate-700 rounded-lg p-3 sm:p-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl">📊</span>
          <h3 className="text-base sm:text-lg font-semibold text-white">Real-Time Stats</h3>
          {stats.isRealTime && (
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          )}
        </div>
        
        <div className={`flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs ${statusDisplay.bgColor} ${statusDisplay.borderColor} border self-start sm:self-auto`}>
          <span className={statusDisplay.color}>{statusDisplay.icon}</span>
          <span className={`${statusDisplay.color} hidden sm:inline`}>{statusDisplay.text}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4">
        {/* Total Plans */}
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-2 sm:p-3">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <span className="text-blue-400 text-sm sm:text-base">📋</span>
            <span className="text-xs text-blue-300">Plans</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white">{stats.totalPlans}</div>
        </div>

        {/* Total Workouts */}
        <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-2 sm:p-3">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <span className="text-green-400 text-sm sm:text-base">🏋️</span>
            <span className="text-xs text-green-300">Workouts</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white">{stats.totalWorkouts}</div>
        </div>

        {/* Sync Status */}
        <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-2 sm:p-3">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <span className="text-purple-400 text-sm sm:text-base">☁️</span>
            <span className="text-xs text-purple-300">Synced</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white">
            {stats.syncedPlans}/{stats.totalPlans}
          </div>
        </div>

        {/* Sync Percentage */}
        <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-2 sm:p-3">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <span className="text-orange-400 text-sm sm:text-base">📈</span>
            <span className="text-xs text-orange-300">Sync %</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white">{stats.syncPercentage}%</div>
        </div>
      </div>

      {/* Sync Progress Bar */}
      {stats.totalPlans > 0 && (
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs text-slate-400 mb-2">
            <span>Sync Progress</span>
            <span>{stats.syncedPlans} of {stats.totalPlans} synced</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.syncPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Network Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          {stats.lastSync && (
            <span>Last sync: {formatTime(stats.lastSync)}</span>
          )}
          {lastUpdate && (
            <span>Updated: {formatTime(lastUpdate)}</span>
          )}
        </div>
      </div>

      {/* Unsync Warning */}
      {stats.unsyncedPlans > 0 && (
        <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-700 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-yellow-300 text-xs">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{stats.unsyncedPlans} plan{stats.unsyncedPlans > 1 ? 's' : ''} pending sync</span>
            </div>
            <button 
              onClick={() => realTimePlanService.forceSync()}
              className="self-start sm:ml-auto px-2 py-1 bg-yellow-800/30 hover:bg-yellow-700/30 rounded text-xs transition-colors"
            >
              Sync Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}