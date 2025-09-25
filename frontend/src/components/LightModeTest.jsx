import React from 'react';

const LightModeTest = () => {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Light Mode Text Visibility Test</h1>
      
      {/* Dashboard Hero Test */}
      <div className="dashboard-hero relative h-32 bg-gray-400 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-white/90">Track your progress and manage workouts</p>
          </div>
        </div>
      </div>

      {/* Workout Builder Header Test */}
      <div className="workout-builder-header relative h-32 bg-gray-400 rounded-lg overflow-hidden">
        <div className="gradient-overlay absolute inset-0 bg-gradient-to-b from-black/30 to-black/70"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">My Workout Builder</h1>
            <p className="text-white/95">Create and customize your training programs</p>
          </div>
        </div>
      </div>

      {/* My Plans Header Test */}
      <div className="workout-builder-section">
        <h2 className="text-2xl font-semibold heading-text text-gray-900 dark:text-white">My Workout Plans</h2>
        <p className="muted-text">Manage your workout plans and routines</p>
      </div>

      {/* Plan Builder Header Test */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Workout Plan Builder</h2>
        <p className="text-gray-600 dark:text-gray-300">Build custom workout plans</p>
      </div>

      {/* Card Test */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-2">Card Header</h3>
        <p className="text-slate-400">This is card content that should be visible in light mode</p>
      </div>
    </div>
  );
};

export default LightModeTest;