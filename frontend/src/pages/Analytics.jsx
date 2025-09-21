// frontend/src/pages/Analytics.jsx
import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useAnalytics } from '../hooks/useAnalytics';

Chart.register(...registerables);

export default function Analytics() {
  const {
    stats,
    caloriesData,
    frequencyData,
    muscleData,
    achievements,
    isLoading,
    error,
    refresh
  } = useAnalytics();

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
        ticks: {
          color: '#94a3b8',
          font: { size: 11 }
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#94a3b8',
          font: { size: 11 }
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e2e8f0',
          font: { size: 11 },
          padding: 15
        }
      }
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl lg:text-3xl font-semibold text-white">Progress & Analytics</h2>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white">Progress & Analytics</h2>
        <button
          onClick={refresh}
          className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          disabled={isLoading}
        >
          {isLoading ? '⟳' : '🔄'} Refresh
        </button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card">
              <div className="animate-pulse">
                <div className="h-8 bg-slate-700 rounded mb-2"></div>
                <div className="h-4 bg-slate-700 rounded mb-1"></div>
                <div className="h-3 bg-slate-700 rounded"></div>
              </div>
            </div>
          ))
        ) : stats ? (
          [
            { 
              label: 'Total Workouts', 
              value: stats.totalWorkouts.toString(), 
              change: stats.changes.workouts, 
              color: 'text-blue-400' 
            },
            { 
              label: 'Calories Burned', 
              value: stats.totalCalories, 
              change: stats.changes.calories, 
              color: 'text-green-400' 
            },
            { 
              label: 'Personal Records', 
              value: stats.personalRecords.toString(), 
              change: stats.changes.records, 
              color: 'text-purple-400' 
            },
            { 
              label: 'Streak Days', 
              value: stats.streak.toString(), 
              change: stats.changes.streak, 
              color: 'text-orange-400' 
            }
          ].map((stat, index) => (
            <div key={index} className="card">
              <div className="text-center">
                <div className={`text-2xl sm:text-3xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-green-400">
                  {stat.change}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full card text-center py-4">
            <div className="text-slate-400">No workout data available</div>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Calories Chart */}
        <div className="card">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Weekly Calories Burned</h3>
          <div className="h-48 sm:h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : caloriesData ? (
              <Line data={caloriesData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                No calorie data available
              </div>
            )}
          </div>
        </div>

        {/* Workout Frequency Chart */}
        <div className="card">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Monthly Workout Frequency</h3>
          <div className="h-48 sm:h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : frequencyData ? (
              <Bar data={frequencyData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                No frequency data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Muscle Group Distribution & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="card lg:col-span-1">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 text-center">Muscle Group Focus</h3>
          <div className="h-48 sm:h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : muscleData ? (
              <Doughnut data={muscleData} options={doughnutOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                No muscle data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="animate-pulse">
                    <div className="w-8 h-8 bg-slate-600 rounded"></div>
                  </div>
                  <div className="flex-1 animate-pulse">
                    <div className="h-4 bg-slate-600 rounded mb-1"></div>
                    <div className="h-3 bg-slate-600 rounded"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="w-16 h-3 bg-slate-600 rounded"></div>
                  </div>
                </div>
              ))
            ) : achievements.length > 0 ? (
              achievements.slice(0, 4).map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm sm:text-base">{achievement.title}</div>
                    <div className="text-xs sm:text-sm text-slate-400">{achievement.description}</div>
                  </div>
                  <div className="text-xs text-slate-500 flex-shrink-0">{achievement.timeAgo}</div>
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