// Simple Real-Time Dashboard Component
import React from 'react';

const RealTimeDashboard = ({ className = '' }) => {
  return (
    <div className={`bg-neutral-900/60 border border-neutral-800 rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        <span className="text-red-500 text-sm font-medium">Real-Time Dashboard Active</span>
      </div>
    </div>
  );
};

export default RealTimeDashboard;