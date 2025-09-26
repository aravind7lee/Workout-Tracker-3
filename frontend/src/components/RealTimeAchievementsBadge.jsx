import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAchievements } from '../context/AchievementsContext';

export default function RealTimeAchievementsBadge() {
  const navigate = useNavigate();
  const {
    unlockedCount,
    totalCount,
    currentXP,
    completionPercentage,
    isOnline,
    loading
  } = useAchievements();

  if (loading) {
    return (
      <div className="animate-pulse bg-slate-700/30 rounded-lg p-3">
        <div className="h-4 bg-slate-600 rounded mb-2"></div>
        <div className="h-3 bg-slate-600 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <motion.button
      onClick={() => navigate('/achievements')}
      className="group relative overflow-hidden bg-gradient-to-br from-yellow-900/30 via-amber-800/20 to-yellow-900/30 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-3 hover:border-yellow-400/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/10 cursor-pointer w-full text-left"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <span className="font-semibold text-white text-sm">Achievements</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${isOnline ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {isOnline ? 'LIVE' : 'LOCAL'}
            </span>
          </div>
          <span className="text-xs text-yellow-400 opacity-75">→</span>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="text-xl font-bold text-yellow-400">
            {unlockedCount}<span className="text-sm text-slate-400">/{totalCount}</span>
          </div>
          <div className="text-xs text-slate-400">
            {completionPercentage}% complete
          </div>
        </div>
        
        <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {currentXP.toLocaleString()} XP
          </span>
          <span className="text-yellow-400 font-medium">
            View All
          </span>
        </div>
      </div>
    </motion.button>
  );
}