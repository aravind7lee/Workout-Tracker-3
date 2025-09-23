import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onlineService } from '../services/onlineService';
import { useAuth } from '../context/AuthContext';

export default function RealTimeAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const loadRealTimeData = async () => {
    if (!isAuthenticated()) return;

    try {
      const online = await onlineService.checkBackendStatus();
      setIsOnline(online);

      let workouts = [], plans = [], meals = [];

      if (online) {
        const [workoutData, planData] = await Promise.all([
          onlineService.getWorkoutHistory().catch(() => []),
          onlineService.getWorkoutPlans().catch(() => [])
        ]);
        workouts = workoutData || [];
        plans = planData || [];
      }

      // Fallback to localStorage
      if (!online || workouts.length === 0) {
        workouts = JSON.parse(localStorage.getItem('recentWorkouts') || '[]');
        plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
        meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      }

      const newAchievements = generateAchievements(workouts, plans, meals);
      const newProgress = calculateProgress(workouts, plans, meals);

      setAchievements(newAchievements);
      setProgress(newProgress);
    } catch (error) {
      console.error('Real-time data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAchievements = (workouts, plans, meals) => {
    const achievements = [];
    
    if (workouts.length >= 1) {
      achievements.push({
        id: 'first_workout',
        title: 'First Steps',
        description: 'Completed your first workout',
        icon: '🎯',
        xp: 100,
        category: 'workout',
        timeAgo: 'Recently'
      });
    }
    
    if (workouts.length >= 5) {
      achievements.push({
        id: 'workout_5',
        title: 'Getting Strong',
        description: 'Completed 5 workouts',
        icon: '💪',
        xp: 250,
        category: 'workout',
        timeAgo: 'This week'
      });
    }
    
    if (workouts.length >= 10) {
      achievements.push({
        id: 'workout_10',
        title: 'Fitness Enthusiast',
        description: 'Completed 10 workouts',
        icon: '🔥',
        xp: 500,
        category: 'workout',
        timeAgo: 'This month'
      });
    }
    
    if (plans.length >= 1) {
      achievements.push({
        id: 'first_plan',
        title: 'Plan Creator',
        description: 'Created your first workout plan',
        icon: '📋',
        xp: 150,
        category: 'planning',
        timeAgo: 'Recently'
      });
    }
    
    if (meals.length >= 3) {
      achievements.push({
        id: 'nutrition_3',
        title: 'Nutrition Tracker',
        description: 'Logged 3 meals',
        icon: '🥗',
        xp: 100,
        category: 'nutrition',
        timeAgo: 'Today'
      });
    }
    
    return achievements;
  };

  const calculateProgress = (workouts, plans, meals) => {
    return {
      nextWorkout: Math.min(workouts.length, 10),
      nextPlan: Math.min(plans.length, 3),
      nextNutrition: Math.min(meals.length, 10),
      totalXP: (workouts.length * 100) + (plans.length * 150) + (meals.length * 50)
    };
  };

  useEffect(() => {
    loadRealTimeData();
    const interval = setInterval(loadRealTimeData, 15000); // Real-time updates every 15 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="card cursor-pointer hover:border-yellow-500/50 transition-all duration-300 group"
      onClick={() => navigate('/achievements')}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors">
            Achievements
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-1 rounded-full ${isOnline ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {isOnline ? '🟢 Live Data' : '🟡 Local Data'}
            </span>
            {loading && <span className="animate-spin">⟳</span>}
          </div>
        </div>
        <div className="text-2xl group-hover:scale-110 transition-transform">🏆</div>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-slate-700 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-700 rounded mb-1"></div>
                <div className="h-3 bg-slate-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : achievements.length > 0 ? (
        <div className="space-y-3">
          {achievements.slice(0, 3).map((achievement) => (
            <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30 group-hover:bg-yellow-500/10 transition-colors">
              <div className="text-xl">{achievement.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">{achievement.title}</div>
                <div className="text-xs text-slate-400">{achievement.description}</div>
              </div>
              <div className="text-xs text-yellow-400">+{achievement.xp} XP</div>
            </div>
          ))}
          
          {/* Progress Indicators */}
          <div className="mt-4 pt-3 border-t border-slate-700">
            <div className="text-xs text-slate-400 mb-2">Progress to Next Achievement</div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Workouts: {progress.nextWorkout}/10</span>
                <span>{Math.round((progress.nextWorkout/10)*100)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-500" 
                  style={{width: `${Math.min((progress.nextWorkout/10)*100, 100)}%`}}
                ></div>
              </div>
            </div>
          </div>
          
          {achievements.length > 3 && (
            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">+{achievements.length - 3} more achievements</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="text-3xl mb-2 opacity-50">🏆</div>
          <p className="text-slate-400 text-sm mb-1">No achievements yet</p>
          <p className="text-xs text-slate-500 mb-3">Complete workouts to earn achievements!</p>
          <div className="text-xs text-slate-400">
            <div>Next: Complete 1 workout → First Steps 🎯</div>
          </div>
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between text-xs text-slate-400">
        <span>Total XP: {progress.totalXP || 0}</span>
        <span className="text-yellow-400">Click to view all →</span>
      </div>
    </div>
  );
}