// Simple Watch Form Video Button Component
import React from 'react';
import { getExerciseVideo } from '../data/exerciseVideos';

export default function WatchFormVideoButton({ exerciseName, className = '', size = 'md' }) {
  const videoUrl = getExerciseVideo(exerciseName);
  
  if (!videoUrl) return null;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
  };
  
  const handleClick = () => {
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg hover:shadow-xl active:scale-95 ${className}`}
      title={`Watch ${exerciseName} correct form video on YouTube`}
    >
      <span className="text-base">\ud83c\udfa5</span>
      <span>Watch Form Video</span>
    </button>
  );
}

// Compact version for cards
export function WatchFormVideoLink({ exerciseName, className = '' }) {
  const videoUrl = getExerciseVideo(exerciseName);
  
  if (!videoUrl) return null;
  
  const handleClick = () => {
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <button
      onClick={handleClick}
      className={`text-xs text-blue-400 hover:text-blue-300 underline flex items-center gap-1 transition-colors ${className}`}
      title={`Watch ${exerciseName} form video`}
    >
      <span>\ud83c\udfa5</span>
      <span>Form Video</span>
    </button>
  );
}
