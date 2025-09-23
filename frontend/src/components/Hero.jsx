// frontend/src/components/Hero.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Hero() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    workouts: 0,
    meals: 0,
    xpPoints: 0,
    streak: 0,
    weeklyGoal: { completed: 0, target: 4, percentage: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Check if user is authenticated safely
        const userIsAuth = isAuthenticated && typeof isAuthenticated === 'function' ? isAuthenticated() : false;
        
        if (userIsAuth) {
          // Get stats from localStorage with error handling
          let workouts = [];
          let meals = [];
          
          try {
            workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
            if (!Array.isArray(workouts)) workouts = [];
          } catch (e) {
            workouts = [];
          }
          
          try {
            meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
            if (!Array.isArray(meals)) meals = [];
          } catch (e) {
            meals = [];
          }
          
          setStats({
            workouts: workouts.length,
            meals: meals.length,
            xpPoints: workouts.length * 100 + meals.length * 50,
            streak: 0,
            weeklyGoal: { 
              completed: Math.min(workouts.length, 4), 
              target: 4, 
              percentage: Math.min((workouts.length / 4) * 100, 100) 
            }
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Keep default stats on error
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to prevent hydration issues
    const timer = setTimeout(fetchStats, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const formatNumber = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <section className="relative rounded-2xl overflow-hidden mb-6 sm:mb-8 min-h-[500px] md:min-h-[600px]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {!imageError ? (
          <img 
            src="/Heroimg.jpg" 
            alt="GymTracker Hero" 
            className="hero-mobile-image"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"></div>
        )}
        <div className="absolute inset-0 hero-overlay-primary"></div>
        <div className="absolute inset-0 hero-overlay-secondary"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="w-full px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
            {/* Text Content */}
            <div className="text-center lg:text-left space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight hero-title">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent preserve-color">
                    GymTracker
                  </span>
                  <br />
                  <span className="hero-subtitle">Your Fitness Journey</span>
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl hero-description max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Transform your workouts with intelligent tracking, personalized plans, and real-time progress monitoring. 
                  <span className="hero-accent font-semibold preserve-color"> Achieve your fitness goals faster than ever.</span>
                </p>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="flex items-center space-x-2 hero-feature-badge backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-green-400 preserve-color">✓</span>
                  <span className="hero-feature-text text-sm font-medium">Smart Workout Plans</span>
                </div>
                <div className="flex items-center space-x-2 hero-feature-badge backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-green-400 preserve-color">✓</span>
                  <span className="hero-feature-text text-sm font-medium">Progress Analytics</span>
                </div>
                <div className="flex items-center space-x-2 hero-feature-badge backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-green-400 preserve-color">✓</span>
                  <span className="hero-feature-text text-sm font-medium">Nutrition Tracking</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/dashboard" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10">Start Your Journey</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link 
                  to="/library" 
                  className="px-8 py-4 hero-secondary-btn font-bold rounded-xl backdrop-blur-sm transition-all duration-300"
                >
                  Explore Exercises
                </Link>
              </div>
            </div>

            {/* Stats Card */}
            <div className="flex justify-center lg:justify-end">
              <div className="hero-stats-card backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl max-w-sm w-full">
                <div className="text-center space-y-6">
                  <div>
                    <h3 className="hero-stats-title font-bold text-xl mb-4">Live Progress</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-400 preserve-color">
                        {loading ? '...' : formatNumber(stats.workouts)}
                      </div>
                      <div className="text-xs hero-stats-label">Workouts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-green-400 preserve-color">
                        {loading ? '...' : formatNumber(stats.meals)}
                      </div>
                      <div className="text-xs hero-stats-label">Meals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-purple-400 preserve-color">
                        {loading ? '...' : formatNumber(stats.xpPoints)}
                      </div>
                      <div className="text-xs hero-stats-label">XP Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-orange-400 preserve-color">
                        {loading ? '...' : `${stats.streak}🔥`}
                      </div>
                      <div className="text-xs hero-stats-label">Streak</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 hero-stats-divider">
                    <div className="text-sm hero-stats-label">Weekly Goal</div>
                    <div className="mt-2 hero-progress-bg rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full preserve-color transition-all duration-500" 
                        style={{width: `${Math.min(Math.max(stats.weeklyGoal.percentage || 0, 0), 100)}%`}}
                      ></div>
                    </div>
                    <div className="text-xs hero-progress-text mt-1">
                      {loading ? 'Loading...' : `${stats.weeklyGoal.completed} of ${stats.weeklyGoal.target} workouts completed`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}