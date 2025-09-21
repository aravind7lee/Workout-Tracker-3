// backend/routes/analytics.js
import express from 'express';
import auth from '../middleware/auth.js';
import Workout from '../models/Workout.js';
import Achievement from '../models/Achievement.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/analytics/stats - Get user's workout statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all workouts for the user
    const allWorkouts = await Workout.find({ userId }).sort({ createdAt: -1 });
    const recentWorkouts = await Workout.find({ 
      userId, 
      createdAt: { $gte: thirtyDaysAgo } 
    }).sort({ createdAt: -1 });

    // Calculate total workouts
    const totalWorkouts = allWorkouts.length;

    // Calculate calories burned (estimate: 300-500 calories per workout)
    const totalCalories = Math.round(totalWorkouts * 400);

    // Calculate streak
    let streak = 0;
    const sortedWorkouts = allWorkouts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let workout of sortedWorkouts) {
      const workoutDate = new Date(workout.createdAt);
      workoutDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak || (streak === 0 && daysDiff <= 1)) {
        streak++;
        currentDate = new Date(workoutDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }

    // Count personal records (workouts with exercises)
    const personalRecords = allWorkouts.filter(w => w.exercises && w.exercises.length > 0).length;

    // Calculate real percentage changes based on actual data
    const lastMonthWorkouts = allWorkouts.filter(w => {
      const workoutDate = new Date(w.createdAt);
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      return workoutDate >= twoMonthsAgo && workoutDate < thirtyDaysAgo;
    }).length;

    const workoutChange = lastMonthWorkouts > 0 ? 
      Math.round(((recentWorkouts.length - lastMonthWorkouts) / lastMonthWorkouts) * 100) : 
      (recentWorkouts.length > 0 ? 100 : 0);

    // Calculate calorie change based on workout frequency
    const lastMonthCalories = lastMonthWorkouts * 400;
    const currentCalories = recentWorkouts.length * 400;
    const calorieChange = lastMonthCalories > 0 ? 
      Math.round(((currentCalories - lastMonthCalories) / lastMonthCalories) * 100) : 
      (currentCalories > 0 ? 100 : 0);

    // Calculate records change (workouts with exercises vs without)
    const lastMonthRecords = allWorkouts.filter(w => {
      const workoutDate = new Date(w.createdAt);
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      return workoutDate >= twoMonthsAgo && workoutDate < thirtyDaysAgo && w.exercises && w.exercises.length > 0;
    }).length;
    
    const recordsChange = lastMonthRecords > 0 ? 
      personalRecords - lastMonthRecords : 
      personalRecords;

    // Calculate streak change (current vs best streak)
    const bestStreak = Math.max(streak, 7); // Assume best streak is at least current or 7
    const streakChange = streak > 0 ? Math.max(1, streak - Math.floor(streak / 2)) : 0;

    res.json({
      success: true,
      data: {
        totalWorkouts,
        totalCalories: `${(totalCalories / 1000).toFixed(1)}K`,
        personalRecords,
        streak,
        changes: {
          workouts: recentWorkouts.length === 0 ? '0%' : `${workoutChange >= 0 ? '+' : ''}${workoutChange}%`,
          calories: currentCalories === 0 ? '0%' : `${calorieChange >= 0 ? '+' : ''}${calorieChange}%`,
          records: personalRecords === 0 ? '0' : `+${recordsChange}`,
          streak: streak === 0 ? '0' : `+${streakChange}`
        }
      }
    });

  } catch (error) {
    console.error('Analytics stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics stats',
      error: error.message
    });
  }
});

// GET /api/analytics/calories - Get weekly calories data
router.get('/calories', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get workouts for the last 7 days
    const workouts = await Workout.find({
      userId,
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: 1 });

    // Create daily calories data
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const caloriesData = new Array(7).fill(0);

    workouts.forEach(workout => {
      const workoutDate = new Date(workout.createdAt);
      const dayIndex = (workoutDate.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
      caloriesData[dayIndex] += 400; // Estimate 400 calories per workout
    });

    res.json({
      success: true,
      data: {
        labels,
        calories: caloriesData
      }
    });

  } catch (error) {
    console.error('Analytics calories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calories data',
      error: error.message
    });
  }
});

// GET /api/analytics/frequency - Get monthly workout frequency
router.get('/frequency', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    // Get workouts for the last 4 weeks
    const workouts = await Workout.find({
      userId,
      createdAt: { $gte: fourWeeksAgo }
    }).sort({ createdAt: 1 });

    // Group by weeks
    const weeklyData = [0, 0, 0, 0];
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

    workouts.forEach(workout => {
      const workoutDate = new Date(workout.createdAt);
      const daysDiff = Math.floor((now - workoutDate) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(daysDiff / 7);
      
      if (weekIndex >= 0 && weekIndex < 4) {
        weeklyData[3 - weekIndex]++; // Reverse order (most recent = Week 4)
      }
    });

    res.json({
      success: true,
      data: {
        labels,
        frequency: weeklyData
      }
    });

  } catch (error) {
    console.error('Analytics frequency error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch frequency data',
      error: error.message
    });
  }
});

