import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Ultra-smooth 120fps loading with premium progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Add fade-out delay before calling completion
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
              onLoadingComplete?.();
            }, 300); // Wait for fade-out animation
          }, 200);
          return 100;
        }
        return prev + 0.8;
      });
    }, 24); // 3000ms / 125 steps = 24ms per step (120fps)

    return () => {
      clearInterval(progressInterval);
    };
  }, [onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-900 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="text-center px-8">
        {/* Logo Container */}
        <div className="relative mb-8">
          {/* Glow Effect */}
          <div className="absolute inset-0 -m-6 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-red-500/20 rounded-full blur-2xl animate-pulse" />
          
          {/* Logo */}
          <img 
            src="/logo.png" 
            alt="Workout Tracker Logo" 
            className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto object-contain filter drop-shadow-2xl"
            style={{ 
              filter: `brightness(1.3) contrast(1.2) drop-shadow(0 0 20px rgba(59,130,246,0.4))`,
              transform: `scale(${0.8 + (loadingProgress / 100) * 0.3})`
            }}
            onLoad={() => console.log('Logo loaded successfully')}
          />
          
          {/* Orbiting Dots */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-6" />
            <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-red-400 rounded-full transform -translate-x-1/2 translate-y-6" />
            <div className="absolute left-0 top-1/2 w-2 h-2 bg-green-400 rounded-full transform -translate-x-6 -translate-y-1/2" />
            <div className="absolute right-0 top-1/2 w-2 h-2 bg-purple-400 rounded-full transform translate-x-6 -translate-y-1/2" />
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="mb-6">
          <div className="text-white text-xl sm:text-2xl font-black mb-2" style={{
            textShadow: '0 0 20px rgba(255,255,255,0.5)'
          }}>
            🔥 UNLEASHING BEAST MODE 🔥
          </div>
          
          <div className="text-slate-400 text-sm font-medium tracking-wide">
            {loadingProgress < 25 && '🔥 Igniting Power Systems...'}
            {loadingProgress >= 25 && loadingProgress < 50 && '💪 Calibrating Strength Metrics...'}
            {loadingProgress >= 50 && loadingProgress < 75 && '🎯 Optimizing Performance Engine...'}
            {loadingProgress >= 75 && loadingProgress < 95 && '🚀 Finalizing Elite Protocols...'}
            {loadingProgress >= 95 && '✨ Ready to Dominate!'}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-72 sm:w-80 mx-auto">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-full transition-all duration-100 ease-out relative"
              style={{ width: `${loadingProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-3 text-xs font-mono">
            <span className="text-slate-500">PROGRESS</span>
            <span className="text-white font-bold text-base">
              {Math.round(loadingProgress)}%
            </span>
            <span className="text-slate-500">ELITE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;