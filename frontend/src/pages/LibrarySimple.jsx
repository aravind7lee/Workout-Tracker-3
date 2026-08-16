import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, Dumbbell, Play, Plus, X, Video, ChevronRight, 
  Sparkles, Check, Info, Filter, Layers, Zap, Flame, Award
} from 'lucide-react';
import { exerciseLibrary } from '../data/exerciseLibrary';
import { getFormTips } from '../data/exerciseFormTips';
import QuickPlanModal from '../components/QuickPlanModal';
import AddToExistingPlanModal from '../components/AddToExistingPlanModal';

import LibraryHeaderImg from "../assets/Libraryheader.jpg";
import Library1 from "../assets/Library1.jpg";
import Library2 from "../assets/Library2.jpg";
import Library4 from "../assets/Library4.jpg";
import Library5 from "../assets/Library5.jpg";
import Library6 from "../assets/Library6.jpg";
import Library7 from "../assets/Library7.jpg";
import Library8 from "../assets/Library8.jpg";
import Library11 from "../assets/Library11.jpg";

const CATEGORY_IMAGES = {
  Chest: Library1,
  Back: Library2,
  Legs: Library4,
  Shoulders: Library5,
  Arms: Library6,
  "Abs / Core": Library7,
  Core: Library7,
  General: Library8
};