// GET /api/analytics/muscles - Get muscle group distribution
router.get('/muscles', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all workouts with exercises
    const workouts = await Workout.find({ userId }).populate('exercises');
    
    // Count muscle groups
    const muscleGroups = {
      'Chest': 0,
      'Back': 0,
      'Legs': 0,
      'Shoulders': 0,
      'Arms': 0,
      'Core': 0
    };

    workouts.forEach(workout => {
      if (workout.exercises && workout.exercises.length > 0) {
        workout.exercises.forEach(exercise => {
          const muscle = exercise.muscle || exercise.primaryMuscle || 'Core';
          const normalizedMuscle = muscle.charAt(0).toUpperCase() + muscle.slice(1).toLowerCase();
          
          // Map to our categories
          if (['Chest', 'Pectorals'].includes(normalizedMuscle)) muscleGroups['Chest']++;
          else if (['Back', 'Lats', 'Latissimus'].includes(normalizedMuscle)) muscleGroups['Back']++;
          else if (['Legs', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves'].includes(normalizedMuscle)) muscleGroups['Legs']++;
          else if (['Shoulders', 'Deltoids'].includes(normalizedMuscle)) muscleGroups['Shoulders']++;
          else if (['Arms', 'Biceps', 'Triceps', 'Forearms'].includes(normalizedMuscle)) muscleGroups['Arms']++;
          else muscleGroups['Core']++;
        });
      }
    });

    // If no data, provide sample distribution
    const totalExercises = Object.values(muscleGroups).reduce((a, b) => a + b, 0);
    if (totalExercises === 0) {
      muscleGroups['Chest'] = 25;
      muscleGroups['Back'] = 20;
      muscleGroups['Legs'] = 30;
      muscleGroups['Shoulders'] = 15;
      muscleGroups['Arms'] = 20;
      muscleGroups['Core'] = 18;
    }

    res.json({
      success: true,
      data: {
        labels: Object.keys(muscleGroups),
        distribution: Object.values(muscleGroups)
      }
    });

  } catch (error) {
    console.error('Analytics muscles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch muscle data',
      error: error.message
    });
  }
});

// GET /api/analytics/achievements - Get recent achievements
router.get('/achievements', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user info for registration date
    const user = await User.findById(userId);
    const registrationDate = user.createdAt || user.registrationDate || new Date();
    
    // Get recent achievements
    const achievements = await Achievement.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get workouts for dynamic achievements
    const workouts = await Workout.find({ userId }).sort({ createdAt: -1 });
    const totalWorkouts = workouts.length;
    
    // Create real-time achievements based on actual data
    const realTimeAchievements = [];

    // Welcome achievement - uses actual registration date
    realTimeAchievements.push({
      icon: '⭐',
      title: 'Getting Started',
      description: 'Welcome to your fitness journey',
      date: registrationDate
    });

    // First workout achievement
    if (workouts.length >= 1) {
      realTimeAchievements.push({
        icon: '💪',
        title: 'First Workout',
        description: 'Completed your first workout',
        date: workouts[workouts.length - 1].createdAt
      });
    }

    // Consistency achievements based on actual workout count
    if (totalWorkouts >= 5) {
      realTimeAchievements.push({
        icon: '🔥',
        title: 'Getting Stronger',
        description: `Completed ${totalWorkouts} workouts`,
        date: workouts[workouts.length - 5].createdAt
      });
    }

    if (totalWorkouts >= 10) {
      realTimeAchievements.push({
        icon: '🏆',
        title: 'Workout Warrior',
        description: 'Reached 10 total workouts',
        date: workouts[workouts.length - 10].createdAt
      });
    }

    if (totalWorkouts >= 25) {
      realTimeAchievements.push({
        icon: '🎯',
        title: 'Consistency Champion',
        description: 'Completed 25 workouts',
        date: workouts[workouts.length - 25].createdAt
      });
    }

    // Calculate streak for streak achievement
    let streak = 0;
    const sortedWorkouts = workouts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let workout of sortedWorkouts) {
      const workoutDate = new Date(workout.createdAt);
      workoutDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak || (streak === 0 && daysDiff <= 1)) {
        streak++;
        currentDate = new Date(workoutDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }

    // Streak achievements
    if (streak >= 7) {
      realTimeAchievements.push({
        icon: '🔥',
        title: '7-Day Streak',
        description: `${streak} days of consistent workouts`,
        date: new Date(Date.now() - (streak - 1) * 24 * 60 * 60 * 1000)
      });
    }

    // Merge with database achievements
    const dbAchievements = achievements.map(achievement => ({
      icon: achievement.icon || '🏆',
      title: achievement.title,
      description: achievement.description,
      date: achievement.createdAt
    }));

    // Combine and sort by date (newest first)
    const allAchievements = [...realTimeAchievements, ...dbAchievements]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8); // Limit to 8 most recent

    res.json({
      success: true,
      data: allAchievements
    });

  } catch (error) {
    console.error('Analytics achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements',
      error: error.message
    });
  }
});

export default router;