// Professional Workout Setup Modal Component
import React, { useState } from 'react';

const WorkoutSetupModal = ({ exercise, onClose, onStartWorkout }) => {
  console.log('📝 WorkoutSetupModal rendered for exercise:', exercise?.name);
  
  const [workoutConfig, setWorkoutConfig] = useState({
    targetSets: 3,
    targetReps: 12,
    weight: 20,
    restTime: 60,
    notes: ''
  });

  const handleInputChange = (field, value) => {
    setWorkoutConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStartWorkout = () => {
    console.log('🚀 Starting workout with config:', workoutConfig);
    
    // Validate required fields
    if (workoutConfig.targetSets < 1 || workoutConfig.targetReps < 1) {
      alert('Please set valid targets for sets and reps');
      return;
    }
    
    onStartWorkout({
      exercise,
      config: workoutConfig
    });
  };

  const presetConfigs = [
    { name: 'Strength', sets: 5, reps: 5, rest: 180, weight: 40, desc: '3 min rest' },
    { name: 'Hypertrophy', sets: 4, reps: 10, rest: 90, weight: 25, desc: '1.5 min rest' },
    { name: 'Endurance', sets: 3, reps: 15, rest: 45, weight: 15, desc: '45s rest' },
    { name: 'Power', sets: 6, reps: 3, rest: 300, weight: 50, desc: '5 min rest' },
    { name: 'Quick', sets: 3, reps: 12, rest: 30, weight: 20, desc: '30s rest' },
    { name: 'Heavy', sets: 3, reps: 6, rest: 240, weight: 35, desc: '4 min rest' }
  ];

  const applyPreset = (preset) => {
    setWorkoutConfig(prev => ({
      ...prev,
      targetSets: preset.sets,
      targetReps: preset.reps,
      restTime: preset.rest,
      weight: preset.weight
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9999]" onClick={onClose}>
      <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">🎯 Setup Your Workout</h2>
          <p className="text-neutral-400">Configure your workout parameters before starting</p>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-neutral-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Exercise Info */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-neutral-900/50 rounded-lg">
          <div className={`w-16 h-16 ${exercise.color} rounded-lg flex items-center justify-center`}>
            <span className="text-3xl">{exercise.icon}</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{exercise.name}</h3>
            <p className="text-neutral-400">{exercise.category} • {exercise.difficulty}</p>
            <p className="text-sm text-neutral-500">Recommended: {exercise.sets}</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-neutral-300 mb-3">Quick Presets</h4>
          <div className="grid grid-cols-2 gap-2">
            {presetConfigs.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="p-3 bg-neutral-900/30 hover:bg-neutral-800/50 rounded-lg text-left transition-colors"
              >
                <div className="text-sm font-medium text-white">{preset.name}</div>
                <div className="text-xs text-neutral-400">
                  {preset.sets} sets × {preset.reps} reps
                </div>
                <div className="text-xs text-red-500">
                  {preset.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Workout Configuration */}
        <div className="space-y-4 mb-6">
          {/* Sets */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Target Sets
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleInputChange('targetSets', Math.max(1, workoutConfig.targetSets - 1))}
                className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white"
              >
                -
              </button>
              <input
                type="number"
                value={workoutConfig.targetSets}
                onChange={(e) => handleInputChange('targetSets', parseInt(e.target.value) || 1)}
                className="flex-1 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-center"
                min="1"
                max="10"
              />
              <button
                onClick={() => handleInputChange('targetSets', Math.min(10, workoutConfig.targetSets + 1))}
                className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white"
              >
                +
              </button>
            </div>
          </div>

          {/* Reps */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Target Reps per Set
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleInputChange('targetReps', Math.max(1, workoutConfig.targetReps - 1))}
                className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white"
              >
                -
              </button>
              <input
                type="number"
                value={workoutConfig.targetReps}
                onChange={(e) => handleInputChange('targetReps', parseInt(e.target.value) || 1)}
                className="flex-1 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-center"
                min="1"
                max="50"
              />
              <button
                onClick={() => handleInputChange('targetReps', Math.min(50, workoutConfig.targetReps + 1))}
                className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white"
              >
                +
              </button>
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Starting Weight (kg)
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleInputChange('weight', Math.max(0, workoutConfig.weight - 2.5))}
                className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white"
              >
                -
              </button>
              <input
                type="number"
                step="0.5"
                value={workoutConfig.weight}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                className="flex-1 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-center"
                min="0"
                max="500"
              />
              <button
                onClick={() => handleInputChange('weight', workoutConfig.weight + 2.5)}
                className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white"
              >
                +
              </button>
            </div>
          </div>

          {/* Rest Time - Fully Customizable */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Rest Between Sets
            </label>
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => handleInputChange('restTime', Math.max(15, workoutConfig.restTime - 15))}
                className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white"
              >
                -
              </button>
              <input
                type="number"
                value={workoutConfig.restTime}
                onChange={(e) => handleInputChange('restTime', parseInt(e.target.value) || 60)}
                className="flex-1 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-center"
                min="15"
                max="900"
                placeholder="60"
              />
              <button
                onClick={() => handleInputChange('restTime', workoutConfig.restTime + 15)}
                className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white"
              >
                +
              </button>
              <div className="text-sm text-neutral-400 min-w-[60px]">
                {Math.floor(workoutConfig.restTime / 60)}:{(workoutConfig.restTime % 60).toString().padStart(2, '0')}
              </div>
            </div>
            
            {/* Quick Rest Time Options */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[30, 45, 60, 90, 120, 180].map(time => (
                <button
                  key={time}
                  onClick={() => handleInputChange('restTime', time)}
                  className={`px-3 py-2 rounded text-xs transition-colors ${
                    workoutConfig.restTime === time 
                      ? 'bg-red-700 text-white' 
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {time >= 60 ? `${Math.floor(time/60)}:${(time%60).toString().padStart(2,'0')}` : `${time}s`}
                </button>
              ))}
            </div>
            
            {/* Custom Time Presets */}
            <div className="grid grid-cols-2 gap-2">
              {[240, 300, 360, 480].map(time => (
                <button
                  key={time}
                  onClick={() => handleInputChange('restTime', time)}
                  className={`px-3 py-2 rounded text-xs transition-colors ${
                    workoutConfig.restTime === time 
                      ? 'bg-red-700 text-white' 
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {Math.floor(time/60)} min
                </button>
              ))}
            </div>
            
            <div className="text-xs text-neutral-500 mt-2">
              💡 Choose your preferred rest time (15 seconds to 15 minutes)
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Workout Notes (Optional)
            </label>
            <textarea
              value={workoutConfig.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white"
              rows={2}
              placeholder="Any specific goals or notes for this workout..."
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-neutral-900/30 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-white mb-2">Workout Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-neutral-400">Total Sets:</span>
              <span className="text-white ml-2">{workoutConfig.targetSets}</span>
            </div>
            <div>
              <span className="text-neutral-400">Reps per Set:</span>
              <span className="text-white ml-2">{workoutConfig.targetReps}</span>
            </div>
            <div>
              <span className="text-neutral-400">Starting Weight:</span>
              <span className="text-white ml-2">{workoutConfig.weight} kg</span>
            </div>
            <div>
              <span className="text-neutral-400">Rest Time:</span>
              <span className="text-white ml-2">{workoutConfig.restTime}s</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-neutral-400">
            Estimated Duration: ~{Math.ceil((workoutConfig.targetSets * workoutConfig.restTime + 300) / 60)} minutes
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleStartWorkout}
            className="btn bg-green-600 hover:bg-green-700 text-white flex-1 font-semibold"
          >
            🚀 Start Workout
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSetupModal;