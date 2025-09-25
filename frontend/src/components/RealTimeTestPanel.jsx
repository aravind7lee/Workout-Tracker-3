import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  quickWorkoutComplete, 
  quickMealLog, 
  quickPlanCreate, 
  forceRefreshAnalytics 
} from '../utils/realTimeUpdates';

export default function RealTimeTestPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState({});

  const handleAction = async (actionType, actionFn) => {
    setLoading(prev => ({ ...prev, [actionType]: true }));
    
    try {
      await actionFn();
      
      // Show success feedback
      setTimeout(() => {
        setLoading(prev => ({ ...prev, [actionType]: false }));
      }, 1000);
    } catch (error) {
      console.error(`Failed to execute ${actionType}:`, error);
      setLoading(prev => ({ ...prev, [actionType]: false }));
    }
  };

  if (!isVisible) {
    return (
      <motion.button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        🧪 Test Real-Time
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-2xl max-w-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          🧪 Real-Time Test Panel
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={() => handleAction('workout', quickWorkoutComplete)}
          disabled={loading.workout}
          className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {loading.workout ? (
            <span className="animate-spin">⟳</span>
          ) : (
            <span>💪</span>
          )}
          Complete Workout
        </button>
        
        <button
          onClick={() => handleAction('meal', quickMealLog)}
          disabled={loading.meal}
          className="w-full flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {loading.meal ? (
            <span className="animate-spin">⟳</span>
          ) : (
            <span>🍎</span>
          )}
          Log Meal
        </button>
        
        <button
          onClick={() => handleAction('plan', quickPlanCreate)}
          disabled={loading.plan}
          className="w-full flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {loading.plan ? (
            <span className="animate-spin">⟳</span>
          ) : (
            <span>📋</span>
          )}
          Create Plan
        </button>
        
        <button
          onClick={() => handleAction('refresh', forceRefreshAnalytics)}
          disabled={loading.refresh}
          className="w-full flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {loading.refresh ? (
            <span className="animate-spin">⟳</span>
          ) : (
            <span>🔄</span>
          )}
          Force Refresh
        </button>
      </div>
      
      <div className="mt-4 p-2 bg-slate-700 rounded-lg">
        <div className="text-xs text-slate-300 text-center">
          Test real-time updates
          <br />
          <span className="text-green-400">Go to Analytics to see changes!</span>
        </div>
      </div>
    </motion.div>
  );
}