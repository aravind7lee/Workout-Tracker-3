import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NutritionSocialDashboard = ({ totals, targets, meals, customCalorieTarget }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [streakData, setStreakData] = useState({ current: 0, best: 0 });
  const [socialStats, setSocialStats] = useState({
    friendsCount: 0,
    averageCalories: 0,
    ranking: 0
  });

  const currentCalorieTarget = customCalorieTarget || targets.calories || 2000;

  // Calculate achievements and milestones
  const currentAchievements = useMemo(() => {
    const achievements = [];
    const proteinProgress = ((totals.protein || 0) / (targets.protein || 150)) * 100;
    const calorieProgress = ((totals.calories || 0) / currentCalorieTarget) * 100;
    const mealCount = meals.length;

    // Protein achievements
    if (proteinProgress >= 100) {
      achievements.push({
        id: 'protein-goal',
        title: 'Protein Champion! 💪',
        description: 'Hit your daily protein target',
        type: 'daily',
        icon: '🏆',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20'
      });
    }

    // Calorie balance achievements
    if (Math.abs(calorieProgress - 100) <= 5) {
      achievements.push({
        id: 'calorie-balance',
        title: 'Perfect Balance! ⚖️',
        description: 'Nailed your calorie target',
        type: 'daily',
        icon: '🎯',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20'
      });
    }

    // Meal frequency achievements
    if (mealCount >= 5) {
      achievements.push({
        id: 'meal-frequency',
        title: 'Consistent Eater! 🍽️',
        description: 'Had 5+ meals today',
        type: 'daily',
        icon: '📅',
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20'
      });
    }

    // Macro balance achievement
    const macroBalance = [proteinProgress, 
      ((totals.carbs || 0) / (targets.carbs || 250)) * 100,
      ((totals.fat || 0) / (targets.fat || 67)) * 100
    ];
    if (macroBalance.every(m => m >= 80 && m <= 120)) {
      achievements.push({
        id: 'macro-balance',
        title: 'Macro Master! 🧬',
        description: 'Balanced all macronutrients',
        type: 'daily',
        icon: '⚗️',
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20'
      });
    }

    return achievements;
  }, [totals, targets, meals, currentCalorieTarget]);

  // Generate shareable content
  const generateShareContent = () => {
    const proteinProgress = Math.round(((totals.protein || 0) / (targets.protein || 150)) * 100);
    const calorieProgress = Math.round(((totals.calories || 0) / currentCalorieTarget) * 100);
    
    return {
      text: `🔥 Today's Nutrition Progress:\n📊 Calories: ${Math.round(totals.calories || 0)}/${currentCalorieTarget} (${calorieProgress}%)\n💪 Protein: ${Math.round(totals.protein || 0)}g/${targets.protein || 150}g (${proteinProgress}%)\n🍽️ Meals: ${meals.length}\n\n${currentAchievements.length > 0 ? `🏆 Achievements: ${currentAchievements.map(a => a.title).join(', ')}` : ''}`,
      hashtags: '#NutritionTracking #HealthyEating #FitnessGoals #WorkoutTracker',
      image: null // Could generate a progress chart image
    };
  };

  const shareContent = generateShareContent();

  // Mock social features (in real app, these would come from backend)
  useEffect(() => {
    // Simulate loading social data
    setSocialStats({
      friendsCount: 12,
      averageCalories: 2150,
      ranking: 3
    });
    
    setStreakData({
      current: 5,
      best: 12
    });
  }, []);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = 'Copied to clipboard!';
      document.body.appendChild(notification);
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToSocial = (platform) => {
    const encodedText = encodeURIComponent(shareContent.text + '\n\n' + shareContent.hashtags);
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      instagram: `https://www.instagram.com/`,
      whatsapp: `https://wa.me/?text=${encodedText}`
    };
    
    window.open(urls[platform], '_blank', 'width=600,height=400');
    setShowShareModal(false);
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
      {/* Social Stats Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-purple-200 dark:border-purple-800 shadow-lg">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2.5 sm:gap-3 md:gap-4">
          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-white text-base sm:text-lg md:text-xl">🌟</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-light-text-primary dark:text-dark-text-primary uppercase tracking-wide leading-none">
                Your Nutrition Journey
              </h3>
              <div className="text-[10px] sm:text-xs md:text-sm text-light-text-muted dark:text-dark-text-muted font-semibold mt-0.5">
                <span className="hidden sm:inline">Share your progress with friends and family</span>
                <span className="sm:hidden">Share your progress</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowShareModal(true)}
            className="relative group overflow-hidden px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wider hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative flex items-center gap-1 sm:gap-1.5 md:gap-2">
              <span>📤</span>
              <span className="hidden xs:inline">Share</span>
              <span className="xs:hidden">Post</span>
            </span>
          </button>
        </div>
      </div>

      {/* Achievement Showcase */}
      {currentAchievements.length > 0 && (
        <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
          <h4 className="font-black text-xs sm:text-sm md:text-base text-light-text-primary dark:text-dark-text-primary flex items-center gap-1.5 sm:gap-2 uppercase tracking-wide">
            <span>🏆</span> Today's Achievements
          </h4>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
            {currentAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border ${achievement.bgColor} border-current/20 shadow-lg`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                  <span className="text-xl sm:text-2xl md:text-3xl flex-shrink-0">{achievement.icon}</span>
                  <div>
                    <h5 className={`font-black text-[10px] sm:text-xs md:text-sm ${achievement.color} uppercase tracking-wide leading-tight`}>
                      {achievement.title}
                    </h5>
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-light-text-muted dark:text-dark-text-muted font-semibold mt-0.5">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}



      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                  Share Your Progress
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary"
                >
                  ✕
                </button>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-lg p-4 mb-6">
                <div className="text-sm text-light-text-primary dark:text-dark-text-primary whitespace-pre-line">
                  {shareContent.text}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  {shareContent.hashtags}
                </div>
              </div>

              {/* Share Options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => shareToSocial('whatsapp')}
                  className="flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                >
                  <span>💬</span>
                  WhatsApp
                </button>
                <button
                  onClick={() => shareToSocial('instagram')}
                  className="flex items-center justify-center gap-2 p-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all"
                >
                  <span>📷</span>
                  Instagram
                </button>
                <button
                  onClick={() => shareToSocial('twitter')}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                >
                  <span>🐦</span>
                  Twitter
                </button>
                <button
                  onClick={() => copyToClipboard(shareContent.text + '\n\n' + shareContent.hashtags)}
                  className="flex items-center justify-center gap-2 p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  <span>📋</span>
                  Copy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NutritionSocialDashboard;