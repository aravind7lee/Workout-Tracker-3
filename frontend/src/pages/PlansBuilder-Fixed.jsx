// FIXED Plan Builder - No Theme System Errors
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { planService } from '../services/planService';
import { exerciseLibrary } from '../data/exerciseLibrary';
import { onlineService } from '../services/onlineService';
import { useAuth } from '../context/AuthContext';
import { realTimePlanService } from '../services/realTimePlanService';

export default function PlansBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('chest');
  const [plan, setPlan] = useState([]);
  const [planName, setPlanName] = useState('');
  const [planCategory, setPlanCategory] = useState('General');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverArea, setDragOverArea] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [realTimeStats, setRealTimeStats] = useState({
    totalPlans: 0,
    totalWorkouts: 0,
    lastSync: null
  });
  const [autoSave, setAutoSave] = useState(false);
  const autoSaveTimer = useRef(null);
  const syncInterval = useRef(null);
  
  // Use dark theme always
  const theme = 'dark';
  
  const currentMuscleGroup = exerciseLibrary[selectedMuscleGroup];
  const exercises = currentMuscleGroup.exercises;

  // Real-time sync and status monitoring
  useEffect(() => {
    const checkOnlineStatus = async () => {
      const online = await onlineService.checkBackendStatus();
      setIsOnline(online);
      if (online) {
        setSyncStatus('synced');
        loadRealTimeStats();
      } else {
        setSyncStatus('offline');
      }
    };

    checkOnlineStatus();
    
    // Set up real-time sync interval
    syncInterval.current = setInterval(checkOnlineStatus, 30000);

    // Network status listeners
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      checkOnlineStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (syncInterval.current) clearInterval(syncInterval.current);
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && planName.trim() && plan.length > 0) {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        savePlanDraft();
      }, 3000);
    }
  }, [planName, plan, autoSave]);

  const loadRealTimeStats = async () => {
    try {
      const localPlans = planService.getAllPlans();
      setRealTimeStats({
        totalPlans: localPlans.length,
        totalWorkouts: 0,
        lastSync: new Date().toISOString()
      });
      
      if (isOnline) {
        try {
          const analytics = await onlineService.getPlanAnalytics();
          if (analytics && !analytics.error) {
            setRealTimeStats({
              totalPlans: analytics.totalPlans || localPlans.length,
              totalWorkouts: analytics.totalWorkouts || 0,
              lastSync: new Date().toISOString()
            });
          }
        } catch (error) {
          console.log('Backend analytics unavailable, using local data');
        }
      }
    } catch (error) {
      console.error('Failed to load real-time stats:', error);
    }
  };

  const savePlanDraft = async () => {
    if (!planName.trim() || plan.length === 0) return;
    
    try {
      const draftData = {
        name: planName.trim() + ' (Draft)',
        exercises: plan.map(exercise => ({
          name: exercise.name,
          category: exercise.category,
          sets: exercise.sets
        })),
        category: planCategory,
        isDraft: true
      };
      
      localStorage.setItem('planBuilderDraft', JSON.stringify(draftData));
      setSyncStatus('draft-saved');
      
      setTimeout(() => setSyncStatus(isOnline ? 'synced' : 'offline'), 2000);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const loadDraft = () => {
    try {
      const draft = localStorage.getItem('planBuilderDraft');
      if (draft) {
        const draftData = JSON.parse(draft);
        setPlanName(draftData.name.replace(' (Draft)', ''));
        setPlanCategory(draftData.category);
        setPlan(draftData.exercises.map((ex, index) => ({
          ...ex,
          planId: `plan-${Date.now()}-${index}`,
          originalId: `draft-${index}`
        })));
        localStorage.removeItem('planBuilderDraft');
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  };

  const handleDragStart = useCallback((e, item, source) => {
    setDraggedItem({ item, source });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ item, source }));
  }, []);

  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = '1';
    e.target.style.transform = 'rotate(0deg)';
    setDraggedItem(null);
    setDragOverArea(null);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e, area) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverArea(area);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverArea(null);
    }
  }, []);

  const handleDrop = useCallback((e, targetArea) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragOverArea(null);

    let dragData;
    try {
      dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
    } catch (error) {
      dragData = draggedItem;
    }

    if (!dragData) return;

    const { item, source } = dragData;

    if (source === 'library' && targetArea === 'plan') {
      const newPlanItem = {
        ...item,
        planId: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        originalId: item.id
      };
      setPlan(prev => [...prev, newPlanItem]);
    } else if (source === 'plan' && targetArea === 'library') {
      setPlan(prev => prev.filter(planItem => planItem.planId !== item.planId));
    }

    setDraggedItem(null);
  }, [draggedItem]);

  const addToPlan = useCallback((exercise) => {
    const newPlanItem = {
      ...exercise,
      planId: `plan-${Date.now()}-${Math.random()}`,
      originalId: exercise.id
    };
    setPlan(prev => [...prev, newPlanItem]);
  }, []);

  const removeFromPlan = useCallback((planId) => {
    setPlan(prev => prev.filter(item => item.planId !== planId));
  }, []);

  const moveUp = useCallback((index) => {
    if (index === 0) return;
    setPlan(prev => {
      const newPlan = [...prev];
      [newPlan[index - 1], newPlan[index]] = [newPlan[index], newPlan[index - 1]];
      return newPlan;
    });
  }, []);

  const moveDown = useCallback((index) => {
    setPlan(prev => {
      if (index === prev.length - 1) return prev;
      const newPlan = [...prev];
      [newPlan[index], newPlan[index + 1]] = [newPlan[index + 1], newPlan[index]];
      return newPlan;
    });
  }, []);

  const savePlan = async () => {
    if (!planName.trim()) {
      alert('Please enter a plan name');
      return;
    }
    if (plan.length === 0) {
      alert('Please add exercises to your plan');
      return;
    }
    
    setSaving(true);
    setSyncStatus('saving');
    
    try {
      const planData = {
        name: planName.trim(),
        exercises: plan.map(exercise => ({
          name: exercise.name,
          category: exercise.category,
          sets: exercise.sets,
          muscle: exercise.muscle || exercise.category,
          difficulty: exercise.difficulty || 'intermediate'
        })),
        category: planCategory,
        description: `Custom ${planCategory} workout plan with ${plan.length} exercises`,
        tags: [planCategory.toLowerCase(), 'custom', selectedMuscleGroup],
        createdBy: user?.name || 'User',
        userId: user?._id
      };
      
      // Save locally first
      const savedPlan = planService.savePlan(planData);
      console.log('Plan saved locally:', savedPlan);
      
      // Use real-time plan service for INSTANT dashboard updates
      let syncSuccess = false;
      if (user) {
        try {
          setSyncStatus('syncing');
          console.log('🚀 Creating plan with REAL-TIME service:', planName);
          
          const createdPlan = await realTimePlanService.createPlan(planData);
          
          if (createdPlan) {
            syncSuccess = createdPlan.synced;
            setSyncStatus(createdPlan.synced ? 'synced' : 'offline');
            
            setRealTimeStats(prev => ({
              ...prev,
              totalPlans: prev.totalPlans + 1,
              lastSync: new Date().toISOString()
            }));
            
            console.log('✅ Plan created with REAL-TIME dashboard update:', createdPlan.name);
            
            if (createdPlan.synced) {
              alert(`🚀 PLAN CREATED - INSTANT DASHBOARD UPDATE!\n\n✅ "${planName}" saved to MongoDB\n⚡ Dashboard updated INSTANTLY\n☁️ Real-time sync active\n📱 Available on all devices\n🏋️♂️ Professional gym-level tracking\n\n🔥 Check your dashboard - it's already updated!`);
            } else {
              alert(`🚀 PLAN CREATED - INSTANT DASHBOARD UPDATE!\n\n💾 "${planName}" saved locally\n⚡ Dashboard updated INSTANTLY\n🔄 Queued for MongoDB sync\n📱 Will sync automatically when online\n\n💪 Your dashboard shows the new plan count!`);
            }
          } else {
            throw new Error('Failed to create plan');
          }
        } catch (syncError) {
          console.error('❌ Real-time plan creation failed:', syncError);
          setSyncStatus('sync-failed');
          
          alert(`🎉 Plan "${planName}" created!\n\n💾 Saved locally\n⚠️ Sync will retry automatically\n🏋️ Ready to use offline!`);
        }
      } else {
        setSyncStatus('offline');
        alert(`🎉 Plan "${planName}" created!\n\n💾 Saved locally\n🔐 Sign in for cloud sync\n💪 Ready for your workout!`);
      }
      
      // Clear draft
      localStorage.removeItem('planBuilderDraft');
      
      // Reset form
      setPlanName('');
      setPlan([]);
      setPlanCategory('General');
      
      // Navigate to My Plans page
      setTimeout(() => {
        navigate('/my-plans');
      }, syncSuccess ? 1500 : 500);
      
    } catch (error) {
      console.error('Error saving plan:', error);
      setSyncStatus('error');
      alert('Failed to save plan. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => {
        if (syncStatus !== 'synced') {
          setSyncStatus(isOnline ? 'idle' : 'offline');
        }
      }, 3000);
    }
  };

  const getSyncStatusDisplay = () => {
    switch (syncStatus) {
      case 'synced': return { icon: '✅', text: 'Synced', color: 'text-green-400' };
      case 'syncing': return { icon: '🔄', text: 'Syncing...', color: 'text-blue-400' };
      case 'saving': return { icon: '💾', text: 'Saving...', color: 'text-yellow-400' };
      case 'offline': return { icon: '📱', text: 'Offline', color: 'text-orange-400' };
      case 'sync-failed': return { icon: '⚠️', text: 'Sync Failed', color: 'text-red-400' };
      case 'draft-saved': return { icon: '📝', text: 'Draft Saved', color: 'text-purple-400' };
      case 'error': return { icon: '❌', text: 'Error', color: 'text-red-500' };
      default: return { icon: '⚡', text: 'Ready', color: 'text-slate-400' };
    }
  };

  const statusDisplay = getSyncStatusDisplay();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Header */}
      <div className="relative w-full h-96 bg-gradient-to-b from-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">PLAN BUILDER</h1>
          <p className="text-slate-300 mb-6">CREATE PROFESSIONAL WORKOUT PLANS</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => navigate('/my-plans')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
            >
              📋 View Plans
            </button>
            <button 
              onClick={() => document.getElementById('plan-builder')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"
            >
              🏋️ Build Plan
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div id="plan-builder" className="container mx-auto px-4 py-8">
        
        {/* Status Bar */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className={`${statusDisplay.color} text-sm font-medium`}>
                {statusDisplay.icon} {statusDisplay.text}
              </span>
              {isOnline && (
                <span className="text-xs text-green-300 bg-green-900/30 px-2 py-1 rounded-full">
                  🌐 Live
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`text-xs px-3 py-1 rounded-full ${
                  autoSave 
                    ? 'bg-blue-900/30 text-blue-300 border border-blue-700' 
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                }`}
              >
                {autoSave ? '🔄 Auto-Save ON' : '💾 Auto-Save OFF'}
              </button>
              <button
                onClick={loadDraft}
                className="text-xs px-3 py-1 rounded-full bg-purple-900/30 text-purple-300 border border-purple-700"
              >
                📝 Load Draft
              </button>
            </div>
          </div>
        </div>

        {/* Form Controls */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Workout Plan Builder 🏋️</h2>
          
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Enter plan name..."
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={planCategory}
                onChange={(e) => setPlanCategory(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
              >
                <option value="General">🏋️ General</option>
                <option value="Strength">💪 Strength</option>
                <option value="Cardio">❤️ Cardio</option>
                <option value="Flexibility">🧘 Flexibility</option>
                <option value="HIIT">🔥 HIIT</option>
              </select>
              <button
                onClick={savePlan}
                disabled={saving || !planName.trim() || plan.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 rounded-lg font-medium"
              >
                {saving ? '🔄 Saving...' : '💾 Save Plan'}
              </button>
            </div>
          </div>
        </div>

        {/* Exercise Library and Plan Builder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Exercise Library */}
          <div 
            className="bg-slate-800 border border-slate-700 rounded-lg p-6"
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, 'library')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'library')}
          >
            <h3 className="text-xl font-semibold mb-4">📚 Exercise Library</h3>
            
            {/* Muscle Group Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {Object.entries(exerciseLibrary).map(([key, group]) => (
                <button
                  key={key}
                  onClick={() => setSelectedMuscleGroup(key)}
                  className={`p-3 rounded-lg text-sm font-medium ${
                    selectedMuscleGroup === key
                      ? `${group.color} text-white`
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <div className="text-lg mb-1">{group.icon}</div>
                  <div>{group.name}</div>
                </button>
              ))}
            </div>
            
            {/* Exercise List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {exercises.map((exercise) => {
                const isInPlan = plan.some(p => p.originalId === exercise.id);
                return (
                  <div 
                    key={exercise.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, { ...exercise, category: currentMuscleGroup.name }, 'library')}
                    onDragEnd={handleDragEnd}
                    className={`p-4 rounded-lg border cursor-grab ${
                      isInPlan 
                        ? 'bg-green-900/30 border-green-700' 
                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-white">{exercise.name}</div>
                        <div className="text-sm text-slate-400">{exercise.sets}</div>
                      </div>
                      <button
                        onClick={() => addToPlan({ ...exercise, category: currentMuscleGroup.name })}
                        disabled={isInPlan}
                        className={`w-8 h-8 rounded-lg font-bold ${
                          isInPlan 
                            ? 'text-green-400 bg-green-900/30 cursor-not-allowed' 
                            : 'text-blue-400 hover:bg-blue-900/20'
                        }`}
                      >
                        {isInPlan ? '✓' : '+'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workout Plan */}
          <div 
            className={`bg-slate-800 border border-slate-700 rounded-lg p-6 ${
              dragOverArea === 'plan' ? 'border-green-400 bg-green-900/20' : ''
            }`}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, 'plan')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'plan')}
          >
            <h3 className="text-xl font-semibold mb-4">🎯 Your Workout Plan ({plan.length})</h3>
            
            {plan.length === 0 ? (
              <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-600 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <p className="text-slate-400">Drag exercises here or use + button</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {plan.map((exercise, index) => (
                  <div 
                    key={exercise.planId}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, exercise, 'plan')}
                    onDragEnd={handleDragEnd}
                    className="p-4 rounded-lg bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-green-400 font-bold w-8 h-8 rounded-full bg-green-900/50 flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-white">{exercise.name}</div>
                          <div className="text-sm text-slate-400">{exercise.category} • {exercise.sets}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="text-slate-400 hover:text-white disabled:opacity-30 w-7 h-7 flex items-center justify-center rounded"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === plan.length - 1}
                          className="text-slate-400 hover:text-white disabled:opacity-30 w-7 h-7 flex items-center justify-center rounded"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeFromPlan(exercise.planId)}
                          className="text-red-400 hover:text-red-300 w-7 h-7 flex items-center justify-center rounded ml-2"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Plan Summary */}
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                  <div className="text-blue-300 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">📊 Plan Summary</span>
                      <span className="text-xs text-green-300">Real-time</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>🏋️ {plan.length} exercises</div>
                      <div>🔥 {planCategory}</div>
                      <div>⏱️ ~{plan.length * 3}min</div>
                      <div>💪 Pro Level</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 p-6 bg-slate-800 border border-slate-700 rounded-lg text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🏆</span>
            <span className="text-lg font-semibold">Professional Gym Tracker</span>
            <span className="text-2xl">🏆</span>
          </div>
          <div className="text-sm text-slate-400 flex items-center justify-center gap-4">
            <span>✅ Real-time MongoDB sync</span>
            <span>💪 Professional tracking</span>
            <span>📱 Cross-device availability</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { realTimePlanService };