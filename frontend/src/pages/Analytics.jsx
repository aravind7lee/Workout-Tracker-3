// frontend/src/pages/Analytics.jsx - Real-time MongoDB Backend Integration
import React, { useState, useEffect, useCallback } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { onlineService } from '../services/onlineService';
import { useAuth } from '../context/AuthContext';

Chart.register(...registerables);

export default function Analytics() {
  const { isAuthenticated } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  
  const loadAnalyticsData = useCallback(async () => {
    if (!isAuthenticated()) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if backend is online
      const online = await onlineService.checkBackendStatus();
      setIsOnline(online);
      
      if (online) {
        // Load real-time data from MongoDB backend
        const [analytics, workouts, plans] = await Promise.all([
          onlineService.getAnalytics(),
          onlineService.getWorkoutHistory(),
          onlineService.getWorkoutPlans()
        ]);
        
        if (analytics) {
          setRealTimeStats({
            totalWorkouts: analytics.totalWorkouts || 0,
            totalPlans: plans?.length || 0,
            totalMeals: analytics.totalMeals || 0,
            currentStreak: analytics.currentStreak || 0,
            xpPoints: analytics.xpPoints || 0
          });
          
          // Set chart data from backend
          setAnalyticsData({
            stats: analytics,
            caloriesTrend: generateChartData(analytics.caloriesTrend, 'Calories'),
            workoutFrequency: generateChartData(analytics.workoutFrequency, 'Workouts'),
            muscleDistribution: generateDoughnutData(analytics.muscleGroups),
            achievements: analytics.achievements || []
          });
        }
      } else {
        // Fallback to localStorage data
        loadOfflineData();
      }
    } catch (err) {
      console.error('Analytics loading error:', err);
      setError(err.message);
      loadOfflineData();
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);
  
  const loadOfflineData = () => {
    try {
      const workouts = JSON.parse(localStorage.getItem('recentWorkouts') || '[]');
      const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      
      setRealTimeStats({
        totalWorkouts: workouts.length,
        totalPlans: plans.length,
        totalMeals: meals.length,
        currentStreak: 0,
        xpPoints: workouts.length * 100 + plans.length * 50
      });
      
      setAnalyticsData({
        stats: null,
        caloriesTrend: null,
        workoutFrequency: null,
        muscleDistribution: null,
        achievements: []
      });
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };
  
  const generateChartData = (data, label) => {
    if (!data || !Array.isArray(data)) return null;
    
    return {
      labels: data.map(item => item.date || item.day || 'Day'),
      datasets: [{
        label,
        data: data.map(item => item.value || item.count || 0),
        borderColor: label === 'Calories' ? '#3b82f6' : '#10b981',
        backgroundColor: label === 'Calories' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }]
    };
  };
  
  const generateDoughnutData = (muscleGroups) => {
    if (!muscleGroups || !Array.isArray(muscleGroups)) return null;
    
    return {
      labels: muscleGroups.map(group => group.name || 'Unknown'),
      datasets: [{
        data: muscleGroups.map(group => group.count || 0),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
        borderWidth: 0
      }]
    };
  };
  
  useEffect(() => {
    loadAnalyticsData();
    
    // Set up real-time refresh every 30 seconds
    const interval = setInterval(() => {
      if (isAuthenticated()) {
        loadAnalyticsData();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadAnalyticsData]);
  
  const refresh = () => {
    loadAnalyticsData();
  };

  const stats = analyticsData?.stats;
  const caloriesData = analyticsData?.caloriesTrend;
  const frequencyData = analyticsData?.workoutFrequency;
  const muscleData = analyticsData?.muscleDistribution;
  const achievements = analyticsData?.achievements;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e2e8f0',
          font: { size: 12 }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { color: 'rgba(148, 163, 184, 0.1)' }
      },
      y: {
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { color: 'rgba(148, 163, 184, 0.1)' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#e2e8f0', font: { size: 11 }, padding: 15 }
      }
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl lg:text-3xl font-semibold text-white">Progress & Analytics</h2>
          <button onClick={refresh} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Retry
          </button>
        </div>
        <div className="card text-center py-8">
          <div className="text-red-400 mb-2">⚠️ Failed to load analytics</div>
          <div className="text-slate-400 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white">Progress & Analytics</h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time insights from MongoDB backend
            <span className={`ml-2 text-xs ${isOnline ? 'text-green-400' : 'text-yellow-400'}`}>
              • {isOnline ? 'Online Mode - Live Data' : 'Offline Mode - Local Data'}
            </span>
          </p>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          disabled={isLoading}
        >
          <span className={isLoading ? 'animate-spin' : ''}>{isLoading ? '⟳' : '🔄'}</span>
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card">
              <div className="animate-pulse">
                <div className="h-8 bg-slate-700 rounded mb-2"></div>
                <div className="h-4 bg-slate-700 rounded mb-1"></div>
                <div className="h-3 bg-slate-700 rounded"></div>
              </div>
            </div>
          ))
        ) : realTimeStats ? (
          [
            { label: 'Total Workouts', value: (realTimeStats.totalWorkouts || 0).toString(), change: realTimeStats.totalWorkouts > 0 ? 'Great progress!' : 'Start your first workout', color: 'text-blue-400' },
            { label: 'Workout Plans', value: (realTimeStats.totalPlans || 0).toString(), change: realTimeStats.totalPlans > 0 ? `${realTimeStats.totalPlans} plans created` : 'Create your first plan', color: 'text-green-400' },
            { label: 'XP Points', value: (realTimeStats.xpPoints || 0).toString(), change: realTimeStats.xpPoints > 0 ? `Level ${Math.floor(realTimeStats.xpPoints / 500) + 1}` : 'Earn XP by working out', color: 'text-purple-400' },
            { label: 'Current Streak', value: (realTimeStats.currentStreak || 0).toString(), change: realTimeStats.currentStreak > 0 ? `${realTimeStats.currentStreak} days strong!` : 'Start your streak', color: 'text-orange-400' }
          ].map((stat, index) => (
            <div key={index} className="card">
              <div className="text-center">
                <div className={`text-2xl sm:text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-xs sm:text-sm text-slate-400 mb-1">{stat.label}</div>
                <div className="text-xs text-green-400">{stat.change}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full card text-center py-8">
            <div className="text-4xl mb-3">📊</div>
            <div className="text-white font-medium mb-2">No Data Yet</div>
            <div className="text-slate-400 text-sm mb-4">Start working out to see your analytics</div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button 
                onClick={() => window.location.href = '/library'}
                className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                Browse Exercises
              </button>
              <button 
                onClick={() => window.location.href = '/plans'}
                className="btn bg-green-600 hover:bg-green-700 text-white text-sm"
              >
                Create Plan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Weekly Calories</h3>
          <div className="h-48 sm:h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : caloriesData ? (
              <Line data={caloriesData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">No data available</div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Weekly Workouts</h3>
          <div className="h-48 sm:h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : frequencyData ? (
              <Bar data={frequencyData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Muscle Groups & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="card lg:col-span-1">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 text-center">Muscle Groups</h3>
          <div className="h-48 sm:h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : muscleData ? (
              <Doughnut data={muscleData} options={doughnutOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">No data available</div>
            )}
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Achievements</h3>
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="animate-pulse">
                    <div className="w-8 h-8 bg-slate-600 rounded"></div>
                  </div>
                  <div className="flex-1 animate-pulse">
                    <div className="h-4 bg-slate-600 rounded mb-1"></div>
                    <div className="h-3 bg-slate-600 rounded"></div>
                  </div>
                </div>
              ))
            ) : achievements && achievements.length > 0 ? (
              achievements.slice(0, 4).map((achievement, index) => (
                <div key={achievement.id || index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-2xl">{achievement.icon || '🏆'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm sm:text-base">{achievement.title || 'Achievement'}</div>
                    <div className="text-xs sm:text-sm text-slate-400">{achievement.description || 'Great job!'}</div>
                  </div>
                  <div className="text-xs text-slate-500 flex-shrink-0">{achievement.timeAgo || 'Recently'}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🏆</div>
                <p className="text-slate-400 mb-2">No achievements yet</p>
                <p className="text-sm text-slate-500">Complete workouts to earn achievements!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}