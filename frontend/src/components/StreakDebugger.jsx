import React, { useState, useEffect } from 'react';
import { useStreak } from '../context/StreakContext';
import api from '../utils/api';

const StreakDebugger = () => {
  const streakContext = useStreak();
  const [apiTest, setApiTest] = useState(null);
  const [loading, setLoading] = useState(false);

  // Test API connection
  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/streak/status');
      setApiTest({ success: true, data: response.data });
    } catch (error) {
      setApiTest({ success: false, error: error.message });
    }
    setLoading(false);
  };

  // Test check-in
  const testCheckIn = async () => {
    setLoading(true);
    try {
      const response = await api.post('/users/streak/check-in');
      setApiTest({ success: true, data: response.data, action: 'check-in' });
    } catch (error) {
      setApiTest({ success: false, error: error.message, action: 'check-in' });
    }
    setLoading(false);
  };

  useEffect(() => {
    console.log('🔥 STREAK DEBUGGER: Context data:', streakContext);
  }, [streakContext]);

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md z-50">
      <h3 className="font-bold mb-2">🔥 Streak Debugger</h3>
      
      <div className="text-xs space-y-1 mb-3">
        <div>Current Streak: {streakContext?.currentStreak || 0}</div>
        <div>Can Check In: {streakContext?.canCheckIn ? 'Yes' : 'No'}</div>
        <div>Last Check In: {streakContext?.lastCheckInDate || 'None'}</div>
        <div>Context Available: {streakContext ? 'Yes' : 'No'}</div>
      </div>

      <div className="flex gap-2 mb-3">
        <button 
          onClick={testAPI}
          disabled={loading}
          className="px-2 py-1 bg-blue-600 text-xs rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test API
        </button>
        <button 
          onClick={testCheckIn}
          disabled={loading}
          className="px-2 py-1 bg-green-600 text-xs rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Check-in
        </button>
      </div>

      {apiTest && (
        <div className="text-xs bg-gray-700 p-2 rounded">
          <div className={apiTest.success ? 'text-green-400' : 'text-red-400'}>
            {apiTest.success ? '✅ Success' : '❌ Error'}
          </div>
          {apiTest.action && <div>Action: {apiTest.action}</div>}
          {apiTest.error && <div>Error: {apiTest.error}</div>}
          {apiTest.data && (
            <div>Data: {JSON.stringify(apiTest.data, null, 2).substring(0, 100)}...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default StreakDebugger;