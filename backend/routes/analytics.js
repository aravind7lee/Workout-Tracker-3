import express from 'express';

const router = express.Router();

// Get user stats
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalWorkouts: 24,
      totalMeals: 156,
      currentStreak: 7,
      xpPoints: 1250,
      joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastActive: new Date()
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get calorie trends (last 7 days)
router.get('/calories', async (req, res) => {
  try {
    const calorieData = [
      { date: '2024-01-15', calories: 2200, day: 'Mon' },
      { date: '2024-01-16', calories: 2100, day: 'Tue' },
      { date: '2024-01-17', calories: 2350, day: 'Wed' },
      { date: '2024-01-18', calories: 2000, day: 'Thu' },
      { date: '2024-01-19', calories: 2400, day: 'Fri' },
      { date: '2024-01-20', calories: 2600, day: 'Sat' },
      { date: '2024-01-21', calories: 2300, day: 'Sun' }
    ];

    res.json({ success: true, data: calorieData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get workout frequency
router.get('/frequency', async (req, res) => {
  try {
    const frequencyData = [
      { day: 'Mon', workouts: 2 },
      { day: 'Tue', workouts: 1 },
      { day: 'Wed', workouts: 3 },
      { day: 'Thu', workouts: 1 },
      { day: 'Fri', workouts: 2 },
      { day: 'Sat', workouts: 4 },
      { day: 'Sun', workouts: 1 }
    ];

    res.json({ success: true, data: frequencyData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get muscle group distribution
router.get('/muscles', async (req, res) => {
  try {
    const muscleData = [
      { muscle: 'Chest', percentage: 25, color: '#3B82F6' },
      { muscle: 'Back', percentage: 20, color: '#10B981' },
      { muscle: 'Legs', percentage: 30, color: '#F59E0B' },
      { muscle: 'Arms', percentage: 15, color: '#EF4444' },
      { muscle: 'Shoulders', percentage: 10, color: '#8B5CF6' }
    ];

    res.json({ success: true, data: muscleData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get achievements
router.get('/achievements', async (req, res) => {
  try {
    const achievements = [
      {
        id: 1,
        title: 'First Workout',
        description: 'Complete your first workout',
        icon: '🏋️',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        title: 'Nutrition Tracker',
        description: 'Log your first meal',
        icon: '🍎',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 3,
        title: 'Week Warrior',
        description: 'Work out 5 times in a week',
        icon: '🔥',
        unlocked: false,
        progress: 3,
        target: 5
      },
      {
        id: 4,
        title: 'Consistency King',
        description: 'Maintain a 30-day streak',
        icon: '👑',
        unlocked: false,
        progress: 7,
        target: 30
      }
    ];

    res.json({ success: true, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;