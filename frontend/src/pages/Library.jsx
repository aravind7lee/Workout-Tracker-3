import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, Dumbbell, Play, Plus, X, Video, ChevronRight, ChevronDown,
  Sparkles, Check, Info, Filter, ArrowRight, Layers, Eye, Edit3, 
  CheckCircle2, Zap, Star, ClipboardList, Trophy, FolderPlus, 
  Bookmark, Flame, RefreshCw, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { exerciseLibrary } from '../data/exerciseLibrary';
import { getFormTips } from '../data/exerciseFormTips';
import { getExerciseVideo } from '../data/exerciseVideos';
import { PRService } from '../services/prService';

import LibraryPlanModal from '../components/LibraryPlanModal';
import QuickLogExerciseModal from '../components/QuickLogExerciseModal';
import ExerciseDetailModal from '../components/ExerciseDetailModal';
import WorkoutSetupModal from '../components/WorkoutSetupModal';
import BackToDashboard from '../components/BackToDashboard';

import LibraryHeaderImg from "../assets/Libraryheader.jpg";
import Library1 from "../assets/Library1.jpg";
import Library2 from "../assets/Library2.jpg";
import Library4 from "../assets/Library4.jpg";
import Library5 from "../assets/Library5.jpg";
import Library6 from "../assets/Library6.jpg";
import Library7 from "../assets/Library7.jpg";
import Library8 from "../assets/Library8.jpg";
import Library11 from "../assets/Library11.jpg";

const FEATURED_CATEGORIES = [
  {
    id: "cat_strength",
    title: "STRENGTH TRAINING",
    tagline: "Build Raw Power",
    description: "Compound movements for maximum strength gains",
    image: Library1,
    filterType: "compound",
    categoryKey: "strength"
  },
  {
    id: "cat_hypertrophy",
    title: "MUSCLE BUILDING",
    tagline: "Mass & Definition",
    description: "Hypertrophy training for maximum muscle growth",
    image: Library2,
    filterType: "hypertrophy",
    categoryKey: "hypertrophy"
  },
  {
    id: "cat_functional",
    title: "FUNCTIONAL FITNESS",
    tagline: "Real-World Movement",
    description: "Practical exercises for daily performance",
    image: Library4,
    filterType: "functional",
    categoryKey: "functional"
  },
  {
    id: "cat_mobility",
    title: "FLEXIBILITY & MOBILITY",
    tagline: "Recovery & Movement",
    description: "Enhance range of motion and recovery",
    image: Library5,
    filterType: "mobility",
    categoryKey: "mobility"
  },
  {
    id: "cat_heavy",
    title: "HEAVY LIFTING",
    tagline: "Elite Technique",
    description: "Advanced lifting techniques and barbell form",
    image: Library6,
    filterType: "heavy",
    categoryKey: "heavy"
  },
  {
    id: "cat_bodyweight",
    title: "BODYWEIGHT TRAINING",
    tagline: "No Equipment Needed",
    description: "Master your bodyweight movements and calisthenics",
    image: Library7,
    filterType: "bodyweight",
    categoryKey: "bodyweight"
  },
  {
    id: "cat_sports",
    title: "SPORTS PERFORMANCE",
    tagline: "Athletic Excellence",
    description: "Sport-specific explosive protocols",
    image: Library8,
    filterType: "sports",
    categoryKey: "sports"
  },
  {
    id: "cat_power",
    title: "POWER TRAINING",
    tagline: "Explosive Movement",
    description: "Develop explosive power and athletic performance",
    image: Library11,
    filterType: "power",
    categoryKey: "power"
  }
];

export default function Library() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navbarSearch = searchParams.get("search") || "";

  // Core Search & Filters State
  const [searchQuery, setSearchQuery] = useState(navbarSearch);
  const [selectedMuscle, setSelectedMuscle] = useState("all");
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const [selectedMechanics, setSelectedMechanics] = useState("all");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyHasPR, setOnlyHasPR] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);

  // Authoritative PRs State
  const [userPRs, setUserPRs] = useState({});
  const [loadingPRs, setLoadingPRs] = useState(false);

  // Favorites state (persisted in localStorage)
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("gym_favorite_exercises") || "[]");
    } catch {
      return [];
    }
  });

  // Accordion state for form tips
  const [expandedFormTips, setExpandedFormTips] = useState({});

  // Production Modals State
  const [showWorkoutSetup, setShowWorkoutSetup] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(null);
  const [showQuickLogModal, setShowQuickLogModal] = useState(null);
  const [selectedDetailExercise, setSelectedDetailExercise] = useState(null);
  const [selectedVideoExercise, setSelectedVideoExercise] = useState(null);
  const [toastNotification, setToastNotification] = useState(null);

  const exercisesSectionRef = useRef(null);

  // Toggle Favorite
  const toggleFavorite = (exerciseName, e) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      let updated;
      if (prev.includes(exerciseName)) {
        updated = prev.filter((name) => name !== exerciseName);
      } else {
        updated = [...prev, exerciseName];
      }
      try {
        localStorage.setItem("gym_favorite_exercises", JSON.stringify(updated));
      } catch (err) {
        console.warn("Failed to persist favorites:", err);
      }
      return updated;
    });
  };

  // Toggle Form Tips Accordion
  const toggleFormTips = (exId) => {
    setExpandedFormTips((prev) => ({
      ...prev,
      [exId]: !prev[exId]
    }));
  };

  // Show Toast
  const triggerToast = (msg, type = "success") => {
    setToastNotification({ message: msg, type });
    setTimeout(() => {
      setToastNotification(null);
    }, 3200);
  };

  // Fetch Authoritative PRs from MongoDB Atlas on mount & on workoutLogged event
  const loadUserPRs = async () => {
    try {
      setLoadingPRs(true);
      const prMap = await PRService.fetchUserPRsFromAPI();
      setUserPRs(prMap || {});
    } catch (err) {
      console.warn("Failed to load user PRs:", err);
    } finally {
      setLoadingPRs(false);
    }
  };

  useEffect(() => {
    loadUserPRs();

    const handleWorkoutLogged = () => {
      loadUserPRs();
      triggerToast("Personal Records updated!", "pr");
    };

    window.addEventListener("workoutLogged", handleWorkoutLogged);
    return () => {
      window.removeEventListener("workoutLogged", handleWorkoutLogged);
    };
  }, []);

  // Sync navbar search
  useEffect(() => {
    if (navbarSearch && navbarSearch !== searchQuery) {
      setSearchQuery(navbarSearch);
    }
  }, [navbarSearch]);

  // Flatten exercise library with 100% video URL mapping and equipment inference
  const allExercises = useMemo(() => {
    const list = [];
    Object.entries(exerciseLibrary).forEach(([muscleKey, group]) => {
      if (group && Array.isArray(group.exercises)) {
        group.exercises.forEach((ex) => {
          const muscleName = group.name || muscleKey;
          const mappedVideo = getExerciseVideo(ex.name) || ex.videoUrl || "https://www.youtube.com/watch?v=rT7DgCr-3pg";
          
          // Infer Equipment
          const n = ex.name.toLowerCase();
          let equipment = "Barbell";
          if (n.includes("dumbbell")) equipment = "Dumbbell";
          else if (n.includes("cable")) equipment = "Cable";
          else if (n.includes("machine") || n.includes("pec deck") || n.includes("pec-deck") || n.includes("leg press") || n.includes("hack squat")) equipment = "Machine";
          else if (n.includes("push-up") || n.includes("pull-up") || n.includes("dip") || n.includes("crunch") || n.includes("plank") || n.includes("handstand") || n.includes("bodyweight")) equipment = "Bodyweight";
          else if (n.includes("kettlebell")) equipment = "Kettlebell";
          else if (n.includes("band")) equipment = "Resistance Band";

          // Infer Mechanics (Compound vs Isolation)
          const isCompound = 
            ex.type === "compound" ||
            n.includes("press") || n.includes("squat") || n.includes("deadlift") || 
            n.includes("row") || n.includes("pull-up") || n.includes("push-up") || 
            n.includes("dip") || n.includes("thrust");

          list.push({
            ...ex,
            id: ex.id || `ex_${ex.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            muscleKey,
            muscleName,
            equipment: ex.equipment || equipment,
            videoUrl: mappedVideo,
            type: isCompound ? "compound" : "isolation",
            difficulty: ex.difficulty || "intermediate",
            icon: group.icon || "💪"
          });
        });
      }
    });
    return list;
  }, []);

  // Multi-Dimensional Filtering Logic
  const filteredExercises = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allExercises.filter((ex) => {
      // 1. Muscle Group Filter
      const matchesMuscle =
        selectedMuscle === "all" ||
        ex.muscleName.toLowerCase() === selectedMuscle.toLowerCase() ||
        (selectedMuscle === "Abs / Core" && (ex.muscleName.toLowerCase().includes("core") || ex.muscleName.toLowerCase().includes("abs")));

      // 2. Equipment Filter
      const matchesEquipment =
        selectedEquipment === "all" ||
        ex.equipment.toLowerCase() === selectedEquipment.toLowerCase();

      // 3. Mechanics Filter
      const matchesMechanics =
        selectedMechanics === "all" ||
        ex.type.toLowerCase() === selectedMechanics.toLowerCase();

      // 4. Favorites Toggle
      const matchesFavorites = !onlyFavorites || favorites.includes(ex.name);

      // 5. PR Toggle
      const matchesPR = !onlyHasPR || Boolean(userPRs[ex.name]?.maxWeight);

      // 6. Category Card Active Filter
      let matchesCategory = true;
      if (activeCategoryFilter) {
        const catKey = activeCategoryFilter.categoryKey;
        const n = ex.name.toLowerCase();
        if (catKey === "strength") {
          matchesCategory = ex.type === "compound";
        } else if (catKey === "hypertrophy") {
          matchesCategory = ex.difficulty === "intermediate" || ex.difficulty === "advanced";
        } else if (catKey === "functional") {
          matchesCategory = ["Dumbbell", "Cable", "Bodyweight", "Kettlebell"].includes(ex.equipment);
        } else if (catKey === "mobility") {
          matchesCategory = ex.muscleName.toLowerCase().includes("core") || ex.muscleName.toLowerCase().includes("abs") || ex.equipment === "Bodyweight";
        } else if (catKey === "heavy") {
          matchesCategory = ex.equipment === "Barbell" && ex.type === "compound";
        } else if (catKey === "bodyweight") {
          matchesCategory = ex.equipment === "Bodyweight";
        } else if (catKey === "sports" || catKey === "power") {
          matchesCategory = ex.type === "compound";
        }
      }

      // 7. Search Query
      const matchesSearch =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        ex.muscleName.toLowerCase().includes(q) ||
        ex.equipment.toLowerCase().includes(q) ||
        (ex.type && ex.type.toLowerCase().includes(q));

      return (
        matchesMuscle &&
        matchesEquipment &&
        matchesMechanics &&
        matchesFavorites &&
        matchesPR &&
        matchesCategory &&
        matchesSearch
      );
    });
  }, [
    allExercises,
    searchQuery,
    selectedMuscle,
    selectedEquipment,
    selectedMechanics,
    activeCategoryFilter,
    onlyFavorites,
    onlyHasPR,
    favorites,
    userPRs
  ]);

  // Load balancing pagination
  const visibleExercises = useMemo(() => {
    return filteredExercises.slice(0, visibleCount);
  }, [filteredExercises, visibleCount]);

  const scrollToExercises = () => {
    if (exercisesSectionRef.current) {
      exercisesSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategoryCard = (cat) => {
    if (activeCategoryFilter?.id === cat.id) {
      setActiveCategoryFilter(null);
    } else {
      setActiveCategoryFilter(cat);
    }
    scrollToExercises();
  };

  const handleWorkoutSetupComplete = ({ exercise, config }) => {
    setShowWorkoutSetup(null);
    navigate("/start-workout", {
      state: {
        selectedExercise: exercise,
        workoutConfig: config,
        fromLibrary: true
      }
    });
  };

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedMuscle("all");
    setSelectedEquipment("all");
    setSelectedMechanics("all");
    setActiveCategoryFilter(null);
    setOnlyFavorites(false);
    setOnlyHasPR(false);
  };

  // Embed URL helper
  const getEmbedUrl = (url) => {
    if (!url) return 'https://www.youtube.com/embed/rT7DgCr-3pg';
    if (url.includes('embed/')) return url;
    if (url.includes('watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return 'https://www.youtube.com/embed/rT7DgCr-3pg';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white pb-36 sm:pb-28 overflow-x-hidden transition-colors duration-300">
      <BackToDashboard variant="floating" />
      
      {/* 1. HERO SECTION (100% VISUALLY PRESERVED AS REQUESTED) */}
      <div className="theme-dark-surface relative w-full min-h-[85vh] h-[85vh] sm:h-[88vh] lg:h-[90vh] rounded-none sm:rounded-3xl overflow-hidden border-b sm:border border-neutral-800/80 shadow-2xl bg-black">
        <img 
          src={LibraryHeaderImg} 
          alt="Exercise Library Hero" 
          className="w-full h-full object-cover object-top sm:object-[center_top] filter brightness-105 contrast-100 saturate-105"
          loading="eager"
        />
        {/* Subtle non-dull gradient overlay for full image clarity and text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-5xl mx-auto space-y-4 sm:space-y-6 z-10">
          <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-black text-[#ff9800] sm:text-[#f39c12] tracking-wider uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] font-sans">
            EXERCISE LIBRARY
          </h1>
          <p className="text-sm sm:text-base lg:text-xl text-neutral-100 font-medium max-w-xs sm:max-w-2xl mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] leading-relaxed">
            Browse, track, and customize your exercises with ease.
          </p>

          {/* Premium Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-6 w-full max-w-[280px] sm:max-w-none mx-auto"
          >
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToExercises}
              className="premium-btn-primary btn-primary preserve-color w-full sm:w-auto"
            >
              Explore Exercises
              <ArrowRight className="w-4 h-4 stroke-[3] shrink-0" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/start-workout')}
              className="premium-btn-secondary btn-secondary preserve-color w-full sm:w-auto"
            >
              Start Training
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Real-Time Toast Notification */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 right-4 sm:right-6 z-50 bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 font-bold text-xs border border-white/20"
          >
            <Trophy className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>{toastNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. 8 CATEGORY IMAGE CARDS GRID */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-8 sm:pt-12 space-y-6 sm:space-y-10">
        <div className="text-center space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" /> Workout Categories
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Targeted Training Categories
          </h2>
          <p className="text-[10px] sm:text-sm text-slate-500 dark:text-neutral-400 max-w-lg mx-auto">
            Select a category below to explore specific exercises and technique guides.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {FEATURED_CATEGORIES.map((cat) => {
            const isActive = activeCategoryFilter?.id === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => handleSelectCategoryCard(cat)}
                className={`group relative h-48 sm:h-60 md:h-68 lg:h-76 rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer border shadow-xl transition-all duration-300 transform active:scale-95 hover:-translate-y-1 ${
                  isActive
                    ? "border-orange-500 ring-2 ring-orange-500 scale-[1.02]"
                    : "border-slate-200 dark:border-neutral-800/80 hover:border-orange-500/60"
                }`}
              >
                <img 
                  src={cat.image} 
                  alt={cat.title} 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {isActive && (
                  <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-orange-500 text-white text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> Active
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 md:p-6 space-y-1 sm:space-y-1.5">
                  <h3 className="text-xs sm:text-base md:text-lg font-black text-white uppercase tracking-wider group-hover:text-red-400 transition-colors line-clamp-1">
                    {cat.title}
                  </h3>
                  <p className="text-[9px] sm:text-xs font-bold text-red-500 uppercase tracking-wide truncate">
                    {cat.tagline}
                  </p>
                  <p className="text-[10px] sm:text-xs text-neutral-300 leading-relaxed line-clamp-2 hidden xs:block">
                    {cat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. EXERCISES DIRECTORY LIST SECTION */}
        <div ref={exercisesSectionRef} className="pt-6 sm:pt-8 space-y-6 sm:space-y-8 border-t border-slate-200 dark:border-neutral-900">
          
          {/* Active Category Filter Banner (if selected) */}
          {activeCategoryFilter && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-red-500/10 to-transparent border border-orange-500/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase">
                    Active Targeted Filter
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    {activeCategoryFilter.title} • {activeCategoryFilter.tagline}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setActiveCategoryFilter(null)}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            </motion.div>
          )}

          {/* Search Bar & Multi-Dimensional Filter Strip */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <span>Exercise Directory</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300">
                    {filteredExercises.length}
                  </span>
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                  Showing {visibleExercises.length} of {filteredExercises.length} filtered exercises ({allExercises.length} total)
                </p>
              </div>

              {/* Instant Search Bar */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search by exercise name, muscle, equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 rounded-xl pl-9 pr-8 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-orange-500 shadow-sm transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-neutral-400 dark:hover:text-white text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Muscle Category Filter Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {['all', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs / Core'].map((muscle) => {
                const isSelected = selectedMuscle.toLowerCase() === muscle.toLowerCase();
                return (
                  <button
                    key={muscle}
                    onClick={() => setSelectedMuscle(muscle)}
                    className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30 scale-105'
                        : 'bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    {muscle === 'all' ? 'All Muscles' : muscle}
                  </button>
                );
              })}
            </div>

            {/* Sub-Filters: Equipment & Mechanics & Aura Toggles */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px] flex-wrap">
              {/* Equipment Dropdown / Pills */}
              <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase px-2">Equipment:</span>
                {['all', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight'].map((eq) => (
                  <button
                    key={eq}
                    onClick={() => setSelectedEquipment(eq)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      selectedEquipment.toLowerCase() === eq.toLowerCase()
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {eq === 'all' ? 'All' : eq}
                  </button>
                ))}
              </div>

              {/* Mechanics Filter */}
              <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase px-2">Type:</span>
                {['all', 'compound', 'isolation'].map((mech) => (
                  <button
                    key={mech}
                    onClick={() => setSelectedMechanics(mech)}
                    className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                      selectedMechanics.toLowerCase() === mech.toLowerCase()
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {mech}
                  </button>
                ))}
              </div>

              {/* Favorites Toggle Button */}
              <button
                onClick={() => setOnlyFavorites((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center gap-1.5 ${
                  onlyFavorites
                    ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-400'
                    : 'bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 hover:border-amber-400'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>Favorites ({favorites.length})</span>
              </button>

              {/* Has PR Toggle Button */}
              <button
                onClick={() => setOnlyHasPR((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center gap-1.5 ${
                  onlyHasPR
                    ? 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-400'
                    : 'bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 hover:border-red-400'
                }`}
              >
                <Trophy className={`w-3.5 h-3.5 ${onlyHasPR ? 'text-red-500' : ''}`} />
                <span>Has My PR</span>
              </button>

              {/* Reset button if any filter active */}
              {(selectedMuscle !== 'all' || selectedEquipment !== 'all' || selectedMechanics !== 'all' || searchQuery || activeCategoryFilter || onlyFavorites || onlyHasPR) && (
                <button
                  onClick={resetAllFilters}
                  className="px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:underline font-bold"
                >
                  Reset All
                </button>
              )}
            </div>
          </div>

          {/* Exercise Cards Grid */}
          {filteredExercises.length === 0 ? (
            <div className="py-12 sm:py-16 text-center space-y-3 bg-white dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-6 shadow-sm">
              <Dumbbell className="w-10 h-10 text-red-500 mx-auto" />
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">No Exercises Found</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
                No exercises matched your current combination of search, muscle, equipment, or category filters.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 md:gap-6 items-stretch">
              {visibleExercises.map((ex) => {
                const formTips = getFormTips(ex.name);
                const isFormTipsOpen = expandedFormTips[ex.id];
                const isFav = favorites.includes(ex.name);
                const pr = userPRs[ex.name];

                return (
                  <div
                    key={ex.id}
                    className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 hover:border-slate-300 dark:hover:border-neutral-700 transition-all shadow-sm dark:shadow-xl relative group"
                  >
                    {/* Upper Content Group */}
                    <div className="space-y-3">
                      {/* Exercise Header & Favorite Button */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black tracking-wider uppercase">
                            <span className="text-red-600 dark:text-red-400 truncate">{ex.muscleName}</span>
                            <span className="text-slate-300 dark:text-neutral-700">•</span>
                            <span className="text-slate-500 dark:text-neutral-400 truncate">{ex.equipment}</span>
                          </div>
                          <h3 
                            className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug truncate" 
                            title={ex.name}
                          >
                            {ex.name}
                          </h3>
                        </div>

                        {/* Interactive Favorite Star Button */}
                        <button
                          onClick={(e) => toggleFavorite(ex.name, e)}
                          title={isFav ? "Remove from favorites" : "Add to favorites"}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                            isFav
                              ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-sm"
                              : "bg-slate-50 dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 text-slate-400 hover:text-amber-500 hover:border-amber-400"
                          }`}
                        >
                          <Star className={`w-4 h-4 ${isFav ? "fill-amber-500" : ""}`} />
                        </button>
                      </div>

                      {/* Badges & Target Sets Row */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-neutral-900">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-400 font-bold text-[10px] rounded-lg shrink-0">
                            <Zap className="w-2.5 h-2.5 text-red-500" />
                            <span className="capitalize">{ex.type || 'compound'}</span>
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] rounded-lg shrink-0 capitalize">
                            {ex.difficulty || 'intermediate'}
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-neutral-300 bg-slate-100 dark:bg-neutral-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-neutral-800 shrink-0 tabular-nums">
                          {ex.sets || '3-4 sets'}
                        </span>
                      </div>

                      {/* Aura Personal Record (PR) Pill */}
                      {pr && pr.maxWeight > 0 ? (
                        <div 
                          onClick={() => setSelectedDetailExercise(ex)}
                          className="min-h-[38px] px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 flex items-center justify-between cursor-pointer hover:border-amber-500/60 transition-all group/pr"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="text-xs font-black text-amber-800 dark:text-amber-300 truncate">
                              PR: {pr.maxWeight} kg × {pr.maxReps || 0} reps
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-0.5 shrink-0 group-hover/pr:translate-x-0.5 transition-transform">
                            History <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      ) : (
                        <div 
                          onClick={() => setShowQuickLogModal(ex)}
                          className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-neutral-900/60 border border-dashed border-slate-200 dark:border-neutral-800 text-[11px] font-medium text-slate-500 dark:text-neutral-400 flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-neutral-700 transition-all"
                        >
                          <span className="truncate">No personal best logged yet</span>
                          <span className="text-orange-500 font-bold hover:underline shrink-0 ml-1">+ Log set</span>
                        </div>
                      )}

                      {/* Form Tips & Technique Collapsible Accordion */}
                      <div className="bg-slate-50 dark:bg-neutral-900/70 border border-slate-200 dark:border-neutral-800/80 rounded-xl overflow-hidden transition-all">
                        <button
                          onClick={() => toggleFormTips(ex.id)}
                          className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <ClipboardList className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400" />
                            <span>Form Tips & Technique</span>
                          </div>
                          <ChevronDown className={`w-3.5 h-3.5 text-red-500 transition-transform duration-200 ${isFormTipsOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isFormTipsOpen && (
                          <div className="p-3 border-t border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 space-y-2 text-xs text-slate-700 dark:text-neutral-300 leading-relaxed">
                            {formTips?.formTips && formTips.formTips.length > 0 && (
                              <div className="space-y-1">
                                <strong className="text-red-600 dark:text-red-400 block text-[10px] uppercase font-bold tracking-wider">Key Technique:</strong>
                                <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-neutral-300">
                                  {formTips.formTips.slice(0, 3).map((tip, idx) => (
                                    <li key={idx}>{tip}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {formTips?.breathingTip && (
                              <div className="pt-1.5 border-t border-slate-100 dark:border-neutral-800/60">
                                <strong className="text-emerald-600 dark:text-emerald-400 block text-[10px] uppercase font-bold tracking-wider">Breathing Cadence:</strong>
                                <p className="text-slate-600 dark:text-neutral-300">{formTips.breathingTip}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Section: 2-Tier Fluid Responsive Structure */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-neutral-800/80">
                      {/* Tier 1: 3 Secondary Utility Actions (Zero Text-Wrapping) */}
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                        {/* Watch Form Video */}
                        <button
                          onClick={() => setSelectedVideoExercise(ex)}
                          title="Watch HD Form Video"
                          className="h-8 sm:h-9 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-200 text-[11px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
                        >
                          <Video className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400 shrink-0" />
                          <span>Video</span>
                        </button>

                        {/* Deep Dive & History Guide */}
                        <button
                          onClick={() => setSelectedDetailExercise(ex)}
                          title="Technique, History & 1RM"
                          className="h-8 sm:h-9 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-200 text-[11px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400 shrink-0" />
                          <span>Guide</span>
                        </button>

                        {/* Add to Routine (MongoDB) */}
                        <button
                          onClick={() => setShowPlanModal(ex)}
                          title="Add to Workout Plan"
                          className="h-8 sm:h-9 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-200 text-[11px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
                        >
                          <FolderPlus className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400 shrink-0" />
                          <span>+ Plan</span>
                        </button>
                      </div>

                      {/* Tier 2: Full-Width Primary Action: Quick Log Set */}
                      <button
                        onClick={() => setShowQuickLogModal(ex)}
                        title="Quick Log a Completed Set"
                        className="h-9 sm:h-10 w-full bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white text-xs sm:text-sm font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/20 whitespace-nowrap"
                      >
                        <Zap className="w-4 h-4 fill-current shrink-0" />
                        <span>Quick Log Set</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {visibleCount < filteredExercises.length && (
            <div className="text-center pt-4 sm:pt-6">
              <button
                onClick={() => setVisibleCount((prev) => prev + 24)}
                className="px-6 py-2.5 sm:px-8 sm:py-3 bg-white dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-300 dark:border-neutral-800 text-slate-900 dark:text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xl sm:rounded-2xl shadow-lg inline-flex items-center gap-2 transition-all hover:scale-105"
              >
                Load More Exercises ({filteredExercises.length - visibleCount} Remaining)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Production Modals */}
      
      {/* 1. Deep Dive Exercise Modal (Tabs: Guide, Video, MongoDB History, 1RM Calc) */}
      {selectedDetailExercise && (
        <ExerciseDetailModal
          exercise={selectedDetailExercise}
          currentPR={userPRs[selectedDetailExercise.name]}
          onClose={() => setSelectedDetailExercise(null)}
          onStartWorkout={(ex) => {
            setSelectedDetailExercise(null);
            setShowWorkoutSetup(ex);
          }}
          onQuickLog={(ex) => {
            setSelectedDetailExercise(null);
            setShowQuickLogModal(ex);
          }}
        />
      )}

      {/* 2. Quick Log Modal (Logs directly to MongoDB Atlas) */}
      {showQuickLogModal && (
        <QuickLogExerciseModal
          exercise={showQuickLogModal}
          currentPR={userPRs[showQuickLogModal.name]}
          onClose={() => setShowQuickLogModal(null)}
          onLogged={(updatedPRs) => {
            if (updatedPRs) setUserPRs(updatedPRs);
            triggerToast(`Logged sets for ${showQuickLogModal.name}!`);
          }}
        />
      )}

      {/* 3. Real Workout Plan Routine Modal (MongoDB Atlas) */}
      {showPlanModal && (
        <LibraryPlanModal
          exercise={showPlanModal}
          onClose={() => setShowPlanModal(null)}
          onSaved={(plan) => {
            triggerToast(`Saved to ${plan.name || "plan"}!`);
          }}
        />
      )}

      {/* 4. Pre-Workout Setup Modal */}
      {showWorkoutSetup && (
        <WorkoutSetupModal
          exercise={showWorkoutSetup}
          onClose={() => setShowWorkoutSetup(null)}
          onStartWorkout={handleWorkoutSetupComplete}
        />
      )}

      {/* 5. Video Demo Modal */}
      {selectedVideoExercise && (
        <div 
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 transition-all"
          onClick={() => setSelectedVideoExercise(null)}
        >
          <div 
            className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex flex-shrink-0 items-start justify-between gap-3 mb-3 sm:mb-4">
              <div className="flex-1 min-w-0">
                <span className="text-[9px] sm:text-xs text-red-600 dark:text-red-500 font-bold uppercase tracking-wider">{selectedVideoExercise.muscleName}</span>
                <h3 className="text-sm sm:text-xl font-black text-slate-900 dark:text-white leading-tight uppercase truncate">{selectedVideoExercise.name} FORM GUIDE</h3>
              </div>
              <button
                onClick={() => setSelectedVideoExercise(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative w-full aspect-[4/3] sm:aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden border border-slate-300 dark:border-neutral-800 shadow-inner">
              <iframe
                src={getEmbedUrl(selectedVideoExercise.videoUrl)}
                title={`${selectedVideoExercise.name} Form Video`}
                className="absolute inset-0 w-full h-full border-0 pointer-events-auto"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 sm:pt-4 flex-shrink-0 mt-2 border-t border-slate-100 dark:border-neutral-800/50">
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-neutral-500 font-medium">Official Technique Video</span>
              <button
                onClick={() => setSelectedVideoExercise(null)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-900 dark:bg-neutral-800 hover:bg-slate-800 dark:hover:bg-neutral-700 text-white text-xs font-bold rounded-lg transition-all"
              >
                Close Video Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
