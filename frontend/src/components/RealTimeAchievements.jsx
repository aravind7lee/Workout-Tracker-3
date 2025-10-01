import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAchievements } from '../context/AchievementsContext';

export default function RealTimeAchievements() {
  const navigate = useNavigate();
  const {
    achievements,
    unlockedCount,
    totalCount,
    totalXPEarned,
    loading,
    realTimeStats,
    isOnline,
    lastSync,
    syncNow,
    completionPercentage,
    currentXP,
    currentStreak
  } = useAchievements();







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



  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const nextAchievements = achievements.filter(a => !a.unlocked).slice(0, 3);

  return (

      <motion.div 
        className="card cursor-pointer hover:border-yellow-500/50 transition-all duration-300 group lg:col-span-2"
        onClick={() => navigate('/achievements')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors flex items-center gap-2">
              🏆 Achievements
            </h3>
            <div className="flex items-center gap-2 text-xs mt-1">
              <span className={`px-2 py-1 rounded-full border ${isOnline ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
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
          <div className="text-right">
            <div className="text-2xl group-hover:scale-110 transition-transform">🏆</div>
            <div className="text-xs text-slate-400 mt-1">
              {unlockedAchievements.length}/{achievements.length}
            </div>
          </div>
        </div>
        
        {/* Real-time XP Display */}
        {realTimeStats && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-300">Total XP Points</span>
              <span className="text-xs text-slate-400">{isOnline ? 'Real-time from MongoDB' : 'Local calculation'}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {currentXP.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">
                {totalXPEarned.toLocaleString()} earned from achievements
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 bg-slate-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-700 rounded mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                </div>
                <div className="w-16 h-6 bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recently Unlocked */}
            {unlockedAchievements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                  ✅ Recently Unlocked ({unlockedAchievements.length})
                </h4>
                <div className="space-y-2">
                  {unlockedAchievements.slice(0, 3).map((achievement) => (
                    <motion.div 
                      key={achievement.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r ${getTierColor(achievement.tier)}/10 border ${getTierBorder(achievement.tier)} group-hover:bg-yellow-500/10 transition-colors`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm flex items-center gap-2">
                          {achievement.title}
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getTierColor(achievement.tier)} text-white font-bold uppercase tracking-wide`}>
                            {achievement.tier}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">{achievement.description}</div>
                        <div className="text-xs text-green-400 mt-1">✅ Unlocked</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-yellow-400">+{achievement.xp}</div>
                        <div className="text-xs text-slate-500">XP</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Next Achievements */}
            {nextAchievements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-orange-400 mb-3 flex items-center gap-2">
                  🎯 Next Achievements ({nextAchievements.length})
                </h4>
                <div className="space-y-2">
                  {nextAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/20 border border-slate-600/30 group-hover:bg-orange-500/10 transition-colors">
                      <div className="text-2xl opacity-50">{achievement.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-300 text-sm flex items-center gap-2">
                          {achievement.title}
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getTierColor(achievement.tier)}/30 text-slate-300 font-bold uppercase tracking-wide`}>
                            {achievement.tier}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">{achievement.description}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                            <div 
                              className={`bg-gradient-to-r ${getTierColor(achievement.tier)} h-1.5 rounded-full transition-all duration-500`}
                              style={{width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%`}}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-400 min-w-0">
                            {achievement.progress}/{achievement.target}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-400">+{achievement.xp}</div>
                        <div className="text-xs text-slate-600">XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {achievements.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-3 opacity-50">🏆</div>
                <p className="text-slate-400 text-sm mb-2">No achievements yet</p>
                <p className="text-xs text-slate-500 mb-4">Complete workouts to unlock achievements!</p>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>🎯 Complete 1 workout → First Rep (100 XP)</div>
                  <div>📋 Create 1 plan → Plan Creator (150 XP)</div>
                  <div>🔥 3-day streak → On Fire (200 XP)</div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between items-center text-xs">
          <div className="flex items-center gap-4 text-slate-400">
            <span>Total XP: <span className="text-yellow-400 font-bold">{currentXP.toLocaleString()}</span></span>
            <span>Unlocked: <span className="text-green-400 font-bold">{unlockedCount}</span></span>
            <span>Progress: <span className="text-blue-400 font-bold">{completionPercentage}%</span></span>
          </div>
          <span className="text-yellow-400 font-medium">View All Achievements →</span>
        </div>
      </motion.div>
    );
}