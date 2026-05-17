// frontend/src/components/ParticleBackground.jsx
import React from 'react';

export default function ParticleBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Animated background dots */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-red-600/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10" />
    </div>
  );
}
