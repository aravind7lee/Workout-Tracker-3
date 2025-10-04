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
    { text: 'LOADING GRIND-X', color: 'from-blue-400 to-purple-500', glow: 'rgba(59,130,246,0.4)' },
    { text: 'INITIALIZING WORKOUTS', color: 'from-purple-500 to-blue-600', glow: 'rgba(139,92,246,0.4)' },
    { text: 'SYNCING PROGRESS', color: 'from-cyan-400 to-blue-500', glow: 'rgba(6,182,212,0.4)' },
    { text: 'LOADING EXERCISES', color: 'from-blue-500 to-purple-600', glow: 'rgba(59,130,246,0.4)' },
    { text: 'PREPARING TRACKER', color: 'from-purple-400 to-cyan-500', glow: 'rgba(139,92,246,0.4)' },
    { text: 'GRIND-X READY', color: 'from-cyan-300 to-blue-400', glow: 'rgba(6,182,212,0.5)' }
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
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-600 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
         style={{
           background: 'linear-gradient(135deg, #050810 0%, #0f172a 25%, #1e293b 50%, #0f172a 75%, #050810 100%)',
           filter: 'contrast(1.1) saturate(1.1) brightness(1.0)'
         }}>
      
      <div className="text-center px-8 max-w-lg mx-auto">
        {/* Logo Section */}
        <div className="relative mb-16">
          <div 
            className="absolute inset-0 -m-10 rounded-full blur-3xl transition-all duration-1000"
            style={{
              background: `radial-gradient(circle, ${phases[currentPhase]?.glow} 0%, rgba(59,130,246,0.2) 40%, transparent 70%)`,
              filter: 'contrast(1.2) brightness(1.1)'
            }}
          />
          
          <div className="relative z-10">
            <img 
              src={logo} 
              alt="Gym Tracker" 
              className="w-24 h-24 sm:w-28 sm:h-28 mx-auto object-contain transition-all duration-400"
              style={{
                filter: `brightness(1.1) contrast(1.1) drop-shadow(0 0 20px ${phases[currentPhase]?.glow})`,
                transform: `scale(${0.9 + (loadingProgress / 100) * 0.2})`
              }}
              loading="eager"
            />
          </div>
          
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '12s' }}>
            <div className="absolute top-0 left-1/2 w-2 h-2 transform -translate-x-1/2 -translate-y-12 bg-blue-400 rounded-full" style={{ 
              boxShadow: '0 0 12px rgba(59,130,246,0.9)'
            }} />
            <div className="absolute bottom-0 left-1/2 w-2 h-2 transform -translate-x-1/2 translate-y-12 bg-purple-400 rounded-full" style={{ 
              boxShadow: '0 0 12px rgba(139,92,246,0.9)'
            }} />
          </div>
        </div>
        
        <div className="mb-12">
          <div 
            className="text-2xl sm:text-3xl font-black mb-4 transition-all duration-800 tracking-wider text-blue-200"
            style={{
              textShadow: `0 0 15px ${phases[currentPhase]?.glow}`,
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '1px'
            }}
          >
            {phases[currentPhase]?.text}
          </div>
          
          <div className="text-blue-300/70 text-sm font-medium tracking-wide uppercase">
            POWERING UP YOUR FITNESS...
          </div>
        </div>
        
        <div className="w-80 sm:w-96 mx-auto">
          <div className="h-3 bg-slate-800/90 rounded-full overflow-hidden border border-blue-500/30 relative">
            <div 
              className="h-full rounded-full transition-all duration-300 ease-out relative"
              style={{ 
                width: `${loadingProgress}%`,
                background: `linear-gradient(90deg, ${phases[currentPhase]?.color.split(' ')[1]}, ${phases[currentPhase]?.color.split(' ')[3]})`,
                boxShadow: `0 0 15px ${phases[currentPhase]?.glow}`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" style={{ animationDuration: '2s' }} />
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <span className="text-xs font-medium text-blue-400/90 tracking-wide uppercase">LOADING</span>
            <span 
              className="text-xl font-black tracking-wide"
              style={{
                color: '#60a5fa',
                textShadow: `0 0 20px ${phases[currentPhase]?.glow}`
              }}
            >
              {Math.round(loadingProgress)}%
            </span>
            <span className="text-xs font-medium text-purple-400/90 tracking-wide uppercase">TRACKER</span>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4 mt-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 bg-blue-400 rounded-full transition-all duration-300"
              style={{
                boxShadow: `0 0 8px ${phases[currentPhase]?.glow}`,
                animation: `pulse 2s infinite`,
                animationDelay: `${i * 0.4}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;