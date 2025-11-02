// frontend/src/pages/MyPlans.jsx - REAL-TIME MONGODB INTEGRATION
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PlanDetailsModal from '../components/PlanDetailsModal';
import WorkoutPlanBuilderHeader from '../components/WorkoutPlanBuilderHeader';
import AuthGuard from '../components/AuthGuard';
import { realTimePlanService } from '../services/realTimePlanService';
import { useAuth } from '../context/AuthContext';

export default function MyPlans() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navbarSearch = searchParams.get('search') || '';
  const highlightPlan = searchParams.get('highlight') || '';
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchQuery, setSearchQuery] = useState(navbarSearch);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSync, setLastSync] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState({ isOnline: false, totalPlans: 0 });
  
  // Filter plans based on search
  const filteredPlans = useMemo(() => {
    if (!searchQuery) return savedPlans;
    return savedPlans.filter(plan => 
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.exercises.some(exercise => 
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [savedPlans, searchQuery]);
  
  // Update search when navbar search parameter changes
  useEffect(() => {
    if (navbarSearch && navbarSearch !== searchQuery) {
      setSearchQuery(navbarSearch);
    }
  }, [navbarSearch]);
  
  // Real-time data loading with instant updates - USER SPECIFIC
  useEffect(() => {
    if (!user) {
      console.log('🔒 No authenticated user - clearing plans');
      setSavedPlans([]);
      setLoading(false);
      return;
    }
    
    // Clean fake plans on mount
    const cleanFakePlans = () => {
      try {
        const allPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
        const userPlans = allPlans.filter(plan => 
          plan.userId === user.id || plan.userId === user._id
        );
        if (userPlans.length !== allPlans.length) {
          localStorage.setItem('workoutPlans', JSON.stringify(userPlans));
          console.log(`🧹 Cleaned plans: ${allPlans.length} → ${userPlans.length}`);
        }
      } catch (error) {
        console.warn('Error cleaning fake plans:', error);
      }
    };
    
    cleanFakePlans();
    loadRealTimePlans();
    
    // Listen for real-time plan events
    const handlePlanCreated = (data) => {
      console.log('🚀 My Plans - Plan Created:', data.plan.name);
      setSavedPlans(prev => [data.plan, ...prev]);
      updateRealTimeStats();
    };
    
    const handlePlanDeleted = (data) => {
      console.log('🗑️ My Plans - Plan Deleted:', data.planId);
      setSavedPlans(prev => prev.filter(p => p.id !== data.planId));
      updateRealTimeStats();
    };
    
    const handlePlanSynced = (data) => {
      console.log('☁️ My Plans - Plan Synced:', data.realPlan.name);
      setSavedPlans(prev => prev.map(p => 
        p.id === data.tempId ? data.realPlan : p
      ));
      updateRealTimeStats();
    };
    
    const handleSyncComplete = () => {
      console.log('✅ My Plans - Sync Complete');
      loadRealTimePlans();
    };
    
    // Subscribe to real-time events
    realTimePlanService.on('planCreated', handlePlanCreated);
    realTimePlanService.on('planDeleted', handlePlanDeleted);
    realTimePlanService.on('planSynced', handlePlanSynced);
    realTimePlanService.on('syncComplete', handleSyncComplete);
    
    return () => {
      realTimePlanService.off('planCreated', handlePlanCreated);
      realTimePlanService.off('planDeleted', handlePlanDeleted);
      realTimePlanService.off('planSynced', handlePlanSynced);
      realTimePlanService.off('syncComplete', handleSyncComplete);
    };
  }, [user]);

  useEffect(() => {
    loadRealTimePlans();
  }, [highlightPlan]);

  const loadRealTimePlans = async () => {
    if (!user) {
      console.log('🔒 No authenticated user - cannot load plans');
      setSavedPlans([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setSyncStatus('syncing');
    try {
      console.log(`🚀 Loading USER-SPECIFIC plans for ${user.id}...`);
      
      // Load plans using real-time service (already user-filtered)
      const plans = await realTimePlanService.getPlans();
      
      // STRICT user filtering - only plans with matching userId
      const userPlans = plans.filter(plan => {
        const belongsToUser = plan.userId === user.id || plan.userId === user._id;
        if (!belongsToUser) {
          console.log(`🗑️ Filtering out plan: "${plan.name}" (userId: ${plan.userId}, user: ${user.id})`);
        }
        return belongsToUser;
      });
      
      setSavedPlans(userPlans);
      
      // Update real-time stats
      updateRealTimeStats();
      
      setLastSync(new Date());
      setSyncStatus('synced');
      
      console.log(`✅ USER-SPECIFIC plans loaded for ${user.id}:`, userPlans.length);
      
      // Auto-hide sync status
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('❌ Failed to load user-specific plans:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    } finally {
      setLoading(false);
    }
  };
  
  const updateRealTimeStats = () => {
    const stats = realTimePlanService.getPlanStats();
    setRealTimeStats(stats);
  };

  const syncPlansWithBackend = async () => {
    if (!user) return;
    
    setSyncStatus('syncing');
    try {
      console.log('🔄 Force syncing all plans...');
      
      const result = await realTimePlanService.forceSync();
      
      if (result.success) {
        // Reload plans after sync
        const plans = await realTimePlanService.getPlans(true);
        setSavedPlans(plans);
        updateRealTimeStats();
        
        setLastSync(new Date());
        setSyncStatus('synced');
        
        console.log('✅ Force sync completed:', result.planCount, 'plans');
      } else {
        throw new Error(result.error || 'Sync failed');
      }
      
      // Auto-hide sync status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('❌ Sync failed:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  };

  const deletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        console.log('🗑️ Deleting plan with REAL-TIME update:', planId);
        
        // Use real-time service for instant deletion
        const success = await realTimePlanService.deletePlan(planId);
        
        if (success) {
          console.log('✅ Plan deleted with REAL-TIME dashboard update');
        } else {
          throw new Error('Failed to delete plan');
        }
      } catch (error) {
        console.error('❌ Error deleting plan:', error);
        alert('Failed to delete plan. Please try again.');
      }
    }
  };

  const duplicatePlan = async (plan) => {
    try {
      console.log('📋 Duplicating plan with REAL-TIME update:', plan.name);
      
      // Use real-time service for instant duplication
      const duplicatedPlan = await realTimePlanService.duplicatePlan(plan);
      
      if (duplicatedPlan) {
        console.log('✅ Plan duplicated with REAL-TIME dashboard update:', duplicatedPlan.name);
      } else {
        throw new Error('Failed to duplicate plan');
      }
    } catch (error) {
      console.error('❌ Error duplicating plan:', error);
      alert('Failed to duplicate plan. Please try again.');
    }
  };



  return (
    <AuthGuard>
      <div className="workout-builder-section">
      {/* My Plans Hero Header - Full Viewport */}
      <WorkoutPlanBuilderHeader />
      
      <div id="plans-content" className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Modern Gym Header Section */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title & Status Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">💪</span>
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                    My Workout Plans
                  </h2>
                  <p className="text-slate-400 text-sm font-medium">Professional Gym Tracking</p>
                </div>
              </div>
              
              {/* Enhanced Real-time Status */}
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full border ${
                  realTimeStats.isOnline 
                    ? 'bg-green-900/30 border-green-500/50 text-green-300' 
                    : 'bg-red-900/30 border-red-500/50 text-red-300'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    realTimeStats.isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                  }`}></div>
                  <span className="text-xs font-semibold">
                    {realTimeStats.isOnline ? 'REAL-TIME' : 'OFFLINE'}
                  </span>
                </div>
                
                {/* Sync Status Badge */}
                {syncStatus !== 'idle' && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-medium ${
                    syncStatus === 'syncing' ? 'bg-blue-900/30 border-blue-500/50 text-blue-300' :
                    syncStatus === 'synced' ? 'bg-green-900/30 border-green-500/50 text-green-300' :
                    'bg-red-900/30 border-red-500/50 text-red-300'
                  }`}>
                    {syncStatus === 'syncing' && (
                      <>
                        <div className="w-3 h-3 border border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                        <span>Syncing...</span>
                      </>
                    )}
                    {syncStatus === 'synced' && (
                      <>
                        <span className="text-green-400">✓</span>
                        <span>Synced</span>
                      </>
                    )}
                    {syncStatus === 'error' && (
                      <>
                        <span className="text-red-400">⚠</span>
                        <span>Sync Failed</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Stats Display */}
              <div className="flex items-center gap-4 px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{realTimeStats.totalPlans}</div>
                  <div className="text-xs text-slate-400">Total Plans</div>
                </div>
                <div className="w-px h-8 bg-slate-600"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{realTimeStats.syncedPlans || 0}</div>
                  <div className="text-xs text-slate-400">Synced</div>
                </div>
              </div>
              
              {/* Control Buttons */}
              <div className="flex gap-2">
                {user && (
                  <button
                    onClick={syncPlansWithBackend}
                    disabled={syncStatus === 'syncing'}
                    className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                    title="Force sync with MongoDB"
                  >
                    <span className={syncStatus === 'syncing' ? 'animate-spin' : ''}>
                      {syncStatus === 'syncing' ? '🔄' : '🔄'}
                    </span>
                    <span className="hidden sm:inline">
                      {syncStatus === 'syncing' ? 'Syncing...' : 'Force Sync'}
                    </span>
                  </button>
                )}
                
                <Link
                  to="/plans"
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                >
                  <span className="text-lg">+</span>
                  <span>Create New Plan</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      
        {/* Enhanced Search Bar */}
        {(savedPlans.length > 0 || searchQuery) && (
          <div className="relative">
            <div className="relative group">
              <input 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="w-full p-4 pl-12 pr-12 rounded-2xl bg-slate-800/60 border border-slate-600/50 text-white placeholder-slate-400 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 shadow-lg backdrop-blur-sm" 
                placeholder="Search your plans..." 
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-orange-400 transition-colors">
                <span className="text-lg">🔍</span>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700/50"
                >
                  <span className="text-lg">✕</span>
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 text-sm text-slate-400 flex items-center gap-2">
                <span>📊</span>
                <span>Showing {filteredPlans.length} of {savedPlans.length} plans</span>
              </div>
            )}
          </div>
        )}

        {searchQuery && filteredPlans.length === 0 && savedPlans.length > 0 ? (
          <div className="bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-900/60 border border-slate-700/50 rounded-2xl p-12 text-center shadow-2xl backdrop-blur-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No Plans Found</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              No plans match "{searchQuery}". Try a different search term or create a new plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/60 border border-slate-600/50 text-slate-300 hover:text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>✕</span>
                <span>Clear Search</span>
              </button>
              <Link
                to="/plans"
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
              >
                <span>+</span>
                <span>Create New Plan</span>
              </Link>
            </div>
          </div>
        ) : savedPlans.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-900/60 border border-slate-700/50 rounded-2xl p-12 text-center shadow-2xl backdrop-blur-sm">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-5xl">{user ? '💪' : '🔒'}</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">
              {user ? 'Ready to Start Training?' : 'Login Required'}
            </h3>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto text-lg">
              {user 
                ? 'Create your first professional workout plan and start your fitness journey with our advanced gym tracking system.' 
                : 'Please login to access your personal workout plans and professional gym tracking features.'
              }
            </p>
            {user ? (
              <Link
                to="/plans"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
              >
                <span className="text-2xl">+</span>
                <span>Create Your First Plan</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
              >
                <span className="text-2xl">🔑</span>
                <span>Login to View Plans</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className={`group relative bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-900/60 border border-slate-700/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-500/30 hover:scale-[1.02] backdrop-blur-sm ${
                highlightPlan === plan.id ? 'ring-2 ring-orange-500 shadow-2xl shadow-orange-500/20 scale-105 border-orange-500/50' : ''
              }`}>
                {/* Enhanced Sync Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  {plan.synced ? (
                    <div className="bg-green-900/40 border border-green-500/50 text-green-300 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 font-medium shadow-lg backdrop-blur-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Synced</span>
                    </div>
                  ) : (
                    <div className="bg-yellow-900/40 border border-yellow-500/50 text-yellow-300 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 font-medium shadow-lg backdrop-blur-sm">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>Local</span>
                    </div>
                  )}
                </div>
                
                {/* Plan Header */}
                <div className="mb-6 pt-2">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-16">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">
                        {plan.name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-slate-300 font-medium">
                          {plan.exercises.length} {plan.exercises.length === 1 ? 'exercise' : 'exercises'}
                        </span>
                        <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                        <span className="text-orange-400 font-medium">{plan.category || 'General'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => duplicatePlan(plan)}
                      className="p-2 bg-slate-700/50 hover:bg-blue-600/20 border border-slate-600/50 hover:border-blue-500/50 text-slate-400 hover:text-blue-300 rounded-lg transition-all duration-200 group/btn"
                      title="Duplicate plan"
                    >
                      <span className="text-lg group-hover/btn:scale-110 transition-transform">📋</span>
                    </button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="p-2 bg-slate-700/50 hover:bg-red-600/20 border border-slate-600/50 hover:border-red-500/50 text-slate-400 hover:text-red-300 rounded-lg transition-all duration-200 group/btn"
                      title="Delete plan"
                    >
                      <span className="text-lg group-hover/btn:scale-110 transition-transform">🗑️</span>
                    </button>
                  </div>
                </div>

                {/* Exercise List */}
                <div className="space-y-3 mb-6">
                  {plan.exercises.slice(0, 3).map((exercise, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/30 rounded-xl hover:bg-slate-700/40 transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{exercise.name}</div>
                        <div className="text-slate-400 text-sm font-medium">{exercise.sets}</div>
                      </div>
                    </div>
                  ))}
                  {plan.exercises.length > 3 && (
                    <button
                      onClick={() => setSelectedPlan(plan)}
                      className="w-full p-3 bg-slate-700/30 hover:bg-slate-600/40 border border-slate-600/50 hover:border-orange-500/50 text-slate-300 hover:text-orange-300 rounded-xl transition-all duration-200 text-sm font-medium"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span>+{plan.exercises.length - 3} more exercises</span>
                        <span className="text-orange-400">→</span>
                      </span>
                    </button>
                  )}
                </div>

                {/* Plan Meta Info */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-6 p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1">
                      <span>📅</span>
                      <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
                    </span>
                    {lastSync && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <span>🔄</span>
                        <span>Last sync: {lastSync.toLocaleTimeString()}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link
                    to={`/workout/${plan.id}`}
                    className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/60 border border-slate-600/50 hover:border-slate-500/50 text-slate-300 hover:text-white rounded-xl font-medium text-sm text-center transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span className="text-lg">🏋️</span>
                    <span>Start Workout</span>
                  </Link>
                  <Link
                    to={`/edit-plan/${plan.id}`}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-semibold text-sm text-center transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                  >
                    <span className="text-lg">✏️</span>
                    <span>Edit Plan</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}


        
        {/* Plan Details Modal */}
        {selectedPlan && (
          <PlanDetailsModal
            plan={selectedPlan}
            onClose={() => setSelectedPlan(null)}
          />
        )}
      </div>
    </div>
    </AuthGuard>
  );
}