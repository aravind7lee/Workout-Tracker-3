// Streak Test Page - For debugging and verifying streak functionality
import React, { useState, useEffect } from 'react';
import streakCalculator from '../utils/streakCalculator';
import { useRealTimeStreak } from '../hooks/useRealTimeStreak';
import { useStreak } from '../context/StreakContext';

const StreakTest = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState([]);
  
  // Get data from all sources
  const hookData = useRealTimeStreak();
  const contextData = useStreak();
  
  useEffect(() => {
    const info = streakCalculator.getDebugInfo();
    setDebugInfo(info);
  }, []);

  const runTest = (testName, testFn) => {
    try {
      const result = testFn();
      setTestResults(prev => [...prev, {
        name: testName,
        success: true,
        result,
        timestamp: new Date().toISOString()
      }]);
      return result;
    } catch (error) {
      setTestResults(prev => [...prev, {
        name: testName,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }]);
      return null;
    }
  };

  const testCalculatorValidation = () => {
    return runTest('Calculator Validation', () => {
      return streakCalculator.validateStreak();
    });
  };

  const testCalculatorStats = () => {
    return runTest('Calculator Stats', () => {
      return streakCalculator.getStreakStats();
    });
  };

  const testButtonText = () => {
    return runTest('Button Text Generation', () => {
      const stats = streakCalculator.getStreakStats();
      return streakCalculator.getCheckInButtonText(stats);
    });
  };

  const testCheckIn = async () => {
    try {
      const result = await streakCalculator.performCheckIn();
      setTestResults(prev => [...prev, {
        name: 'Perform Check-in',
        success: true,
        result,
        timestamp: new Date().toISOString()
      }]);
      
      // Refresh debug info
      const info = streakCalculator.getDebugInfo();
      setDebugInfo(info);
      
      return result;
    } catch (error) {
      setTestResults(prev => [...prev, {
        name: 'Perform Check-in',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }]);
      return null;
    }
  };

  const resetStreak = () => {
    return runTest('Reset Streak', () => {
      const result = streakCalculator.resetStreak();
      
      // Refresh debug info
      const info = streakCalculator.getDebugInfo();
      setDebugInfo(info);
      
      return result;
    });
  };

  const clearTests = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔥 Streak System Test Page</h1>
        
        {/* Test Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={testCalculatorValidation}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Test Validation
            </button>
            <button
              onClick={testCalculatorStats}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
            >
              Test Stats
            </button>
            <button
              onClick={testButtonText}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              Test Button Text
            </button>
            <button
              onClick={testCheckIn}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg"
            >
              Test Check-in
            </button>
            <button
              onClick={resetStreak}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
            >
              Reset Streak
            </button>
            <button
              onClick={clearTests}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
            >
              Clear Tests
            </button>
          </div>
        </div>

        {/* Debug Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🔍 Calculator Debug Info</h2>
            <pre className="text-sm bg-gray-900 p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🎣 Hook Data</h2>
            <pre className="text-sm bg-gray-900 p-4 rounded overflow-auto">
              {JSON.stringify({
                currentStreak: hookData.currentStreak,
                canCheckIn: hookData.canCheckIn,
                nextDay: hookData.nextDay,
                lastCheckInDate: hookData.lastCheckInDate,
                buttonText: hookData.buttonText,
                motivation: hookData.motivation
              }, null, 2)}
            </pre>
          </div>
        </div>

        {/* Context Data */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Context Data</h2>
          <pre className="text-sm bg-gray-900 p-4 rounded overflow-auto">
            {JSON.stringify({
              currentStreak: contextData.currentStreak,
              longestStreak: contextData.longestStreak,
              totalCheckIns: contextData.totalCheckIns,
              canCheckIn: contextData.canCheckIn,
              lastCheckInDate: contextData.lastCheckInDate,
              debugInfo: contextData.debugInfo
            }, null, 2)}
          </pre>
        </div>

        {/* Test Results */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Test Results</h2>
          {testResults.length === 0 ? (
            <p className="text-gray-400">No tests run yet. Click the buttons above to run tests.</p>
          ) : (
            <div className="space-y-3">
              {testResults.map((test, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    test.success 
                      ? 'bg-green-900/20 border-green-500 text-green-200' 
                      : 'bg-red-900/20 border-red-500 text-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">
                      {test.success ? '✅' : '❌'} {test.name}
                    </h3>
                    <span className="text-xs opacity-75">
                      {new Date(test.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {test.success ? (
                    <pre className="text-xs bg-gray-900 p-2 rounded overflow-auto">
                      {JSON.stringify(test.result, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm">{test.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Status Display */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Current Streak Status</h2>
          <div className="text-6xl font-bold mb-2">{hookData.currentStreak}</div>
          <div className="text-xl mb-4">
            {hookData.currentStreak === 0 ? 'Start Today' : `Day${hookData.currentStreak !== 1 ? 's' : ''}`}
          </div>
          <div className="text-lg mb-4">{hookData.motivation}</div>
          <button
            onClick={testCheckIn}
            disabled={!hookData.canCheckIn}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              hookData.canCheckIn
                ? 'bg-white text-orange-600 hover:bg-gray-100'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {hookData.buttonText || `🔥 START DAY ${hookData.nextDay} STREAK`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreakTest;