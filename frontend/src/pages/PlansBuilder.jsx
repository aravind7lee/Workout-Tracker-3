// FIXED Plan Builder - No Theme System Errors
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { planService } from '../services/planService';
import { exerciseLibrary } from '../data/exerciseLibrary';
import { onlineService } from '../services/onlineService';
import { useAuth } from '../context/AuthContext';
import { realTimePlanService } from '../services/realTimePlanService';
import PlanBuilderHeader from '../assets/PlanBuilderheader.jpg';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import PremiumSkeletonLoader from '../components/PremiumSkeletonLoader';
import '../styles/plan-builder-header.css';

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);
  const autoSaveTimer = useRef(null);
  const syncInterval = useRef(null);
  
  // Particles configuration
  const particlesLoaded = useCallback(async container => {
    console.log(container);
  }, []);

  const initParticles = useCallback(async engine => {
    await loadSlim(engine);
    setParticlesReady(true);
  }, []);
  
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

    // Network status listeners with proper cleanup
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      checkOnlineStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    // Store references for cleanup
    const onlineRef = handleOnline;
    const offlineRef = handleOffline;

    window.addEventListener('online', onlineRef);
    window.addEventListener('offline', offlineRef);

    return () => {
      if (syncInterval.current) clearInterval(syncInterval.current);
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      window.removeEventListener('online', onlineRef);
      window.removeEventListener('offline', offlineRef);
      // Cleanup handled automatically
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
      // Use local data to avoid API errors
      const localPlans = planService.getAllPlans();
      setRealTimeStats({
        totalPlans: localPlans.length,
        totalWorkouts: 0, // Will be updated from backend when available
        lastSync: new Date().toISOString()
      });
      
      // Try to get backend data if online
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
          // Silently fail and use local data
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
    console.log('Drag started:', item.name, 'from', source);
    setDraggedItem({ item, source });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ item, source }));
    
    // Add visual feedback
    setTimeout(() => {
      e.target.style.opacity = '0.5';
      e.target.style.transform = 'rotate(5deg)';
    }, 0);
  }, []);

  const handleDragEnd = useCallback((e) => {
    console.log('Drag ended');
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
    console.log('Drag enter:', area);
    setDragOverArea(area);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    // Only clear if we're leaving the drop zone completely
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
    console.log('Drop in:', targetArea);
    
    setDragOverArea(null);

    let dragData;
    try {
      dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
    } catch (error) {
      dragData = draggedItem;
    }

    if (!dragData) {
      console.log('No drag data available');
      return;
    }

    const { item, source } = dragData;
    console.log('Processing drop:', item.name, 'from', source, 'to', targetArea);

    if (source === 'library' && targetArea === 'plan') {
      const newPlanItem = {
        ...item,
        planId: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        originalId: item.id
      };
      setPlan(prev => {
        console.log('Adding to plan:', newPlanItem.name);
        return [...prev, newPlanItem];
      });
    } else if (source === 'plan' && targetArea === 'library') {
      setPlan(prev => {
        console.log('Removing from plan:', item.name);
        return prev.filter(planItem => planItem.planId !== item.planId);
      });
    } else if (source === 'plan' && targetArea === 'plan') {
      // Reordering within plan - for now just keep it in place
      console.log('Reordering within plan');
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
          
          // Use real-time service for instant dashboard updates
          const createdPlan = await realTimePlanService.createPlan(planData);
          
          if (createdPlan) {
            syncSuccess = createdPlan.synced;
            setSyncStatus(createdPlan.synced ? 'synced' : 'offline');
            
            // Update real-time stats
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
    <div className="space-y-0">
      {/* Enhanced Premium Header Section */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* Premium Skeleton Loader */}
        <AnimatePresence>
          {!imageLoaded && <PremiumSkeletonLoader />}
        </AnimatePresence>

        {/* Hero Image - Clear and Vibrant */}
        <img
          src={PlanBuilderHeader}
          alt="Plan Builder - Professional gym workout planning with modern equipment and premium atmosphere"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300"
          style={{ 
            opacity: imageLoaded ? 1 : 0,
            filter: 'brightness(1.1) contrast(1.05) saturate(1.1)'
          }}
          onLoad={() => setImageLoaded(true)}
          fetchPriority="high"
          decoding="async"
        />
        
        {/* Optimized Particles */}
        {particlesReady && (
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <Particles
              id="planBuilderParticles"
              init={initParticles}
              loaded={particlesLoaded}
              options={{
                background: { color: { value: "transparent" } },
                fpsLimit: 60,
                interactivity: { events: { onClick: { enable: false }, onHover: { enable: false } } },
                particles: {
                  color: { value: ["#3b82f6", "#10b981"] },
                  links: { enable: false },
                  move: { enable: true, speed: 0.5, direction: "none" },
                  number: { value: 15 },
                  opacity: { value: 0.4 },
                  size: { value: 2 }
                }
              }}
            />
          </div>
        )}
        
        {/* Light Gradient Overlay - Preserve Image Clarity */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />
        
        {/* Content Overlay - Ultra Smooth */}
        <AnimatePresence>
          {imageLoaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0 flex items-center justify-center text-center px-4 sm:px-6"
            >
              <div className="max-w-3xl mx-auto">
                {/* Main Title - Reduced Size */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
                  style={{
                    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                    fontWeight: '700'
                  }}
                >
                  PLAN BUILDER
                </motion.h1>
                
                {/* Subtitle - Reduced Size */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="text-base sm:text-lg text-white/90 mb-6 max-w-2xl mx-auto font-medium"
                  style={{
                    textShadow: '0 1px 4px rgba(0,0,0,0.7)'
                  }}
                >
                  CREATE PROFESSIONAL WORKOUT PLANS
                </motion.p>
                
                {/* CTA Buttons - Reduced Size */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => navigate('/my-plans')}
                    className="px-6 py-3 text-white rounded-lg font-medium text-sm shadow-lg transition-all duration-200"
                    style={{
                      background: 'linear-gradient(to right, #f97316, #dc2626)',
                      boxShadow: '0 4px 14px 0 rgba(249, 115, 22, 0.39)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(to right, #ea580c, #b91c1c)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(to right, #f97316, #dc2626)';
                    }}
                  >
                    📋 View Plans
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => document.getElementById('plan-builder')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-6 py-3 text-white rounded-lg font-medium text-sm shadow-lg transition-all duration-200"
                    style={{
                      background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                      boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(to right, #1d4ed8, #6d28d9)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(to right, #2563eb, #7c3aed)';
                    }}
                  >
                    🏋️ Build Plan
                  </motion.button>
                </motion.div>
                
                {/* Status Badge - Reduced Size */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="flex justify-center"
                >
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-xs">
                    <span className="flex items-center gap-2 text-white/90">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                      <span>Professional Tracker</span>
                      <span className="text-yellow-400">✨</span>
                    </span>
                  </div>
                </motion.div>
                
                {/* Accessibility Enhancement - Screen Reader Info */}
                <div className="sr-only">
                  Plan Builder page for creating professional workout plans. 
                  Navigate to view existing plans or scroll down to build a new plan.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Main Content */}
      <div id="plan-builder" className="container mx-auto px-4 py-8 bg-slate-900 min-h-screen">
        
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

      {/* Real-time Muscle Group Info & Progress */}
      <div className={`border rounded-lg p-3 sm:p-4 ${currentMuscleGroup.color}/20 border-${currentMuscleGroup.color.split('-')[1]}-500/30 transition-all duration-300`}>
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              <span className="text-2xl sm:text-3xl animate-bounce">{currentMuscleGroup.icon}</span>
              <div className="flex-1">
                <h4 className="text-base sm:text-lg font-semibold text-white">{currentMuscleGroup.name} Workout Tips</h4>
                <div className="text-xs text-slate-400">
                  {exercises.length} exercises • Real-time guidance
                </div>
              </div>
            </div>
            <div className="text-sm text-slate-300 space-y-1">
              {selectedMuscleGroup === 'chest' && (
                <>
                  <p>• Start with compound movements (Bench Press, Dips)</p>
                  <p>• Focus on full range of motion for better muscle activation</p>
                  <p>• Include both incline and decline angles for complete development</p>
                </>
              )}
              {selectedMuscleGroup === 'shoulders' && (
                <>
                  <p>• Warm up thoroughly - shoulders are injury-prone</p>
                  <p>• Train all three heads: anterior, medial, posterior</p>
                  <p>• Use lighter weights with perfect form</p>
                </>
              )}
              {selectedMuscleGroup === 'back' && (
                <>
                  <p>• Focus on pulling with your back, not your arms</p>
                  <p>• Include both vertical and horizontal pulling movements</p>
                  <p>• Squeeze shoulder blades together at the top</p>
                </>
              )}
              {selectedMuscleGroup === 'arms' && (
                <>
                  <p>• Train biceps and triceps with equal volume</p>
                  <p>• Use full range of motion for maximum growth</p>
                  <p>• Don't neglect compound movements</p>
                </>
              )}
              {selectedMuscleGroup === 'legs' && (
                <>
                  <p>• Squat and deadlift are essential compound movements</p>
                  <p>• Don't skip leg day - legs are your largest muscle group</p>
                  <p>• Include unilateral exercises for balance</p>
                </>
              )}
              {selectedMuscleGroup === 'abs' && (
                <>
                  <p>• Quality over quantity - focus on controlled movements</p>
                  <p>• Train abs 2-3 times per week for best results</p>
                  <p>• Include isometric holds like planks</p>
                </>
              )}
            </div>
            {draggedItem && (
              <div className="mt-3 p-2 bg-green-900/30 border border-green-700 rounded-lg">
                <div className="text-green-300 text-sm animate-pulse flex items-center gap-2">
                  <span className="animate-bounce">🎯</span>
                  <span>Dragging: <strong>{draggedItem.item.name}</strong></span>
                  <span className="text-green-400">→ Drop in plan area!</span>
                </div>
              </div>
            )}
            
            {/* Real-time Plan Progress */}
            {plan.length > 0 && (
              <div className="mt-3 p-2 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <div className="text-blue-300 text-sm flex items-center gap-2">
                  <span>📊</span>
                  <span>Plan Progress: {plan.length} exercises added</span>
                  <div className="flex-1 bg-slate-700 rounded-full h-2 ml-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((plan.length / 8) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs">{Math.min(Math.round((plan.length / 8) * 100), 100)}%</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center sm:justify-end">
            <button
              onClick={() => navigate('/my-plans')}
              className="w-full sm:w-auto px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span>📋</span>
              <span>View My Plans</span>
              {realTimeStats.totalPlans > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {realTimeStats.totalPlans}
                </span>
              )}
            </button>
            
            {isOnline && (
              <div className="text-xs text-green-400 flex items-center justify-center sm:justify-start gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>Real-time sync active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* Exercise Library */}
        <div 
          className={`bg-slate-800/60 border border-slate-700 rounded-lg p-3 sm:p-4 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] transition-all duration-200 ${
            dragOverArea === 'library' ? 'bg-slate-700/50 border-slate-500 shadow-lg' : ''
          }`}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, 'library')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'library')}
          data-drop-zone="library"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white flex items-center gap-2">
              <span className="animate-pulse">📚</span> 
              <span>Exercise Library</span>
              <span className="text-xs sm:text-sm text-slate-400">({exercises.length})</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-white ${currentMuscleGroup.color} shadow-lg`}>
                {currentMuscleGroup.name}
              </span>
              {isOnline && (
                <span className="px-2 py-1 rounded-full text-xs bg-green-900/30 text-green-300 border border-green-700">
                  ☁️ Live
                </span>
              )}
            </div>
          </div>
          
          {/* Muscle Group Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 sm:gap-2 mb-4">
            {Object.entries(exerciseLibrary).map(([key, group]) => (
              <button
                key={key}
                onClick={() => setSelectedMuscleGroup(key)}
                className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  selectedMuscleGroup === key
                    ? `${group.color} text-white shadow-lg`
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                }`}
              >
                <div className="text-base sm:text-lg lg:text-xl mb-1">{group.icon}</div>
                <div className="truncate text-xs sm:text-sm">{group.name}</div>
              </button>
            ))}
          </div>
          
          {/* Exercise List */}
          <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 lg:max-h-96 overflow-y-auto exercise-scroll">
            {exercises.map((exercise, index) => {
              const isInPlan = plan.some(p => p.originalId === exercise.id);
              return (
                <div 
                  key={exercise.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, { ...exercise, category: currentMuscleGroup.name }, 'library')}
                  onDragEnd={handleDragEnd}
                  className={`p-3 sm:p-4 rounded-lg border cursor-grab active:cursor-grabbing transition-all duration-200 select-none transform hover:scale-[1.02] ${
                    isInPlan 
                      ? 'bg-green-900/30 border-green-700 shadow-green-900/20 shadow-lg' 
                      : 'bg-slate-800/60 border-slate-700 hover:bg-slate-700/60 hover:border-slate-600 hover:shadow-md'
                  }`}
                  data-exercise-id={exercise.id}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-white text-sm sm:text-base">
                          {exercise.name}
                        </div>
                        {isInPlan && (
                          <span className="text-green-400 text-xs bg-green-900/30 px-2 py-1 rounded-full border border-green-700">
                            ✓ Added
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1">
                          <span>🏋️</span>
                          <span>{exercise.sets}</span>
                        </span>
                        <span className={`px-2 py-1 rounded text-xs border ${
                          exercise.difficulty === 'beginner' ? 'bg-green-900/30 text-green-300 border-green-700' :
                          exercise.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700' :
                          'bg-red-900/30 text-red-300 border-red-700'
                        }`}>
                          {exercise.difficulty}
                        </span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <span>🏅</span>
                          <span>{exercise.type}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => addToPlan({ ...exercise, category: currentMuscleGroup.name })}
                        disabled={isInPlan}
                        className={`text-lg font-bold w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                          isInPlan 
                            ? 'text-green-400 bg-green-900/30 border border-green-700 cursor-not-allowed' 
                            : 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 border border-transparent hover:border-blue-700'
                        }`}
                        title={isInPlan ? 'Already in plan' : 'Add to plan'}
                      >
                        {isInPlan ? '✓' : '+'}
                      </button>
                      <div className="text-slate-500 text-lg sm:text-xl ml-1 cursor-grab">
                        ⋮⋮
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workout Plan */}
        <div 
          className={`bg-slate-800/60 border border-slate-700 rounded-lg p-3 sm:p-4 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] transition-all duration-200 ${
            dragOverArea === 'plan' 
              ? 'bg-green-900/30 border-green-400 shadow-xl ring-2 ring-green-400/50' 
              : ''
          }`}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, 'plan')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'plan')}
          data-drop-zone="plan"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white flex items-center gap-2">
              <span className="animate-pulse">🎯</span> 
              <span>Your Workout Plan</span>
              {plan.length > 0 && (
                <span className="text-xs sm:text-sm text-green-400 hidden sm:inline">• Ready to save!</span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-slate-400 bg-slate-700/50 px-2 sm:px-3 py-1 rounded-full border border-slate-600">
                {plan.length} {plan.length === 1 ? 'exercise' : 'exercises'}
              </span>
              {plan.length > 0 && (
                <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded-full border border-blue-700">
                  🔥 Active
                </span>
              )}
            </div>
          </div>
          
          {plan.length === 0 ? (
            <div className="flex items-center justify-center h-32 sm:h-40 lg:h-48 border-2 border-dashed border-slate-600 rounded-lg transition-all duration-300 hover:border-slate-500 hover:bg-slate-800/30">
              <div className="text-center px-4">
                <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3 animate-bounce">🎯</div>
                <p className="text-slate-400 text-sm sm:text-base font-medium">
                  Drag exercises here or use + button
                </p>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Build your custom workout plan
                </p>
                <div className="mt-2 sm:mt-3 flex items-center justify-center gap-1 sm:gap-2 text-xs text-slate-500">
                  <span>💪</span>
                  <span className="text-center">Professional gym-level planning</span>
                  <span>💪</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {plan.map((exercise, index) => (
                <div 
                  key={exercise.planId}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, exercise, 'plan')}
                  onDragEnd={handleDragEnd}
                  className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700/50 cursor-grab active:cursor-grabbing transition-all duration-200 hover:from-green-800/30 hover:to-blue-800/30 hover:border-green-600/70 hover:shadow-lg hover:shadow-green-900/20 select-none transform hover:scale-[1.02]"
                  data-plan-id={exercise.planId}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-green-400 font-bold text-sm sm:text-base bg-gradient-to-r from-green-900/50 to-blue-900/50 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm border border-green-700/50 shadow-lg">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm sm:text-base flex items-center gap-2">
                          <span>{exercise.name}</span>
                          <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded-full border border-blue-700">
                            ✓ Added
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1">
                            <span>🏅</span>
                            <span>{exercise.category}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span>🏋️</span>
                            <span>{exercise.sets}</span>
                          </span>
                          {exercise.difficulty && (
                            <>
                              <span>•</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                exercise.difficulty === 'beginner' ? 'bg-green-900/30 text-green-300' :
                                exercise.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-300' :
                                'bg-red-900/30 text-red-300'
                              }`}>
                                {exercise.difficulty}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700/50 transition-all duration-200 border border-transparent hover:border-slate-600"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === plan.length - 1}
                        className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700/50 transition-all duration-200 border border-transparent hover:border-slate-600"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeFromPlan(exercise.planId)}
                        className="text-red-400 hover:text-red-300 text-lg font-bold w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-900/30 transition-all duration-200 ml-1 border border-transparent hover:border-red-700"
                        title="Remove from plan"
                      >
                        ×
                      </button>
                      <div className="text-slate-500 text-lg sm:text-xl ml-2 cursor-grab">
                        ⋮⋮
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Plan Summary */}
              {plan.length > 0 && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-lg">
                  <div className="text-sm text-blue-300">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span>📊</span>
                        <span className="font-semibold text-sm sm:text-base">Professional Plan Summary</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-xs text-green-300">Real-time</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <span>🏋️</span>
                        <span>{plan.length} exercises</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🔥</span>
                        <span>{planCategory}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>~{plan.length * 3}min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>💪</span>
                        <span>Pro Level</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-slate-400">
                      💡 This plan will sync to MongoDB and be available across all your devices
                    </div>
                  </div>
                </div>
              )}
              
              {/* Real-time Sync Indicator */}
              {plan.length > 0 && (
                <div className="mt-3 sm:mt-4 p-3 bg-slate-800/40 border border-slate-600 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span>☁️</span>
                      <span>Real-time MongoDB Integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOnline ? (
                        <>
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          <span className="text-green-300">Connected</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                          <span className="text-orange-300">Offline Mode</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

// Export with real-time service integration
export { realTimePlanService };