import React from 'react';
import { motion } from 'framer-motion';

export default function NutritionParticles() {
  // Create floating nutrition-themed particles
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    emoji: ['🥗', '🍎', '🥑', '🥕', '🫐', '🍊', '🥦', '🍌', '🥬', '🍇'][i % 10],
    size: Math.random() * 20 + 15,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating nutrition icons */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute opacity-20 select-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: `${particle.size}px`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, -15, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {particle.emoji}
        </motion.div>
      ))}

      {/* Subtle gradient dots */}
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-green-400/20 to-blue-400/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [0.5, 1.2, 0.5],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Animated lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0.1)" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.1)" />
            <stop offset="100%" stopColor="rgba(147, 51, 234, 0.1)" />
          </linearGradient>
        </defs>
        {Array.from({ length: 3 }, (_, i) => (
          <motion.path
            key={`line-${i}`}
            d={`M${Math.random() * 100},${Math.random() * 100} Q${Math.random() * 100},${Math.random() * 100} ${Math.random() * 100},${Math.random() * 100}`}
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{
              duration: 8 + Math.random() * 4,
              delay: Math.random() * 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
}