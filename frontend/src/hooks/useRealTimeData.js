// Real-time data hook for all components - FIXED VERSION
import { useState, useEffect, useCallback } from 'react';
import { realTimeService } from '../services/realTimeService';

export function useRealTimeData(dataType, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { autoRefresh = true, refreshInterval = 30000 } = options;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      switch (dataType) {
        case 'dashboard':
          result = await realTimeService.getDashboardData();
          break;
        case 'workouts':
          result = await realTimeService.getWorkouts();
          break;
        case 'exercises':
          result = await realTimeService.getExercises();
          break;
        case 'nutrition':
          result = await realTimeService.getNutritionData();
          break;
        case 'analytics':
          result = await realTimeService.getAnalytics();
          break;
        default:
          result = null;
      }
      
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching ${dataType}:`, err);
    } finally {
      setLoading(false);
    }
  }, [dataType]);

  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time updates if service supports it
    let unsubscribe = () => {};
    try {
      if (realTimeService.subscribe) {
        unsubscribe = realTimeService.subscribe(dataType, (newData) => {
          if (newData) {
            setData(newData);
          }
        });
      }
    } catch (error) {
      console.error('Error subscribing to real-time updates:', error);
    }

    // Auto-refresh if enabled
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(fetchData, refreshInterval);
    }

    return () => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchData, autoRefresh, refreshInterval, dataType]);

  return {
    data,
    loading,
    error,
    refresh: fetchData
  };
}

// Specialized hooks for different data types
export function useRealTimeDashboard() {
  return useRealTimeData('dashboard');
}

export function useRealTimeWorkouts() {
  return useRealTimeData('workouts');
}

export function useRealTimeExercises() {
  return useRealTimeData('exercises');
}

export function useRealTimeNutrition() {
  return useRealTimeData('nutrition');
}

export function useRealTimeAnalytics() {
  return useRealTimeData('analytics');
}