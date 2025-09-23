import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onlineService } from '../services/onlineService';
import { achievementService } from '../services/achievementService';
import { useAuth } from '../context/AuthContext';

export default function AchievementsWidget() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, recent: 0 });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadAchievements();
    const interval = setInterval(loadAchievements, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAchievements = async () => {
    if (!isAuthenticated()) return;
    
    try {
      const online = await onlineService.checkBackendStatus();
      
      if (online) {
        const data = await onlineService.getAchievements();
        setAchievements(data.achievements || []);
        setStats({ total: data.total || 0, recent: data.recent || 0 });
      } else {
        loadLocalAchievements();
      }
    } catch (error) {
      loadLocalAchievements();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalAchievements = () => {
    const data = achievementService.generateLocalAchievements();
    setAchievements(data.achievements);
    setStats({ total: data.total, recent: data.recent });
  };

  return (
    <div 
      className="card cursor-pointer hover:border-yellow-500/50 transition-all duration-300 group"
      onClick={() => navigate('/achievements')}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors">
          Achievements
        </h3>
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
                <div className="text-xs text-slate-400">{achievement.timeAgo}</div>
              </div>
            </div>
          ))}
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
          <p className="text-xs text-slate-500">Complete workouts to earn achievements!</p>
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between text-xs text-slate-400">
        <span>Total: {stats.total}</span>
        <span className="text-yellow-400">Click to view all →</span>
      </div>
    </div>
  );
}