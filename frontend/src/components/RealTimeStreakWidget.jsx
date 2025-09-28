// Real-Time Streak Widget - Universal component for displaying streak data
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealTimeStreak } from '../hooks/useRealTimeStreak';

const RealTimeStreakWidget = ({ 
  variant = 'default', // 'default', 'compact', 'detailed'
  showActions = true,
  className = '',
  onClick = null
}) => {
  const navigate = useNavigate();
  const {
    currentStreak,
    longestStreak,
    totalCheckIns,
    canCheckIn,
    updateStreak,
    isLoading,
    motivation,
    lastUpdate
  } = useRealTimeStreak();

  const [isUpdating, setIsUpdating] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Handle quick check-in
  const handleQuickCheckIn = async (e) => {
    e.stopPropagation();
    
    if (!canCheckIn || isUpdating) return;
    
    try {
      setIsUpdating(true);
      const result = await updateStreak();
      
      setNotificationMessage(`🔥 Day ${result.currentStreak} Streak Active!`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      
    } catch (error) {
      const message = error.message.includes('Already checked in') 
        ? '✅ Already checked in today!' 
        : '❌ Check-in failed';
      setNotificationMessage(message);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle widget click
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/current-streak');
    }
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={handleClick}
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
        >
          <span className="text-lg">🔥</span>
          <span className="font-bold">{currentStreak}</span>
          <span className="text-xs opacity-75">days</span>
        </button>
        
        {showNotification && (
          <div className="absolute top-full left-0 mt-2 px-3 py-2 bg-green-600 text-white text-xs rounded-lg shadow-lg animate-bounce z-50">
            {notificationMessage}
          </div>
        )}
      </div>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <div className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            🔥 Current Streak
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </h3>
          <div className="text-xs text-slate-400">
            Live • {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className={`text-2xl font-bold text-orange-400 ${currentStreak > 0 ? 'animate-pulse' : ''}`}>
              {currentStreak}
            </div>
            <div className="text-xs text-slate-400">Current</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{longestStreak}</div>
            <div className="text-xs text-slate-400">Best</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{totalCheckIns}</div>
            <div className="text-xs text-slate-400">Total</div>
          </div>
        </div>
        
        <div className="text-sm text-slate-300 mb-4 text-center">
          {motivation}
        </div>
        
        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={handleQuickCheckIn}
              disabled={!canCheckIn || isUpdating}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                canCheckIn && !isUpdating
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isUpdating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </div>
              ) : canCheckIn ? (
                '🔥 Check In'
              ) : (
                '✅ Done Today'
              )}
            </button>
            
            <button
              onClick={handleClick}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all duration-300"
            >
              View Details
            </button>
          </div>
        )}
        
        {showNotification && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg shadow-lg animate-bounce z-50">
            {notificationMessage}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleClick}
        className="w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 text-left"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="text-white font-bold">Current Streak</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">LIVE</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-3xl font-bold text-orange-400 ${currentStreak > 0 ? 'animate-pulse' : ''}`}>
              {currentStreak} days
            </div>
            <div className="text-sm text-slate-400 mt-1">
              {currentStreak > 0 ? `${currentStreak} days strong!` : 'Start your streak'}
            </div>
          </div>
          
          {showActions && canCheckIn && (
            <button
              onClick={handleQuickCheckIn}
              disabled={isUpdating}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium text-sm transition-all duration-300"
            >
              {isUpdating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                '🔥 Check In'
              )}
            </button>
          )}
        </div>
      </button>
      
      {showNotification && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg shadow-lg animate-bounce z-50">
          {notificationMessage}
        </div>
      )}
    </div>
  );
};

export default RealTimeStreakWidget;