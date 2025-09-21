// Simple Dashboard for demo mode
import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function DashboardSimple() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'User'}!</h1>
          <p className="text-slate-400">Ready to crush your fitness goals today?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">7</div>
            <div className="text-slate-400">Day Streak</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="text-2xl font-bold text-green-400">12</div>
            <div className="text-slate-400">Workouts This Month</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">2.5kg</div>
            <div className="text-slate-400">Weight Progress</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">85%</div>
            <div className="text-slate-400">Goal Completion</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
            <div className="text-3xl mb-4">🏋️</div>
            <h3 className="text-xl font-bold mb-2">Start Workout</h3>
            <p className="text-slate-400">Begin your training session</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">View Progress</h3>
            <p className="text-slate-400">Check your fitness analytics</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
            <div className="text-3xl mb-4">🍎</div>
            <h3 className="text-xl font-bold mb-2">Log Nutrition</h3>
            <p className="text-slate-400">Track your daily meals</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div>
                <div className="font-semibold">Push Day Workout</div>
                <div className="text-slate-400 text-sm">Completed 45 minutes ago</div>
              </div>
              <div className="text-green-400 font-bold">✓ Completed</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div>
                <div className="font-semibold">Protein Shake</div>
                <div className="text-slate-400 text-sm">Logged 2 hours ago</div>
              </div>
              <div className="text-blue-400 font-bold">📊 Nutrition</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div>
                <div className="font-semibold">Morning Run</div>
                <div className="text-slate-400 text-sm">Completed yesterday</div>
              </div>
              <div className="text-purple-400 font-bold">🏃 Cardio</div>
            </div>
          </div>
        </div>

        {/* Demo Mode Notice */}
        {user?.bio?.includes('Demo') && (
          <div className="mt-8 bg-blue-900/20 border border-blue-500 rounded-lg p-4">
            <h4 className="font-bold text-blue-300 mb-2">🎯 Demo Mode Active</h4>
            <p className="text-blue-200 text-sm">
              You're using the demo version. All data is simulated and stored locally. 
              Connect to a live backend for full functionality.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}