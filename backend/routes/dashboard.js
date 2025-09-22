import express from 'express';

const router = express.Router();

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalUsers: 1247,
      activeUsers: 89,
      recentUsers: 23,
      usersWithImages: 456,
      totalWorkouts: 3421,
      totalMeals: 8934,
      avgWorkoutsPerUser: 2.7,
      timestamp: new Date()
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

// Get recent activity
router.get('/activity', async (req, res) => {
  try {
    const activities = [
      {
        id: 1,
        user: 'John Doe',
        action: 'completed workout',
        details: 'Push Day - 45 minutes',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        type: 'workout'
      },
      {
        id: 2,
        user: 'Sarah Smith',
        action: 'logged meal',
        details: 'Protein Shake - 250 calories',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        type: 'nutrition'
      },
      {
        id: 3,
        user: 'Mike Johnson',
        action: 'achieved milestone',
        details: '7-day streak',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: 'achievement'
      }
    ];

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Dashboard activity error:', error);
    res.status(500).json({ message: 'Error fetching dashboard activity' });
  }
});

export default router;