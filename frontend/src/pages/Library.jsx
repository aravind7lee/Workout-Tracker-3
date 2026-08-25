import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, Dumbbell, Play, Plus, X, Video, ChevronRight, ChevronDown,
  Sparkles, Check, Info, Filter, ArrowRight, Layers, Eye, Edit3, CheckCircle2, Zap, Star, ClipboardList
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { exerciseLibrary } from '../data/exerciseLibrary';
import { getFormTips } from '../data/exerciseFormTips';
import { getExerciseVideo } from '../data/exerciseVideos';
import QuickPlanModal from '../components/QuickPlanModal';
import AddToExistingPlanModal from '../components/AddToExistingPlanModal';
import WorkoutSetupModal from '../components/WorkoutSetupModal';

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
    filterCategory: "Chest"
  },
  {
    id: "cat_hypertrophy",
    title: "MUSCLE BUILDING",
    tagline: "Mass & Definition",
    description: "Hypertrophy training for maximum muscle growth",
    image: Library2,
    filterCategory: "Back"
  },
  {
    id: "cat_functional",
    title: "FUNCTIONAL FITNESS",
    tagline: "Real-World Movement",
    description: "Practical exercises for daily performance",
    image: Library4,
    filterCategory: "Legs"
  },
  {
    id: "cat_mobility",
    title: "FLEXIBILITY & MOBILITY",
    tagline: "Recovery & Movement",
    description: "Enhance range of motion and recovery",
    image: Library5,
    filterCategory: "Core"
  },
  {
    id: "cat_heavy",
    title: "HEAVY LIFTING",
    tagline: "Elite Technique",
    description: "Advanced lifting techniques and form",
    image: Library6,
    filterCategory: "Chest"
  },
  {
    id: "cat_bodyweight",
    title: "BODYWEIGHT TRAINING",
    tagline: "No Equipment Needed",
    description: "Master your bodyweight movements",
    image: Library7,
    filterCategory: "Arms"
  },
  {
    id: "cat_sports",
    title: "SPORTS PERFORMANCE",
    tagline: "Athletic Excellence",
    description: "Sport-specific training protocols",
    image: Library8,
    filterCategory: "Shoulders"
  },
  {
    id: "cat_power",
    title: "POWER TRAINING",
    tagline: "Explosive Movement",
    description: "Develop explosive power and athletic performance",
    image: Library11,
    filterCategory: "Legs"
  }
];

