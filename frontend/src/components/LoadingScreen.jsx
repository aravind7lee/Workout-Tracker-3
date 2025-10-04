import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + 1.6;
        
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
    }, 45);

    return () => clearInterval(progressInterval);
  }, [onLoadingComplete, currentPhase]);

  const phases = [
    { text: 'LOADING GYM TRACKER', glow: 'rgba(218,165,32,0.3)' },
    { text: 'INITIALIZING WORKOUTS', glow: 'rgba(205,133,63,0.3)' },
    { text: 'SYNCING PROGRESS', glow: 'rgba(184,134,11,0.3)' },
    { text: 'LOADING EXERCISES', glow: 'rgba(160,82,45,0.3)' },
    { text: 'PREPARING TRACKER', glow: 'rgba(139,69,19,0.3)' },
    { text: 'GYM TRACKER READY', glow: 'rgba(218,165,32,0.4)' }
  ];

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
         style={{
           background: 'linear-gradient(135deg, #1c1611 0%, #0f0c08 25%, #2a1f16 50%, #141007 75%, #1c1611 100%)',
           filter: 'contrast(1.15) saturate(0.7) sepia(0.15) brightness(0.95)'
         }}>
      
      <div className="text-center px-8 max-w-lg mx-auto">
        {/* Fight Club Logo Section */}
        <div className="relative mb-16">
          {/* Subtle Industrial Glow */}
          <div 
            className="absolute inset-0 -m-10 rounded-full blur-3xl transition-all duration-1000"
            style={{
              background: `radial-gradient(circle, ${phases[currentPhase]?.glow} 0%, rgba(218,165,32,0.1) 40%, transparent 70%)`,
              filter: 'contrast(1.1) brightness(1.05) sepia(0.2)'
            }}
          />
          
          {/* Logo with Fight Club Grading */}
          <div className="relative z-10">
            <img 
              src={logo} 
              alt="Gym Tracker" 
              className="w-24 h-24 sm:w-28 sm:h-28 mx-auto object-contain transition-all duration-400"
              style={{
                filter: `brightness(1.1) contrast(1.25) sepia(0.25) saturate(0.75) drop-shadow(0 0 15px ${phases[currentPhase]?.glow})`,
                transform: `scale(${0.9 + (loadingProgress / 100) * 0.15})`
              }}
              loading="eager"
            />
          </div>
          
          {/* Muted Orbiting Elements */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '15s' }}>
            <div className="absolute top-0 left-1/2 w-2 h-2 transform -translate-x-1/2 -translate-y-12" style={{ 
              background: 'linear-gradient(45deg, #daa520, #b8860b)', 
              boxShadow: '0 0 8px rgba(218,165,32,0.6)',
              borderRadius: '1px'
            }} />
            <div className="absolute bottom-0 left-1/2 w-2 h-2 transform -translate-x-1/2 translate-y-12" style={{ 
              background: 'linear-gradient(45deg, #cd853f, #8b4513)', 
              boxShadow: '0 0 8px rgba(205,133,63,0.6)',
              borderRadius: '1px'
            }} />
          </div>
        </div>
        
        {/* Fight Club Typography */}
        <div className="mb-12">
          <div 
            className="text-2xl sm:text-3xl font-black mb-4 transition-all duration-800 tracking-wider"
            style={{
              color: '#d4af37',
              textShadow: `0 0 12px ${phases[currentPhase]?.glow}, 0 2px 4px rgba(0,0,0,0.8)`,
              fontFamily: 'monospace',
              letterSpacing: '2px',
              filter: 'contrast(1.1) sepia(0.1) saturate(0.8)'
            }}
          >
            {phases[currentPhase]?.text}
          </div>
          
          <div className="text-sm font-mono tracking-widest uppercase" style={{
            color: '#b8860b',
            textShadow: '0 0 8px rgba(218,165,32,0.2), 0 1px 2px rgba(0,0,0,0.7)',
            opacity: 0.8
          }}>
            POWERING UP YOUR FITNESS...
          </div>
        </div>
        
        {/* Fight Club Progress Bar */}
        <div className="w-80 sm:w-96 mx-auto">
          <div className="h-3 bg-zinc-900/95 rounded-sm overflow-hidden border border-yellow-900/40 relative" style={{
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(218,165,32,0.15)'
          }}>
            <div 
              className="h-full rounded-sm transition-all duration-300 ease-out relative"
              style={{ 
                width: `${loadingProgress}%`,
                background: 'linear-gradient(90deg, #daa520, #b8860b)',
                boxShadow: `0 0 12px ${phases[currentPhase]?.glow}, inset 0 1px 2px rgba(255,255,255,0.1)`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse" style={{ animationDuration: '2.5s' }} />
            </div>
          </div>
          
          {/* Muted Progress Indicators */}
          <div className="flex justify-between items-center mt-6">
            <span className="text-xs font-mono tracking-widest uppercase" style={{ color: '#b8860b', opacity: 0.9 }}>LOADING</span>
            <span 
              className="text-xl font-black font-mono tracking-wider"
              style={{
                color: '#daa520',
                textShadow: `0 0 15px ${phases[currentPhase]?.glow}, 0 2px 4px rgba(0,0,0,0.6)`,
                filter: 'contrast(1.15) sepia(0.1)'
              }}
            >
              {Math.round(loadingProgress)}%
            </span>
            <span className="text-xs font-mono tracking-widest uppercase" style={{ color: '#8b7355', opacity: 0.9 }}>TRACKER</span>
          </div>
        </div>
        
        {/* Subtle Loading Dots */}
        <div className="flex justify-center space-x-4 mt-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 transition-all duration-300"
              style={{
                background: `linear-gradient(45deg, ${phases[currentPhase]?.glow}, rgba(218,165,32,0.4))`,
                boxShadow: `0 0 6px ${phases[currentPhase]?.glow}`,
                animation: `pulse 2.5s infinite`,
                animationDelay: `${i * 0.5}s`,
                borderRadius: '1px'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;