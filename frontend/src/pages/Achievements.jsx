import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAchievements } from '../context/AchievementsContext';
import { onlineService } from '../services/onlineService';
import AuthGuard from '../components/AuthGuard';

export default function Achievements() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    achievements,
    realTimeStats,
    unlockedCount,
    totalCount,
    totalXPEarned,
    loading,
    isOnline,
    lastSync,
    syncNow,
    getNavigationPath,
    completionPercentage,
    currentXP,
    currentStreak
  } = useAchievements();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [newAchievementAlert, setNewAchievementAlert] = useState(null);

  // Handle achievement box navigation
  const handleAchievementNavigation = (achievement) => {
    const path = getNavigationPath(achievement.type || achievement.category);
    navigate(path);
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'platinum': return 'from-purple-400 to-pink-400';
      case 'gold': return 'from-yellow-400 to-orange-400';
      case 'silver': return 'from-gray-300 to-gray-400';
      case 'bronze': return 'from-orange-600 to-yellow-600';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  const getTierBorder = (tier) => {
    switch (tier) {
      case 'platinum': return 'border-purple-400/50';
      case 'gold': return 'border-yellow-400/50';
      case 'silver': return 'border-gray-300/50';
      case 'bronze': return 'border-orange-500/50';
      default: return 'border-slate-500/50';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'workout': return '🏋️';
      case 'planning': return '📋';
      case 'streak': return '🔥';
      case 'nutrition': return '🥗';
      case 'xp': return '💎';
      default: return '🏆';
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    const tierMatch = selectedTier === 'all' || achievement.tier === selectedTier;
    return categoryMatch && tierMatch;
  });

  // Show new achievement alert when achievements are unlocked
  useEffect(() => {
    const newlyUnlocked = achievements.filter(a => a.unlocked && !a.alerted);
    if (newlyUnlocked.length > 0) {
      const latest = newlyUnlocked[0];
      setNewAchievementAlert(latest);
      setTimeout(() => setNewAchievementAlert(null), 5000);
    }
  }, [achievements]);

  const categories = ['all', 'workout', 'planning', 'streak', 'nutrition', 'xp'];
  const tiers = ['all', 'bronze', 'silver', 'gold', 'platinum'];

  return (
    <AuthGuard>
      {/* New Achievement Alert */}
      <AnimatePresence>
        {newAchievementAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-xl shadow-2xl border border-yellow-400/50"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl animate-bounce">{newAchievementAlert.icon}</div>
              <div>
                <div className="font-bold">Achievement Unlocked!</div>
                <div className="text-sm opacity-90">{newAchievementAlert.title}</div>
                <div className="text-xs opacity-75">+{newAchievementAlert.xp} XP</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              🏆 Achievements
            </h1>
            <div className="flex items-center gap-2 text-sm mt-2">
              <span className={`px-3 py-1 rounded-full border ${isOnline ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                {isOnline ? '🔥 LIVE MONGODB' : '📱 LOCAL DATA'}
              </span>
              {lastSync && (
                <span className="text-slate-500">
                  Last sync: {lastSync.toLocaleTimeString()}
                </span>
              )}
              {loading && <span className="animate-spin text-blue-400">⟳</span>}
            </div>
          </div>
          
          <button
            onClick={syncNow}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg"
            disabled={loading}
          >
            <span className={loading ? 'animate-spin' : ''}>{loading ? '⟳' : '🔄'}</span>
            {loading ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>

        {/* Real-Time Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="card text-center py-4 hover:scale-105 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-2xl font-bold text-green-400 group-hover:text-green-300">{currentXP?.toLocaleString() || 0}</div>
            <div className="text-sm text-slate-400 group-hover:text-slate-300">Total XP</div>
            <div className="text-xs text-green-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">View Dashboard →</div>
          </button>
          
          <button
            onClick={() => navigate('/achievements')}
            className="card text-center py-4 hover:scale-105 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-2xl font-bold text-green-400 group-hover:text-green-300">{unlockedCount}</div>
            <div className="text-sm text-slate-400 group-hover:text-slate-300">Unlocked</div>
            <div className="text-xs text-green-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{completionPercentage}% Complete</div>
          </button>
          
          <button
            onClick={() => navigate('/achievements')}
            className="card text-center py-4 hover:scale-105 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-2xl font-bold text-green-400 group-hover:text-green-300">{totalXPEarned.toLocaleString()}</div>
            <div className="text-sm text-slate-400 group-hover:text-slate-300">XP Earned</div>
            <div className="text-xs text-green-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">From Achievements</div>
          </button>
          
          <button
            onClick={() => navigate('/current-streak')}
            className="card text-center py-4 hover:scale-105 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-2xl font-bold text-green-400 group-hover:text-green-300 flex items-center justify-center gap-2">
              {currentStreak || 0}
              {currentStreak > 0 && <span className="animate-pulse">🔥</span>}
            </div>
            <div className="text-sm text-slate-400 group-hover:text-slate-300">Current Streak</div>
            <div className="text-xs text-green-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">View Streak →</div>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {getCategoryIcon(category)} {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">Tier</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white"
            >
              {tiers.map(tier => (
                <option key={tier} value={tier}>
                  {tier === 'all' ? 'All Tiers' : tier.charAt(0).toUpperCase() + tier.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card p-4 cursor-pointer hover:scale-105 transition-all duration-300 ${
                achievement.unlocked ? 'bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30' : 'bg-slate-800/50'
              } ${getTierBorder(achievement.tier)}`}
              onClick={() => handleAchievementNavigation(achievement)}
            >
              <div className="flex items-start gap-3">
                <div className={`text-3xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-sm ${achievement.unlocked ? 'text-green-400' : 'text-slate-300'}`}>
                    {achievement.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getTierColor(achievement.tier)} text-white font-medium`}>
                      {achievement.tier}
                    </span>
                    <span className="text-xs text-slate-500">
                      +{achievement.xp} XP
                    </span>
                  </div>
                  {!achievement.unlocked && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{achievement.current || 0}/{achievement.target}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${achievement.percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {achievement.unlocked && (
                    <div className="mt-2 flex items-center gap-1 text-green-400 text-xs">
                      <span>✅</span>
                      <span>Unlocked</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No achievements found</h3>
            <p className="text-slate-400">Try adjusting your filters or start completing activities to unlock achievements!</p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}