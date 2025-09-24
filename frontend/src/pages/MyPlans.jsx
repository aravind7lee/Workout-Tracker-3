// frontend/src/pages/MyPlans.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PlanDetailsModal from '../components/PlanDetailsModal';
import { onlineService } from '../services/onlineService';
import { planService } from '../services/planService';
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSync, setLastSync] = useState(null);
  
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
  
  // Real-time data loading and sync
  useEffect(() => {
    loadRealTimePlans();
    
    // Set up real-time sync interval
    const syncInterval = setInterval(() => {
      if (isOnline && user) {
        syncPlansWithBackend();
      }
    }, 30000); // Sync every 30 seconds
    
    // Listen for network status changes
    const handleOnline = () => {
      setIsOnline(true);
      syncPlansWithBackend();
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, isOnline]);

  useEffect(() => {
    loadRealTimePlans();
  }, [highlightPlan]);

  const loadRealTimePlans = async () => {
    setLoading(true);
    try {
      if (user && isOnline) {
        // Try to load from backend first
        await syncPlansWithBackend();
      } else {
        // Load from local storage
        const localPlans = planService.getAllPlans();
        setSavedPlans(localPlans);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      // Fallback to local storage
      const localPlans = planService.getAllPlans();
      setSavedPlans(localPlans);
    } finally {
      setLoading(false);
    }
  };

  const syncPlansWithBackend = async () => {
    if (!user || !isOnline) return;
    
    setSyncStatus('syncing');
    try {
      // Get plans from backend
      const backendPlans = await onlineService.getWorkoutPlans();
      
      // Get local plans
      const localPlans = planService.getAllPlans();
      
      // Merge and sync plans
      const mergedPlans = await mergePlansData(localPlans, backendPlans);
      
      // Update local storage
      localStorage.setItem('workoutPlans', JSON.stringify(mergedPlans));
      setSavedPlans(mergedPlans);
      
      setLastSync(new Date());
      setSyncStatus('synced');
      
      // Auto-hide sync status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  };

  const mergePlansData = async (localPlans, backendPlans) => {
    const merged = [...localPlans];
    
    // Add backend plans that don't exist locally
    for (const backendPlan of backendPlans) {
      const existsLocally = localPlans.find(p => p.id === backendPlan._id || p.backendId === backendPlan._id);
      if (!existsLocally) {
        merged.push({
          id: backendPlan._id,
          backendId: backendPlan._id,
          name: backendPlan.name,
          exercises: backendPlan.exercises || [],
          category: backendPlan.category || 'General',
          createdAt: backendPlan.createdAt,
          updatedAt: backendPlan.updatedAt || backendPlan.createdAt,
          synced: true
        });
      }
    }
    
    // Sync local plans to backend
    for (const localPlan of localPlans) {
      if (!localPlan.synced && !localPlan.backendId) {
        try {
          const savedPlan = await onlineService.saveWorkoutPlan({
            name: localPlan.name,
            exercises: localPlan.exercises,
            category: localPlan.category
          });
          
          if (savedPlan) {
            const planIndex = merged.findIndex(p => p.id === localPlan.id);
            if (planIndex !== -1) {
              merged[planIndex] = {
                ...merged[planIndex],
                backendId: savedPlan._id,
                synced: true
              };
            }
          }
        } catch (error) {
          console.error('Failed to sync plan to backend:', error);
        }
      }
    }
    
    return merged;
  };

  const deletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        const plan = savedPlans.find(p => p.id === planId);
        
        // Delete from backend if synced
        if (plan?.backendId && isOnline && user) {
          try {
            await onlineService.deletePlan(plan.backendId);
          } catch (error) {
            console.error('Failed to delete from backend:', error);
          }
        }
        
        // Delete locally
        const updatedPlans = savedPlans.filter(plan => plan.id !== planId);
        localStorage.setItem('workoutPlans', JSON.stringify(updatedPlans));
        setSavedPlans(updatedPlans);
        
        // Store deletion for later sync if offline
        if (!isOnline || !user) {
          const pendingDeletes = JSON.parse(localStorage.getItem('pendingPlanDeletes') || '[]');
          pendingDeletes.push({ planId, timestamp: new Date().toISOString() });
          localStorage.setItem('pendingPlanDeletes', JSON.stringify(pendingDeletes));
        }
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    }
  };

  const duplicatePlan = async (plan) => {
    try {
      const newPlan = {
        ...plan,
        id: Date.now().toString(),
        name: `${plan.name} (Copy)`,
        createdAt: new Date().toISOString(),
        synced: false,
        backendId: null
      };
      
      const updatedPlans = [...savedPlans, newPlan];
      localStorage.setItem('workoutPlans', JSON.stringify(updatedPlans));
      setSavedPlans(updatedPlans);
      
      // Sync to backend if online
      if (isOnline && user) {
        try {
          const savedPlan = await onlineService.saveWorkoutPlan({
            name: newPlan.name,
            exercises: newPlan.exercises,
            category: newPlan.category
          });
          
          if (savedPlan) {
            const finalPlans = updatedPlans.map(p => 
              p.id === newPlan.id 
                ? { ...p, backendId: savedPlan._id, synced: true }
                : p
            );
            localStorage.setItem('workoutPlans', JSON.stringify(finalPlans));
            setSavedPlans(finalPlans);
          }
        } catch (error) {
          console.error('Failed to sync duplicated plan:', error);
        }
      }
    } catch (error) {
      console.error('Error duplicating plan:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl lg:text-3xl font-semibold text-white">My Workout Plans</h2>
          
          {/* Real-time Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-slate-400">
              {isOnline ? 'Online' : 'Offline'}
            </span>
            
            {/* Sync Status */}
            {syncStatus !== 'idle' && (
              <div className="flex items-center gap-1 text-xs">
                {syncStatus === 'syncing' && (
                  <>
                    <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="text-blue-400">Syncing...</span>
                  </>
                )}
                {syncStatus === 'synced' && (
                  <>
                    <span className="text-green-400">✓</span>
                    <span className="text-green-400">Synced</span>
                  </>
                )}
                {syncStatus === 'error' && (
                  <>
                    <span className="text-red-400">⚠</span>
                    <span className="text-red-400">Sync Failed</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Manual Sync Button */}
          {isOnline && user && (
            <button
              onClick={syncPlansWithBackend}
              disabled={syncStatus === 'syncing'}
              className="btn-secondary text-sm px-3 py-1 disabled:opacity-50"
              title="Sync with server"
            >
              🔄 Sync
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
            className="w-full p-3 pl-10 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400" 
            placeholder="Search your plans..." 
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            🔍
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {searchQuery && filteredPlans.length === 0 && savedPlans.length > 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Plans Found</h3>
          <p className="text-slate-400 mb-6">
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
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Plans Yet</h3>
          <p className="text-slate-400 mb-6">
            You haven't created any workout plans yet. Start building your first plan!
          </p>
          <Link
            to="/plans"
            className="btn bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2"
          >
            <span>+</span> Create Your First Plan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchQuery && (
            <div className="col-span-full mb-4">
              <p className="text-slate-400 text-sm">
                Showing {filteredPlans.length} of {savedPlans.length} plans for "{searchQuery}"
              </p>
            </div>
          )}
          {filteredPlans.map((plan) => (
            <div key={plan.id} className={`card hover:bg-slate-800/60 transition-all duration-500 relative ${
              highlightPlan === plan.id ? 'ring-2 ring-blue-500 bg-blue-900/20 shadow-lg shadow-blue-500/20 scale-105' : ''
            }`}>
              {/* Sync Status Badge */}
              <div className="absolute top-2 right-2 flex items-center gap-1">
                {plan.synced ? (
                  <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    Synced
                  </div>
                ) : (
                  <div className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                    Local
                  </div>
                )}
              </div>
              
              <div className="flex items-start justify-between mb-4 mt-8">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-slate-400">
                    {plan.exercises.length} {plan.exercises.length === 1 ? 'exercise' : 'exercises'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => duplicatePlan(plan)}
                    className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-900/20 transition-colors"
                    title="Duplicate plan"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20 transition-colors"
                    title="Delete plan"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {plan.exercises.slice(0, 3).map((exercise, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-blue-400 font-medium">{index + 1}.</span>
                    <span className="text-white">{exercise.name}</span>
                    <span className="text-slate-400">• {exercise.sets}</span>
                  </div>
                ))}
                {plan.exercises.length > 3 && (
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
                  >
                    +{plan.exercises.length - 3} more exercises
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <div className="flex flex-col gap-1">
                  <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
                  {lastSync && (
                    <span className="text-slate-600">Last sync: {lastSync.toLocaleTimeString()}</span>
                  )}
                </div>
                <span className="bg-slate-700/50 px-2 py-1 rounded">{plan.category || 'General'}</span>
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
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-blue-300 font-medium mb-2">💡 Real-time Features:</h4>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• {isOnline ? '🌐 Real-time sync with MongoDB database' : '📱 Offline mode - data saved locally'}</li>
            <li>• 🔄 Auto-sync every 30 seconds when online</li>
            <li>• 💾 All workout data persists across sessions</li>
            <li>• 📊 Real-time progress tracking and analytics</li>
            <li>• {user ? '👤 Logged in - data synced to your account' : '🔒 Login to sync across devices'}</li>
          </ul>
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
  );
}