export default function LibrarySimple() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [displayLimit, setDisplayLimit] = useState(24);

  // Modals & Active Selections
  const [selectedVideoExercise, setSelectedVideoExercise] = useState(null);
  const [showQuickPlan, setShowQuickPlan] = useState(null);
  const [showAddToExisting, setShowAddToExisting] = useState(null);

  // Flatten exercise library
  const allExercises = useMemo(() => {
    const list = [];
    Object.entries(exerciseLibrary).forEach(([muscleKey, group]) => {
      if (group && Array.isArray(group.exercises)) {
        group.exercises.forEach((ex, idx) => {
          const muscleName = group.name || muscleKey;
          const imageAsset = CATEGORY_IMAGES[muscleName] || Library11;
          list.push({
            ...ex,
            muscleKey,
            muscleName,
            icon: group.icon || '💪',
            image: imageAsset
          });
        });
      }
    });
    return list;
  }, []);

  // Filtered exercises with Memoization
  const filteredExercises = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allExercises.filter(ex => {
      const matchesMuscle = selectedMuscle === 'all' || ex.muscleName.toLowerCase() === selectedMuscle.toLowerCase();
      const matchesDifficulty = selectedDifficulty === 'all' || (ex.difficulty && ex.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());
      const matchesSearch = !q || 
        ex.name.toLowerCase().includes(q) ||
        ex.muscleName.toLowerCase().includes(q) ||
        (ex.type && ex.type.toLowerCase().includes(q));

      return matchesMuscle && matchesDifficulty && matchesSearch;
    });
  }, [allExercises, searchQuery, selectedMuscle, selectedDifficulty]);

  // Reset pagination limit when filters change
  useEffect(() => {
    setDisplayLimit(24);
  }, [searchQuery, selectedMuscle, selectedDifficulty]);

  const visibleExercises = useMemo(() => {
    return filteredExercises.slice(0, displayLimit);
  }, [filteredExercises, displayLimit]);

  const muscleCategories = useMemo(() => {
    return [
      { key: 'all', name: 'All Muscles' },
      { key: 'Chest', name: 'Chest' },
      { key: 'Back', name: 'Back' },
      { key: 'Legs', name: 'Legs' },
      { key: 'Shoulders', name: 'Shoulders' },
      { key: 'Arms', name: 'Arms' },
      { key: 'Abs / Core', name: 'Core' }
    ];
  }, []);

  const handleStartWorkoutWithExercise = (exercise) => {
    navigate('/start-workout', {
      state: { defaultTitle: `${exercise.name} Focus` }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      
      {/* 1. Hero Header Banner with Rich Visual Image */}
      <div className="relative overflow-hidden border-b border-neutral-800">
        <div className="absolute inset-0">
          <img 
            src={LibraryHeaderImg} 
            alt="Exercise Library Header" 
            className="w-full h-full object-cover object-center opacity-35 filter brightness-75"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                <Dumbbell className="w-4 h-4" /> Exercise Directory
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-1 uppercase">
                Exercise Library
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl leading-relaxed">
                Explore {allExercises.length}+ professional exercises with form tips, technique guides, and video demos.
              </p>
            </div>

            {/* Live Count Badge */}
            <div className="inline-flex items-center gap-3 bg-neutral-900/90 border border-neutral-800 backdrop-blur-md rounded-2xl px-5 py-2.5 self-start md:self-auto shadow-xl">
              <span className="text-xs text-neutral-400 font-semibold">Showing</span>
              <span className="text-base font-black text-orange-400 font-mono">
                {filteredExercises.length} / {allExercises.length}
              </span>
              <span className="text-xs text-neutral-400 font-semibold">Exercises</span>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative max-w-3xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search exercise by name, muscle, or type (e.g. Bench Press, Squat, Pullup)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950/90 border border-neutral-800 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors shadow-2xl backdrop-blur-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Muscle Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {muscleCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedMuscle(cat.key)}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedMuscle.toLowerCase() === cat.key.toLowerCase()
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                    : 'bg-neutral-900/90 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 backdrop-blur-sm'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid with Rich Thumbnails & 60 FPS Smooth Scrolling */}
      <div className="max-w-6xl mx-auto px-4 pt-8 space-y-6">
        
        {/* Difficulty Filter Bar */}
        <div className="flex items-center justify-between text-xs border-b border-neutral-900 pb-4">
          <div className="flex items-center gap-2 text-neutral-400 font-semibold">
            <Filter className="w-4 h-4 text-orange-500" /> Filter by Level:
          </div>
          <div className="flex items-center gap-2">
            {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedDifficulty(lvl)}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition-colors ${
                  selectedDifficulty === lvl
                    ? 'bg-neutral-800 text-white border border-neutral-700'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises Grid */}
        {filteredExercises.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-neutral-900/40 border border-neutral-800 rounded-3xl">
            <div className="w-12 h-12 bg-neutral-800 text-orange-500 rounded-2xl flex items-center justify-center mx-auto">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Exercises Match Your Search</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Try adjusting your search query or selecting "All Muscles".
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedMuscle('all'); setSelectedDifficulty('all'); }}
              className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleExercises.map((ex) => {
              const formTips = getFormTips(ex.name);

              return (
                <div
                  key={ex.id}
                  className="bg-neutral-900 border border-neutral-800/90 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-orange-500/50 transition-all duration-200 group shadow-xl"
                >
                  {/* Card Header Thumbnail Image */}
                  <div className="relative h-44 overflow-hidden bg-neutral-950">
                    <img 
                      src={ex.image} 
                      alt={ex.name} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 filter brightness-90"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-lg font-extrabold bg-orange-500 text-white shadow-md">
                        {ex.muscleName}
                      </span>
                      {ex.difficulty && (
                        <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold bg-black/70 text-neutral-300 backdrop-blur-md uppercase tracking-wider border border-white/10">
                          {ex.difficulty}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-black text-white group-hover:text-orange-400 transition-colors tracking-tight">
                        {ex.name}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
                        <span>Target: <strong className="text-white">{ex.sets || '3x10'}</strong></span>
                        {ex.type && <span>• Type: <strong className="text-neutral-300 capitalize">{ex.type}</strong></span>}
                      </div>

                      {/* Execution Tip Box */}
                      {formTips && (
                        <div className="p-3 bg-neutral-950/80 border border-neutral-800/80 rounded-2xl space-y-1">
                          <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-orange-400" /> Execution Tip:
                          </span>
                          <p className="text-[11px] text-neutral-300 line-clamp-2 leading-relaxed font-medium">
                            {formTips.execution || formTips.setup || 'Keep core tight and execute with controlled rhythm.'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleStartWorkoutWithExercise(ex)}
                        className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition-all"
                      >
                        Train <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <div className="flex items-center gap-2">
                        {ex.videoUrl && (
                          <button
                            onClick={() => setSelectedVideoExercise(ex)}
                            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                            title="Watch Form Demo"
                          >
                            <Video className="w-3.5 h-3.5 text-orange-400" /> Demo
                          </button>
                        )}

                        <button
                          onClick={() => setShowQuickPlan(ex)}
                          className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-xl transition-colors"
                          title="Add to Quick Plan"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {visibleExercises.length < filteredExercises.length && (
          <div className="text-center pt-8">
            <button
              onClick={() => setDisplayLimit(prev => prev + 24)}
              className="px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-xl inline-flex items-center gap-2"
            >
              Load More Exercises ({filteredExercises.length - visibleExercises.length} Remaining)
            </button>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideoExercise && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-orange-400 font-bold uppercase">{selectedVideoExercise.muscleName}</span>
                <h3 className="text-lg font-black text-white">{selectedVideoExercise.name}</h3>
              </div>
              <button
                onClick={() => setSelectedVideoExercise(null)}
                className="p-2 text-neutral-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center">
              {selectedVideoExercise.videoUrl ? (
                <iframe
                  src={selectedVideoExercise.videoUrl.replace('watch?v=', 'embed/')}
                  title={selectedVideoExercise.name}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <p className="text-xs text-neutral-500">No video preview available for this exercise.</p>
              )}
            </div>

            <button
              onClick={() => setSelectedVideoExercise(null)}
              className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl"
            >
              Close Video Demo
            </button>
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
