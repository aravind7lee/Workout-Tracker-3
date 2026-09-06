import React, { useEffect, useState } from 'react';
import { Timer, X, Plus, Minus, Play, Pause, SkipForward } from 'lucide-react';

export default function RestTimerFloatingBar({ restTimeSeconds, onFinished, onClose }) {
  const [timeLeft, setTimeLeft] = useState(restTimeSeconds || 60);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    setTimeLeft(restTimeSeconds || 60);
    setIsRunning(true);
  }, [restTimeSeconds]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onFinished) onFinished();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onFinished]);

  const addTime = (seconds) => {
    setTimeLeft((prev) => Math.max(0, prev + seconds));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (timeLeft / (restTimeSeconds || 60)) * 100));

  return (
    <div className="fixed bottom-6 right-6 z-40 bg-neutral-900/95 border border-orange-500/40 rounded-2xl shadow-2xl backdrop-blur-md p-4 w-72 max-w-[calc(100vw-3rem)] animate-slideUp">
      <div className="flex items-center justify-between mb-2 pt-1">
        <div className="flex items-center gap-2 text-orange-500 font-semibold text-xs uppercase tracking-wider">
          <Timer className="w-4 h-4 animate-pulse" />
          Rest Timer
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
          title="Close Rest Timer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between my-2">
        <div className="relative grid h-20 w-20 place-items-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#262626" strokeWidth="6" />
            <circle cx="40" cy="40" r="34" fill="none" stroke="#f97316" strokeWidth="6" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - progressPercent} className="transition-all duration-1000 ease-linear" />
          </svg>
          <span className="text-xl font-black font-mono text-white tracking-tight">{formatTime(timeLeft)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-colors"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white rounded-xl transition-colors"
            title="Skip Rest"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800 text-xs">
        <button onClick={onClose} className="flex-1 py-1 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium text-center transition-colors">Skip Rest</button>
        <button
          onClick={() => addTime(15)}
          className="flex-1 py-1 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium text-center transition-colors"
        >
          +15s
        </button>
        <button
          onClick={() => addTime(30)}
          className="flex-1 py-1 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium text-center transition-colors"
        >
          +30s
        </button>
      </div>
    </div>
  );
}
