import React, { useState, useMemo } from 'react';
import { Search, X, Plus, Dumbbell, Check } from 'lucide-react';
import { exerciseLibrary } from '../data/exerciseLibrary';

export default function ExercisePickerModal({ isOpen, onClose, onSelectExercise, selectedExerciseNames = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Flatten exercise library into a single searchable array
  const allExercises = useMemo(() => {
    const list = [];
    Object.keys(exerciseLibrary).forEach(categoryKey => {
      const catObj = exerciseLibrary[categoryKey];
      if (catObj && Array.isArray(catObj.exercises)) {
        catObj.exercises.forEach(ex => {
          list.push({
            ...ex,
            categoryKey,
            categoryName: catObj.name || categoryKey,
            color: catObj.color || 'bg-blue-600'
          });
        });
      }
    });
    return list;
  }, []);

  const categories = useMemo(() => {
    return [
      { key: 'all', name: 'All Muscles' },
      ...Object.keys(exerciseLibrary).map(key => ({
        key,
        name: exerciseLibrary[key].name || key
      }))
    ];
  }, []);

  const filteredExercises = useMemo(() => {
    return allExercises.filter(ex => {
      const matchesCategory = selectedCategory === 'all' || ex.categoryKey === selectedCategory;
      const matchesSearch = !searchQuery || 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allExercises, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-orange-500/10 text-orange-500 rounded-lg">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white uppercase tracking-wider">Add Exercise</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-3 sm:p-4 border-b border-neutral-800 space-y-3 bg-neutral-950/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search exercise by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 sm:pl-10 pr-4 py-2 sm:py-2.5 text-[11px] sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-[10px] sm:text-xs">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors uppercase tracking-wide ${
                  selectedCategory === cat.key
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-10 text-neutral-500">
              <p className="text-sm sm:text-base font-bold uppercase tracking-wider">No exercises found</p>
              <p className="text-[10px] sm:text-xs text-neutral-600 mt-1">Try a different search term or category filter</p>
            </div>
          ) : (
            filteredExercises.map((ex) => {
              const isAdded = selectedExerciseNames.some(
                name => name.toLowerCase() === ex.name.toLowerCase()
              );

              return (
                <div
                  key={ex.id}
                  onClick={() => !isAdded && onSelectExercise(ex)}
                  className={`p-2.5 sm:p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    isAdded
                      ? 'bg-neutral-900/40 border-neutral-800/60 opacity-60 cursor-not-allowed'
                      : 'bg-neutral-800/40 border-neutral-800 hover:border-orange-500/50 hover:bg-neutral-800/80 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-xs sm:text-sm">
                      {ex.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{ex.name}</h4>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                        <span className="text-[9px] sm:text-xs text-orange-400 font-bold uppercase tracking-wider">{ex.categoryName}</span>
                        {ex.difficulty && (
                          <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 capitalize">
                            {ex.difficulty}
                          </span>
                        )}
                        {ex.type && (
                          <span className="text-[9px] sm:text-[10px] text-neutral-500 capitalize">
                            • {ex.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isAdded}
                    className={`px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 transition-colors ${
                      isAdded
                        ? 'bg-neutral-800 text-neutral-500'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Add
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
