import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { onlineService } from '../services/onlineService';
import AuthGuard from '../components/AuthGuard';

export default function Achievements() {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [achievements, setAchievements] = useState([]);
  const [realTimeStats, setRealTimeStats] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [newAchievementAlert, setNewAchievementAlert] = useState(null);

  const loadAchievements = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      setLoading(true);
      
      // Check backend status
      const online = await onlineService.checkBackendStatus();
      setIsOnline(online);

      if (online) {
        try {
          // Fetch real-time data from MongoDB
          const [achievementData, statsData, progressData] = await Promise.all([
            onlineService.getAchievements(),
            onlineService.getRealTimeStats(),
            onlineService.getAchievementProgress()
          ]);

          setAchievements(achievementData || []);
          setRealTimeStats(statsData);
          setProgress(progressData);
          setLastSync(new Date());
        } catch (error) {
          console.error('Failed to fetch online data:', error);
          loadOfflineAchievements();
        }
      } else {
        loadOfflineAchievements();
      }
    } catch (error) {
      console.error('Achievement loading error:', error);
      loadOfflineAchievements();
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadOfflineAchievements = () => {
    try {
      const workouts = JSON.parse(localStorage.getItem('recentWorkouts') || '[]');
      const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      
      const calculatedStreak = calculateStreak(workouts);
      const calculatedXP = (workouts.length * 100) + (plans.length * 150) + (meals.length * 50);
      
      setRealTimeStats({
        totalWorkouts: workouts.length,
        totalPlans: plans.length,
        totalMeals: meals.length,
        currentStreak: calculatedStreak,
        xpPoints: calculatedXP,
        isRealTime: false
      });

      // Generate offline achievements
      const offlineAchievements = generateOfflineAchievements(workouts, plans, meals, calculatedStreak, calculatedXP);
      setAchievements(offlineAchievements);
    } catch (error) {
      console.error('Error loading offline achievements:', error);
    }
  };

  const calculateStreak = (workouts) => {
    if (!workouts.length) return 0;
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const hasWorkout = workouts.some(w => {
        const workoutDate = new Date(w.completedAt || w.createdAt || w.date);
        return workoutDate.toDateString() === checkDate.toDateString();
      });
      if (hasWorkout) streak++;
      else break;
    }
    return streak;
  };

  const generateOfflineAchievements = (workouts, plans, meals, streak, xp) => {
    const achievements = [];
    
    // Workout achievements
    const workoutAchievements = [
      { threshold: 1, title: 'First Rep', description: 'Completed your first workout', icon: '🎯', xp: 100, tier: 'bronze' },
      { threshold: 5, title: 'Getting Strong', description: 'Completed 5 workouts', icon: '💪', xp: 250, tier: 'bronze' },
      { threshold: 10, title: 'Fitness Enthusiast', description: 'Completed 10 workouts', icon: '🔥', xp: 500, tier: 'silver' },
      { threshold: 25, title: 'Iron Warrior', description: 'Completed 25 workouts', icon: '⚔️', xp: 1000, tier: 'silver' },
      { threshold: 50, title: 'Gym Legend', description: 'Completed 50 workouts', icon: '👑', xp: 2000, tier: 'gold' },
      { threshold: 100, title: 'Ultimate Beast', description: 'Completed 100 workouts', icon: '🦁', xp: 5000, tier: 'platinum' }
    ];
    
    workoutAchievements.forEach(ach => {
      achievements.push({
        id: `workout_${ach.threshold}`,
        title: ach.title,
        description: ach.description,
        icon: ach.icon,
        xp: ach.xp,
        category: 'workout',
        tier: ach.tier,
        unlocked: workouts.length >= ach.threshold,
        progress: Math.min(workouts.length, ach.threshold),
        target: ach.threshold,
        percentage: Math.min((workouts.length / ach.threshold) * 100, 100)
      });
    });
    
    // Plan achievements
    const planAchievements = [
      { threshold: 1, title: 'Plan Creator', description: 'Created your first workout plan', icon: '📋', xp: 150, tier: 'bronze' },
      { threshold: 3, title: 'Strategic Planner', description: 'Created 3 workout plans', icon: '🎯', xp: 400, tier: 'silver' },
      { threshold: 5, title: 'Master Planner', description: 'Created 5 workout plans', icon: '🧠', xp: 750, tier: 'gold' }
    ];
    
    planAchievements.forEach(ach => {
      achievements.push({
        id: `plan_${ach.threshold}`,
        title: ach.title,
        description: ach.description,
        icon: ach.icon,
        xp: ach.xp,
        category: 'planning',
        tier: ach.tier,
        unlocked: plans.length >= ach.threshold,
        progress: Math.min(plans.length, ach.threshold),
        target: ach.threshold,
        percentage: Math.min((plans.length / ach.threshold) * 100, 100)
      });
    });
    
    // Streak achievements
    const streakAchievements = [
      { threshold: 3, title: 'On Fire', description: '3-day workout streak', icon: '🔥', xp: 200, tier: 'bronze' },
      { threshold: 7, title: 'Week Warrior', description: '7-day workout streak', icon: '⚡', xp: 500, tier: 'silver' },
      { threshold: 14, title: 'Unstoppable', description: '14-day workout streak', icon: '🚀', xp: 1000, tier: 'gold' },
      { threshold: 30, title: 'Consistency King', description: '30-day workout streak', icon: '👑', xp: 2500, tier: 'platinum' }
    ];
    
    streakAchievements.forEach(ach => {
      achievements.push({
        id: `streak_${ach.threshold}`,
        title: ach.title,
        description: ach.description,
        icon: ach.icon,
        xp: ach.xp,
        category: 'streak',
        tier: ach.tier,
        unlocked: streak >= ach.threshold,
        progress: Math.min(streak, ach.threshold),
        target: ach.threshold,
        percentage: Math.min((streak / ach.threshold) * 100, 100)
      });
    });
    
    return achievements.sort((a, b) => {
      if (a.unlocked !== b.unlocked) return b.unlocked - a.unlocked;
      const tierOrder = { 'platinum': 4, 'gold': 3, 'silver': 2, 'bronze': 1 };
      if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[b.tier] - tierOrder[a.tier];
      return b.percentage - a.percentage;
    });
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

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalXPEarned = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xp, 0);

  useEffect(() => {
    loadAchievements();
    
    // Real-time updates
    const interval = setInterval(loadAchievements, 30000);
    
    // Listen for achievement events
    const handleWorkoutComplete = () => {
      setTimeout(loadAchievements, 2000);
    };
    
    const handleMealAdded = () => {
      setTimeout(loadAchievements, 2000);
    };
    
    const handlePlanCreated = () => {
      setTimeout(loadAchievements, 2000);
    };
    
    window.addEventListener('workoutCompleted', handleWorkoutComplete);
    window.addEventListener('mealAdded', handleMealAdded);
    window.addEventListener('planCreated', handlePlanCreated);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('workoutCompleted', handleWorkoutComplete);
      window.removeEventListener('mealAdded', handleMealAdded);
      window.removeEventListener('planCreated', handlePlanCreated);
    };
  }, [loadAchievements]);

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
              <span className="text-lg bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-normal">
                ULTRA AURA++
              </span>
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
            onClick={loadAchievements}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg"
            disabled={loading}
          >
            <span className={loading ? 'animate-spin' : ''}>{loading ? '⟳' : '🔄'}</span>
            {loading ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>

        {/* Stats Overview */}
        {realTimeStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card text-center py-4">
              <div className="text-2xl font-bold text-blue-400">{realTimeStats.xpPoints?.toLocaleString() || 0}</div>
              <div className="text-sm text-slate-400">Total XP</div>
            </div>
            <div className="card text-center py-4">
              <div className="text-2xl font-bold text-green-400">{unlockedCount}</div>
              <div className="text-sm text-slate-400">Unlocked</div>
            </div>
            <div className="card text-center py-4">
              <div className="text-2xl font-bold text-purple-400">{totalXPEarned.toLocaleString()}</div>
              <div className="text-sm text-slate-400">XP Earned</div>
            </div>
            <div className="card text-center py-4">
              <div className="text-2xl font-bold text-orange-400">{realTimeStats.currentStreak || 0}</div>
              <div className="text-sm text-slate-400">Current Streak</div>
            </div>
          </div>
        )}

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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-slate-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-slate-700 rounded mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="h-2 bg-slate-700 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-slate-700 rounded w-16"></div>
                  <div className="h-4 bg-slate-700 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAchievements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <div className="text-xl font-semibold text-white mb-2">No achievements found</div>
            <div className="text-slate-400 mb-6">Try adjusting your filters or complete more activities!</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                className={`card ${achievement.unlocked ? `border ${getTierBorder(achievement.tier)} bg-gradient-to-br ${getTierColor(achievement.tier)}/5` : 'border-slate-600/30'} transition-all duration-300 hover:scale-105`}
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Achievement Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl ${achievement.unlocked ? `bg-gradient-to-br ${getTierColor(achievement.tier)}/20` : 'bg-slate-700/50'}`}>
                    <span className={achievement.unlocked ? '' : 'opacity-50'}>{achievement.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold text-lg ${achievement.unlocked ? 'text-white' : 'text-slate-400'}`}>
                        {achievement.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getTierColor(achievement.tier)} text-white font-bold uppercase tracking-wide`}>
                        {achievement.tier}
                      </span>
                    </div>
                    <p className={`text-sm ${achievement.unlocked ? 'text-slate-300' : 'text-slate-500'}`}>
                      {achievement.description}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Progress</span>
                    <span className={achievement.unlocked ? 'text-green-400' : 'text-slate-400'}>
                      {achievement.progress}/{achievement.target}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${achievement.unlocked ? `bg-gradient-to-r ${getTierColor(achievement.tier)}` : 'bg-slate-600'}`}
                      style={{ width: `${achievement.percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{getCategoryIcon(achievement.category)} {achievement.category}</span>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${achievement.unlocked ? 'text-yellow-400' : 'text-slate-500'}`}>
                      +{achievement.xp} XP
                    </div>
                    {achievement.unlocked && (
                      <div className="text-xs text-green-400">✅ Unlocked</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        <div className="card">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-4">Achievement Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-blue-400">{achievements.length}</div>
                <div className="text-sm text-slate-400">Total Available</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{unlockedCount}</div>
                <div className="text-sm text-slate-400">Unlocked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">{Math.round((unlockedCount / achievements.length) * 100) || 0}%</div>
                <div className="text-sm text-slate-400">Completion</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{totalXPEarned.toLocaleString()}</div>
                <div className="text-sm text-slate-400">XP Earned</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}