import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Dumbbell, Play, RefreshCw, Zap, Layers, Plus, Calendar, 
  ChevronRight, Award, Trash2, ArrowRight, ArrowLeft, Sparkles, Flame, 
  Clock, TrendingUp, ChevronLeft, CalendarDays, CheckCircle2, 
  Target, History, Filter, Shield, Heart, Activity, Check,
  Sliders, Compass, RotateCcw, AlertCircle, Building2, Home,
  Cpu, UserCheck, Calculator, X, ChevronDown, CheckSquare,
  BarChart2, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
import api from '../utils/api';
import { 
  getMuscleGroup, 
  getPrimaryMuscleGroup, 
  getMuscleGroupTheme, 
  getExerciseDisplayName 
} from '../utils/muscleGroupHelper';

const ACTIVE_SESSION_KEY = 'active_workout_session';
const ACTIVE_SPLIT_KEY = 'grindx_active_split';

// =========================================================
// 1. SPORTS-SCIENCE TRAINING PROTOCOLS (NO CRINGE, PURE SCIENCE)
// =========================================================
const TRAINING_PROTOCOLS = [
  {
    id: 'strength',
    title: 'Max Strength & Power',
    subtitle: 'Compound Heavy Overload',
    icon: Target,
    reps: '3 – 5 Reps',
    intensity: '85 – 92% 1RM',
    restSeconds: 180,
    rpe: 'RPE 8.5 – 9.5',
    color: 'border-red-500 text-red-500',
    activeBg: 'bg-red-500/10 border-red-500 text-red-400 ring-1 ring-red-500/40'
  },
  {
    id: 'hypertrophy',
    title: 'Hypertrophy & Growth',
    subtitle: 'Maximum Muscle Volume',
    icon: TrendingUp,
    reps: '8 – 12 Reps',
    intensity: '70 – 80% 1RM',
    restSeconds: 90,
    rpe: 'RPE 7.5 – 8.5',
    color: 'border-orange-500 text-orange-500',
    activeBg: 'bg-orange-500/10 border-orange-500 text-orange-400 ring-1 ring-orange-500/40'
  },
  {
    id: 'conditioning',
    title: 'Metabolic & Density',
    subtitle: 'Paced Supersets & Endurance',
    icon: Zap,
    reps: '12 – 18 Reps',
    intensity: '60 – 70% 1RM',
    restSeconds: 45,
    rpe: 'RPE 7.0 – 8.0',
    color: 'border-blue-500 text-blue-500',
    activeBg: 'bg-blue-500/10 border-blue-500 text-blue-400 ring-1 ring-blue-500/40'
  },
  {
    id: 'mobility',
    title: 'Active Joint Recovery',
    subtitle: 'Tendon Health & De-load',
    icon: Shield,
    reps: '15 – 20 Reps',
    intensity: 'Light / Bodyweight',
    restSeconds: 60,
    rpe: 'RPE 5.0 – 6.0',
    color: 'border-emerald-500 text-emerald-500',
    activeBg: 'bg-emerald-500/10 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/40'
  }
];

// =========================================================
// 2. GYM ENVIRONMENT / EQUIPMENT PROFILES
// =========================================================
const EQUIPMENT_PROFILES = [
  { id: 'full_gym', label: 'Commercial Gym', icon: Building2, desc: 'Barbells, Cables & Dumbbells' },
  { id: 'dumbbells', label: 'Dumbbells & Bench', icon: Home, desc: 'Compact Home Gym Setup' },
  { id: 'machines', label: 'Machines & Cables', icon: Cpu, desc: 'Joint-Friendly Fixed Track' },
  { id: 'bodyweight', label: 'Bodyweight Only', icon: UserCheck, desc: 'Calisthenics & Floor' }
];

// =========================================================
// 3. ADAPTIVE TIME BUDGETS
// =========================================================
const TIME_BUDGETS = [
  { id: 'all', label: 'All Routines', minutes: null },
  { id: '30m', label: '⚡ 30m Express', minutes: 30, maxEx: 4 },
  { id: '45m', label: '⏱️ 45m Focused', minutes: 45, maxEx: 5 },
  { id: '60m', label: '🏋️ 60m+ Full Volume', minutes: 60, maxEx: 7 }
];

