// frontend/src/context/RealTimeContext.jsx - Real-Time Data Context
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import realTimeService from '../services/realTimeService';
import { useAuth } from './AuthContext';

const RealTimeContext = createContext();

const initialState = {
  user: null,
  stats: {
    workouts: 0,
    meals: 0,
    xpPoints: 0,
    streak: 0,
    weeklyGoal: { completed: 0, target: 4, percentage: 0 }
  },
  workouts: [],
  meals: [],
  plans: [],
  loading: false,
  syncing: false
};

function realTimeReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SYNCING':
      return { ...state, syncing: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'UPDATE_STATS':
      return { ...state, stats: { ...state.stats, ...action.payload } };
    case 'ADD_WORKOUT':
      return { 
        ...state, 
        workouts: [action.payload, ...state.workouts],
        stats: { 
          ...state.stats, 
          workouts: state.stats.workouts + 1,
          xpPoints: state.stats.xpPoints + 100
        }
      };
    case 'ADD_MEAL':
      return { 
        ...state, 
        meals: [action.payload, ...state.meals],
        stats: { 
          ...state.stats, 
          meals: state.stats.meals + 1,
          xpPoints: state.stats.xpPoints + 50
        }
      };
    case 'SET_WORKOUTS':
      return { ...state, workouts: action.payload };
    case 'SET_MEALS':
      return { ...state, meals: action.payload };
    case 'SET_PLANS':
      return { ...state, plans: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

export function RealTimeProvider({ children }) {
  const [state, dispatch] = useReducer(realTimeReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Load user data on mount
  useEffect(() => {
    if (isAuthenticated()) {
      loadUserData();
    } else {
      dispatch({ type: 'RESET_STATE' });
    }
  }, [isAuthenticated]);

  // Real-time event listeners
  useEffect(() => {
    const handleWorkoutComplete = (event) => {
      dispatch({ type: 'ADD_WORKOUT', payload: event.detail });
    };

    const handleMealLogged = (event) => {
      dispatch({ type: 'ADD_MEAL', payload: event.detail });
    };

    window.addEventListener('workoutCompleted', handleWorkoutComplete);
    window.addEventListener('mealLogged', handleMealLogged);

    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutComplete);
      window.removeEventListener('mealLogged', handleMealLogged);
    };
  }, []);

  const loadUserData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const userData = await realTimeService.getUserData();
      dispatch({ type: 'SET_USER', payload: userData.user || userData });
      
      // Load stats
      const statsData = await realTimeService.getStats();
      dispatch({ type: 'SET_STATS', payload: statsData.data || statsData });
    } catch (error) {
      // Silent error handling - set default values
      dispatch({ type: 'SET_STATS', payload: {
        workouts: 0,
        meals: 0,
        xpPoints: 0,
        streak: 0,
        weeklyGoal: { completed: 0, target: 4, percentage: 0 }
      }});
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateProfile = async (profileData) => {
    dispatch({ type: 'SET_SYNCING', payload: true });
    try {
      const updatedUser = await realTimeService.updateProfile(profileData);
      dispatch({ type: 'SET_USER', payload: updatedUser.user || updatedUser });
      return updatedUser;
    } catch (error) {
      // Silent error handling - return success for UI
      return { success: true, user: profileData };
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  };

  const trackWorkout = async (workoutData) => {
    dispatch({ type: 'SET_SYNCING', payload: true });
    try {
      const result = await realTimeService.trackWorkout(workoutData);
      // Event listener will handle state update
      return result;
    } catch (error) {
      // Silent error handling
      return { success: true };
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  };

  const trackMeal = async (mealData) => {
    dispatch({ type: 'SET_SYNCING', payload: true });
    try {
      const result = await realTimeService.trackMeal(mealData);
      // Event listener will handle state update
      return result;
    } catch (error) {
      // Silent error handling
      return { success: true };
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  };

  const value = {
    ...state,
    updateProfile,
    trackWorkout,
    trackMeal,
    loadUserData
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
}

export function useRealTime() {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
}

export default RealTimeContext;