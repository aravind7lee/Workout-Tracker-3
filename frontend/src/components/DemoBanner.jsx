// Demo Banner Component - Fixed
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { demoService } from '../services/demoService';

const DemoBanner = () => {
  const navigate = useNavigate();

  if (!demoService.isDemoMode()) {
    return null;
  }

  const handleCreateAccount = () => {
    demoService.clearDemoSession();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/register');
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-xl shadow-2xl border border-green-500/30">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🚀</div>
          <div className="flex-1">
            <div className="font-bold text-sm">Demo Mode Active</div>
            <div className="text-xs opacity-90">You're exploring GymTracker with sample data</div>
          </div>
          <button
            onClick={handleCreateAccount}
            className="px-3 py-1 bg-white text-green-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;