// =========================================================
// 4. ADAPTIVE QUICK-START ROUTINES MATRIX (EQUIPMENT-AWARE)
// =========================================================
const ALL_ROUTINES = [
  {
    id: 'chest_triceps_overload',
    title: 'Chest & Tricep Hypertrophy',
    muscleCategory: 'Chest',
    targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
    duration: '45-55m',
    equipmentVariants: {
      full_gym: [
        { name: 'Barbell Bench Press', category: 'Chest', sets: 4, reps: 8, weight: 60 },
        { name: 'Incline Dumbbell Press', category: 'Chest', sets: 3, reps: 10, weight: 22 },
        { name: 'Cable Crossover Fly', category: 'Chest', sets: 3, reps: 12, weight: 15 },
        { name: 'Tricep Rope Pushdown', category: 'Triceps', sets: 4, reps: 12, weight: 25 },
        { name: 'Dips (Weighted/Bodyweight)', category: 'Chest', sets: 3, reps: 10, weight: 0 }
      ],
      dumbbells: [
        { name: 'Flat Dumbbell Press', category: 'Chest', sets: 4, reps: 10, weight: 22 },
        { name: 'Incline Dumbbell Fly', category: 'Chest', sets: 3, reps: 12, weight: 14 },
        { name: 'Dumbbell Floor Press', category: 'Chest', sets: 3, reps: 10, weight: 20 },
        { name: 'Overhead Dumbbell Tricep Extension', category: 'Triceps', sets: 3, reps: 12, weight: 16 },
        { name: 'Push-ups (Deficit/Diamond)', category: 'Chest', sets: 3, reps: 15, weight: 0 }
      ],
      machines: [
        { name: 'Chest Press Machine', category: 'Chest', sets: 4, reps: 10, weight: 50 },
        { name: 'Incline Chest Machine', category: 'Chest', sets: 3, reps: 12, weight: 45 },
        { name: 'Pec Deck Machine', category: 'Chest', sets: 3, reps: 15, weight: 40 },
        { name: 'Cable Tricep Pushdown', category: 'Triceps', sets: 4, reps: 12, weight: 25 },
        { name: 'Assisted Dip Machine', category: 'Triceps', sets: 3, reps: 10, weight: 30 }
      ],
      bodyweight: [
        { name: 'Push-ups (Standard Tempo)', category: 'Chest', sets: 4, reps: 20, weight: 0 },
        { name: 'Feet-Elevated Decline Push-ups', category: 'Chest', sets: 3, reps: 15, weight: 0 },
        { name: 'Diamond Push-ups', category: 'Triceps', sets: 3, reps: 12, weight: 0 },
        { name: 'Bench/Chair Tricep Dips', category: 'Triceps', sets: 3, reps: 15, weight: 0 },
        { name: 'Isometric Chest Squeeze', category: 'Chest', sets: 3, reps: 30, weight: 0 }
      ]
    }
  },
  {
    id: 'back_biceps_overload',
    title: 'Back & Bicep Density',
    muscleCategory: 'Back',
    targetMuscles: ['Back', 'Lats', 'Biceps'],
    duration: '45-55m',
    equipmentVariants: {
      full_gym: [
        { name: 'Wide-Grip Lat Pulldown', category: 'Back', sets: 4, reps: 10, weight: 55 },
        { name: 'Barbell Bent-Over Row', category: 'Back', sets: 4, reps: 8, weight: 50 },
        { name: 'Seated Cable Row', category: 'Back', sets: 3, reps: 12, weight: 45 },
        { name: 'Dumbbell Hammer Curl', category: 'Biceps', sets: 4, reps: 12, weight: 14 },
        { name: 'Barbell EZ Preacher Curl', category: 'Biceps', sets: 3, reps: 10, weight: 25 }
      ],
      dumbbells: [
        { name: 'One-Arm Dumbbell Row', category: 'Back', sets: 4, reps: 10, weight: 24 },
        { name: 'Incline Chest-Supported DB Row', category: 'Back', sets: 3, reps: 12, weight: 18 },
        { name: 'Dumbbell Pullover', category: 'Back', sets: 3, reps: 12, weight: 20 },
        { name: 'Dumbbell Hammer Curl', category: 'Biceps', sets: 4, reps: 12, weight: 14 },
        { name: 'Incline Dumbbell Curl', category: 'Biceps', sets: 3, reps: 10, weight: 12 }
      ],
      machines: [
        { name: 'Lat Pulldown Machine', category: 'Back', sets: 4, reps: 10, weight: 55 },
        { name: 'Seated Cable Row Machine', category: 'Back', sets: 3, reps: 12, weight: 45 },
        { name: 'Machine T-Bar Row', category: 'Back', sets: 3, reps: 10, weight: 40 },
        { name: 'Machine Preacher Bicep Curl', category: 'Biceps', sets: 4, reps: 12, weight: 25 },
        { name: 'High Cable Bicep Curl', category: 'Biceps', sets: 3, reps: 15, weight: 15 }
      ],
      bodyweight: [
        { name: 'Pull-ups / Chin-ups', category: 'Back', sets: 4, reps: 8, weight: 0 },
        { name: 'Inverted Australian Rows', category: 'Back', sets: 3, reps: 12, weight: 0 },
        { name: 'Doorframe Single-Arm Row', category: 'Back', sets: 3, reps: 15, weight: 0 },
        { name: 'Towel Bicep Isometric Curls', category: 'Biceps', sets: 3, reps: 15, weight: 0 },
        { name: 'Superman Back Extensions', category: 'Back', sets: 3, reps: 20, weight: 0 }
      ]
    }
  },
  {
    id: 'quads_hamstrings_power',
    title: 'Quads & Hamstrings Power',
    muscleCategory: 'Legs',
    targetMuscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
    duration: '50-60m',
    equipmentVariants: {
      full_gym: [
        { name: 'Barbell Back Squat', category: 'Legs', sets: 4, reps: 8, weight: 70 },
        { name: 'Romanian Deadlift (RDL)', category: 'Legs', sets: 3, reps: 10, weight: 60 },
        { name: 'Leg Press 45°', category: 'Legs', sets: 3, reps: 12, weight: 120 },
        { name: 'Lying Leg Curl', category: 'Legs', sets: 3, reps: 12, weight: 40 },
        { name: 'Standing Calf Raise', category: 'Legs', sets: 4, reps: 15, weight: 50 }
      ],
      dumbbells: [
        { name: 'Dumbbell Goblet Squat', category: 'Legs', sets: 4, reps: 12, weight: 26 },
        { name: 'Dumbbell Romanian Deadlift', category: 'Legs', sets: 4, reps: 10, weight: 22 },
        { name: 'Bulgarian Split Squats', category: 'Legs', sets: 3, reps: 10, weight: 14 },
        { name: 'Dumbbell Walking Lunges', category: 'Legs', sets: 3, reps: 12, weight: 16 },
        { name: 'Single-Leg Standing Calf Raise', category: 'Legs', sets: 4, reps: 15, weight: 12 }
      ],
      machines: [
        { name: 'Leg Press Machine', category: 'Legs', sets: 4, reps: 10, weight: 120 },
        { name: 'Seated Leg Extension', category: 'Legs', sets: 3, reps: 12, weight: 45 },
        { name: 'Lying Leg Curl Machine', category: 'Legs', sets: 3, reps: 12, weight: 40 },
        { name: 'Seated Calf Raise Machine', category: 'Legs', sets: 4, reps: 15, weight: 35 },
        { name: 'Smith Machine Squat', category: 'Legs', sets: 3, reps: 10, weight: 50 }
      ],
      bodyweight: [
        { name: 'Air Squats (Controlled Tempo)', category: 'Legs', sets: 4, reps: 25, weight: 0 },
        { name: 'Bulgarian Split Squats (Bodyweight)', category: 'Legs', sets: 3, reps: 15, weight: 0 },
        { name: 'Nordic Hamstring Curl / Glute Bridge', category: 'Legs', sets: 3, reps: 12, weight: 0 },
        { name: 'Alternating Jump Lunges', category: 'Legs', sets: 3, reps: 16, weight: 0 },
        { name: 'Single-Leg Calf Raises', category: 'Legs', sets: 4, reps: 20, weight: 0 }
      ]
    }
  },
  {
    id: 'shoulders_arms_overload',
    title: 'Shoulders & Arms Volume',
    muscleCategory: 'Shoulders',
    targetMuscles: ['Shoulders', 'Biceps', 'Triceps'],
    duration: '40-50m',
    equipmentVariants: {
      full_gym: [
        { name: 'Standing Overhead Barbell Press', category: 'Shoulders', sets: 4, reps: 8, weight: 40 },
        { name: 'Dumbbell Lateral Raise', category: 'Shoulders', sets: 4, reps: 15, weight: 10 },
        { name: 'Cable Face Pulls', category: 'Shoulders', sets: 4, reps: 15, weight: 20 },
        { name: 'Skull Crushers (EZ Bar)', category: 'Triceps', sets: 3, reps: 12, weight: 25 },
        { name: 'Incline Dumbbell Curl', category: 'Biceps', sets: 3, reps: 12, weight: 12 }
      ],
      dumbbells: [
        { name: 'Seated Dumbbell Shoulder Press', category: 'Shoulders', sets: 4, reps: 10, weight: 18 },
        { name: 'Dumbbell Lateral Raise', category: 'Shoulders', sets: 4, reps: 15, weight: 10 },
        { name: 'Bent-Over Rear Delt Fly', category: 'Shoulders', sets: 3, reps: 15, weight: 8 },
        { name: 'Dumbbell Hammer Curl', category: 'Biceps', sets: 3, reps: 12, weight: 14 },
        { name: 'Overhead Dumbbell Tricep Extension', category: 'Triceps', sets: 3, reps: 12, weight: 16 }
      ],
      machines: [
        { name: 'Shoulder Press Machine', category: 'Shoulders', sets: 4, reps: 10, weight: 45 },
        { name: 'Cable Lateral Raise', category: 'Shoulders', sets: 4, reps: 15, weight: 10 },
        { name: 'Reverse Pec Deck (Rear Delts)', category: 'Shoulders', sets: 3, reps: 15, weight: 35 },
        { name: 'Cable Tricep Pushdown', category: 'Triceps', sets: 4, reps: 12, weight: 25 },
        { name: 'Cable Bicep Curl', category: 'Biceps', sets: 3, reps: 12, weight: 20 }
      ],
      bodyweight: [
        { name: 'Pike Push-ups', category: 'Shoulders', sets: 4, reps: 10, weight: 0 },
        { name: 'Prone Y-T-W Shoulder Raises', category: 'Shoulders', sets: 3, reps: 15, weight: 0 },
        { name: 'Bench / Box Dips', category: 'Triceps', sets: 4, reps: 15, weight: 0 },
        { name: 'Doorframe Pull-in Curls', category: 'Biceps', sets: 3, reps: 15, weight: 0 },
        { name: 'Plank Shoulder Taps', category: 'Shoulders', sets: 3, reps: 20, weight: 0 }
      ]
    }
  },
  {
    id: 'full_body_compound',
    title: 'Full Body Compound Strength',
    muscleCategory: 'Full Body',
    targetMuscles: ['Chest', 'Back', 'Legs', 'Core'],
    duration: '45-55m',
    equipmentVariants: {
      full_gym: [
        { name: 'Conventional Deadlift', category: 'Back', sets: 3, reps: 5, weight: 90 },
        { name: 'Barbell Bench Press', category: 'Chest', sets: 3, reps: 8, weight: 60 },
        { name: 'Barbell Back Squat', category: 'Legs', sets: 3, reps: 8, weight: 70 },
        { name: 'Pull-ups', category: 'Back', sets: 3, reps: 8, weight: 0 },
        { name: 'Hanging Leg Raises', category: 'Core', sets: 3, reps: 12, weight: 0 }
      ],
      dumbbells: [
        { name: 'Dumbbell Romanian Deadlift', category: 'Back', sets: 3, reps: 8, weight: 26 },
        { name: 'Flat Dumbbell Press', category: 'Chest', sets: 3, reps: 10, weight: 24 },
        { name: 'Dumbbell Goblet Squat', category: 'Legs', sets: 3, reps: 10, weight: 26 },
        { name: 'One-Arm Dumbbell Row', category: 'Back', sets: 3, reps: 10, weight: 22 },
        { name: 'Plank Hold (Timed)', category: 'Core', sets: 3, reps: 60, weight: 0 }
      ],
      machines: [
        { name: 'Leg Press Machine', category: 'Legs', sets: 3, reps: 10, weight: 120 },
        { name: 'Chest Press Machine', category: 'Chest', sets: 3, reps: 10, weight: 55 },
        { name: 'Lat Pulldown Machine', category: 'Back', sets: 3, reps: 10, weight: 50 },
        { name: 'Seated Cable Row', category: 'Back', sets: 3, reps: 12, weight: 45 },
        { name: 'Machine Abdominal Crunch', category: 'Core', sets: 3, reps: 15, weight: 35 }
      ],
      bodyweight: [
        { name: 'Pull-ups / Chin-ups', category: 'Back', sets: 3, reps: 8, weight: 0 },
        { name: 'Push-ups', category: 'Chest', sets: 3, reps: 20, weight: 0 },
        { name: 'Bulgarian Split Squats', category: 'Legs', sets: 3, reps: 12, weight: 0 },
        { name: 'Hanging Knee Raises', category: 'Core', sets: 3, reps: 15, weight: 0 },
        { name: 'Burpees / Jump Squats', category: 'Full Body', sets: 3, reps: 15, weight: 0 }
      ]
    }
  },
  {
    id: 'core_cardio_density',
    title: 'Core & Conditioning Shred',
    muscleCategory: 'Core',
    targetMuscles: ['Core', 'Abs', 'Cardio'],
    duration: '30-40m',
    equipmentVariants: {
      full_gym: [
        { name: 'Treadmill Interval Sprints', category: 'Cardio', sets: 5, reps: 1, weight: 0 },
        { name: 'Hanging Leg Raises', category: 'Core', sets: 3, reps: 15, weight: 0 },
        { name: 'Cable Woodchoppers', category: 'Core', sets: 3, reps: 15, weight: 15 },
        { name: 'Ab Wheel Rollout', category: 'Core', sets: 3, reps: 12, weight: 0 },
        { name: 'Plank Hold (Weighted)', category: 'Core', sets: 3, reps: 60, weight: 0 }
      ],
      dumbbells: [
        { name: 'Dumbbell Russian Twists', category: 'Core', sets: 3, reps: 20, weight: 10 },
        { name: 'Dumbbell Suitcase Carry', category: 'Core', sets: 3, reps: 1, weight: 24 },
        { name: 'Lying Leg Raises', category: 'Core', sets: 3, reps: 15, weight: 0 },
        { name: 'Mountain Climbers', category: 'Core', sets: 3, reps: 30, weight: 0 },
        { name: 'Plank Hold', category: 'Core', sets: 3, reps: 60, weight: 0 }
      ],
      machines: [
        { name: 'Machine Ab Crunch', category: 'Core', sets: 4, reps: 15, weight: 40 },
        { name: 'Cable Woodchopper', category: 'Core', sets: 3, reps: 15, weight: 15 },
        { name: 'Captain’s Chair Leg Raise', category: 'Core', sets: 3, reps: 15, weight: 0 },
        { name: 'Rowing Machine Intervals', category: 'Cardio', sets: 4, reps: 1, weight: 0 },
        { name: 'Back Extension Machine', category: 'Back', sets: 3, reps: 15, weight: 35 }
      ],
      bodyweight: [
        { name: 'Hollow Body Hold', category: 'Core', sets: 3, reps: 45, weight: 0 },
        { name: 'Bicycle Crunches', category: 'Core', sets: 3, reps: 25, weight: 0 },
        { name: 'Lying Leg Raises', category: 'Core', sets: 3, reps: 15, weight: 0 },
        { name: 'Mountain Climbers', category: 'Core', sets: 3, reps: 35, weight: 0 },
        { name: 'High Plank to Elbow Plank', category: 'Core', sets: 3, reps: 15, weight: 0 }
      ]
    }
  }
];

