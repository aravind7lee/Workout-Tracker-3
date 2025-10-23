// Custom hook for PR tracking across the entire website
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PRService from '../services/prService';

export const usePRTracking = () => {
  const { user } = useAuth();
  const [userPRs, setUserPRs] = useState({});
  const [recentPRs, setRecentPRs] = useState([]);

  useEffect(() => {
    if (user?.id) {
      // Load user's PRs
      const prs = PRService.getUserPRs(user.id);
      setUserPRs(prs);
    }
  }, [user?.id]);

  useEffect(() => {
    const handleNewPR = (event) => {
      const { userId, exerciseName, newPRs, updatedPR } = event.detail;
      
      if (userId === user?.id) {
        // Update user PRs
        setUserPRs(prev => ({
          ...prev,
          [exerciseName]: updatedPR
        }));
        
        // Add to recent PRs
        setRecentPRs(prev => [
          {
            exerciseName,
            newPRs,
            timestamp: new Date().toISOString()
          },
          ...prev.slice(0, 9) // Keep last 10 PRs
        ]);
      }
    };

    window.addEventListener('newPRRecord', handleNewPR);
    return () => window.removeEventListener('newPRRecord', handleNewPR);
  }, [user?.id]);

  const getPRForExercise = (exerciseName) => {
    return userPRs[exerciseName.toLowerCase()] || null;
  };

  const checkIfNewPR = (exerciseName, weight, reps, volume) => {
    const currentPR = getPRForExercise(exerciseName);
    if (!currentPR) return true; // First time doing this exercise
    
    return (
      weight > (currentPR.maxWeight || 0) ||
      reps > (currentPR.maxReps || 0) ||
      volume > (currentPR.totalVolume || 0)
    );
  };

  return {
    userPRs,
    recentPRs,
    getPRForExercise,
    checkIfNewPR
  };
};

export default usePRTracking;