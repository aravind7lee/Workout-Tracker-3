// frontend/src/hooks/useAnalytics.js
import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export function useAnalytics() {
  const [stats, setStats] = useState(null);
  const [caloriesData, setCaloriesData] = useState(null);
  const [frequencyData, setFrequencyData] = useState(null);
  const [muscleData, setMuscleData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all analytics data in parallel
      const [statsRes, caloriesRes, frequencyRes, muscleRes, achievementsRes] = await Promise.all([
        api.get('/analytics/stats'),
        api.get('/analytics/calories'),
        api.get('/analytics/frequency'),
        api.get('/analytics/muscles'),
        api.get('/analytics/achievements')
      ]);

      // Set stats
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // Set calories chart data
      if (caloriesRes.data.success) {
        const { labels, calories } = caloriesRes.data.data;
        setCaloriesData({
          labels,
          datasets: [{
            label: 'Calories Burned',
            data: calories,
            tension: 0.3,
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: '#3b82f6',
            pointRadius: 4,
            pointBackgroundColor: '#3b82f6'
          }]
        });
      }

      // Set frequency chart data
      if (frequencyRes.data.success) {
        const { labels, frequency } = frequencyRes.data.data;
        setFrequencyData({
          labels,
          datasets: [{
            label: 'Workouts per Week',
            data: frequency,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: '#10b981',
            borderWidth: 2
          }]
        });
      }

      // Set muscle distribution data
      if (muscleRes.data.success) {
        const { labels, distribution } = muscleRes.data.data;
        setMuscleData({
          labels,
          datasets: [{
            data: distribution,
            backgroundColor: [
              '#ef4444', // Red
              '#f97316', // Orange
              '#eab308', // Yellow
              '#22c55e', // Green
              '#3b82f6', // Blue
              '#8b5cf6'  // Purple
            ],
            borderWidth: 2,
            borderColor: '#1e293b'
          }]
        });
      }

      // Set achievements
      if (achievementsRes.data.success) {
        setAchievements(achievementsRes.data.data);
      }

    } catch (err) {
      console.error('Analytics loading error:', err);
      setError(err.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now - past) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks === 1) return '1 week ago';
    if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths === 1) return '1 month ago';
    if (diffInMonths < 12) return `${diffInMonths} months ago`;
    
    return past.toLocaleDateString();
  };

  return {
    stats,
    caloriesData,
    frequencyData,
    muscleData,
    achievements: achievements.map(achievement => ({
      ...achievement,
      timeAgo: formatTimeAgo(achievement.date)
    })),
    isLoading,
    error,
    refresh: loadAnalytics
  };
}