// Default Classic Split Template if user has no assigned split yet
const DEFAULT_CLASSIC_SPLIT = {
  id: 'classic_ppl',
  name: 'Push • Pull • Legs Classic',
  description: 'The premier hypertrophic split for balanced mass and athletic strength.',
  frequency: '3-6 Days/Week',
  days: [
    {
      dayNumber: 1,
      name: 'Push (Chest, Delts & Triceps)',
      muscles: ['Chest', 'Shoulders', 'Triceps'],
      exercises: [
        { name: 'Barbell Bench Press', category: 'Chest', sets: 4, reps: 8, weight: 60 },
        { name: 'Incline Dumbbell Press', category: 'Chest', sets: 3, reps: 10, weight: 22 },
        { name: 'Overhead Shoulder Press', category: 'Shoulders', sets: 3, reps: 8, weight: 40 },
        { name: 'Cable Lateral Raise', category: 'Shoulders', sets: 4, reps: 12, weight: 10 },
        { name: 'Tricep Rope Pushdown', category: 'Triceps', sets: 3, reps: 12, weight: 25 }
      ]
    },
    {
      dayNumber: 2,
      name: 'Pull (Back, Lats & Biceps)',
      muscles: ['Back', 'Biceps', 'Rear Delts'],
      exercises: [
        { name: 'Wide-Grip Lat Pulldown', category: 'Back', sets: 4, reps: 10, weight: 55 },
        { name: 'Barbell Bent-Over Row', category: 'Back', sets: 4, reps: 8, weight: 50 },
        { name: 'Face Pulls', category: 'Shoulders', sets: 4, reps: 15, weight: 20 },
        { name: 'Barbell Bicep Curl', category: 'Biceps', sets: 3, reps: 10, weight: 25 },
        { name: 'Dumbbell Hammer Curl', category: 'Biceps', sets: 3, reps: 12, weight: 14 }
      ]
    },
    {
      dayNumber: 3,
      name: 'Legs & Abs (Quads, Hams & Core)',
      muscles: ['Quads', 'Hamstrings', 'Calves', 'Core'],
      exercises: [
        { name: 'Barbell Back Squat', category: 'Legs', sets: 4, reps: 8, weight: 70 },
        { name: 'Romanian Deadlift', category: 'Legs', sets: 3, reps: 10, weight: 60 },
        { name: 'Leg Press', category: 'Legs', sets: 3, reps: 12, weight: 120 },
        { name: 'Hanging Leg Raise', category: 'Core', sets: 3, reps: 15, weight: 0 },
        { name: 'Standing Calf Raise', category: 'Legs', sets: 4, reps: 15, weight: 50 }
      ]
    }
  ]
};

// Available exercises for the Interactive Quick Builder
const BUILDER_CATALOG = [
  { name: 'Barbell Bench Press', muscle: 'Chest' },
  { name: 'Incline DB Press', muscle: 'Chest' },
  { name: 'Barbell Back Squat', muscle: 'Legs' },
  { name: 'Romanian Deadlift', muscle: 'Legs' },
  { name: 'Wide-Grip Lat Pulldown', muscle: 'Back' },
  { name: 'Barbell Bent Row', muscle: 'Back' },
  { name: 'Overhead DB Press', muscle: 'Shoulders' },
  { name: 'Cable Lateral Raise', muscle: 'Shoulders' },
  { name: 'DB Hammer Curl', muscle: 'Arms' },
  { name: 'Tricep Rope Pushdown', muscle: 'Arms' },
  { name: 'Hanging Leg Raises', muscle: 'Core' },
  { name: 'Conventional Deadlift', muscle: 'Back' }
];

