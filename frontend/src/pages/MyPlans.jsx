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
      
      <div id="plans-content" className="px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl lg:text-3xl font-semibold heading-text text-gray-900 dark:text-white">My Workout Plans</h2>
            
            {/* Real-time Status Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                realTimeStats.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}></div>
              <span className="text-xs muted-text">
                {realTimeStats.isOnline ? 'REAL-TIME' : 'OFFLINE MODE'}
              </span>
              
              {/* Sync Status */}
              {syncStatus !== 'idle' && (
                <div className="flex items-center gap-1 text-xs">
                  {syncStatus === 'syncing' && (
                    <>
                      <span className="text-blue-500 dark:text-blue-400">Syncing...</span>
                    </>
                  )}
                  {syncStatus === 'synced' && (
                    <>
                      <span className="text-green-600 dark:text-green-400">✓</span>
                      <span className="text-green-600 dark:text-green-400">Synced</span>
                    </>
                  )}
                  {syncStatus === 'error' && (
                    <>
                      <span className="text-red-600 dark:text-red-400">⚠</span>
                      <span className="text-red-600 dark:text-red-400">Sync Failed</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Manual Sync Button */}
            {user && (
              <button
                onClick={syncPlansWithBackend}
                disabled={syncStatus === 'syncing'}
                className="btn-secondary text-sm px-3 py-1 disabled:opacity-50"
                title="Force sync with MongoDB"
              >
                {syncStatus === 'syncing' ? '🔄 Syncing...' : '🔄 Force Sync'}
              </button>
            )}
            
            <Link
              to="/plans"
              className="btn bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2"
            >
              <span>+</span> Create New Plan
            </Link>
          </div>
        </div>
      
        {/* Search Bar */}
        {(savedPlans.length > 0 || searchQuery) && (
          <div className="relative">
            <input 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full p-3 pl-10 rounded-lg bg-slate-800/60 dark:bg-slate-800/60 light-theme:bg-white light-theme:border-gray-300 border border-slate-700 dark:border-slate-700 light-theme:text-gray-900 text-white placeholder-slate-400 dark:placeholder-slate-400 light-theme:placeholder-gray-500" 
              placeholder="Search your plans..." 
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 muted-text">
              🔍
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 muted-text hover:text-gray-900 dark:hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {searchQuery && filteredPlans.length === 0 && savedPlans.length > 0 ? (
          <div className="empty-state card text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold heading-text mb-2">No Plans Found</h3>
            <p className="muted-text mb-6">
              No plans match "{searchQuery}". Try a different search term.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="btn bg-blue-600 hover:bg-blue-700 text-white"
            >
              Clear Search
            </button>
          </div>
        ) : savedPlans.length === 0 ? (
          <div className="empty-state card text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold heading-text mb-2">
              {user ? 'No Plans Yet' : 'Login Required'}
            </h3>
            <p className="muted-text mb-6">
              {user 
                ? 'You haven\'t created any workout plans yet. Start building your first plan!' 
                : 'Please login to view and create your personal workout plans.'
              }
            </p>
            {user ? (
              <Link
                to="/plans"
                className="btn bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2"
              >
                <span>+</span> Create Your First Plan
              </Link>
            ) : (
              <Link
                to="/login"
                className="btn bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2"
              >
                🔑 Login to View Plans
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchQuery && (
              <div className="col-span-full mb-4">
                <p className="search-results-text muted-text text-sm">
                  Showing {filteredPlans.length} of {savedPlans.length} plans for "{searchQuery}"
                </p>
              </div>
            )}
            {filteredPlans.map((plan) => (
              <div key={plan.id} className={`plan-card card hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light-theme:hover:bg-gray-50 transition-all duration-500 relative ${
                highlightPlan === plan.id ? 'ring-2 ring-blue-500 bg-blue-900/20 dark:bg-blue-900/20 light-theme:bg-blue-50 shadow-lg shadow-blue-500/20 scale-105' : ''
              }`}>
                {/* Sync Status Badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  {plan.synced ? (
                    <div className="sync-badge-synced bg-green-500/20 dark:bg-green-500/20 light-theme:bg-green-100 text-green-400 dark:text-green-400 light-theme:text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 dark:bg-green-400 light-theme:bg-green-600 rounded-full"></span>
                      Synced
                    </div>
                  ) : (
                    <div className="sync-badge-local bg-yellow-500/20 dark:bg-yellow-500/20 light-theme:bg-yellow-100 text-yellow-400 dark:text-yellow-400 light-theme:text-yellow-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-yellow-400 dark:bg-yellow-400 light-theme:bg-yellow-600 rounded-full"></span>
                      Local
                    </div>
                  )}
                </div>
                
                <div className="flex items-start justify-between mb-4 mt-8">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold heading-text mb-1">{plan.name}</h3>
                    <p className="text-sm muted-text">
                      {plan.exercises.length} {plan.exercises.length === 1 ? 'exercise' : 'exercises'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicatePlan(plan)}
                      className="action-button-duplicate text-blue-400 dark:text-blue-400 light-theme:text-blue-600 hover:text-blue-300 dark:hover:text-blue-300 light-theme:hover:text-blue-700 p-1 rounded hover:bg-blue-900/20 dark:hover:bg-blue-900/20 light-theme:hover:bg-blue-100 transition-colors"
                      title="Duplicate plan"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="action-button-delete text-red-400 dark:text-red-400 light-theme:text-red-600 hover:text-red-300 dark:hover:text-red-300 light-theme:hover:text-red-700 p-1 rounded hover:bg-red-900/20 dark:hover:bg-red-900/20 light-theme:hover:bg-red-100 transition-colors"
                      title="Delete plan"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {plan.exercises.slice(0, 3).map((exercise, index) => (
                    <div key={index} className="exercise-list-item flex items-center gap-2 text-sm">
                      <span className="exercise-number text-blue-600 dark:text-blue-400 font-medium">{index + 1}.</span>
                      <span className="exercise-name heading-text">{exercise.name}</span>
                      <span className="exercise-sets muted-text">• {exercise.sets}</span>
                    </div>
                  ))}
                  {plan.exercises.length > 3 && (
                    <button
                      onClick={() => setSelectedPlan(plan)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer transition-colors"
                    >
                      +{plan.exercises.length - 3} more exercises
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs muted-text mb-4">
                  <div className="flex flex-col gap-1">
                    <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
                    {lastSync && (
                      <span className="text-gray-500 dark:text-slate-600">Last sync: {lastSync.toLocaleTimeString()}</span>
                    )}
                  </div>
                  <span className="bg-gray-200 dark:bg-slate-700/50 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">{plan.category || 'General'}</span>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/workout/${plan.id}`}
                    className="btn-secondary flex-1 text-sm text-center"
                  >
                    Start Workout
                  </Link>
                  <Link
                    to={`/edit-plan/${plan.id}`}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white flex-1 text-sm text-center"
                  >
                    Edit Plan
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {savedPlans.length > 0 && (
          <div className="features-box bg-blue-900/20 dark:bg-blue-900/20 light-theme:bg-blue-50 border border-blue-500/30 dark:border-blue-500/30 light-theme:border-blue-200 rounded-lg p-4">
            <h4 className="text-blue-700 dark:text-blue-300 font-medium mb-2">🚀 REAL-TIME MongoDB Features:</h4>
            <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
              <li>• {realTimeStats.isOnline ? '🔥 INSTANT MongoDB sync - changes appear immediately' : '📱 Offline mode - data saved locally'}</li>
              <li>• ⚡ INSTANT dashboard updates when plans are created/deleted</li>
              <li>• 💾 Professional-grade data persistence with MongoDB</li>
              <li>• 📊 Real-time progress tracking and analytics</li>
              <li>• 🏋️ Professional gym-level experience</li>
              <li>• {user ? `👤 Account: ${realTimeStats.totalPlans} plans synced` : '🔒 Login to sync across devices'}</li>
            </ul>
            <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
              📈 Stats: {realTimeStats.totalPlans} total • {realTimeStats.syncedPlans} synced • {realTimeStats.unsyncedPlans} pending
            </div>
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