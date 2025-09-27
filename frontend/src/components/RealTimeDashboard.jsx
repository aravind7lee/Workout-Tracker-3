// Simple Real-Time Dashboard Component
import React from 'react';

const RealTimeDashboard = ({ className = '' }) => {
  return (
    <div className={`bg-slate-800/60 border border-slate-700 rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        <span className="text-green-400 text-sm font-medium">Real-Time Dashboard Active</span>
      </div>
    </div>
  );
};

export default RealTimeDashboard;