export default function StartWorkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isOnline } = useRealTime();

  // 1. Scientific Protocol State
  const [selectedProtocol, setSelectedProtocol] = useState(() => {
    return localStorage.getItem('grindx_training_protocol') || 'hypertrophy';
  });

  // 2. Equipment / Environment Profile Filter
  const [equipmentProfile, setEquipmentProfile] = useState(() => {
    return localStorage.getItem('grindx_equipment_profile') || 'full_gym';
  });

  // 3. Time Budget Filter
  const [timeBudget, setTimeBudget] = useState('all');

  // 4. Targeted Muscle Filter (From Fatigue Radar or Manual Click)
  const [muscleFilter, setMuscleFilter] = useState('all');

  // Active Draft / In-Progress State
  const [activeDraft, setActiveDraft] = useState(null);
  const [lastWorkout, setLastWorkout] = useState(null);
  const [plans, setPlans] = useState([]);
  const [freestyleTitle, setFreestyleTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // Active Split State
  const [activeSplit, setActiveSplit] = useState(null);
  const [selectedSplitDayIndex, setSelectedSplitDayIndex] = useState(0);

  // History & Calendar States
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('monthly'); // 'daily' | 'weekly' | 'monthly' | 'yearly'
  
  // Calendar Navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [recoveryLogging, setRecoveryLogging] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // 5. Interactive Warmup Sets Calculator State
  const [showWarmupCalc, setShowWarmupCalc] = useState(false);
  const [warmupExercise, setWarmupExercise] = useState('Barbell Bench Press');
  const [warmupWorkingWeight, setWarmupWorkingWeight] = useState(80);

  // 6. Interactive Quick-Build Custom Session State
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [customSelectedEx, setCustomSelectedEx] = useState([]);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Persist Protocol
  const handleProtocolChange = (id) => {
    setSelectedProtocol(id);
    try {
      localStorage.setItem('grindx_training_protocol', id);
    } catch (e) {}
  };

  // Persist Equipment
  const handleEquipmentChange = (id) => {
    setEquipmentProfile(id);
    try {
      localStorage.setItem('grindx_equipment_profile', id);
    } catch (e) {}
  };

  // ---------------------------------------------------------
  // Initialize Active Split from State, Storage, or Defaults
  // ---------------------------------------------------------
  useEffect(() => {
    let resolvedSplit = null;

    if (location.state?.selectedSplit) {
      resolvedSplit = location.state.selectedSplit;
      try {
        localStorage.setItem(ACTIVE_SPLIT_KEY, JSON.stringify(resolvedSplit));
      } catch (e) {}
    } else {
      try {
        const stored = localStorage.getItem(ACTIVE_SPLIT_KEY) || sessionStorage.getItem(ACTIVE_SPLIT_KEY);
        if (stored) {
          resolvedSplit = JSON.parse(stored);
        }
      } catch (e) {}
    }

    if (!resolvedSplit) {
      resolvedSplit = DEFAULT_CLASSIC_SPLIT;
    }

    if (resolvedSplit.weeklySchedule && !resolvedSplit.days) {
      const days = Object.entries(resolvedSplit.weeklySchedule)
        .filter(([day, content]) => content && !content.toLowerCase().includes('rest day'))
        .map(([day, content], idx) => {
          const parts = content.split(' - ');
          const title = parts[0] || day;
          const muscleStr = parts[1] || '';
          return {
            dayNumber: idx + 1,
            name: `${day}: ${title}`,
            muscles: muscleStr.split(',').map(m => m.trim()).filter(Boolean),
            exercises: [
              { name: `${title} Compound Lift`, category: 'General', sets: 4, reps: 8, weight: 50 },
              { name: `${title} Accessory 1`, category: 'General', sets: 3, reps: 10, weight: 20 },
              { name: `${title} Accessory 2`, category: 'General', sets: 3, reps: 12, weight: 15 }
            ]
          };
        });
      resolvedSplit.days = days.length > 0 ? days : DEFAULT_CLASSIC_SPLIT.days;
    } else if (!resolvedSplit.days || resolvedSplit.days.length === 0) {
      resolvedSplit.days = DEFAULT_CLASSIC_SPLIT.days;
    }

    setActiveSplit(resolvedSplit);
  }, [location.state]);

  useEffect(() => {
    checkActiveDraft();
    fetchLaunchpadData();
    fetchAllWorkoutHistory();

    const handleWorkoutUpdate = () => {
      checkActiveDraft();
      fetchLaunchpadData();
      fetchAllWorkoutHistory();
    };

    window.addEventListener('workoutCompleted', handleWorkoutUpdate);
    window.addEventListener('realTimeStatsUpdate', handleWorkoutUpdate);
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutUpdate);
      window.removeEventListener('realTimeStatsUpdate', handleWorkoutUpdate);
    };
  }, []);

  const checkActiveDraft = () => {
    try {
      const savedDraft = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && (parsed.sessionState === 'ACTIVE' || (Array.isArray(parsed.exercises) && parsed.exercises.length > 0))) {
          setActiveDraft(parsed);
          return;
        }
      }
      setActiveDraft(null);
    } catch (e) {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
      setActiveDraft(null);
    }
  };

  const fetchLaunchpadData = async () => {
    setLoading(true);
    try {
      try {
        const lastRes = await api.get('/workouts?limit=1&status=completed');
        if (lastRes.data?.success && lastRes.data?.workouts?.length > 0) {
          const raw = lastRes.data.workouts[0];
          const rawEx = Array.isArray(raw.exercises) ? raw.exercises : [];
          const primaryMuscle = raw.category || raw.muscle || getPrimaryMuscleGroup(rawEx) || getMuscleGroup(raw.title);
          const displayName = getExerciseDisplayName(raw.title || rawEx[0]?.exerciseName || 'workout-session');

          setLastWorkout({
            ...raw,
            displayName,
            primaryMuscle
          });
        }
      } catch (err) {}

      try {
        const plansRes = await api.get('/plans');
        if (plansRes.data?.success && Array.isArray(plansRes.data.plans)) {
          setPlans(plansRes.data.plans);
        }
      } catch (err) {}
    } finally {
      setLoading(false);
    }
  };

  const fetchAllWorkoutHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/workouts?limit=200&status=completed');
      const list = Array.isArray(res.data?.workouts) ? res.data.workouts : (Array.isArray(res.data) ? res.data : []);
      
      const normalized = list.map(w => {
        const rawEx = Array.isArray(w.exercises) ? w.exercises : [];
        const isRecovery = w.category === 'Recovery' || w.title?.toLowerCase().includes('recovery') || w.title?.toLowerCase().includes('mobility');
        const primaryMuscle = isRecovery ? 'Recovery' : (w.category || w.muscle || getPrimaryMuscleGroup(rawEx) || getMuscleGroup(w.title));
        const displayName = getExerciseDisplayName(w.title || rawEx[0]?.exerciseName || (isRecovery ? 'Active Recovery & Mobility' : 'workout-session'));
        const completedDate = new Date(w.completedAt || w.date || w.createdAt || Date.now());

        const totalSets = rawEx.reduce((sum, ex) => sum + (Array.isArray(ex.sets) ? ex.sets.length : 0), 0);
        const totalReps = rawEx.reduce((sum, ex) => sum + (Array.isArray(ex.sets) ? ex.sets.reduce((s, set) => s + (Number(set.reps) || 0), 0) : 0), 0);
        const totalVolume = w.totalVolume || rawEx.reduce((sum, ex) => sum + (Array.isArray(ex.sets) ? ex.sets.reduce((s, set) => s + (Number(set.reps) || 0) * (Number(set.weight) || 0), 0) : 0), 0);

        return {
          ...w,
          id: w._id || w.id,
          displayName,
          primaryMuscle,
          isRecovery,
          completedDate,
          totalSets,
          totalReps,
          totalVolume,
          duration: w.durationMinutes ? w.durationMinutes * 60 : (w.duration || 0),
          caloriesBurned: w.calories || w.caloriesBurned || (isRecovery ? 120 : 0)
        };
      });

      setAllWorkouts(normalized);
    } catch (err) {
      console.warn('Failed to load history:', err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ---------------------------------------------------------
  // REAL-WORLD FEATURE 1: MUSCLE RECOVERY & FATIGUE RADAR
  // ---------------------------------------------------------
  const muscleRecoveryStatus = useMemo(() => {
    const majorGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
    const now = Date.now();

    const result = {};
    majorGroups.forEach(m => {
      // Find latest completed workout that targeted this muscle
      const match = allWorkouts.find(w => {
        if (w.isRecovery) return false;
        const norm = (w.primaryMuscle || '').toLowerCase();
        const titleNorm = (w.title || '').toLowerCase();
        const target = m.toLowerCase();
        return norm.includes(target) || titleNorm.includes(target);
      });

      if (!match) {
        result[m] = { percent: 100, status: 'Primed', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      } else {
        const diffHours = (now - match.completedDate.getTime()) / (1000 * 60 * 60);
        if (diffHours < 24) {
          result[m] = { percent: 45, status: 'Fatigued', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
        } else if (diffHours < 48) {
          result[m] = { percent: 75, status: 'Rebuilding', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
        } else {
          result[m] = { percent: 100, status: 'Primed', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
        }
      }
    });

    return result;
  }, [allWorkouts]);

  // Recommendation based on recovery
  const aiReadinessRecommendation = useMemo(() => {
    const primed = Object.entries(muscleRecoveryStatus).filter(([_, data]) => data.percent === 100).map(([m]) => m);
    const fatigued = Object.entries(muscleRecoveryStatus).filter(([_, data]) => data.percent < 70).map(([m]) => m);

    if (primed.length === 0) {
      return {
        headline: 'Systemic Fatigue Detected',
        text: 'Multiple muscle groups are currently rebuilding. Consider an Active Recovery & Mobility session today to accelerate recovery.'
      };
    }

    return {
      headline: `Primed for Training: ${primed.slice(0, 2).join(' & ')}`,
      text: fatigued.length > 0 
        ? `${fatigued.join(', ')} were trained recently. Focus on ${primed.slice(0, 2).join(' & ')} for optimal progressive overload.`
        : 'All muscle groups are recovered and primed for maximal overload.'
    };
  }, [muscleRecoveryStatus]);

  // ---------------------------------------------------------
  // REAL-WORLD FEATURE 2: SCIENTIFIC WARMUP SETS CALCULATOR
  // ---------------------------------------------------------
  const warmupProtocol = useMemo(() => {
    const weight = Number(warmupWorkingWeight) || 60;
    const bar = 20;

    return [
      { step: 1, label: 'Groove & Activation', weight: bar, reps: 10, percent: 'Empty Bar' },
      { step: 2, label: 'Motor Recruitment', weight: Math.max(bar, Math.round((weight * 0.5) / 2.5) * 2.5), reps: 6, percent: '50%' },
      { step: 3, label: 'CNS Neural Priming', weight: Math.max(bar, Math.round((weight * 0.72) / 2.5) * 2.5), reps: 3, percent: '72%' },
      { step: 4, label: 'Acclimation & Potentiation', weight: Math.max(bar, Math.round((weight * 0.88) / 2.5) * 2.5), reps: 1, percent: '88%' }
    ];
  }, [warmupWorkingWeight]);

  const handleInjectWarmupToSession = () => {
    const working = Number(warmupWorkingWeight) || 60;
    const sets = [
      ...warmupProtocol.map(w => ({ reps: w.reps, weight: w.weight, isWarmup: true })),
      { reps: 8, weight: working, isWarmup: false },
      { reps: 8, weight: working, isWarmup: false },
      { reps: 8, weight: working, isWarmup: false }
    ];

    const targetEx = [
      {
        name: warmupExercise,
        category: 'General',
        sets: sets.length,
        reps: 8,
        weight: working
      }
    ];

    localStorage.removeItem(ACTIVE_SESSION_KEY);
    navigate('/workout-session', {
      state: {
        defaultTitle: `${warmupExercise} (With Warmup Protocol)`,
        exercises: targetEx,
        protocol: selectedProtocol
      }
    });
  };

  // ---------------------------------------------------------
  // FILTERED ROUTINES MATRIX
  // ---------------------------------------------------------
  const filteredRoutines = useMemo(() => {
    return ALL_ROUTINES.filter(routine => {
      // Muscle filter
      if (muscleFilter !== 'all' && routine.muscleCategory.toLowerCase() !== muscleFilter.toLowerCase()) {
        return false;
      }
      // Time budget filter
      if (timeBudget === '30m' && routine.duration.includes('60')) return false;
      if (timeBudget === '60m' && routine.duration.includes('30')) return false;
      return true;
    }).map(routine => {
      // Adapt exercises based on current equipment profile
      const exList = routine.equipmentVariants[equipmentProfile] || routine.equipmentVariants.full_gym;
      return {
        ...routine,
        activeExercises: exList
      };
    });
  }, [equipmentProfile, timeBudget, muscleFilter]);

  // ---------------------------------------------------------
  // Session Launch Handlers
  // ---------------------------------------------------------
  const handleResumeDraft = () => {
    navigate('/workout-session');
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    setActiveDraft(null);
    showToast('In-progress draft discarded.');
  };

  const handleStartFreestyle = (presetTitle) => {
    const title = presetTitle || freestyleTitle.trim() || 'Freestyle Workout';
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    navigate('/workout-session', { state: { defaultTitle: title, protocol: selectedProtocol } });
  };

  const handleRepeatLastWorkout = (targetWorkout = lastWorkout) => {
    if (!targetWorkout) return;
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    navigate('/workout-session', { state: { repeatWorkout: targetWorkout, protocol: selectedProtocol } });
  };

  const handleStartRoutine = (routine) => {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    navigate('/workout-session', {
      state: {
        defaultTitle: routine.title,
        exercises: routine.activeExercises,
        protocol: selectedProtocol
      }
    });
  };

  const handleStartSplitDay = (day) => {
    if (!day) return;
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    navigate('/workout-session', {
      state: {
        defaultTitle: `${activeSplit?.name || 'Split'} - ${day.name}`,
        exercises: day.exercises || [],
        protocol: selectedProtocol
      }
    });
  };

  const handleStartCustomBuiltSession = () => {
    if (customSelectedEx.length === 0) return;
    const formatted = customSelectedEx.map(ex => ({
      name: ex.name,
      category: ex.muscle,
      sets: 3,
      reps: 10,
      weight: 40
    }));

    localStorage.removeItem(ACTIVE_SESSION_KEY);
    navigate('/workout-session', {
      state: {
        defaultTitle: `Custom ${customSelectedEx[0].muscle} Session`,
        exercises: formatted,
        protocol: selectedProtocol
      }
    });
  };

  // ---------------------------------------------------------
  // Log Active Recovery / Rest Day Action
  // ---------------------------------------------------------
  const handleLogActiveRecovery = async () => {
    if (recoveryLogging) return;
    setRecoveryLogging(true);

    const logTargetDate = selectedDate || new Date();

    const recoveryPayload = {
      title: 'Active Recovery & Mobility',
      category: 'Recovery',
      muscle: 'Full Body',
      durationMinutes: 25,
      calories: 135,
      date: logTargetDate.toISOString(),
      status: 'completed',
      exercises: [
        {
          exerciseName: 'Full Body Mobility & Dynamic Stretching',
          category: 'Recovery',
          sets: [{ setNumber: 1, reps: 1, weight: 0, completed: true }]
        },
        {
          exerciseName: 'Deep Breathing & Joint Decompression',
          category: 'Recovery',
          sets: [{ setNumber: 1, reps: 1, weight: 0, completed: true }]
        }
      ]
    };

    try {
      const res = await api.post('/workouts', recoveryPayload);
      if (res.data?.success || res.status === 200 || res.status === 201) {
        showToast('🧘 Active Recovery session logged! Streak maintained.');
        fetchAllWorkoutHistory();
      }
    } catch (err) {
      console.warn('Backend log failed, saving locally:', err.message);
      const mockSession = {
        id: `recovery_${Date.now()}`,
        displayName: 'Active Recovery & Mobility',
        primaryMuscle: 'Recovery',
        isRecovery: true,
        completedDate: logTargetDate,
        totalSets: 2,
        totalReps: 2,
        totalVolume: 0,
        duration: 25 * 60,
        caloriesBurned: 135
      };
      setAllWorkouts(prev => [mockSession, ...prev]);
      showToast('🧘 Active Recovery logged locally!');
    } finally {
      setRecoveryLogging(false);
    }
  };

  // ---------------------------------------------------------
  // Calendar Calculations
  // ---------------------------------------------------------
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentYear, currentMonth]);

  const workoutDatesMap = useMemo(() => {
    const map = {};
    allWorkouts.forEach(w => {
      const d = w.completedDate;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(w);
    });
    return map;
  }, [allWorkouts]);

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const filteredSessions = useMemo(() => {
    if (allWorkouts.length === 0) return [];

    if (timeframe === 'daily') {
      const selKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
      return workoutDatesMap[selKey] || [];
    }

    if (timeframe === 'weekly') {
      const now = selectedDate.getTime();
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      return allWorkouts.filter(w => {
        const time = w.completedDate.getTime();
        return time >= oneWeekAgo && time <= now + (24 * 60 * 60 * 1000);
      });
    }

    if (timeframe === 'monthly') {
      return allWorkouts.filter(w => {
        const d = w.completedDate;
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });
    }

    if (timeframe === 'yearly') {
      return allWorkouts.filter(w => w.completedDate.getFullYear() === currentYear);
    }

    return allWorkouts;
  }, [allWorkouts, timeframe, selectedDate, currentYear, currentMonth, workoutDatesMap]);

  const periodStats = useMemo(() => {
    const totalCount = filteredSessions.length;
    const totalVolume = filteredSessions.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
    const totalDurationSeconds = filteredSessions.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalCalories = filteredSessions.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    return {
      totalCount,
      totalVolume,
      totalDurationMinutes: Math.round(totalDurationSeconds / 60),
      totalCalories
    };
  }, [filteredSessions]);

  const currentStreak = useMemo(() => {
    if (allWorkouts.length === 0) return 0;
    const uniqueDays = new Set(
      allWorkouts.map(w => `${w.completedDate.getFullYear()}-${w.completedDate.getMonth()}-${w.completedDate.getDate()}`)
    );

    let streak = 0;
    const checkDate = new Date();
    const todayKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
    if (!uniqueDays.has(todayKey)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
      if (uniqueDays.has(key)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [allWorkouts]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentProtocolObj = TRAINING_PROTOCOLS.find(p => p.id === selectedProtocol) || TRAINING_PROTOCOLS[1];
  const activeDay = activeSplit?.days?.[selectedSplitDayIndex] || activeSplit?.days?.[0];

  return (
    <div className="min-h-screen bg-black text-white pb-36 sm:pb-28 pt-2 sm:pt-4 start-workout-page">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 space-y-4 sm:space-y-6">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 p-3 bg-neutral-900 border border-red-500 text-white rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        {/* =========================================================
            1. HEADER & GYM STREAK BANNER
           ========================================================= */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="space-y-0.5 min-w-0 flex-1">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 px-3 py-1 mb-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 hover:border-red-500/40 text-xs font-bold transition-all shadow-md group"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-red-500 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-1 text-red-500 font-bold text-[9px] sm:text-xs uppercase tracking-wider">
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" /> Start Training
            </div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight truncate">
              Workout Launchpad
            </h1>
            <p className="text-[10px] sm:text-xs text-neutral-400 line-clamp-1">
              Select workout routines, track recovery, or launch customized training sessions.
            </p>
          </div>

          {/* Active Training Streak Tag */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-red-600/20 via-neutral-900 to-neutral-900 border border-red-500/30 rounded-xl sm:rounded-2xl shadow-lg shrink-0">
            <div className="p-1 sm:p-1.5 bg-red-600 text-white rounded-lg sm:rounded-xl shadow-md shadow-red-600/30">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            </div>
            <div>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-bold text-neutral-400 block leading-none">Streak</span>
              <span className="text-[11px] sm:text-xs md:text-sm font-black text-red-400 font-mono leading-tight">
                {currentStreak}d Active
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================
            2. REAL-WORLD ADVANCED FEATURE: MUSCLE RECOVERY & READINESS
           ========================================================= */}
        <div className="p-3 sm:p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl sm:rounded-2xl space-y-3 shadow-md start-workout-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                Muscle Recovery & Readiness Radar
              </h2>
            </div>
            <span className="text-[9px] sm:text-[10px] text-neutral-400 font-mono">
              Auto-tracked from recent volume
            </span>
          </div>

          {/* Recovery Gauge Strip */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {Object.entries(muscleRecoveryStatus).map(([muscle, data]) => {
              const isSelected = muscleFilter.toLowerCase() === muscle.toLowerCase();
              return (
                <button
                  key={muscle}
                  onClick={() => setMuscleFilter(prev => prev.toLowerCase() === muscle.toLowerCase() ? 'all' : muscle)}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-between ${
                    isSelected
                      ? 'border-red-500 bg-red-500/10 ring-1 ring-red-500'
                      : 'border-neutral-800 bg-neutral-950/70 hover:border-neutral-700'
                  }`}
                  title={`Filter ${muscle} routines`}
                >
                  <span className="text-[10px] sm:text-xs font-bold text-white block">{muscle}</span>
                  <span className={`text-[9px] font-black font-mono px-1.5 py-0.5 rounded mt-1 ${data.color}`}>
                    {data.percent}% {data.status}
                  </span>
                </button>
              );
            })}
          </div>

          {/* AI Training Recommendation Box */}
          <div className="p-2.5 bg-neutral-950/90 border border-neutral-800/80 rounded-xl flex items-start gap-2.5">
            <div className="p-1 bg-red-600/20 text-red-400 rounded-lg shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] sm:text-xs font-bold text-white leading-tight">
                {aiReadinessRecommendation.headline}
              </h4>
              <p className="text-[9px] sm:text-[10px] text-neutral-400 mt-0.5 leading-snug">
                {aiReadinessRecommendation.text}
              </p>
            </div>
            {muscleFilter !== 'all' && (
              <button
                onClick={() => setMuscleFilter('all')}
                className="text-[9px] text-red-400 hover:underline shrink-0 font-bold"
              >
                Clear Filter ✕
              </button>
            )}
          </div>
        </div>

        {/* =========================================================
            3. RESUME IN-PROGRESS SESSION (TOP PRIORITY)
           ========================================================= */}
        {activeDraft && (
          <div className="p-3.5 sm:p-5 bg-gradient-to-r from-red-600/25 via-amber-500/15 to-neutral-900 border-2 border-red-500 rounded-xl sm:rounded-3xl shadow-2xl space-y-3 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shadow-lg shadow-red-600/40 shrink-0">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 bg-red-600 text-black font-black text-[8px] sm:text-[9px] uppercase tracking-widest rounded">
                      ⚡ In-Progress
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-red-300 font-mono font-bold">
                      {activeDraft.elapsedSeconds ? `${Math.floor(activeDraft.elapsedSeconds / 60)}m logged` : 'Active'}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-base font-black text-white truncate mt-0.5">
                    {activeDraft.title || 'Freestyle workout-session'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleDiscardDraft}
                  className="px-2.5 py-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-900/80 rounded-lg sm:rounded-xl transition-colors text-[10px] sm:text-xs font-bold flex items-center gap-1"
                  title="Discard Draft"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Discard</span>
                </button>
                <button
                  onClick={handleResumeDraft}
                  className="flex-1 sm:flex-initial px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-orange-600 text-white font-black rounded-lg sm:rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 transition-all text-[11px] sm:text-xs uppercase tracking-wider start-repeat-btn"
                >
                  <span>RESUME SESSION</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            4. ACTIVE SPLIT ROUTINE HERO CARD
           ========================================================= */}
        {activeSplit && (
          <div className="p-3.5 sm:p-5 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-red-500/40 rounded-xl sm:rounded-3xl shadow-xl space-y-3.5 split-hero-card">
            <div className="flex items-center justify-between gap-2 border-b border-neutral-800/80 pb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 sm:p-2 bg-red-600/20 text-red-500 rounded-lg sm:rounded-xl border border-red-500/30 shrink-0">
                  <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-red-400">
                      Active Split Routine
                    </span>
                    <span className="px-1.5 py-0.2 bg-red-500/10 text-red-400 text-[8px] font-bold rounded">
                      {activeSplit.frequency || 'Daily'}
                    </span>
                  </div>
                  <h2 className="text-xs sm:text-base font-black text-white truncate">
                    {activeSplit.name}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => navigate('/splits')}
                className="px-2.5 py-1 text-[9px] sm:text-xs text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800 rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                <Sliders className="w-3 h-3" />
                <span>Change Split</span>
              </button>
            </div>

            {/* Split Days Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {activeSplit.days?.map((day, idx) => {
                const isSelected = selectedSplitDayIndex === idx;
                return (
                  <button
                    key={day.dayNumber || idx}
                    onClick={() => setSelectedSplitDayIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                      isSelected
                        ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                        : 'bg-neutral-950/80 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    <span>Day {day.dayNumber || idx + 1}</span>
                    <span className="text-[9px] opacity-80 truncate max-w-[120px]">{day.name.split(':')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Day Routine Preview & Launch Button */}
            {activeDay && (
              <div className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl sm:rounded-2xl space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-white">
                      {activeDay.name}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      {activeDay.muscles?.map((muscle, mIdx) => (
                        <span
                          key={mIdx}
                          className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded text-[9px] font-bold"
                        >
                          {muscle}
                        </span>
                      ))}
                      <span className="text-[9px] text-neutral-500 font-mono">
                        • {activeDay.exercises?.length || 0} Exercises Preloaded
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartSplitDay(activeDay)}
                    className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 uppercase tracking-wider transition-all start-repeat-btn"
                  >
                    <span>Start Day Routine</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            5. TRAINING PROTOCOL & SPORTS-SCIENCE PARAMETERS
           ========================================================= */}
        <div className="p-3 sm:p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl sm:rounded-2xl space-y-2.5 shadow-md start-workout-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-red-500" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                Training Objective & Rest Protocol
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-neutral-400">
              Target Rest: {currentProtocolObj.restSeconds}s
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
            {TRAINING_PROTOCOLS.map(proto => {
              const isSelected = selectedProtocol === proto.id;
              const IconComp = proto.icon;
              return (
                <button
                  key={proto.id}
                  onClick={() => handleProtocolChange(proto.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? proto.activeBg
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <IconComp className={`w-4 h-4 ${proto.color}`} />
                    <span className="text-[8px] font-mono font-bold text-neutral-400">{proto.reps}</span>
                  </div>
                  <div>
                    <span className="text-[11px] sm:text-xs font-black block truncate leading-tight">
                      {proto.title}
                    </span>
                    <span className="text-[8px] text-neutral-500 block truncate mt-0.5">
                      {proto.restSeconds}s rest • {proto.rpe}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            6. REPEAT LAST WORKOUT QUICK CARD (HIGH CONTRAST)
           ========================================================= */}
        {lastWorkout && (
          <div className="p-3 sm:p-4 bg-neutral-900 border border-neutral-800 rounded-xl sm:rounded-2xl space-y-2.5 hover:border-neutral-700 transition-all shadow-lg start-workout-card">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-2 sm:p-2.5 bg-neutral-800 text-red-500 rounded-xl shrink-0">
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] sm:text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                      Repeat Previous
                    </span>
                    <span className="px-1.5 py-0.2 bg-red-500/10 text-red-400 rounded text-[8px] sm:text-[9px] font-bold uppercase">
                      {lastWorkout.primaryMuscle}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-base font-black text-white truncate mt-0.5">
                    {lastWorkout.displayName}
                  </h3>
                  <span className="text-[9px] sm:text-[10px] text-neutral-400 block font-mono">
                    {new Date(lastWorkout.completedAt || lastWorkout.date || lastWorkout.createdAt).toLocaleDateString()} • {lastWorkout.exercises?.length || 0} Ex.
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleRepeatLastWorkout(lastWorkout)}
                className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-[11px] sm:text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-red-600/30 shrink-0 whitespace-nowrap start-repeat-btn"
              >
                <span>Repeat</span> <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            7. REAL-WORLD ADVANCED FEATURE: INTERACTIVE WARMUP CALCULATOR (COLLAPSIBLE)
           ========================================================= */}
        <div className="p-3 sm:p-4 bg-neutral-900 border border-neutral-800 rounded-xl sm:rounded-2xl space-y-3 shadow-md start-workout-card">
          <div 
            onClick={() => setShowWarmupCalc(prev => !prev)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              <div>
                <h3 className="text-xs sm:text-sm font-black text-white">
                  Warmup & Ramp-Up Sets Calculator
                </h3>
                <p className="text-[9px] text-neutral-400">
                  Calculate scientific warm-up progression before heavy working sets
                </p>
              </div>
            </div>
            <button className="p-1 rounded-lg bg-neutral-800 text-neutral-300">
              <ChevronDown className={`w-4 h-4 transition-transform ${showWarmupCalc ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showWarmupCalc && (
            <div className="pt-2 border-t border-neutral-800/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-neutral-400 block mb-1 uppercase">Exercise</label>
                  <select
                    value={warmupExercise}
                    onChange={(e) => setWarmupExercise(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-lg p-2 focus:outline-none focus:border-red-500"
                  >
                    <option value="Barbell Bench Press">Barbell Bench Press</option>
                    <option value="Barbell Back Squat">Barbell Back Squat</option>
                    <option value="Conventional Deadlift">Conventional Deadlift</option>
                    <option value="Standing Overhead Press">Standing Overhead Press</option>
                    <option value="Incline Dumbbell Press">Incline Dumbbell Press</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-neutral-400 block mb-1 uppercase">Working Weight (kg)</label>
                  <input
                    type="number"
                    min="20"
                    max="400"
                    step="2.5"
                    value={warmupWorkingWeight}
                    onChange={(e) => setWarmupWorkingWeight(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-lg p-2 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              {/* Calculated Warmup Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {warmupProtocol.map(step => (
                  <div key={step.step} className="p-2 bg-neutral-950 border border-neutral-800/80 rounded-lg text-center">
                    <span className="text-[8px] font-bold text-amber-400 uppercase block">{step.percent} • Set {step.step}</span>
                    <span className="text-xs sm:text-sm font-black text-white font-mono block mt-0.5">{step.weight} kg × {step.reps}</span>
                    <span className="text-[8px] text-neutral-500 block truncate">{step.label}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleInjectWarmupToSession}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider"
              >
                <span>Launch {warmupExercise} With Warmup Protocol</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          )}
        </div>

        {/* =========================================================
            8. EQUIPMENT FILTER & TIME BUDGET SWITCHER
           ========================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-neutral-400">
              Customize Workout Environment & Time Budget
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {EQUIPMENT_PROFILES.map(eq => {
              const isSelected = equipmentProfile === eq.id;
              const EqIcon = eq.icon;
              return (
                <button
                  key={eq.id}
                  onClick={() => handleEquipmentChange(eq.id)}
                  className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'border-red-500 bg-red-500/10 text-white ring-1 ring-red-500/30'
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
                  }`}
                >
                  <EqIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-red-500' : 'text-neutral-500'}`} />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] sm:text-xs font-bold block truncate leading-tight">{eq.label}</span>
                    <span className="text-[8px] text-neutral-500 block truncate">{eq.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Time Budget Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            {TIME_BUDGETS.map(t => (
              <button
                key={t.id}
                onClick={() => setTimeBudget(t.id)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all border shrink-0 ${
                  timeBudget === t.id
                    ? 'bg-neutral-800 border-neutral-600 text-white shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================
            9. ADAPTIVE WORKOUT ROUTINES GRID
           ========================================================= */}
        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 shrink-0" />
              <h2 className="text-xs sm:text-base font-black text-white">Targeted Workout Routines</h2>
            </div>
            <span className="text-[9px] sm:text-[10px] text-neutral-400">
              Showing {filteredRoutines.length} routines for {EQUIPMENT_PROFILES.find(e => e.id === equipmentProfile)?.label}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {filteredRoutines.map(routine => (
              <div
                key={routine.id}
                onClick={() => handleStartRoutine(routine)}
                className="p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl sm:rounded-2xl hover:border-red-500/60 transition-all cursor-pointer group shadow-sm flex flex-col justify-between start-workout-card quick-start-card"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[8px] font-bold uppercase tracking-wider">
                      {routine.muscleCategory}
                    </span>
                    <span className="text-[9px] text-neutral-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-500" /> {routine.duration}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-red-400 transition-colors leading-tight">
                    {routine.title}
                  </h3>
                  <div className="space-y-0.5 pt-1">
                    {routine.activeExercises.slice(0, 3).map((ex, exIdx) => (
                      <span key={exIdx} className="text-[9px] text-neutral-400 block truncate">
                        • {ex.name} ({ex.sets} × {ex.reps})
                      </span>
                    ))}
                    {routine.activeExercises.length > 3 && (
                      <span className="text-[8px] text-neutral-500 block">
                        + {routine.activeExercises.length - 3} more exercises
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-neutral-800/80 mt-2">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Start Routine</span>
                  <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-red-600/30">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================
            10. REAL-WORLD ADVANCED FEATURE: QUICK MULTI-EXERCISE BUILDER (COLLAPSIBLE)
           ========================================================= */}
        <div className="p-3 sm:p-4 bg-neutral-900 border border-neutral-800 rounded-xl sm:rounded-2xl space-y-3 shadow-md start-workout-card">
          <div 
            onClick={() => setShowCustomBuilder(prev => !prev)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-red-500" />
              <div>
                <h3 className="text-xs sm:text-sm font-black text-white">
                  Quick Multi-Exercise Routine Builder
                </h3>
                <p className="text-[9px] text-neutral-400">
                  Select 3–6 exercises to build and start an immediate session
                </p>
              </div>
            </div>
            <button className="p-1 rounded-lg bg-neutral-800 text-neutral-300">
              <ChevronDown className={`w-4 h-4 transition-transform ${showCustomBuilder ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showCustomBuilder && (
            <div className="pt-2 border-t border-neutral-800/80 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {BUILDER_CATALOG.map(item => {
                  const isPicked = customSelectedEx.some(e => e.name === item.name);
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        if (isPicked) {
                          setCustomSelectedEx(prev => prev.filter(e => e.name !== item.name));
                        } else {
                          setCustomSelectedEx(prev => [...prev, item]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border flex items-center gap-1 ${
                        isPicked
                          ? 'bg-red-600 border-red-500 text-white'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span>{isPicked ? '✓' : '+'}</span>
                      <span>{item.name}</span>
                      <span className="text-[8px] opacity-70">({item.muscle})</span>
                    </button>
                  );
                })}
              </div>

              {customSelectedEx.length > 0 && (
                <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between gap-2">
                  <div className="text-[10px] text-neutral-400">
                    <span className="font-bold text-white">{customSelectedEx.length}</span> exercises selected • Est. <span className="text-red-400 font-bold">{customSelectedEx.length * 9}m</span>
                  </div>
                  <button
                    onClick={handleStartCustomBuiltSession}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-1 uppercase tracking-wider"
                  >
                    <span>Launch Custom Session</span>
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================================
            11. START FREESTYLE WORKOUT
           ========================================================= */}
        <div className="p-3 sm:p-4 bg-neutral-900 border border-neutral-800 rounded-xl sm:rounded-2xl space-y-2.5 shadow-lg start-workout-card">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-500/10 text-red-500 rounded-xl shrink-0">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">Freestyle Workout</h2>
              <p className="text-[9px] sm:text-[10px] text-neutral-400">Start an empty workout and pick exercises on the fly.</p>
            </div>
          </div>

          <div className="flex gap-2 pt-0.5">
            <input
              type="text"
              placeholder="e.g. Upper Body Blast, Chest & Back..."
              value={freestyleTitle}
              onChange={(e) => setFreestyleTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartFreestyle()}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
            />
            <button
              onClick={() => handleStartFreestyle()}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] sm:text-xs rounded-lg sm:rounded-xl shadow-md flex items-center justify-center gap-1 transition-all uppercase tracking-wider shrink-0 start-repeat-btn"
            >
              <span>Start</span> <Play className="w-2.5 h-2.5 fill-current shrink-0" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {['Chest Blast', 'Back & Bi', 'Heavy Leg Day', 'Arms & Delts', 'Full Body Compound'].map((chip, cIdx) => (
              <button
                key={cIdx}
                onClick={() => handleStartFreestyle(chip)}
                className="px-2 py-0.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded text-[9px] text-neutral-400 hover:text-white transition-colors shrink-0"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================
            12. PROFESSIONAL INTERACTIVE CALENDAR & TRACKER
           ========================================================= */}
        <div className="p-3 sm:p-5 bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl sm:rounded-3xl space-y-4 shadow-xl start-workout-card">
          
          {/* Header & Mobile-First Segmented Control */}
          <div className="space-y-3 border-b border-neutral-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-600 to-red-700 rounded-lg sm:rounded-xl text-white shadow-md shrink-0">
                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-base md:text-lg font-black text-white tracking-tight truncate">
                  Session History & Calendar
                </h2>
                <p className="text-[9px] sm:text-[10px] text-neutral-400 line-clamp-1">
                  Track consistency, progressive volume and recovery across timeframes.
                </p>
              </div>
            </div>

            {/* Responsive 4-Column Segmented Control */}
            <div className="grid grid-cols-4 bg-neutral-950 border border-neutral-800 p-1 rounded-xl gap-1">
              {[
                { key: 'daily', label: 'Daily' },
                { key: 'weekly', label: 'Weekly' },
                { key: 'monthly', label: 'Monthly' },
                { key: 'yearly', label: 'Yearly' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setTimeframe(tab.key)}
                  className={`py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-xs font-bold transition-all uppercase tracking-wider text-center ${
                    timeframe === tab.key
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Period Summary Stats Bento: Compact 4-Grid */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
            <div className="p-2 sm:p-3 bg-neutral-950 border border-neutral-800/80 rounded-lg sm:rounded-xl text-center bento-stat-card">
              <span className="text-[7px] sm:text-[9px] text-neutral-400 font-bold uppercase tracking-wider block truncate">
                Workouts
              </span>
              <span className="text-xs sm:text-lg md:text-xl font-black text-white font-mono block">
                {periodStats.totalCount}
              </span>
            </div>

            <div className="p-2 sm:p-3 bg-neutral-950 border border-neutral-800/80 rounded-lg sm:rounded-xl text-center bento-stat-card">
              <span className="text-[7px] sm:text-[9px] text-neutral-400 font-bold uppercase tracking-wider block truncate">
                Volume
              </span>
              <span className="text-xs sm:text-lg md:text-xl font-black text-red-400 font-mono block truncate">
                {periodStats.totalVolume > 999 ? `${(periodStats.totalVolume / 1000).toFixed(1)}k` : periodStats.totalVolume} kg
              </span>
            </div>

            <div className="p-2 sm:p-3 bg-neutral-950 border border-neutral-800/80 rounded-lg sm:rounded-xl text-center bento-stat-card">
              <span className="text-[7px] sm:text-[9px] text-neutral-400 font-bold uppercase tracking-wider block truncate">
                Time
              </span>
              <span className="text-xs sm:text-lg md:text-xl font-black text-blue-400 font-mono block truncate">
                {periodStats.totalDurationMinutes}m
              </span>
            </div>

            <div className="p-2 sm:p-3 bg-neutral-950 border border-neutral-800/80 rounded-lg sm:rounded-xl text-center bento-stat-card">
              <span className="text-[7px] sm:text-[9px] text-neutral-400 font-bold uppercase tracking-wider block truncate">
                Calories
              </span>
              <span className="text-xs sm:text-lg md:text-xl font-black text-red-400 font-mono block truncate">
                {periodStats.totalCalories}
              </span>
            </div>
          </div>

          {/* Interactive Month Calendar Widget */}
          {(timeframe === 'monthly' || timeframe === 'daily') && (
            <div className="p-2.5 sm:p-4 bg-neutral-950 border border-neutral-800/80 rounded-xl sm:rounded-2xl space-y-2.5 sm:space-y-3.5">
              
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-base font-black text-white tracking-tight">
                    {monthNames[currentMonth]} {currentYear}
                  </span>
                  <button
                    onClick={handleGoToday}
                    className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-[8px] sm:text-[10px] font-bold text-red-400 rounded transition-colors"
                  >
                    Today
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 sm:p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-md transition-colors"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 sm:p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-md transition-colors"
                    title="Next Month"
                  >
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              {/* Day-of-week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[8px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="py-0.5">{d}</div>
                ))}
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-7 sm:h-9 rounded-lg bg-neutral-900/20 opacity-20" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateKey = `${currentYear}-${currentMonth}-${dayNum}`;
                  const dayWorkouts = workoutDatesMap[dateKey] || [];
                  const hasWorkout = dayWorkouts.length > 0;
                  const hasRecovery = dayWorkouts.some(w => w.isRecovery);

                  const isSelected = 
                    selectedDate.getFullYear() === currentYear &&
                    selectedDate.getMonth() === currentMonth &&
                    selectedDate.getDate() === dayNum;

                  const isToday = 
                    new Date().getFullYear() === currentYear &&
                    new Date().getMonth() === currentMonth &&
                    new Date().getDate() === dayNum;

                  return (
                    <button
                      key={dayNum}
                      onClick={() => {
                        setSelectedDate(new Date(currentYear, currentMonth, dayNum));
                        if (timeframe !== 'daily') setTimeframe('daily');
                      }}
                      className={`h-7 sm:h-9 rounded-lg flex flex-col items-center justify-between p-1 transition-all relative calendar-day-btn ${
                        isSelected 
                          ? 'bg-red-600 text-white font-black shadow-md shadow-red-600/30 scale-105 z-10 selected'
                          : hasRecovery
                          ? 'bg-emerald-950/40 border border-emerald-500/60 text-emerald-400'
                          : hasWorkout
                          ? 'bg-gradient-to-b from-neutral-800 to-neutral-900 border border-red-500/50 text-white hover:border-red-500'
                          : isToday
                          ? 'bg-neutral-900 border border-neutral-700 text-red-400'
                          : 'bg-neutral-900/50 hover:bg-neutral-800/60 text-neutral-400'
                      }`}
                    >
                      <span className="text-[9px] sm:text-xs font-mono font-bold leading-none">{dayNum}</span>
                      
                      {hasWorkout && (
                        <div className="flex items-center justify-center">
                          <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isSelected ? 'bg-white' : hasRecovery ? 'bg-emerald-400' : 'bg-red-600 animate-pulse'}`} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sessions List for Selected Period */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-red-500" />
                <span>
                  {timeframe === 'daily' && `${selectedDate.toLocaleDateString()}`}
                  {timeframe === 'weekly' && 'This Week'}
                  {timeframe === 'monthly' && `${monthNames[currentMonth]} ${currentYear}`}
                  {timeframe === 'yearly' && `${currentYear}`}
                </span>
                <span className="px-1.5 py-0.2 bg-neutral-800 text-neutral-300 rounded text-[9px] font-mono">
                  {filteredSessions.length}
                </span>
              </h3>

              {filteredSessions.length === 0 && (
                <button
                  onClick={handleLogActiveRecovery}
                  disabled={recoveryLogging}
                  className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all shrink-0"
                >
                  <Shield className="w-3 h-3" />
                  <span>{recoveryLogging ? 'Logging...' : 'Log Rest Day / Recovery'}</span>
                </button>
              )}
            </div>

            {historyLoading ? (
              <div className="text-center py-6 text-neutral-500 text-[10px]">Loading records...</div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-4 bg-neutral-950/60 border border-neutral-800/80 rounded-xl text-center space-y-2.5">
                <p className="text-[10px] text-neutral-400">No workout-sessions logged for this day.</p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleStartFreestyle()}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg shadow-md inline-flex items-center gap-1 start-repeat-btn"
                  >
                    <Plus className="w-3 h-3" /> Train Today
                  </button>
                  <button
                    onClick={handleLogActiveRecovery}
                    disabled={recoveryLogging}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-emerald-900/60 text-emerald-400 hover:text-white border border-emerald-500/30 text-[10px] font-bold rounded-lg inline-flex items-center gap-1 transition-colors"
                  >
                    <Shield className="w-3 h-3" /> Log Rest & Recovery
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSessions.map((session, sIdx) => {
                  const theme = getMuscleGroupTheme(session.primaryMuscle);

                  return (
                    <div
                      key={session.id || sIdx}
                      className="p-2.5 sm:p-3.5 bg-neutral-950 border border-neutral-800/80 rounded-xl flex items-center justify-between gap-2 hover:border-neutral-700 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${session.isRecovery ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-neutral-900 border border-neutral-800 text-red-500'}`}>
                          {session.isRecovery ? <Shield className="w-4 h-4" /> : <Dumbbell className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wide border ${session.isRecovery ? 'bg-emerald-950/60 border-emerald-600/40 text-emerald-400' : `${theme.bg} ${theme.border} ${theme.text}`}`}>
                              {session.isRecovery ? '🧘 RECOVERY' : `${theme.icon} ${theme.name}`}
                            </span>
                            <span className="text-[9px] text-neutral-400 font-mono truncate">
                              {session.completedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-black text-white truncate mt-0.5">
                            {session.displayName}
                          </h4>
                          <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-neutral-400 font-mono">
                            <span>{session.totalSets} Sets</span>
                            <span>•</span>
                            <span>{session.totalReps} Reps</span>
                            {session.totalVolume > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-red-400">{session.totalVolume} kg</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => navigate(`/workout-details/${session.id}`, { state: { workout: session } })}
                          className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-[10px] sm:text-xs font-bold border border-neutral-800 transition-colors"
                        >
                          View →
                        </button>
                        <button
                          onClick={() => handleRepeatLastWorkout(session)}
                          className="p-1 sm:p-1.5 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors"
                          title="Repeat Session"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================
            13. WORKOUT PLANS PRESETS
           ========================================================= */}
        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 shrink-0" />
              <h2 className="text-xs sm:text-base font-bold text-white">Your Workout Plans</h2>
            </div>
            <button
              onClick={() => navigate('/plans')}
              className="text-[10px] sm:text-xs text-red-400 hover:underline font-semibold"
            >
              Manage Plans →
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4 text-neutral-500 text-[10px]">Loading plans...</div>
          ) : plans.length === 0 ? (
            <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl text-center space-y-1.5 start-workout-card">
              <p className="text-[10px] text-neutral-400">No workout plans created yet</p>
              <button
                onClick={() => navigate('/plans')}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-bold rounded-lg transition-colors inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Create Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              {plans.map((plan) => (
                <div
                  key={plan._id || plan.id}
                  className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between gap-2.5 hover:border-red-500/40 transition-all shadow-sm start-workout-card"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] font-bold text-red-400 uppercase tracking-wider bg-red-500/10 px-1.5 py-0.2 rounded border border-red-500/20">
                      {plan.category || 'Plan'}
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-white mt-1 truncate">{plan.name}</h3>
                    <p className="text-[9px] text-neutral-400 font-mono">
                      {plan.exercises?.length || 0} Exercises
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      localStorage.removeItem(ACTIVE_SESSION_KEY);
                      navigate('/workout-session', { state: { workoutPlan: plan, protocol: selectedProtocol } });
                    }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 transition-colors shadow-sm shrink-0 uppercase tracking-wider start-repeat-btn"
                  >
                    Start <Play className="w-2.5 h-2.5 fill-current shrink-0" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
