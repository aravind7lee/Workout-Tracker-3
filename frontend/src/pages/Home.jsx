// Premium GymTracker Home - Professional Level UI/UX
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
import { useStreak } from '../context/StreakContext';
import { useAchievements } from '../context/AchievementsContext';
import Hero from '../components/Hero';
import RealTimeNotification from '../components/RealTimeNotification';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { stats, isOnline } = useRealTime();
  const { currentStreak } = useStreak();
  const { unlockedCount, totalCount, currentXP, completionPercentage, isOnline: achievementsOnline, checkAchievements } = useAchievements();
  const [notification, setNotification] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [liveUsers, setLiveUsers] = useState(2847);
  const observerRef = useRef();
  
  const isAuthenticated = () => {
    try {
      return auth?.isAuthenticated() || false;
    } catch {
      return false;
    }
  };

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Live users counter simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(el => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 6);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle workout completion notifications
  useEffect(() => {
    const workoutState = location.state;
    if (workoutState?.workoutCompleted) {
      const message = workoutState.savedOffline 
        ? `🎉 ${workoutState.exercise} completed! (Saved offline)`
        : `🎉 ${workoutState.exercise} completed in ${workoutState.duration}!`;
      
      setNotification({
        message,
        type: 'workout'
      });
      
      checkAchievements();
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname, checkAchievements]);

  const features = [
    { icon: '🏋️', title: 'WORKOUT DOMINATION', desc: 'AI-powered training with real-time form analysis and performance optimization', color: 'blue' },
    { icon: '📊', title: 'PROGRESS ANALYTICS', desc: 'Advanced metrics with predictive insights and transformation visualization', color: 'purple' },
    { icon: '🎯', title: 'GOAL CRUSHING', desc: 'Smart goal setting with achievement tracking and milestone rewards', color: 'green' },
    { icon: '🔥', title: 'STREAK MASTER', desc: 'Maintain momentum with streak rewards and consistency challenges', color: 'orange' },
    { icon: '🏆', title: 'ACHIEVEMENT SYSTEM', desc: 'Unlock exclusive badges and level up your fitness journey', color: 'yellow' },
    { icon: '👥', title: 'COMMUNITY POWER', desc: 'Connect with elite athletes worldwide and compete in challenges', color: 'pink' }
  ];

  const quickStats = [
    { label: 'Today\'s Workouts', value: stats?.todayWorkouts || 0, icon: '💪', color: 'blue' },
    { label: 'Current Streak', value: currentStreak || 0, icon: '🔥', color: 'orange' },
    { label: 'Total XP', value: currentXP || 0, icon: '⭐', color: 'yellow' },
    { label: 'Achievements', value: `${unlockedCount}/${totalCount}`, icon: '🏆', color: 'purple' }
  ];

  const globalStats = [
    { value: '15K+', label: 'ELITE ATHLETES', sublabel: 'WORLDWIDE', color: 'blue', icon: '🌍' },
    { value: '125K+', label: 'WORKOUTS', sublabel: 'COMPLETED', color: 'purple', icon: '💪' },
    { value: '85K+', label: 'GOALS', sublabel: 'ACHIEVED', color: 'green', icon: '🎯' },
    { value: '4.9★', label: 'APP RATING', sublabel: 'EXCELLENCE', color: 'yellow', icon: '⭐' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400/30 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400/40 rounded-full animate-ping" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-green-400/20 rounded-full animate-pulse" style={{animationDelay: '5s'}}></div>
      </div>

      {/* Enhanced Hero Section with Parallax */}
      <div className="relative" style={{transform: `translateY(${scrollY * 0.5}px)`}}>
        <Hero />
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        
        {/* Real-time Status Bar */}
        <div className="mb-8" data-animate id="status-bar">
          <div className={`transform transition-all duration-1000 ${isVisible['status-bar'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-4 mb-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                    <span className="text-sm font-bold text-white">{isOnline ? 'LIVE' : 'OFFLINE'}</span>
                  </div>
                  <div className="text-sm text-slate-300 font-mono">
                    {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
                  </div>
                  <div className="hidden sm:block text-xs text-slate-400">
                    Server: Online • Latency: 12ms
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-slate-300">
                    👥 <span className="font-bold text-blue-400">{liveUsers.toLocaleString()}</span> users online
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Quick Stats Dashboard */}
        {isAuthenticated() && (
          <div className="mb-12" data-animate id="quick-stats">
            <div className={`transform transition-all duration-1000 delay-200 ${isVisible['quick-stats'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-transparent bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text mb-2 font-heading">
                  YOUR ELITE STATUS
                </h2>
                <p className="text-slate-400">Real-time performance metrics</p>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickStats.map((stat, index) => (
                  <div key={index} className="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 backdrop-blur-sm border border-slate-600/30 rounded-xl p-6 hover:border-blue-400/40 transition-all duration-500 hover:scale-105 hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 text-center">
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <div className="text-2xl font-black text-blue-400 mb-1">{stat.value}</div>
                      <div className="text-xs text-slate-300 uppercase tracking-wide">{stat.label}</div>
                    </div>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Premium Features Showcase - AURA++++ */}
        <div className="mb-16" data-animate id="features">
          <div className={`transform transition-all duration-1000 delay-300 ${isVisible['features'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text mb-4 font-heading tracking-tight">
                ELITE FEATURES
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 mx-auto rounded-full mb-4"></div>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">Professional-grade tools that give you the competitive edge over other fitness apps</p>
            </div>
            
            {/* Interactive Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const colorClasses = {
                  blue: 'from-blue-500 to-blue-600 hover:border-blue-400/40 hover:shadow-blue-500/10',
                  purple: 'from-purple-500 to-purple-600 hover:border-purple-400/40 hover:shadow-purple-500/10',
                  green: 'from-green-500 to-green-600 hover:border-green-400/40 hover:shadow-green-500/10',
                  orange: 'from-orange-500 to-orange-600 hover:border-orange-400/40 hover:shadow-orange-500/10',
                  yellow: 'from-yellow-500 to-yellow-600 hover:border-yellow-400/40 hover:shadow-yellow-500/10',
                  pink: 'from-pink-500 to-pink-600 hover:border-pink-400/40 hover:shadow-pink-500/10'
                };
                
                return (
                  <div 
                    key={index}
                    className={`group relative overflow-hidden bg-gradient-to-br from-slate-800/40 via-slate-700/20 to-slate-800/40 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-8 transition-all duration-700 hover:scale-105 hover:shadow-2xl cursor-pointer transform ${activeFeature === index ? 'scale-105 border-blue-500/60 shadow-2xl shadow-blue-500/20' : ''} ${colorClasses[feature.color]}`}
                    onMouseEnter={() => setActiveFeature(index)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 text-center">
                      <div className={`w-20 h-20 bg-gradient-to-br ${colorClasses[feature.color].split(' ')[0]} ${colorClasses[feature.color].split(' ')[1]} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <span className="text-3xl">{feature.icon}</span>
                      </div>
                      <h3 className="text-xl lg:text-2xl font-black text-white mb-4 font-heading tracking-tight">{feature.title}</h3>
                      <p className="text-slate-300 font-medium leading-relaxed">{feature.desc}</p>
                      
                      {/* Progress indicator for active feature */}
                      {activeFeature === index && (
                        <div className="mt-4">
                          <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse" style={{width: '100%'}}></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Floating particles effect */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500/30 rounded-full animate-ping"></div>
                      <div className="absolute bottom-4 left-4 w-1 h-1 bg-blue-500/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Global Impact Stats - Enhanced */}
        <div className="mb-20" data-animate id="global-stats">
          <div className={`transform transition-all duration-1000 delay-400 ${isVisible['global-stats'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text mb-4 font-heading">
                GLOBAL DOMINATION
              </h3>
              <p className="text-lg text-slate-400 font-medium">Join the elite fitness revolution</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {globalStats.map((stat, index) => {
                const colorClasses = {
                  blue: 'text-blue-400 hover:border-blue-400/40 hover:shadow-blue-500/10 from-blue-500/5',
                  purple: 'text-purple-400 hover:border-purple-400/40 hover:shadow-purple-500/10 from-purple-500/5',
                  green: 'text-green-400 hover:border-green-400/40 hover:shadow-green-500/10 from-green-500/5',
                  yellow: 'text-yellow-400 hover:border-yellow-400/40 hover:shadow-yellow-500/10 from-yellow-500/5'
                };
                
                return (
                  <div key={index} className={`group relative overflow-hidden bg-gradient-to-br from-slate-800/50 via-slate-700/30 to-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${colorClasses[stat.color]}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[stat.color].split(' ')[5]} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    <div className="relative z-10 text-center">
                      <div className="text-2xl mb-2">{stat.icon}</div>
                      <div className={`text-5xl md:text-6xl font-black mb-3 font-heading tracking-tighter ${colorClasses[stat.color].split(' ')[0]}`}>
                        {stat.value}
                      </div>
                      <div className="text-slate-300 font-bold text-sm uppercase tracking-widest">{stat.label}</div>
                      <div className={`text-xs mt-1 ${colorClasses[stat.color].split(' ')[0]}/70`}>{stat.sublabel}</div>
                    </div>
                    <div className={`absolute -top-2 -right-2 w-8 h-8 ${colorClasses[stat.color].split(' ')[0]}/20 rounded-full animate-ping`}></div>
                    <div className={`absolute top-2 left-2 w-4 h-4 ${colorClasses[stat.color].split(' ')[0]}/30 rounded-full animate-pulse`} style={{animationDelay: '1s'}}></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Premium CTA Section - AURA++++ */}
        <div className="relative text-center px-4" data-animate id="cta">
          <div className={`transform transition-all duration-1000 delay-500 ${isVisible['cta'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-slate-800/50 via-slate-700/30 to-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-3xl p-8 lg:p-12 shadow-2xl">
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-2 rounded-full border border-blue-400/30">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-sm font-bold text-white">PREMIUM EXPERIENCE</span>
                  </div>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text mb-6 font-heading tracking-tight leading-tight">
                  {isAuthenticated() ? 'UNLEASH YOUR POTENTIAL' : 'JOIN THE ELITE'}
                </h2>
                <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 mb-8 font-medium max-w-3xl mx-auto leading-relaxed">
                  {isAuthenticated() 
                    ? 'Your transformation awaits. Access your personalized dashboard and dominate your fitness goals with AI-powered insights.' 
                    : 'Transform your body, elevate your mind. Join thousands of elite athletes already crushing their goals with our premium platform.'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <button
                  onClick={() => navigate(isAuthenticated() ? '/dashboard' : '/register')}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white font-black text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 rounded-2xl hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 border border-blue-400/30 w-full sm:w-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 tracking-wide uppercase flex items-center justify-center gap-2">
                    {isAuthenticated() ? '🚀 ENTER DASHBOARD' : '⚡ START DOMINATING'}
                  </span>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                </button>
                
                {!isAuthenticated() && (
                  <button
                    onClick={() => navigate('/features')}
                    className="group relative overflow-hidden bg-transparent text-white font-bold text-lg px-8 py-4 rounded-2xl border-2 border-slate-600 hover:border-blue-400 transition-all duration-300 w-full sm:w-auto"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      📋 VIEW FEATURES
                    </span>
                  </button>
                )}
              </div>
              
              {!isAuthenticated() && (
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-2 font-medium">Free forever • No credit card required • Join 15K+ elite athletes</p>
                  <div className="flex justify-center items-center gap-4 text-xs text-slate-500">
                    <span>✓ Real-time Analytics</span>
                    <span>✓ AI Coaching</span>
                    <span>✓ Community Access</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-20" data-animate id="testimonials">
          <div className={`transform transition-all duration-1000 delay-600 ${isVisible['testimonials'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-black text-transparent bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text mb-4 font-heading">
                ELITE TESTIMONIALS
              </h3>
              <p className="text-slate-400">What our champions are saying</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Sarah M.', role: 'Professional Athlete', text: 'GymTracker revolutionized my training. The AI insights are incredible!', rating: 5 },
                { name: 'Mike R.', role: 'Fitness Coach', text: 'Best fitness app I\'ve used. My clients love the real-time analytics.', rating: 5 },
                { name: 'Emma L.', role: 'Fitness Enthusiast', text: 'Finally achieved my goals with this amazing platform. Highly recommended!', rating: 5 }
              ].map((testimonial, index) => (
                <div key={index} className="bg-gradient-to-br from-slate-800/40 via-slate-700/20 to-slate-800/40 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6 hover:border-blue-400/40 transition-all duration-500">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">⭐</span>
                    ))}
                  </div>
                  <p className="text-slate-300 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Real-time Notifications */}
      {notification && (
        <RealTimeNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}