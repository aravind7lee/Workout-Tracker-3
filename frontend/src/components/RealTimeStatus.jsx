// Real-time backend connection status component
import React, { useState, useEffect } from 'react';
import { realTimeService } from '../services/realTimeService';
import api from '../utils/api';

export default function RealTimeStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [lastSync, setLastSync] = useState(null);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    // Network status listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check backend connectivity
    const checkBackend = async () => {
      try {
        const response = await api.get('/health');
        setBackendStatus('connected');
        setLastSync(new Date());
      } catch (error) {
        setBackendStatus('disconnected');
      }
    };

    // Check pending sync items
    const checkPendingSync = () => {
      const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      
      const pending = [
        ...workouts.filter(w => w.synced === false),
        ...meals.filter(m => m.synced === false),
        ...plans.filter(p => p.synced === false)
      ].length;
      
      setPendingSync(pending);
    };

    checkBackend();
    checkPendingSync();

    // Set up periodic checks
    const backendInterval = setInterval(checkBackend, 60000); // Check every minute
    const syncInterval = setInterval(checkPendingSync, 10000); // Check every 10 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(backendInterval);
      clearInterval(syncInterval);
    };
  }, []);

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-400';
    if (backendStatus === 'connected') return 'text-green-400';
    if (backendStatus === 'disconnected') return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getStatusIcon = () => {
    if (!isOnline) return '🔴';
    if (backendStatus === 'connected') return '🟢';
    if (backendStatus === 'disconnected') return '🟡';
    return '';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (backendStatus === 'connected') return 'Live';
    if (backendStatus === 'disconnected') return 'Backend Offline';
    return '';
  };

  const handleForceSync = async () => {
    try {
      await realTimeService.syncAllData();
      setLastSync(new Date());
    } catch (error) {
      console.error('Force sync failed:', error);
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1">
        <span>{getStatusIcon()}</span>
        <span className={getStatusColor()}>{getStatusText()}</span>
      </div>
      
      {pendingSync > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-blue-400">⏳</span>
          <span className="text-blue-400">{pendingSync} pending</span>
        </div>
      )}
      
      {lastSync && (
        <div className="text-gray-500">
          • {lastSync.toLocaleTimeString()}
        </div>
      )}
      
      {backendStatus === 'connected' && (
        <button
          onClick={handleForceSync}
          className="text-blue-400 hover:text-blue-300 underline"
          title="Force sync now"
        >
          Sync
        </button>
      )}
    </div>
  );
}