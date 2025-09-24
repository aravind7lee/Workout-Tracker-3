// Real-time Sync Status Component
import React, { useState, useEffect } from 'react';
import { onlineService, planSyncService } from '../services/onlineService';
import { useAuth } from '../context/AuthContext';

export default function RealTimeSyncStatus() {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingChanges: 0,
    syncInProgress: false,
    error: null
  });

  useEffect(() => {
    // Initialize sync status
    updateSyncStatus();
    
    // Start real-time sync if user is logged in
    if (user) {
      planSyncService.startRealTimeSync();
    }

    // Listen for network changes
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true, error: null }));
      if (user) {
        performSync();
      }
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    // Listen for sync events
    const handleSyncComplete = (event) => {
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        syncInProgress: false,
        error: null,
        pendingChanges: 0
      }));
    };

    const handleSyncError = (event) => {
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: event.detail?.error || 'Sync failed'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offlineDataSynced', handleSyncComplete);
    window.addEventListener('syncError', handleSyncError);

    // Check for pending changes periodically
    const pendingInterval = setInterval(updatePendingChanges, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offlineDataSynced', handleSyncComplete);
      window.removeEventListener('syncError', handleSyncError);
      clearInterval(pendingInterval);
      
      if (user) {
        planSyncService.stopRealTimeSync();
      }
    };
  }, [user]);

  const updateSyncStatus = () => {
    const lastSyncStr = localStorage.getItem('lastSyncTime');
    const lastSync = lastSyncStr ? new Date(lastSyncStr) : null;
    
    setSyncStatus(prev => ({
      ...prev,
      lastSync,
      isOnline: navigator.onLine
    }));
  };

  const updatePendingChanges = () => {
    const localPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
    const pendingDeletes = JSON.parse(localStorage.getItem('pendingPlanDeletes') || '[]');
    const offlineData = JSON.parse(localStorage.getItem('gymTracker_offlineData') || '{}');
    
    const unsyncedPlans = localPlans.filter(p => !p.synced && !p.backendId).length;
    const pendingDeletesCount = pendingDeletes.length;
    const offlineWorkouts = offlineData.workouts?.length || 0;
    const offlineMeals = offlineData.meals?.length || 0;
    
    const totalPending = unsyncedPlans + pendingDeletesCount + offlineWorkouts + offlineMeals;
    
    setSyncStatus(prev => ({ ...prev, pendingChanges: totalPending }));
  };

  const performSync = async () => {
    if (!user || !syncStatus.isOnline || syncStatus.syncInProgress) return;
    
    setSyncStatus(prev => ({ ...prev, syncInProgress: true, error: null }));
    
    try {
      const result = await planSyncService.forceSync();
      
      if (result.success) {
        localStorage.setItem('lastSyncTime', new Date().toISOString());
        setSyncStatus(prev => ({
          ...prev,
          lastSync: new Date(),
          syncInProgress: false,
          error: null,
          pendingChanges: 0
        }));
      } else {
        setSyncStatus(prev => ({
          ...prev,
          syncInProgress: false,
          error: result.error || 'Sync failed'
        }));
      }
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: error.message
      }));
    }
  };

  const formatLastSync = (date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getSyncStatusColor = () => {
    if (!syncStatus.isOnline) return 'text-red-400';
    if (syncStatus.syncInProgress) return 'text-blue-400';
    if (syncStatus.error) return 'text-red-400';
    if (syncStatus.pendingChanges > 0) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getSyncStatusIcon = () => {
    if (!syncStatus.isOnline) return '📱';
    if (syncStatus.syncInProgress) return '🔄';
    if (syncStatus.error) return '⚠️';
    if (syncStatus.pendingChanges > 0) return '⏳';
    return '✅';
  };

  const getSyncStatusText = () => {
    if (!syncStatus.isOnline) return 'Offline Mode';
    if (syncStatus.syncInProgress) return 'Syncing...';
    if (syncStatus.error) return 'Sync Error';
    if (syncStatus.pendingChanges > 0) return `${syncStatus.pendingChanges} Pending`;
    return 'All Synced';
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>🔒</span>
        <span>Login to enable real-time sync</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Status Indicator */}
      <div className="flex items-center gap-1">
        <span className={getSyncStatusColor()}>{getSyncStatusIcon()}</span>
        <span className={getSyncStatusColor()}>{getSyncStatusText()}</span>
      </div>

      {/* Last Sync Time */}
      {syncStatus.lastSync && (
        <span className="text-slate-500">
          • {formatLastSync(syncStatus.lastSync)}
        </span>
      )}

      {/* Manual Sync Button */}
      {syncStatus.isOnline && !syncStatus.syncInProgress && (
        <button
          onClick={performSync}
          className="text-blue-400 hover:text-blue-300 transition-colors"
          title="Force sync now"
        >
          🔄
        </button>
      )}

      {/* Error Details */}
      {syncStatus.error && (
        <div className="text-red-400" title={syncStatus.error}>
          ⚠️
        </div>
      )}

      {/* Sync Progress Indicator */}
      {syncStatus.syncInProgress && (
        <div className="animate-spin w-3 h-3 border border-blue-400 border-t-transparent rounded-full"></div>
      )}
    </div>
  );
}