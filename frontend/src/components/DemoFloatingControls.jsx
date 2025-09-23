// Demo Floating Controls Component
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Clock, Star, ArrowRight } from 'lucide-react';
import { demoService } from '../services/demoService';

const DemoFloatingControls = () => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [featuresExplored, setFeaturesExplored] = useState([]);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!demoService.isDemoMode()) return;

    const updateTimer = () => {
      const remaining = demoService.getRemainingTime();
      setTimeRemaining(remaining);
      
      const session = demoService.getDemoSession();
      if (session) {
        setFeaturesExplored(session.featuresExplored || []);
      }

      // Show upgrade prompt after 10 minutes or 3 features explored
      if (remaining < 50 * 60 * 1000 || featuresExplored.length >= 3) {
        setShowUpgrade(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [featuresExplored.length]);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleExitDemo = () => {
    demoService.clearDemoSession();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleUpgrade = () => {
    demoService.clearDemoSession();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/register');
  };

  if (!demoService.isDemoMode()) return null;

  return (
    <>
      {/* Demo Timer & Controls */}
      <div className="fixed top-20 right-4 z-50">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl shadow-2xl border border-blue-500/30 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Clock size={16} />
              <span className="text-sm font-mono">{formatTime(timeRemaining)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star size={16} />
              <span className="text-sm">{featuresExplored.length}/7</span>
            </div>
            <button
              onClick={handleExitDemo}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Exit Demo"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade Prompt */}
      {showUpgrade && (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-xl shadow-2xl border border-green-500/30">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🚀</div>
              <div className="flex-1">
                <div className="font-bold text-sm mb-1">Loving the demo?</div>
                <div className="text-xs opacity-90 mb-3">
                  Create your account to save progress and unlock all features!
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpgrade}
                    className="flex-1 bg-white text-green-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>Sign Up Free</span>
                    <ArrowRight size={12} />
                  </button>
                  <button
                    onClick={() => setShowUpgrade(false)}
                    className="px-3 py-2 text-white/80 hover:text-white text-xs"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DemoFloatingControls;