import express from 'express';
import auth from '../middleware/auth.js';

const router = express.Router();

// Workout Splits Data
const workoutSplitsData = [
  {
    id: 1,
    name: 'Push/Pull/Legs (PPL)',
    category: ['bulking', 'recomp', 'advanced'],
    frequency: '6 days/week',
    difficulty: 'Intermediate-Advanced',
    duration: '60-90 min',
    description: 'Classic 3-day split focusing on movement patterns',
    muscles: {
      'Push Day': 'Chest, Shoulders, Triceps',
      'Pull Day': 'Back, Biceps, Rear Delts',
      'Leg Day': 'Quadriceps, Hamstrings, Glutes, Calves'
    },
    benefits: ['High frequency training', 'Great for muscle growth', 'Balanced development'],
    bestFor: 'Intermediate to advanced lifters looking for muscle growth',
    sampleWorkouts: {
      'Push Day': [
        'Bench Press: 4x6-8',
        'Overhead Press: 3x8-10',
        'Incline Dumbbell Press: 3x10-12',
        'Lateral Raises: 3x12-15',
        'Tricep Dips: 3x10-12',
        'Tricep Pushdowns: 3x12-15'
      ],
      'Pull Day': [
        'Deadlifts: 4x6-8',
        'Pull-ups/Lat Pulldowns: 3x8-10',
        'Barbell Rows: 3x8-10',
        'Face Pulls: 3x12-15',
        'Barbell Curls: 3x10-12',
        'Hammer Curls: 3x12-15'
      ],
      'Leg Day': [
        'Squats: 4x6-8',
        'Romanian Deadlifts: 3x8-10',
        'Bulgarian Split Squats: 3x10-12',
        'Leg Curls: 3x12-15',
        'Calf Raises: 4x15-20',
        'Leg Press: 3x12-15'
      ]
    }
  },
  {
    id: 2,
    name: 'Upper/Lower Split',
    category: ['bulking', 'cutting', 'recomp'],
    frequency: '4 days/week',
    difficulty: 'Beginner-Intermediate',
    duration: '60-75 min',
    description: 'Simple 2-day split alternating upper and lower body',
    muscles: {
      'Upper Day': 'Chest, Back, Shoulders, Arms',
      'Lower Day': 'Legs, Glutes, Calves'
    },
    benefits: ['Good recovery time', 'Simple structure', 'Flexible scheduling'],
    bestFor: 'Beginners to intermediate lifters with limited time',
    sampleWorkouts: {
      'Upper Day': [
        'Bench Press: 4x6-8',
        'Barbell Rows: 4x6-8',
        'Overhead Press: 3x8-10',
        'Pull-ups: 3x8-10',
        'Barbell Curls: 3x10-12',
        'Tricep Extensions: 3x10-12'
      ],
      'Lower Day': [
        'Squats: 4x6-8',
        'Romanian Deadlifts: 3x8-10',
        'Leg Press: 3x10-12',
        'Leg Curls: 3x12-15',
        'Calf Raises: 4x15-20',
        'Glute Bridges: 3x12-15'
      ]
    }
  },
  {
    id: 3,
    name: 'Full Body Split',
    category: ['beginner', 'cutting', 'recomp'],
    frequency: '3 days/week',
    difficulty: 'Beginner-Intermediate',
    duration: '60-90 min',
    description: 'Train all major muscle groups in each session',
    muscles: {
      'Each Session': 'All major muscle groups - Chest, Back, Shoulders, Arms, Legs'
    },
    benefits: ['High frequency', 'Great for beginners', 'Time efficient'],
    bestFor: 'Beginners or those with limited training days',
    sampleWorkouts: {
      'Full Body A': [
        'Squats: 3x8-10',
        'Bench Press: 3x8-10',
        'Barbell Rows: 3x8-10',
        'Overhead Press: 2x10-12',
        'Barbell Curls: 2x10-12',
        'Tricep Extensions: 2x10-12'
      ],
      'Full Body B': [
        'Deadlifts: 3x6-8',
        'Incline Dumbbell Press: 3x8-10',
        'Pull-ups: 3x8-10',
        'Leg Press: 3x10-12',
        'Lateral Raises: 2x12-15',
        'Calf Raises: 3x15-20'
      ]
    }
  }
];

// GET /api/workout-splits - Get all workout splits
router.get('/', (req, res) => {
  try {
    const { category, search } = req.query;
    
    let filteredSplits = workoutSplitsData;
    
    // Filter by category
    if (category && category !== 'all') {
      filteredSplits = filteredSplits.filter(split => 
        split.category.includes(category)
      );
    }
    
    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredSplits = filteredSplits.filter(split =>
        split.name.toLowerCase().includes(searchTerm) ||
        split.description.toLowerCase().includes(searchTerm) ||
        split.bestFor.toLowerCase().includes(searchTerm)
      );
    }
    
    res.json({
      success: true,
      data: filteredSplits,
      total: filteredSplits.length
    });
  } catch (error) {
    console.error('Error fetching workout splits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workout splits'
    });
  }
});

// GET /api/workout-splits/:id - Get specific workout split
router.get('/:id', (req, res) => {
  try {
    const splitId = parseInt(req.params.id);
    const split = workoutSplitsData.find(s => s.id === splitId);
    
    if (!split) {
      return res.status(404).json({
        success: false,
        message: 'Workout split not found'
      });
    }
    
    res.json({
      success: true,
      data: split
    });
  } catch (error) {
    console.error('Error fetching workout split:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workout split'
    });
  }
});

// POST /api/workout-splits/favorite - Add split to user favorites (requires auth)
router.post('/favorite', auth, async (req, res) => {
  try {
    const { splitId } = req.body;
    const userId = req.user.id;
    
    // Here you would typically save to database
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: 'Workout split added to favorites',
      data: { splitId, userId }
    });
  } catch (error) {
    console.error('Error adding favorite split:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add favorite split'
    });
  }
});

// DELETE /api/workout-splits/favorite/:splitId - Remove split from favorites (requires auth)
router.delete('/favorite/:splitId', auth, async (req, res) => {
  try {
    const splitId = parseInt(req.params.splitId);
    const userId = req.user.id;
    
    // Here you would typically remove from database
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: 'Workout split removed from favorites',
      data: { splitId, userId }
    });
  } catch (error) {
    console.error('Error removing favorite split:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove favorite split'
    });
  }
});

// GET /api/workout-splits/categories - Get all available categories
router.get('/meta/categories', (req, res) => {
  try {
    const categories = [
      { id: 'all', name: 'All Splits', description: 'All available workout splits' },
      { id: 'bulking', name: 'Bulking', description: 'Splits optimized for muscle growth and mass gain' },
      { id: 'cutting', name: 'Cutting', description: 'Splits designed for fat loss while preserving muscle' },
      { id: 'recomp', name: 'Body Recomp', description: 'Splits for simultaneous muscle building and fat loss' },
      { id: 'beginner', name: 'Beginner', description: 'Simple splits perfect for those new to training' },
      { id: 'advanced', name: 'Advanced', description: 'Complex splits for experienced lifters' }
    ];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

export default router;