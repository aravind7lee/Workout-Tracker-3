// Demo Feature Tracker Hook
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';

const DemoFeatureTracker = () => {
  const location = useLocation();
  const { isDemoMode, trackFeature } = useDemo();

  useEffect(() => {
    if (!isDemoMode) return;

    // Track page visits as features
    const featureMap = {
      '/dashboard': 'dashboard',
      '/library': 'exercise_library',
      '/my-plans': 'workout_plans',
      '/plans': 'plan_builder',
      '/nutrition': 'nutrition_tracking',
      '/analytics': 'progress_analytics',
      '/profile': 'profile_management'
    };

    const feature = featureMap[location.pathname];
    if (feature) {
      trackFeature(feature);
    }
  }, [location.pathname, isDemoMode, trackFeature]);

  return null;
};

export default DemoFeatureTracker;