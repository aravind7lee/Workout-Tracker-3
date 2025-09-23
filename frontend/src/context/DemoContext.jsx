// Demo Context for State Management
import React, { createContext, useContext, useState, useEffect } from 'react';
import { demoService } from '../services/demoService';

const DemoContext = createContext();

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};

export const DemoProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoSession, setDemoSession] = useState(null);
  const [featuresExplored, setFeaturesExplored] = useState([]);

  useEffect(() => {
    const checkDemoMode = () => {
      const isDemo = demoService.isDemoMode();
      setIsDemoMode(isDemo);
      
      if (isDemo) {
        const session = demoService.getDemoSession();
        setDemoSession(session);
        setFeaturesExplored(session?.featuresExplored || []);
      }
    };

    checkDemoMode();
    const interval = setInterval(checkDemoMode, 5000);
    return () => clearInterval(interval);
  }, []);

  const trackFeature = (feature) => {
    if (isDemoMode) {
      demoService.trackFeatureExplored(feature);
      setFeaturesExplored(prev => 
        prev.includes(feature) ? prev : [...prev, feature]
      );
    }
  };

  const exitDemo = () => {
    demoService.clearDemoSession();
    setIsDemoMode(false);
    setDemoSession(null);
    setFeaturesExplored([]);
  };

  const value = {
    isDemoMode,
    demoSession,
    featuresExplored,
    trackFeature,
    exitDemo,
    getRemainingTime: () => demoService.getRemainingTime()
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
};

export default DemoContext;