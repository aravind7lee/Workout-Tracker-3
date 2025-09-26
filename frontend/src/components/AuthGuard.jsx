// Professional authentication guard component
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthGuard } from '../hooks/useAuthGuard';

const AuthGuard = ({ children, showLoginPrompt = true }) => {
  const { isAuthenticated, loading, user } = useAuthGuard();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Checking authentication...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated && showLoginPrompt) {
    return (
      <motion.div 
        className="max-w-2xl mx-auto text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card p-8">
          <motion.div 
            className="text-6xl mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            🔒
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            Login Required for Real-Time Tracking
          </h2>
          
          <p className="text-slate-400 mb-6 leading-relaxed">
            To track your workouts, meals, and progress in real-time across all devices, 
            please log in to your GymTracker account.
          </p>
          
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-3">🏋️ Professional Features Available After Login:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-blue-400">📊</span>
                Real-time progress tracking
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">🍽️</span>
                Nutrition logging & analytics
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">📋</span>
                Custom workout plans
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-400">🏆</span>
                Achievement system
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">☁️</span>
                Cross-device synchronization
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">📈</span>
                Advanced analytics
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <motion.button
              onClick={() => navigate('/login')}
              className="btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔑 Login to Track Progress
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/register')}
              className="btn bg-green-600 hover:bg-green-700 text-white px-6 py-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🚀 Create Account
            </motion.button>
          </div>
          
          <p className="text-xs text-slate-500 mt-4">
            Your data will be securely stored and synced across all your devices
          </p>
        </div>
      </motion.div>
    );
  }

  if (!isAuthenticated && !showLoginPrompt) {
    return null;
  }

  return children;
};

export default AuthGuard;