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
import PlanBuilder1 from '../assets/PlanBuilder1.jpg';
import PlanBuilder2 from '../assets/PlanBuilder2.jpg';
import PlanBuilder3 from '../assets/PlanBuilder3.jpg';
import PlanBuilder4 from '../assets/PlanBuilder4.jpg';
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
  const [featuresImagesLoaded, setFeaturesImagesLoaded] = useState({
    image1: false,
    image2: false,
    image3: false,
    image4: false
  });
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
              alert(`🚀 PLAN CREATED - INSTANT DASHBOARD UPDATE!\n\n💾 "${planName}" saved locally\n⚡ Dashboard updated INSTANTLY\n🔄 Queued for MongoDB sync\n📱 Will sync automatically when online\n\n💪 Your dashboard and Analytics page shows the new plan count!`);
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
      case 'synced': return { icon: '✅', text: 'Synced', color: 'text-red-500' };
      case 'syncing': return { icon: '🔄', text: 'Syncing...', color: 'text-red-500' };
      case 'saving': return { icon: '💾', text: 'Saving...', color: 'text-yellow-400' };
      case 'offline': return { icon: '📱', text: 'Offline', color: 'text-orange-400' };
      case 'sync-failed': return { icon: '⚠️', text: 'Sync Failed', color: 'text-red-400' };
      case 'draft-saved': return { icon: '📝', text: 'Draft Saved', color: 'text-red-600' };
      case 'error': return { icon: '❌', text: 'Error', color: 'text-red-500' };
      default: return { icon: '⚡', text: 'Ready', color: 'text-neutral-400' };
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
                  className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight"
                  style={{
                    color: '#f59e0b',
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
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
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
      
      {/* Plan Builder Features Showcase - 2x2 Grid */}
      <div className="bg-gradient-to-b from-black via-neutral-900 to-black py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Professional Plan Builder
              </span>
            </h2>
            <p className="text-neutral-300 text-xl max-w-3xl mx-auto leading-relaxed">
              Experience gym-quality workout planning with advanced tools and real-time synchronization
            </p>
          </motion.div>

          {/* 2x2 Grid Layout - Mobile Optimized */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            {/* Feature 1 - Smart Exercise Selection */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 h-64 sm:h-80 md:h-96 lg:h-[400px]">
                {/* Skeleton Loader */}
                <AnimatePresence>
                  {!featuresImagesLoaded.image1 && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 animate-pulse"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <img
                  src={PlanBuilder1}
                  alt="Smart Exercise Selection - Advanced filtering system with 200+ exercises categorized by muscle groups and difficulty levels"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  onLoad={() => setFeaturesImagesLoaded(prev => ({ ...prev, image1: true }))}
                  style={{ opacity: featuresImagesLoaded.image1 ? 1 : 0 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl sm:text-2xl">🎯</span>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Smart Exercise Selection</h3>
                  </div>
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                    Advanced filtering with 200+ exercises by muscle groups and difficulty levels.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 - Drag & Drop Interface */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 hover:border-red-600/50 transition-all duration-500 hover:shadow-2xl hover:shadow-red-600/20 h-64 sm:h-80 md:h-96 lg:h-[400px]">
                {/* Skeleton Loader */}
                <AnimatePresence>
                  {!featuresImagesLoaded.image2 && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 animate-pulse"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <img
                  src={PlanBuilder2}
                  alt="Intuitive Drag & Drop Interface - Effortlessly build workout plans with modern UI and seamless interaction"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  onLoad={() => setFeaturesImagesLoaded(prev => ({ ...prev, image2: true }))}
                  style={{ opacity: featuresImagesLoaded.image2 ? 1 : 0 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl sm:text-2xl">🖱️</span>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Intuitive Drag & Drop</h3>
                  </div>
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                    Effortlessly build workout plans with modern drag-and-drop interface.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 3 - Real-time Cloud Sync */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 hover:border-red-600/50 transition-all duration-500 hover:shadow-2xl hover:shadow-red-600/20 h-64 sm:h-80 md:h-96 lg:h-[400px]">
                {/* Skeleton Loader */}
                <AnimatePresence>
                  {!featuresImagesLoaded.image3 && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 animate-pulse"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <img
                  src={PlanBuilder3}
                  alt="Real-time Cloud Sync - Instant synchronization across all devices with MongoDB integration for secure data access"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  onLoad={() => setFeaturesImagesLoaded(prev => ({ ...prev, image3: true }))}
                  style={{ opacity: featuresImagesLoaded.image3 ? 1 : 0 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl sm:text-2xl">☁️</span>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Real-time Cloud Sync</h3>
                  </div>
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                    Instant sync across all devices with MongoDB integration for secure access.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 4 - Advanced Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 hover:border-red-700/50 transition-all duration-500 hover:shadow-2xl hover:shadow-red-700/20 h-64 sm:h-80 md:h-96 lg:h-[400px]">
                {/* Skeleton Loader */}
                <AnimatePresence>
                  {!featuresImagesLoaded.image4 && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 animate-pulse"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <img
                  src={PlanBuilder4}
                  alt="Advanced Analytics & Progress Tracking - Detailed workout insights with performance metrics and personalized recommendations"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  onLoad={() => setFeaturesImagesLoaded(prev => ({ ...prev, image4: true }))}
                  style={{ opacity: featuresImagesLoaded.image4 ? 1 : 0 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl sm:text-2xl">📊</span>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Advanced Analytics</h3>
                  </div>
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                    Track progress with detailed analytics and personalized insights.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mobile-Optimized Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mt-8 sm:mt-12 lg:mt-16 px-3 sm:px-4"
          >
            <div className="bg-gradient-to-r from-neutral-900/80 to-black/80 backdrop-blur-sm border border-neutral-800 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto shadow-2xl">
              {/* Mobile-First Heading */}
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                <span className="block">Ready to Build Your</span>
                <span className="block text-orange-400">Perfect Workout?</span>
              </h3>
              
              {/* Mobile-Optimized Description */}
              <p className="text-neutral-300 text-xs sm:text-sm lg:text-base mb-4 sm:mb-6 leading-relaxed max-w-2xl mx-auto">
                Join thousands using our professional plan builder with
                <span className="font-semibold text-blue-300"> real-time sync</span> and
                <span className="font-semibold text-green-300"> advanced analytics</span>
              </p>
              
              {/* Mobile-Responsive Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => document.getElementById('plan-builder')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-5 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25 flex items-center justify-center gap-2 shadow-xl"
              >
                <span className="text-lg sm:text-xl">🚀</span>
                <span>Start Building Now</span>
              </motion.button>
              
              {/* Mobile-Friendly Features List */}
              <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-3 text-[10px] sm:text-xs">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-neutral-400 bg-neutral-900/50 p-2 sm:p-3 rounded-md sm:rounded-lg border border-neutral-800/50">
                  <span className="text-red-500 text-sm sm:text-base">✅</span>
                  <span className="text-center sm:text-left">Real-time Sync</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-neutral-400 bg-neutral-900/50 p-2 sm:p-3 rounded-md sm:rounded-lg border border-neutral-800/50">
                  <span className="text-red-500 text-sm sm:text-base">📊</span>
                  <span className="text-center sm:text-left">Advanced Analytics</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-neutral-400 bg-neutral-900/50 p-2 sm:p-3 rounded-md sm:rounded-lg border border-neutral-800/50">
                  <span className="text-red-600 text-sm sm:text-base">🏋️</span>
                  <span className="text-center sm:text-left">Professional Grade</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Main Content */}
      <div id="plan-builder" className="container mx-auto px-4 py-8 bg-black min-h-screen">
        
        {/* Mobile-Responsive Status Bar */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Status Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className={`${statusDisplay.color} text-sm font-medium flex items-center gap-1`}>
                <span className="text-base">{statusDisplay.icon}</span>
                <span>{statusDisplay.text}</span>
              </span>
              {isOnline && (
                <span className="text-xs text-green-300 bg-green-900/30 px-2 py-1 rounded-full border border-green-700/50 w-fit">
                  🌐 Live
                </span>
              )}
            </div>
            
            {/* Controls Section - Mobile Stack */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`text-xs px-3 py-2 rounded-full transition-all duration-200 ${
                  autoSave 
                    ? 'bg-blue-900/30 text-blue-300 border border-blue-700 hover:bg-blue-800/40' 
                    : 'bg-neutral-800/50 text-neutral-400 border border-neutral-700 hover:bg-neutral-700/50'
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  <span>{autoSave ? '🔄' : '💾'}</span>
                  <span className="hidden xs:inline">Auto-Save</span>
                  <span className="font-medium">{autoSave ? 'ON' : 'OFF'}</span>
                </span>
              </button>
              <button
                onClick={loadDraft}
                className="text-xs px-3 py-2 rounded-full bg-purple-900/30 text-purple-300 border border-purple-700 hover:bg-purple-800/40 transition-all duration-200"
              >
                <span className="flex items-center justify-center gap-1">
                  <span>📝</span>
                  <span>Load Draft</span>
                </span>
              </button>
            </div>
          </div>
        </div>


        {/* Mobile-Responsive Form Controls */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">🏋️</span>
              <span>Workout Plan Builder</span>
            </h2>
            
            {/* Mobile Status Indicator */}
            <div className="flex items-center gap-2 sm:hidden">
              {plan.length > 0 && (
                <span className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full border border-green-700/50">
                  {plan.length} exercises
                </span>
              )}
              {isOnline && (
                <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded-full border border-blue-700/50">
                  ☁️ Synced
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Plan Name Input - Full Width on Mobile */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2 sm:hidden">
                Plan Name
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Enter plan name..."
                className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-all duration-200"
              />
            </div>
            
            {/* Category and Save Button - Mobile Stack */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-neutral-300 mb-2 sm:hidden">
                  Category
                </label>
                <select
                  value={planCategory}
                  onChange={(e) => setPlanCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-all duration-200"
                >
                  <option value="General">🏋️ General</option>
                  <option value="Strength">💪 Strength</option>
                  <option value="Cardio">❤️ Cardio</option>
                  <option value="Flexibility">🧘 Flexibility</option>
                  <option value="HIIT">🔥 HIIT</option>
                </select>
              </div>
              
              <button
                onClick={savePlan}
                disabled={saving || !planName.trim() || plan.length === 0}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-700 to-red-800 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
              >
                <span className="text-lg">{saving ? '🔄' : '💾'}</span>
                <span>{saving ? 'Saving...' : 'Save Plan'}</span>
              </button>
            </div>
            
            {/* Mobile Plan Progress Indicator */}
            {plan.length > 0 && (
              <div className="sm:hidden bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-300">Plan Progress</span>
                  <span className="text-blue-300 font-medium">{plan.length} exercises</span>
                </div>
                <div className="mt-2 bg-neutral-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-red-600 to-red-700 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((plan.length / 8) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-neutral-400 text-center">
                  {Math.min(Math.round((plan.length / 8) * 100), 100)}% Complete
                </div>
              </div>
            )}
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
                <div className="text-xs text-neutral-400">
                  {exercises.length} exercises • Real-time guidance
                </div>
              </div>
            </div>
            <div className="text-sm text-neutral-300 space-y-1">
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
                  <span className="text-red-500">→ Drop in plan area!</span>
                </div>
              </div>
            )}
            
            {/* Real-time Plan Progress */}
            {plan.length > 0 && (
              <div className="mt-3 p-2 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <div className="text-blue-300 text-sm flex items-center gap-2">
                  <span>📊</span>
                  <span>Plan Progress: {plan.length} exercises added</span>
                  <div className="flex-1 bg-neutral-800 rounded-full h-2 ml-2">
                    <div 
                      className="bg-gradient-to-r from-red-600 to-red-700 h-2 rounded-full transition-all duration-300"
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
              className="w-full sm:w-auto px-3 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span>📋</span>
              <span>View My Plans</span>
              {realTimeStats.totalPlans > 0 && (
                <span className="bg-red-700 text-white text-xs px-2 py-1 rounded-full">
                  {realTimeStats.totalPlans}
                </span>
              )}
            </button>
            
            {isOnline && (
              <div className="text-xs text-red-500 flex items-center justify-center sm:justify-start gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span>Real-time sync active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* Exercise Library */}
        <div 
          className={`bg-neutral-900/60 border border-neutral-800 rounded-lg p-3 sm:p-4 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] transition-all duration-200 ${
            dragOverArea === 'library' ? 'bg-neutral-800/50 border-neutral-500 shadow-lg' : ''
          }`}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, 'library')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'library')}
          data-drop-zone="library"
        >
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-lg sm:text-xl">📚</span>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white truncate">
                  Exercise Library
                </h3>
                <span className="text-[10px] sm:text-xs text-neutral-400">({exercises.length})</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium text-white ${currentMuscleGroup.color}`}>
                {currentMuscleGroup.name}
              </span>
              {isOnline && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-green-900/30 text-green-300 border border-green-700">
                  ☁️
                </span>
              )}
            </div>
          </div>
          
          {/* Muscle Group Tabs - Mobile Optimized */}
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {Object.entries(exerciseLibrary).map(([key, group]) => (
              <button
                key={key}
                onClick={() => setSelectedMuscleGroup(key)}
                className={`p-1.5 sm:p-2 md:p-3 rounded-md sm:rounded-lg text-xs font-medium transition-all ${
                  selectedMuscleGroup === key
                    ? `${group.color} text-white shadow-md`
                    : 'bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50'
                }`}
              >
                <div className="text-lg sm:text-xl mb-0.5 sm:mb-1">{group.icon}</div>
                <div className="truncate text-[10px] sm:text-xs leading-tight">{group.name}</div>
              </button>
            ))}
          </div>
          
          {/* Exercise List - Mobile Optimized */}
          <div className="space-y-1.5 sm:space-y-2 max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto exercise-scroll">
            {exercises.map((exercise, index) => {
              const isInPlan = plan.some(p => p.originalId === exercise.id);
              return (
                <div 
                  key={exercise.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, { ...exercise, category: currentMuscleGroup.name }, 'library')}
                  onDragEnd={handleDragEnd}
                  className={`p-2 sm:p-3 rounded-md sm:rounded-lg border cursor-grab active:cursor-grabbing transition-all duration-200 select-none ${
                    isInPlan 
                      ? 'bg-green-900/30 border-green-700' 
                      : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800/60'
                  }`}
                  data-exercise-id={exercise.id}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="font-medium text-white text-xs sm:text-sm truncate">
                          {exercise.name}
                        </div>
                        {isInPlan && (
                          <span className="text-red-500 text-[10px] bg-green-900/30 px-1.5 py-0.5 rounded-full border border-green-700 flex-shrink-0">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-neutral-400">
                        <span className="flex items-center gap-0.5">
                          <span>🏋️</span>
                          <span className="truncate">{exercise.sets}</span>
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] border flex-shrink-0 ${
                          exercise.difficulty === 'beginner' ? 'bg-green-900/30 text-green-300 border-green-700' :
                          exercise.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700' :
                          'bg-red-900/30 text-red-300 border-red-700'
                        }`}>
                          {exercise.difficulty.slice(0,3)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => addToPlan({ ...exercise, category: currentMuscleGroup.name })}
                        disabled={isInPlan}
                        className={`text-base font-bold w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md transition-all ${
                          isInPlan 
                            ? 'text-red-500 bg-green-900/30 border border-green-700' 
                            : 'text-red-500 hover:bg-blue-900/20 border border-transparent'
                        }`}
                      >
                        {isInPlan ? '✓' : '+'}
                      </button>
                      <div className="text-neutral-500 text-sm cursor-grab hidden sm:block">
                        ⋮⋮
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🎯 Your Workout Plan - Mobile-First Responsive */}
        <div 
          className={`bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 sm:p-5 md:p-6 min-h-[350px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[550px] transition-all duration-300 ${
            dragOverArea === 'plan' 
              ? 'bg-green-900/30 border-red-500 shadow-xl ring-2 ring-red-500/50 scale-[1.02]' 
              : 'hover:bg-neutral-900/80 hover:border-neutral-700'
          }`}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, 'plan')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'plan')}
          data-drop-zone="plan"
        >
          {/* Mobile-Optimized Header */}
          <div className="flex flex-col gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl sm:text-2xl">🎯</span>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">
                  <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                    Your Workout Plan
                  </span>
                </h3>
              </div>
              {plan.length > 0 && (
                <span className="text-[10px] sm:text-xs text-red-500 font-medium flex items-center gap-1 flex-shrink-0">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="hidden sm:inline">Ready!</span>
                </span>
              )}
            </div>
            
            {/* Mobile-Friendly Status Badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs font-medium text-neutral-300 bg-neutral-800/60 px-2 py-1 rounded-full border border-neutral-700">
                <span className="text-red-500">📊</span>{plan.length}
              </span>
              {plan.length > 0 && (
                <span className="text-[10px] sm:text-xs bg-gradient-to-r from-blue-900/40 to-purple-900/40 text-blue-300 px-2 py-1 rounded-full border border-blue-700/50">
                  <span>🔥</span><span className="hidden sm:inline">Active</span>
                </span>
              )}
              {isOnline && (
                <span className="text-[10px] bg-green-900/30 text-green-300 px-2 py-1 rounded-full border border-green-700/50">
                  ☁️<span className="hidden sm:inline">Live</span>
                </span>
              )}
            </div>
          </div>
          
          {/* Mobile-Optimized Empty State */}
          {plan.length === 0 ? (
            <div className="flex items-center justify-center min-h-[200px] sm:min-h-[250px] md:min-h-[300px] border-2 border-dashed border-neutral-700 rounded-xl transition-all duration-300 hover:border-neutral-500 hover:bg-neutral-900/30 mx-1">
              <div className="text-center px-6 py-8">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-4 animate-bounce">🎯</div>
                <h4 className="text-neutral-300 text-base sm:text-lg md:text-xl font-semibold mb-2">
                  Start Building Your Plan
                </h4>
                <p className="text-neutral-400 text-sm sm:text-base mb-3 max-w-xs mx-auto leading-relaxed">
                  Drag exercises here or tap the + button to add them
                </p>
                <div className="space-y-2">
                  <p className="text-neutral-500 text-xs sm:text-sm">
                    Build your custom workout plan
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-neutral-500">
                    <span className="text-base">💪</span>
                    <span className="font-medium">Professional gym-level planning</span>
                    <span className="text-base">💪</span>
                  </div>
                </div>
                
                {/* Mobile Hint */}
                <div className="mt-4 sm:hidden">
                  <p className="text-xs text-neutral-700 bg-neutral-900/50 px-3 py-2 rounded-lg border border-neutral-800">
                    💡 Tap + buttons to add exercises on mobile
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900">
              {plan.map((exercise, index) => (
                <div 
                  key={exercise.planId}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, exercise, 'plan')}
                  onDragEnd={handleDragEnd}
                  className="group p-4 sm:p-5 rounded-xl bg-gradient-to-r from-green-900/20 via-blue-900/20 to-purple-900/20 border border-green-700/50 cursor-grab active:cursor-grabbing transition-all duration-300 hover:from-green-800/30 hover:via-blue-800/30 hover:to-purple-800/30 hover:border-green-600/70 hover:shadow-xl hover:shadow-green-900/20 select-none transform hover:scale-[1.02] active:scale-[0.98]"
                  data-plan-id={exercise.planId}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Mobile-First Exercise Layout */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {/* Exercise Number & Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0">
                        <span className="text-red-500 font-bold text-base sm:text-lg bg-gradient-to-r from-green-900/60 to-blue-900/60 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border border-green-700/50 shadow-lg group-hover:shadow-red-600/20 transition-all duration-300">
                          {index + 1}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Exercise Name */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white text-base sm:text-lg truncate">
                            {exercise.name}
                          </h4>
                          <span className="text-xs bg-gradient-to-r from-blue-900/40 to-purple-900/40 text-blue-300 px-3 py-1 rounded-full border border-blue-700/50 w-fit">
                            ✓ Added to Plan
                          </span>
                        </div>
                        
                        {/* Exercise Details - Mobile Optimized */}
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-neutral-400">
                          <span className="flex items-center gap-1 bg-neutral-900/50 px-2 py-1 rounded-md border border-neutral-800">
                            <span className="text-sm">🏅</span>
                            <span className="font-medium">{exercise.category}</span>
                          </span>
                          <span className="flex items-center gap-1 bg-neutral-900/50 px-2 py-1 rounded-md border border-neutral-800">
                            <span className="text-sm">🏋️</span>
                            <span className="font-medium">{exercise.sets}</span>
                          </span>
                          {exercise.difficulty && (
                            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                              exercise.difficulty === 'beginner' ? 'bg-green-900/40 text-green-300 border-green-700/50' :
                              exercise.difficulty === 'intermediate' ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50' :
                              'bg-red-900/40 text-red-300 border-red-700/50'
                            }`}>
                              {exercise.difficulty}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile-Optimized Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t border-neutral-800/50 sm:border-t-0">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-base w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-800/50 transition-all duration-200 border border-transparent hover:border-neutral-700 active:scale-95"
                          title="Move up"
                        >
                          <span className="text-sm font-bold">↑</span>
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === plan.length - 1}
                          className="text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-base w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-800/50 transition-all duration-200 border border-transparent hover:border-neutral-700 active:scale-95"
                          title="Move down"
                        >
                          <span className="text-sm font-bold">↓</span>
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromPlan(exercise.planId)}
                          className="text-red-400 hover:text-red-300 text-xl font-bold w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-900/30 transition-all duration-200 border border-transparent hover:border-red-700/50 active:scale-95"
                          title="Remove from plan"
                        >
                          ×
                        </button>
                        <div className="text-neutral-500 text-xl cursor-grab hidden sm:block">
                          ⋮⋮
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Mobile-Optimized Plan Summary */}
              {plan.length > 0 && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-indigo-900/30 border border-blue-700/50 rounded-lg sm:rounded-xl shadow-lg">
                  <div className="text-blue-300">
                    {/* Summary Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl">📊</span>
                        <h4 className="font-bold text-sm sm:text-base text-white">
                          Plan Summary
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 bg-green-900/30 px-2 py-0.5 rounded-full border border-green-700/50">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-medium text-green-300">Live</span>
                      </div>
                    </div>
                    
                    {/* Stats Grid - Mobile Responsive */}
                    <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-3">
                      <div className="bg-neutral-900/50 p-2 rounded-md border border-neutral-800/50 text-center">
                        <div className="text-base sm:text-lg mb-0.5">🏋️</div>
                        <div className="text-xs sm:text-sm font-semibold text-white">{plan.length}</div>
                        <div className="text-[9px] sm:text-[10px] text-neutral-400">ex</div>
                      </div>
                      <div className="bg-neutral-900/50 p-2 rounded-md border border-neutral-800/50 text-center">
                        <div className="text-base sm:text-lg mb-0.5">🔥</div>
                        <div className="text-xs sm:text-sm font-semibold text-white truncate">{planCategory.slice(0,3)}</div>
                        <div className="text-[9px] sm:text-[10px] text-neutral-400">cat</div>
                      </div>
                      <div className="bg-neutral-900/50 p-2 rounded-md border border-neutral-800/50 text-center">
                        <div className="text-base sm:text-lg mb-0.5">⏱️</div>
                        <div className="text-xs sm:text-sm font-semibold text-white">{plan.length * 3}m</div>
                        <div className="text-[9px] sm:text-[10px] text-neutral-400">time</div>
                      </div>
                      <div className="bg-neutral-900/50 p-2 rounded-md border border-neutral-800/50 text-center">
                        <div className="text-base sm:text-lg mb-0.5">💪</div>
                        <div className="text-xs sm:text-sm font-semibold text-white">Pro</div>
                        <div className="text-[9px] sm:text-[10px] text-neutral-400">lvl</div>
                      </div>
                    </div>
                    
                    {/* Mobile-Friendly Info */}
                    <div className="bg-neutral-900/30 p-2 sm:p-3 rounded-md border border-neutral-800/30">
                      <div className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-neutral-300">
                        <span className="text-sm flex-shrink-0">💡</span>
                        <div className="leading-relaxed">
                          <span className="font-medium">Cloud Sync:</span> Auto-syncs to MongoDB across all devices
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Mobile-Optimized Real-time Sync Indicator */}
              {plan.length > 0 && (
                <div className="mt-3 p-2.5 sm:p-3 bg-neutral-900/50 border border-neutral-700/50 rounded-lg">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-neutral-300 min-w-0">
                      <span className="text-base sm:text-lg flex-shrink-0">☁️</span>
                      <span className="text-xs sm:text-sm font-medium truncate">MongoDB Sync</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-neutral-800/50 px-2 py-1 rounded-md border border-neutral-700/50 flex-shrink-0">
                      {isOnline ? (
                        <>
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          <span className="text-green-300 text-[10px] sm:text-xs font-medium">Connected</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                          <span className="text-orange-300 text-[10px] sm:text-xs font-medium">Offline</span>
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