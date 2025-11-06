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
        {/* Compact Mobile Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-lg p-3 sm:p-4">
          <div className="space-y-3">
            {/* Compact Title Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg">💪</span>
                </div>
                <div>
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white">
                    My Workout Plans
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400">Professional Gym Tracking</p>
                </div>
              </div>
              
              <button
                onClick={syncPlansWithBackend}
                disabled={syncStatus === 'syncing'}
                className="p-1.5 bg-slate-700/50 text-slate-300 rounded-md text-xs"
              >
                🔄
              </button>
            </div>
            
            {/* Compact Status Bar */}
            <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2 border border-slate-600/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-300">REAL-TIME</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-sm lg:text-base font-bold text-white">{realTimeStats.totalPlans}</div>
                    <div className="text-xs lg:text-sm text-slate-400">Total Plans</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm lg:text-base font-bold text-green-400">{realTimeStats.syncedPlans || 0}</div>
                    <div className="text-xs lg:text-sm text-slate-400">Synced</div>
                  </div>
                </div>
              </div>
              
              {syncStatus !== 'idle' && (
                <div className="text-xs text-green-300 flex items-center gap-1">
                  <span>✓</span>
                  <span className="hidden sm:inline">Synced</span>
                </div>
              )}
            </div>
            
            {/* Compact Action Button */}
            <Link
              to="/plans"
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-2 rounded-lg font-medium text-sm lg:text-base flex items-center justify-center gap-2"
            >
              <span>+</span>
              <span>Create New Plan</span>
            </Link>
          </div>
        </div>
      
        {/* Compact Search Bar */}
        {(savedPlans.length > 0 || searchQuery) && (
          <div className="relative">
            <div className="relative">
              <input 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="w-full p-2 pl-8 pr-8 rounded-lg bg-slate-800/60 border border-slate-600/50 text-white placeholder-slate-400 text-sm lg:text-base" 
                placeholder="Search your plans..." 
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400">
                <span className="text-sm">🔍</span>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>
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
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">{user ? '💪' : '🔒'}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {user ? 'Ready to Start Training?' : 'Login Required'}
            </h3>
            <p className="text-slate-400 mb-4 text-sm">
              {user 
                ? 'Create your first professional workout plan and start your fitness journey.' 
                : 'Please login to access your personal workout plans.'
              }
            </p>
            {user ? (
              <Link
                to="/plans"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium text-sm"
              >
                <span>+</span>
                <span>Create Your First Plan</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium text-sm"
              >
                <span>🔑</span>
                <span>Login to View Plans</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 transition-all duration-300 hover:border-orange-500/30">
                {/* Compact Status Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-yellow-300 bg-yellow-900/40 px-1.5 py-0.5 rounded border border-yellow-500/50">
                      🔥 Local
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => duplicatePlan(plan)}
                      className="p-1 text-slate-400 hover:text-blue-300 rounded"
                    >
                      <span className="text-sm">📋</span>
                    </button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="p-1 text-slate-400 hover:text-red-300 rounded"
                    >
                      <span className="text-sm">🗑️</span>
                    </button>
                  </div>
                </div>
                
                {/* Compact Plan Header */}
                <div className="mb-3">
                  <h3 className="text-sm lg:text-base font-bold text-white mb-1 truncate">
                    {plan.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs lg:text-sm">
                    <span className="text-slate-300">
                      {plan.exercises.length} exercises
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-orange-400">{plan.category || 'General'}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">📋</span>
                  </div>
                </div>

                {/* Compact Exercise List */}
                <div className="space-y-1.5 mb-3">
                  {plan.exercises.slice(0, 2).map((exercise, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-slate-800/40 border border-slate-700/30 rounded">
                      <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-red-600 rounded flex items-center justify-center text-white font-bold text-xs">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-xs lg:text-sm truncate">{exercise.name}</div>
                        <div className="text-slate-400 text-xs lg:text-sm">{exercise.sets}</div>
                      </div>
                    </div>
                  ))}
                  {plan.exercises.length > 2 && (
                    <div className="text-center py-1">
                      <span className="text-xs text-orange-400">
                        +{plan.exercises.length - 2} more
                      </span>
                    </div>
                  )}
                </div>

                {/* Compact Meta Info */}
                <div className="text-xs lg:text-sm text-slate-400 mb-3 p-2 bg-slate-800/30 border border-slate-700/30 rounded">
                  <div className="flex items-center gap-1 mb-1">
                    <span>📅</span>
                    <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
                  </div>
                  {lastSync && (
                    <div className="flex items-center gap-1">
                      <span>🔄</span>
                      <span>Last sync: {lastSync.toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>

                {/* Compact Action Buttons */}
                <div className="space-y-1.5">
                  <Link
                    to="/start-workout"
                    state={{ workoutPlan: plan }}
                    className="w-full px-3 py-2 bg-slate-700/50 text-slate-300 rounded text-xs lg:text-sm font-medium text-center flex items-center justify-center gap-1"
                  >
                    <span>🏋️</span>
                    <span>Start Workout</span>
                  </Link>
                  <Link
                    to={`/edit-plan/${plan.id}`}
                    className="w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded text-xs lg:text-sm font-medium text-center flex items-center justify-center gap-1"
                  >
                    <span>✏️</span>
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