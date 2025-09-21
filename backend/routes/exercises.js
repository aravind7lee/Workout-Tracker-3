// backend/routes/exercises.js
import express from 'express';
import Exercise from '../models/Exercise.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// list with advanced search and filtering
router.get('/', async (req, res) => {
  try {
    const { q, category, muscle, difficulty, sort = 'name', page = 1, limit = 20 } = req.query;
    const filter = {};
    
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { instructions: { $regex: q, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;
    if (muscle) filter.muscles = { $in: [muscle] };
    if (difficulty) filter.difficulty = difficulty;
    
    const sortOptions = {
      name: { name: 1 },
      rating: { 'reviewStats.averageRating': -1 },
      reviews: { 'reviewStats.totalReviews': -1 },
      newest: { createdAt: -1 }
    };
    
    const exercises = await Exercise.find(filter)
      .sort(sortOptions[sort] || { name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Exercise.countDocuments(filter);
    
    // Return exercises directly for frontend compatibility
    if (req.query.simple === 'true') {
      return res.json(exercises);
    }
    
    res.json({
      exercises,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get exercise categories and muscles for filtering
router.get('/filters', async (req, res) => {
  try {
    const categories = await Exercise.distinct('category');
    const muscles = await Exercise.distinct('muscles');
    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
    
    res.json({
      categories: categories.filter(Boolean),
      muscles: muscles.flat().filter(Boolean),
      difficulties
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single exercise
router.get('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// create (admin-style)
router.post('/', auth, upload.single('thumbnail'), async (req, res) => {
  const { name, category, muscles, instructions, videoUrl } = req.body;
  const thumbnail = req.file ? req.file.path : undefined;
  const exercise = new Exercise({
    name,
    category,
    muscles: muscles ? muscles.split(',').map(s => s.trim()) : [],
    instructions,
    videoUrl,
    thumbnail
  });
  await exercise.save();
  res.json(exercise);
});

export default router;
