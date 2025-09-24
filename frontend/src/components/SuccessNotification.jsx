// Success Notification Component
import React, { useEffect, useState } from 'react';

const SuccessNotification = ({ message, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 translate-x-full opacity-0">
        <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md">
          <div className="text-2xl">✅</div>
          <div>
            <div className="font-semibold">Workout Completed!</div>
            <div className="text-sm text-green-100">{message}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all duration-300">
      <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md">
        <div className="text-2xl">✅</div>
        <div className="flex-1">
          <div className="font-semibold">Workout Completed!</div>
          <div className="text-sm text-green-100">{message}</div>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-green-100 hover:text-white text-xl ml-2"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default SuccessNotification;