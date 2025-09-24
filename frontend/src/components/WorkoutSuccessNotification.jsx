// Workout Success Notification Component
import React, { useState, useEffect } from 'react';

export default function WorkoutSuccessNotification({ message, onClose, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in-slide">
      <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md">
        <div className="text-2xl">🎉</div>
        <div className="flex-1">
          <div className="font-semibold">Workout Completed!</div>
          <div className="text-sm opacity-90">{message}</div>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-white hover:text-gray-200 text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
}