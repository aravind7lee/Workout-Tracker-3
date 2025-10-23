// PR Notification Component - Real-time PR alerts
import React, { useState, useEffect } from 'react';

export default function PRNotification() {
  const [prAlert, setPrAlert] = useState(null);

  useEffect(() => {
    const handleNewPR = (event) => {
      const { exerciseName, newPRs } = event.detail;
      setPrAlert({ exerciseName, newPRs });

      // Auto-hide after 6 seconds
      setTimeout(() => {
        setPrAlert(null);
      }, 6000);
    };

    window.addEventListener('newPRRecord', handleNewPR);
    return () => window.removeEventListener('newPRRecord', handleNewPR);
  }, []);

  if (!prAlert) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white p-6 rounded-xl shadow-2xl animate-bounce max-w-sm border-2 border-yellow-300">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">🏆</div>
        <div className="text-2xl font-bold mb-2 text-yellow-100">NEW PR!</div>
        <div className="text-lg font-semibold mb-4 text-white">{prAlert.exerciseName}</div>
        
        <div className="space-y-2 mb-4">
          {prAlert.newPRs.map((pr, index) => (
            <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
              <div className="font-bold text-yellow-100">{pr.type}</div>
              <div className="text-xl font-bold text-white">{pr.value}{pr.unit}</div>
              <div className="text-sm text-yellow-200">
                +{pr.improvement}{pr.unit} improvement!
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-sm font-semibold text-yellow-200 animate-pulse">
          🎉 Outstanding Achievement! 🎉
        </div>
        
        <button
          onClick={() => setPrAlert(null)}
          className="mt-3 text-xs text-white/80 hover:text-white underline"
        >
          Click to dismiss
        </button>
      </div>
    </div>
  );
}