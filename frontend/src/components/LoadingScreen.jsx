import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + 1.8;
        
        if (newProgress >= 20 && currentPhase === 0) setCurrentPhase(1);
        if (newProgress >= 40 && currentPhase === 1) setCurrentPhase(2);
        if (newProgress >= 60 && currentPhase === 2) setCurrentPhase(3);
        if (newProgress >= 80 && currentPhase === 3) setCurrentPhase(4);
        if (newProgress >= 95 && currentPhase === 4) setCurrentPhase(5);
        
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onLoadingComplete?.(), 400);
          }, 300);
          return 100;
        }
        return newProgress;
      });
    }, 40);

    return () => clearInterval(progressInterval);
  }, [onLoadingComplete, currentPhase]);

  const phases = [
    { text: 'LOADING GRIND-X', color: 'from-orange-400 to-red-500', glow: 'rgba(251,146,60,0.4)' },
    { text: 'INITIALIZING WORKOUTS', color: 'from-red-500 to-orange-600', glow: 'rgba(239,68,68,0.4)' },
    { text: 'SYNCING PROGRESS', color: 'from-amber-400 to-orange-500', glow: 'rgba(245,158,11,0.4)' },
    { text: 'LOADING EXERCISES', color: 'from-orange-500 to-red-600', glow: 'rgba(249,115,22,0.4)' },
    { text: 'PREPARING TRACKER', color: 'from-red-400 to-amber-500', glow: 'rgba(248,113,113,0.4)' },
    { text: 'GRIND-X READY', color: 'from-amber-300 to-orange-400', glow: 'rgba(252,211,77,0.5)' }
  ];

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[99999] flex items-center justify-center transition-all duration-600 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
         style={{
           background: 'linear-gradient(135deg, #2d1b0e 0%, #1a0f08 25%, #3d2817 50%, #1f1209 75%, #2d1b0e 100%)',
           filter: 'contrast(1.2) saturate(0.9) brightness(1.05)'
         }}>
      
      {/* Enhanced Film Grain Overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, #fb923c 0%, transparent 50%), 
                         radial-gradient(circle at 75% 75%, #f97316 0%, transparent 50%),
                         radial-gradient(circle at 50% 50%, #ea580c 0%, transparent 30%)`,
        mixBlendMode: 'soft-light'
      }} />
      
      {/* Subtle Dust Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-orange-300/50 animate-pulse"
            style={{
              left: `${15 + (i * 15)}%`,
              top: `${25 + (i * 8)}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: '4s'
            }}
          />
        ))}
      </div>
      
      <div className="text-center px-8 max-w-lg mx-auto">
        {/* Raw Logo Section */}
        <div className="relative mb-16">
          {/* Industrial Glow */}
          <div 
            className="absolute inset-0 -m-10 rounded-full blur-3xl transition-all duration-1000"
            style={{
              background: `radial-gradient(circle, ${phases[currentPhase]?.glow} 0%, rgba(251,146,60,0.2) 40%, transparent 70%)`,
              filter: 'contrast(1.3) brightness(1.2)'
            }}
          />
          
          {/* Logo with Gritty Effects */}
          <div className="relative z-10">
            <img 
              src={logo} 
              alt="Gym Tracker" 
              className="w-24 h-24 sm:w-28 sm:h-28 mx-auto object-contain transition-all duration-400"
              style={{
                filter: `brightness(1.2) contrast(1.2) sepia(0.2) saturate(0.9) drop-shadow(0 0 20px ${phases[currentPhase]?.glow})`,
                transform: `scale(${0.9 + (loadingProgress / 100) * 0.2})`
              }}
              loading="eager"
            />
          </div>
          
          {/* Industrial Orbiting Elements */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '12s' }}>
            <div className="absolute top-0 left-1/2 w-2 h-2 transform -translate-x-1/2 -translate-y-12" style={{ 
              background: 'linear-gradient(45deg, #fb923c, #ea580c)', 
              boxShadow: '0 0 12px rgba(251,146,60,0.9)',
              borderRadius: '1px'
            }} />
            <div className="absolute bottom-0 left-1/2 w-2 h-2 transform -translate-x-1/2 translate-y-12" style={{ 
              background: 'linear-gradient(45deg, #f97316, #dc2626)', 
              boxShadow: '0 0 12px rgba(249,115,22,0.9)',
              borderRadius: '1px'
            }} />
          </div>
        </div>
        
        {/* Raw Phase Text */}
        <div className="mb-12">
          <div 
            className="text-2xl sm:text-3xl font-black mb-4 transition-all duration-800 tracking-wider text-orange-200"
            style={{
              textShadow: `0 0 15px ${phases[currentPhase]?.glow}`,
              fontFamily: 'monospace',
              letterSpacing: '2px',
              filter: 'brightness(1.1) contrast(1.05)'
            }}
          >
            {phases[currentPhase]?.text}
          </div>
          
          <div className="text-orange-300/70 text-sm font-mono tracking-widest uppercase" style={{
            textShadow: '0 0 10px rgba(251,146,60,0.3)'
          }}>
            POWERING UP YOUR FITNESS...
          </div>
        </div>
        
        {/* Industrial Progress Bar */}
        <div className="w-80 sm:w-96 mx-auto">
          <div className="h-3 bg-zinc-900/90 rounded-sm overflow-hidden border border-orange-800/60 relative" style={{
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.7), 0 0 10px rgba(251,146,60,0.2)'
          }}>
            <div 
              className="h-full rounded-sm transition-all duration-300 ease-out relative"
              style={{ 
                width: `${loadingProgress}%`,
                background: `linear-gradient(90deg, ${phases[currentPhase]?.color.split(' ')[1]}, ${phases[currentPhase]?.color.split(' ')[3]})`,
                boxShadow: `0 0 15px ${phases[currentPhase]?.glow}, inset 0 1px 2px rgba(255,255,255,0.2)`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" style={{ animationDuration: '2s' }} />
            </div>
          </div>
          
          {/* Raw Progress Indicators */}
          <div className="flex justify-between items-center mt-6">
            <span className="text-xs font-mono text-orange-400/90 tracking-widest uppercase">LOADING</span>
            <span 
              className="text-xl font-black font-mono tracking-wider"
              style={{
                color: '#fb923c',
                textShadow: `0 0 20px ${phases[currentPhase]?.glow}`,
                filter: 'contrast(1.3) brightness(1.1)'
              }}
            >
              {Math.round(loadingProgress)}%
            </span>
            <span className="text-xs font-mono text-red-400/90 tracking-widest uppercase">TRACKER</span>
          </div>
        </div>
        
        {/* Industrial Loading Indicators */}
        <div className="flex justify-center space-x-4 mt-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 transition-all duration-300"
              style={{
                background: `linear-gradient(45deg, ${phases[currentPhase]?.glow}, rgba(251,146,60,0.5))`,
                boxShadow: `0 0 8px ${phases[currentPhase]?.glow}`,
                animation: `pulse 2s infinite`,
                animationDelay: `${i * 0.4}s`,
                borderRadius: '1px'
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Gritty Corner Shadows */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-amber-900/10 to-transparent" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-red-900/10 to-transparent" />
    </div>
  );
};

export default LoadingScreen;