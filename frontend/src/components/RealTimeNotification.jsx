// Real-time notification component for instant feedback
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RealTimeNotification({ message, type = 'success', onClose, duration = 4000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '🎉';
      case 'workout': return '💪';
      case 'xp': return '⭐';

      case 'sync': return '🔄';
      default: return '✅';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success': return 'from-red-600/20 to-red-600/20 border-red-600/30';
      case 'workout': return 'from-red-600/20 to-red-600/20 border-red-600/30';
      case 'xp': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';

      case 'sync': return 'from-red-700/20 to-red-700/20 border-red-700/30';
      default: return 'from-gray-500/20 to-neutral-500/20 border-gray-500/30';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed top-24 right-4 z-50 max-w-sm bg-gradient-to-r ${getColors()} backdrop-blur-sm border rounded-lg p-4 shadow-2xl`}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
              className="text-2xl"
            >
              {getIcon()}
            </motion.div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm leading-tight">
                {message}
              </p>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="text-white/70 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
          
          {/* Progress bar */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}