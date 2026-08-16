import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, Dumbbell, Play, Plus, X, Video, ChevronRight, ChevronDown,
  Sparkles, Check, Info, Filter, ArrowRight, Layers, Eye, Edit3, CheckCircle2, Zap, Star, ClipboardList
} from 'lucide-react';
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
    <div className="min-h-screen bg-black text-white pb-32 overflow-x-hidden">
      
      {/* 1. HERO SECTION (EXACT 100% FULL SCREEN HERO MATCHING ATTACHED SCREENSHOT) */}
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

          {/* Exact Buttons matching Close-Up Reference Image: Sharp Rectangles (rounded-none) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3 sm:pt-6 w-full max-w-[300px] sm:max-w-none mx-auto">
            <button
              onClick={scrollToExercises}
              style={{ backgroundColor: '#e51c23', color: '#ffffff' }}
              className="w-full sm:w-auto h-13 sm:h-14 px-8 !bg-[#e51c23] hover:!bg-[#c61a20] text-white font-black text-xs sm:text-sm uppercase tracking-[0.18em] rounded-none shadow-2xl flex items-center justify-center gap-3 whitespace-nowrap transition-all transform active:scale-95 hover:scale-[1.02] cursor-pointer border-none"
            >
              <span>EXPLORE EXERCISES</span>
              <ArrowRight className="w-4 h-4 stroke-[3.5] shrink-0" />
            </button>

            <button
              onClick={() => navigate('/start-workout')}
              style={{ 
                background: 'linear-gradient(180deg, rgba(120, 85, 70, 0.55) 0%, rgba(60, 40, 30, 0.70) 100%)', 
                borderColor: 'rgba(210, 180, 165, 0.45)' 
              }}
              className="w-full sm:w-auto h-13 sm:h-14 px-8 text-white font-black text-xs sm:text-sm uppercase tracking-[0.18em] rounded-none shadow-2xl border backdrop-blur-md flex items-center justify-center whitespace-nowrap transition-all transform active:scale-95 hover:scale-[1.02] cursor-pointer"
            >
              <span>START TRAINING</span>
            </button>
          </div>
        </div>
      </div>

      {/* Completion Toast Notification */}
      {completedNotification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{completedNotification}</span>
        </div>
      )}

      {/* 2. 8 CATEGORY IMAGE CARDS GRID */}
      <div className="max-w-7xl mx-auto px-4 pt-12 space-y-12">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
            <Layers className="w-4 h-4" /> Workout Categories
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Targeted Training Categories
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
            Select a category below to explore specific exercises and technique guides.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleSelectCategoryCard(cat)}
              className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer border border-neutral-800/80 hover:border-orange-500/60 shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <img 
                src={cat.image} 
                alt={cat.title} 
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 filter brightness-90"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 space-y-2">
                <h3 className="text-lg font-black text-white uppercase tracking-wider group-hover:text-orange-400 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs font-bold text-red-500 uppercase tracking-wide">
                  {cat.tagline}
                </p>
                <p className="text-xs text-neutral-300 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 3. EXERCISES LIST SECTION */}
        <div ref={exercisesSectionRef} className="pt-8 space-y-8 border-t border-neutral-900">
          
          {/* Search & Filter Header */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  Exercise Directory
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Showing {filteredExercises.length} of {allExercises.length} available exercises
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search exercises by name, type, muscle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-8 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
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

            {/* Muscle Category Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              {['all', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs / Core'].map((muscle) => (
                <button
                  key={muscle}
                  onClick={() => setSelectedCategory(muscle)}
                  className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                    selectedCategory.toLowerCase() === muscle.toLowerCase()
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
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
            <div className="py-16 text-center space-y-3 bg-neutral-900/40 border border-neutral-800 rounded-3xl">
              <Dumbbell className="w-8 h-8 text-orange-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Exercises Found</h3>
              <p className="text-xs text-neutral-400">Try clearing your search or category filters.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {visibleExercises.map((ex) => {
                const formTips = getFormTips(ex.name);
                const isFormTipsOpen = expandedFormTips[ex.id];

                return (
                  <div
                    key={ex.id}
                    className="bg-neutral-950 border border-neutral-800/90 rounded-3xl p-5 space-y-4 hover:border-neutral-700 transition-all shadow-2xl"
                  >
                    <div className="space-y-3">
                      {/* Exercise Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-orange-400 font-extrabold uppercase tracking-wider">
                            {ex.muscleName}
                          </span>
                          <h3 className="text-lg font-black text-white mt-0.5">{ex.name}</h3>
                        </div>
                      </div>

                      {/* Type Pill Badge (Red) */}
                      <div className="p-3 bg-neutral-900/90 border border-neutral-800/90 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-neutral-300 font-medium">
                          <Zap className="w-4 h-4 text-red-500" />
                          <span>Type:</span>
                        </div>
                        <span className="px-3 py-1 bg-red-950/70 border border-red-800/80 text-red-400 font-bold text-xs rounded-xl capitalize">
                          {ex.type || 'compound'}
                        </span>
                      </div>

                      {/* Difficulty Pill Badge (Green) */}
                      <div className="p-3 bg-neutral-900/90 border border-neutral-800/90 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-neutral-300 font-medium">
                          <Star className="w-4 h-4 text-red-500" />
                          <span>Difficulty:</span>
                        </div>
                        <span className="px-3 py-1 bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 font-bold text-xs rounded-xl capitalize">
                          {ex.difficulty || 'beginner'}
                        </span>
                      </div>

                      {/* Form Tips & Technique Collapsible Accordion */}
                      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => toggleFormTips(ex.id)}
                          className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-neutral-200 hover:text-white transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-neutral-400" />
                            <span>Form Tips & Technique</span>
                          </div>
                          <span className={`text-red-500 transition-transform duration-200 ${isFormTipsOpen ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>

                        {isFormTipsOpen && (
                          <div className="p-4 border-t border-neutral-800/80 bg-neutral-950 space-y-3 text-xs text-neutral-300 leading-relaxed">
                            {formTips?.formTips && formTips.formTips.length > 0 && (
                              <div className="space-y-1">
                                <strong className="text-orange-400 block text-[10px] uppercase font-bold tracking-wider">Key Technique & Form Tips:</strong>
                                <ul className="list-disc list-inside space-y-1 text-neutral-300">
                                  {formTips.formTips.map((tip, idx) => (
                                    <li key={idx}>{tip}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {formTips?.commonMistakes && formTips.commonMistakes.length > 0 && (
                              <div className="space-y-1 pt-2 border-t border-neutral-800/60">
                                <strong className="text-red-400 block text-[10px] uppercase font-bold tracking-wider">Common Mistakes to Avoid:</strong>
                                <ul className="list-disc list-inside space-y-1 text-neutral-400">
                                  {formTips.commonMistakes.map((mistake, idx) => (
                                    <li key={idx}>{mistake}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {formTips?.breathingTip && (
                              <div className="pt-2 border-t border-neutral-800/60">
                                <strong className="text-emerald-400 block text-[10px] uppercase font-bold tracking-wider">Breathing Pattern:</strong>
                                <p className="text-neutral-300">{formTips.breathingTip}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button Stack */}
                    <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                      {/* Watch Form Video Button */}
                      <button
                        onClick={() => setSelectedVideoExercise(ex)}
                        className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
                      >
                        <Video className="w-4 h-4 text-neutral-400" /> Watch Form Video
                      </button>

                      {/* View Details Button */}
                      <button
                        onClick={() => setSelectedDetailExercise(ex)}
                        className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
                      >
                        <Eye className="w-4 h-4 text-neutral-400" /> View Details
                      </button>

                      {/* + New Plan & Add to Plan Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setShowQuickPlan(ex)}
                          className="py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all"
                        >
                          + New Plan
                        </button>
                        <button
                          onClick={() => setShowAddToExisting(ex)}
                          className="py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-neutral-400" /> Add to Plan
                        </button>
                      </div>

                      {/* Start Workout & Complete Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleStartWorkoutSetup(ex)}
                          className="py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Play className="w-3.5 h-3.5 text-neutral-400 fill-current" /> Start Workout
                        </button>
                        <button
                          onClick={() => handleMarkComplete(ex)}
                          className="py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" /> Complete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {visibleCount < filteredExercises.length && (
            <div className="text-center pt-6">
              <button
                onClick={() => setVisibleCount((prev) => prev + 24)}
                className="px-8 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-xl inline-flex items-center gap-2"
              >
                Load More Exercises ({filteredExercises.length - visibleCount} Remaining)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Exercise Details Drawer / Modal */}
      {selectedDetailExercise && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-orange-400 font-bold uppercase">{selectedDetailExercise.muscleName}</span>
                <h3 className="text-xl font-black text-white">{selectedDetailExercise.name}</h3>
              </div>
              <button
                onClick={() => setSelectedDetailExercise(null)}
                className="p-2 text-neutral-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1">
                <span className="text-orange-400 font-bold uppercase text-[10px]">Target Sets & Reps</span>
                <p className="font-mono text-sm font-bold text-white">{selectedDetailExercise.sets || '3 Sets x 10 Reps'}</p>
              </div>

              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1">
                <span className="text-orange-400 font-bold uppercase text-[10px]">Equipment Required</span>
                <p className="font-bold text-white capitalize">{selectedDetailExercise.equipment || 'Barbell / Dumbbell'}</p>
              </div>
            </div>

            <button
              onClick={() => {
                const ex = selectedDetailExercise;
                setSelectedDetailExercise(null);
                handleStartWorkoutSetup(ex);
              }}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-orange-400 font-bold uppercase">{selectedVideoExercise.muscleName}</span>
                <h3 className="text-xl font-black text-white">{selectedVideoExercise.name} Form Guide</h3>
              </div>
              <button
                onClick={() => setSelectedVideoExercise(null)}
                className="p-2 text-neutral-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
              <iframe
                src={getEmbedUrl(selectedVideoExercise.videoUrl)}
                title={`${selectedVideoExercise.name} Form Video`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-neutral-400 font-mono">Official Technique Video</span>
              <button
                onClick={() => setSelectedVideoExercise(null)}
                className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl"
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