export default function Library() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navbarSearch = searchParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(navbarSearch);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [visibleCount, setVisibleCount] = useState(24);

  // Accordion state for form tips
  const [expandedFormTips, setExpandedFormTips] = useState({});

  // Modals & Drawers
  const [showWorkoutSetup, setShowWorkoutSetup] = useState(null);
  const [showQuickPlan, setShowQuickPlan] = useState(null);
  const [showAddToExisting, setShowAddToExisting] = useState(null);
  const [selectedVideoExercise, setSelectedVideoExercise] = useState(null);
  const [selectedDetailExercise, setSelectedDetailExercise] = useState(null);
  const [completedNotification, setCompletedNotification] = useState(null);

  const exercisesSectionRef = useRef(null);

  // Toggle Form Tips Accordion
  const toggleFormTips = (exId) => {
    setExpandedFormTips(prev => ({
      ...prev,
      [exId]: !prev[exId]
    }));
  };

  // Flatten exercise library with 100% video URL mapping for every exercise
  const allExercises = useMemo(() => {
    const list = [];
    Object.entries(exerciseLibrary).forEach(([muscleKey, group]) => {
      if (group && Array.isArray(group.exercises)) {
        group.exercises.forEach((ex) => {
          const muscleName = group.name || muscleKey;
          const mappedVideo = getExerciseVideo(ex.name) || ex.videoUrl || "https://www.youtube.com/watch?v=rT7DgCr-3pg";

          list.push({
            ...ex,
            id: ex.id || `ex_${ex.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            muscleKey,
            muscleName,
            videoUrl: mappedVideo,
            type: ex.type || (['Barbell Bench Press', 'Squat', 'Deadlift', 'Overhead Press'].includes(ex.name) ? 'compound' : 'isolation'),
            difficulty: ex.difficulty || 'beginner',
            icon: group.icon || '💪'
          });
        });
      }
    });
    return list;
  }, []);

  // Filter exercises
  const filteredExercises = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allExercises.filter((ex) => {
      const matchesCategory = selectedCategory === "all" || ex.muscleName.toLowerCase() === selectedCategory.toLowerCase();
      const matchesDifficulty = selectedDifficulty === "all" || (ex.difficulty && ex.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());
      const matchesSearch = !q ||
        ex.name.toLowerCase().includes(q) ||
        ex.muscleName.toLowerCase().includes(q) ||
        (ex.type && ex.type.toLowerCase().includes(q));

      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [allExercises, searchQuery, selectedCategory, selectedDifficulty]);

  const visibleExercises = useMemo(() => {
    return filteredExercises.slice(0, visibleCount);
  }, [filteredExercises, visibleCount]);

  const scrollToExercises = () => {
    if (exercisesSectionRef.current) {
      exercisesSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategoryCard = (cat) => {
    setSelectedCategory(cat.filterCategory || "all");
    scrollToExercises();
  };

  const handleStartWorkoutSetup = (exercise) => {
    setShowWorkoutSetup(exercise);
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

  const handleMarkComplete = (exercise) => {
    setCompletedNotification(`Marked ${exercise.name} as completed!`);
    setTimeout(() => {
      setCompletedNotification(null);
    }, 3000);
  };

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
    <div className="min-h-screen bg-black text-white pb-36 sm:pb-28 overflow-x-hidden">
      
      {/* 1. HERO SECTION (100% UNCHANGED AS EXPLICITLY REQUESTED) */}
      <div className="relative w-full min-h-[85vh] h-[85vh] sm:h-[88vh] lg:h-[90vh] rounded-none sm:rounded-3xl overflow-hidden border-b sm:border border-neutral-800/80 shadow-2xl bg-black">
        <img 
          src={LibraryHeaderImg} 
          alt="Exercise Library Hero" 
          className="w-full h-full object-cover object-top sm:object-[center_top] filter brightness-105 contrast-100 saturate-105"
          loading="eager"
        />
        {/* Subtle, non-dull gradient overlay for full image clarity and text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-5xl mx-auto space-y-4 sm:space-y-6 z-10">
          <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-black text-[#ff9800] sm:text-[#f39c12] tracking-wider uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] font-sans">
            EXERCISE LIBRARY
          </h1>
          <p className="text-sm sm:text-base lg:text-xl text-neutral-100 font-medium max-w-xs sm:max-w-2xl mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] leading-relaxed">
            Browse, track, and customize your exercises with ease.
          </p>

          {/* Premium Action Buttons (Matching My Plans Layout) */}
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

      {/* Completion Toast Notification */}
      {completedNotification && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-emerald-500 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-2xl flex items-center gap-2.5 font-bold text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{completedNotification}</span>
        </div>
      )}

      {/* 2. 8 CATEGORY IMAGE CARDS GRID - FULLY RESPONSIVE */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-8 sm:pt-12 space-y-6 sm:space-y-10">
        <div className="text-center space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold text-orange-400 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" /> Workout Categories
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Targeted Training Categories
          </h2>
          <p className="text-[10px] sm:text-sm text-neutral-400 max-w-lg mx-auto">
            Select a category below to explore specific exercises and technique guides.
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {FEATURED_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleSelectCategoryCard(cat)}
              className="group relative h-64 sm:h-72 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer border border-neutral-800/80 hover:border-orange-500/60 shadow-xl transition-all duration-300 transform active:scale-95 hover:-translate-y-1"
            >
              <img 
                src={cat.image} 
                alt={cat.title} 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 space-y-1 sm:space-y-1.5">
                <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider group-hover:text-orange-400 transition-colors line-clamp-1">
                  {cat.title}
                </h3>
                <p className="text-[10px] sm:text-xs font-bold text-red-500 uppercase tracking-wide">
                  {cat.tagline}
                </p>
                <p className="text-[10px] sm:text-xs text-neutral-300 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 3. EXERCISES DIRECTORY LIST SECTION - FULLY RESPONSIVE */}
        <div ref={exercisesSectionRef} className="pt-6 sm:pt-8 space-y-6 sm:space-y-8 border-t border-neutral-900">
          
          {/* Search & Filter Header */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight">
                  Exercise Directory
                </h2>
                <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                  Showing {filteredExercises.length} of {allExercises.length} available exercises
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search exercises by name, muscle, type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-8 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Muscle Category Filter Buttons (Smooth Horizontal Scroll on Mobile) */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
              {['all', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs / Core'].map((muscle) => (
                <button
                  key={muscle}
                  onClick={() => setSelectedCategory(muscle)}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    selectedCategory.toLowerCase() === muscle.toLowerCase()
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 scale-105'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {muscle === 'all' ? 'All Muscles' : muscle}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Cards Grid */}
          {filteredExercises.length === 0 ? (
            <div className="py-12 sm:py-16 text-center space-y-3 bg-neutral-900/40 border border-neutral-800 rounded-2xl sm:rounded-3xl p-4">
              <Dumbbell className="w-8 h-8 text-orange-500 mx-auto" />
              <h3 className="text-sm sm:text-base font-bold text-white">No Exercises Found</h3>
              <p className="text-[10px] sm:text-xs text-neutral-400">Try clearing your search or category filters.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 md:gap-6 items-start">
              {visibleExercises.map((ex) => {
                const formTips = getFormTips(ex.name);
                const isFormTipsOpen = expandedFormTips[ex.id];

                return (
                  <div
                    key={ex.id}
                    className="bg-neutral-950 border border-neutral-800/90 rounded-xl sm:rounded-3xl p-3.5 sm:p-5 space-y-3 hover:border-neutral-700 transition-all shadow-xl"
                  >
                    {/* Exercise Header & Badges */}
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-[8px] sm:text-[10px] text-orange-400 font-extrabold uppercase tracking-wider block truncate">
                            {ex.muscleName}
                          </span>
                          <h3 className="text-sm sm:text-base md:text-lg font-black text-white leading-snug truncate">{ex.name}</h3>
                        </div>
                      </div>

                      {/* Compact Inline Type & Difficulty Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="px-2 py-0.5 bg-red-950/80 border border-red-800/60 text-red-400 font-bold text-[9px] sm:text-[10px] rounded-md flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 text-red-400" />
                          <span className="capitalize">{ex.type || 'compound'}</span>
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 font-bold text-[9px] sm:text-[10px] rounded-md flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 text-emerald-400" />
                          <span className="capitalize">{ex.difficulty || 'intermediate'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Form Tips & Technique Collapsible Accordion */}
                    <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-lg sm:rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleFormTips(ex.id)}
                        className="w-full px-3 py-2 flex items-center justify-between text-[10px] sm:text-xs font-bold text-neutral-300 hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <ClipboardList className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Form Tips & Technique</span>
                        </div>
                        <span className={`text-orange-500 text-[10px] transition-transform duration-200 ${isFormTipsOpen ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </button>

                      {isFormTipsOpen && (
                        <div className="p-3 border-t border-neutral-800/80 bg-neutral-950 space-y-2 text-[10px] sm:text-xs text-neutral-300 leading-relaxed">
                          {formTips?.formTips && formTips.formTips.length > 0 && (
                            <div className="space-y-1">
                              <strong className="text-orange-400 block text-[9px] uppercase font-bold tracking-wider">Key Technique:</strong>
                              <ul className="list-disc list-inside space-y-0.5 text-neutral-300">
                                {formTips.formTips.map((tip, idx) => (
                                  <li key={idx}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {formTips?.commonMistakes && formTips.commonMistakes.length > 0 && (
                            <div className="space-y-1 pt-1.5 border-t border-neutral-800/60">
                              <strong className="text-red-400 block text-[9px] uppercase font-bold tracking-wider">Mistakes to Avoid:</strong>
                              <ul className="list-disc list-inside space-y-0.5 text-neutral-400">
                                {formTips.commonMistakes.map((mistake, idx) => (
                                  <li key={idx}>{mistake}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {formTips?.breathingTip && (
                            <div className="pt-1.5 border-t border-neutral-800/60">
                              <strong className="text-emerald-400 block text-[9px] uppercase font-bold tracking-wider">Breathing Pattern:</strong>
                              <p className="text-neutral-300">{formTips.breathingTip}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Grid - Clean Responsive Grid */}
                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-neutral-800/80">
                      {/* Watch Form Video */}
                      <button
                        onClick={() => setSelectedVideoExercise(ex)}
                        className="py-2 px-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl flex items-center justify-center gap-1 transition-all truncate"
                      >
                        <Video className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span className="truncate">Video</span>
                      </button>

                      {/* View Details */}
                      <button
                        onClick={() => setSelectedDetailExercise(ex)}
                        className="py-2 px-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl flex items-center justify-center gap-1 transition-all truncate"
                      >
                        <Eye className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span className="truncate">Details</span>
                      </button>

                      {/* + New Plan */}
                      <button
                        onClick={() => setShowQuickPlan(ex)}
                        className="py-2 px-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl flex items-center justify-center gap-1 transition-all truncate"
                      >
                        <span className="truncate">+ Plan</span>
                      </button>

                      {/* Add to Existing Plan */}
                      <button
                        onClick={() => setShowAddToExisting(ex)}
                        className="py-2 px-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl flex items-center justify-center gap-1 transition-all truncate"
                      >
                        <Edit3 className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span className="truncate">Add to</span>
                      </button>

                      {/* Start Workout */}
                      <button
                        onClick={() => handleStartWorkoutSetup(ex)}
                        className="py-2 px-1.5 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-400 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl flex items-center justify-center gap-1 transition-all truncate"
                      >
                        <Play className="w-3 h-3 text-orange-400 fill-current shrink-0" />
                        <span className="truncate">Start</span>
                      </button>

                      {/* Complete */}
                      <button
                        onClick={() => handleMarkComplete(ex)}
                        className="py-2 px-1.5 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/50 text-emerald-400 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl flex items-center justify-center gap-1 transition-all truncate"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">Done</span>
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
                className="px-6 py-2.5 sm:px-8 sm:py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xl sm:rounded-2xl shadow-xl inline-flex items-center gap-2"
              >
                Load More Exercises ({filteredExercises.length - visibleCount} Remaining)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Exercise Details Drawer / Modal - Responsive */}
      {selectedDetailExercise && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-xl w-full space-y-3 sm:space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-orange-400 font-bold uppercase">{selectedDetailExercise.muscleName}</span>
                <h3 className="text-base sm:text-xl font-black text-white">{selectedDetailExercise.name}</h3>
              </div>
              <button
                onClick={() => setSelectedDetailExercise(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-neutral-300">
              <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-0.5">
                <span className="text-orange-400 font-bold uppercase text-[9px]">Target Sets & Reps</span>
                <p className="font-mono text-xs sm:text-sm font-bold text-white">{selectedDetailExercise.sets || '3 Sets x 10 Reps'}</p>
              </div>

              <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-0.5">
                <span className="text-orange-400 font-bold uppercase text-[9px]">Equipment Required</span>
                <p className="font-bold text-white capitalize text-xs sm:text-sm">{selectedDetailExercise.equipment || 'Barbell / Dumbbell'}</p>
              </div>
            </div>

            <button
              onClick={() => {
                const ex = selectedDetailExercise;
                setSelectedDetailExercise(null);
                handleStartWorkoutSetup(ex);
              }}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl"
            >
              Configure & Start Workout
            </button>
          </div>
        </div>
      )}

      {/* Pre-Workout Setup Modal */}
      {showWorkoutSetup && (
        <WorkoutSetupModal
          exercise={showWorkoutSetup}
          onClose={() => setShowWorkoutSetup(null)}
          onStartWorkout={handleWorkoutSetupComplete}
        />
      )}

      {/* Video Demo Modal with 100% Embed Link Parser */}
      {selectedVideoExercise && (
        <div 
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 transition-all"
          onClick={() => setSelectedVideoExercise(null)}
        >
          <div 
            className="bg-neutral-900 border border-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex flex-shrink-0 items-start justify-between gap-3 mb-3 sm:mb-4">
              <div className="flex-1 min-w-0">
                <span className="text-[9px] sm:text-xs text-orange-500 font-bold uppercase tracking-wider">{selectedVideoExercise.muscleName}</span>
                <h3 className="text-sm sm:text-xl font-black text-white leading-tight uppercase truncate">{selectedVideoExercise.name} FORM GUIDE</h3>
              </div>
              <button
                onClick={() => setSelectedVideoExercise(null)}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative w-full aspect-[4/3] sm:aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden border border-neutral-800 shadow-inner">
              <iframe
                src={getEmbedUrl(selectedVideoExercise.videoUrl)}
                title={`${selectedVideoExercise.name} Form Video`}
                className="absolute inset-0 w-full h-full border-0 pointer-events-auto"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 sm:pt-4 flex-shrink-0 mt-2 border-t border-neutral-800/50">
              <span className="text-[10px] sm:text-xs text-neutral-500 font-medium">Official Technique Video</span>
              <button
                onClick={() => setSelectedVideoExercise(null)}
                className="w-full sm:w-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg transition-all"
              >
                Close Video Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Plan & Add to Existing Modals */}
      {showQuickPlan && (
        <QuickPlanModal
          exercise={showQuickPlan}
          onClose={() => setShowQuickPlan(null)}
          onSaved={() => setShowQuickPlan(null)}
        />
      )}

      {showAddToExisting && (
        <AddToExistingPlanModal
          exercise={showAddToExisting}
          onClose={() => setShowAddToExisting(null)}
          onAdded={() => setShowAddToExisting(null)}
        />
      )}
    </div>
  );
}
