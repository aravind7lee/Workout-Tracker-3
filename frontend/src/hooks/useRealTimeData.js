// Real-time data hook for all components
import { useState, useEffect, useCallback } from 'react';
import { realTimeService } from '../services/realTimeService.js';

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
          throw new Error(`Unknown data type: ${dataType}`);
      }
      
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dataType]);

  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time updates
    const unsubscribe = realTimeService.subscribe(dataType, (newData) => {
      setData(newData);
    });

    // Auto-refresh if enabled
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(fetchData, refreshInterval);
    }

    return () => {
      unsubscribe();
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