// backend/routes/plans.js
import express from 'express';
import Plan from '../models/Plan.js';
import Workout from '../models/Workout.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all user plans with real-time stats
router.get('/', auth, async (req, res) => {
  try {
    const plans = await Plan.find({ user: req.user._id })
      .populate('days.exercises')
      .sort({ updatedAt: -1 });
    
    // Add real-time workout stats for each plan
    const plansWithStats = await Promise.all(plans.map(async (plan) => {
      const workoutCount = await Workout.countDocuments({
        user: req.user._id,
        'exercises.exercise': { $in: plan.exercises.map(e => e._id) }
      });
      
      const lastWorkout = await Workout.findOne({
        user: req.user._id,
        'exercises.exercise': { $in: plan.exercises.map(e => e._id) }
      }).sort({ createdAt: -1 });
      
      return {
        ...plan.toObject(),
        stats: {
          ...plan.stats,
          totalWorkouts: workoutCount,
          lastUsed: lastWorkout?.createdAt
        }
      };
    }));
    
    res.json({ success: true, plans: plansWithStats });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch plans' });
  }
});

// Get single plan by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const plan = await Plan.findOne({ _id: req.params.id, user: req.user._id })
      .populate('days.exercises');
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    
    res.json({ success: true, plan });
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch plan' });
  }
});

// Create new plan with real-time features
router.post('/', auth, async (req, res) => {
  try {
    const planData = {
      ...req.body,
      user: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Real-time sync data
      syncStatus: {
        synced: true,
        lastSynced: new Date(),
        syncVersion: 1
      },
      
      // Enhanced metadata
      metadata: {
        difficulty: req.body.difficulty || 'intermediate',
        createdBy: req.user.name || 'User',
        version: '1.0',
        ...req.body.metadata
      },
      
      // Initialize performance tracking
      performance: {
        progressNotes: []
      },
      
      // Initialize engagement
      engagement: {
        views: 0,
        shares: 0,
        likes: 0,
        comments: []
      }
    };
    
    const plan = new Plan(planData);
    await plan.save();
    
    // Emit real-time event
    if (global.io) {
      global.io.to(`user_${req.user._id}`).emit('planCreated', {
        plan: plan,
        timestamp: new Date().toISOString()
      });
    }
    
    // Log activity
    console.log(`✅ Plan created: "${plan.name}" by ${req.user.name || req.user.email}`);
    
    res.status(201).json({ 
      success: true, 
      plan,
      message: 'Plan created successfully with real-time sync'
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update plan
router.put('/:id', auth, async (req, res) => {
  try {
    const plan = await Plan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    
    res.json({ success: true, plan });
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ success: false, message: 'Failed to update plan' });
  }
});

// Delete plan
router.delete('/:id', auth, async (req, res) => {
  try {
    const plan = await Plan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ success: false, message: 'Failed to delete plan' });
  }
});

// Duplicate plan
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalPlan = await Plan.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!originalPlan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    
    const duplicatedPlan = new Plan({
      ...originalPlan.toObject(),
      _id: undefined,
      name: `${originalPlan.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalWorkouts: 0,
        averageRating: 0,
        totalRatings: 0
      }
    });
    
    await duplicatedPlan.save();
    
    res.status(201).json({ success: true, plan: duplicatedPlan });
  } catch (error) {
    console.error('Error duplicating plan:', error);
    res.status(500).json({ success: false, message: 'Failed to duplicate plan' });
  }
});

// Update plan stats (called when workout is completed)
router.post('/:id/stats', auth, async (req, res) => {
  try {
    const { rating } = req.body;
    
    const plan = await Plan.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    
    // Update workout count
    plan.stats.totalWorkouts += 1;
    plan.stats.lastUsed = new Date();
    
    // Update rating if provided
    if (rating && rating >= 1 && rating <= 5) {
      const currentTotal = plan.stats.averageRating * plan.stats.totalRatings;
      plan.stats.totalRatings += 1;
      plan.stats.averageRating = (currentTotal + rating) / plan.stats.totalRatings;
    }
    
    await plan.save();
    
    res.json({ success: true, plan });
  } catch (error) {
    console.error('Error updating plan stats:', error);
    res.status(500).json({ success: false, message: 'Failed to update plan stats' });
  }
});

// Get user's real-time plan analytics
router.get('/analytics/overview', auth, async (req, res) => {
  try {
    // Simple count-based analytics to avoid aggregation issues
    const totalPlans = await Plan.countDocuments({ user: req.user._id });
    
    // Get basic stats without complex aggregation
    const plans = await Plan.find({ user: req.user._id }).select('stats category syncStatus');
    
    let totalWorkouts = 0;
    let totalTime = 0;
    let totalRatings = 0;
    let ratingSum = 0;
    let syncedPlans = 0;
    const categories = new Set();
    let lastSync = null;
    
    plans.forEach(plan => {
      totalWorkouts += plan.stats?.totalWorkouts || 0;
      totalTime += plan.stats?.totalTime || 0;
      
      if (plan.stats?.averageRating && plan.stats?.totalRatings) {
        ratingSum += plan.stats.averageRating * plan.stats.totalRatings;
        totalRatings += plan.stats.totalRatings;
      }
      
      if (plan.category) categories.add(plan.category);
      
      if (plan.syncStatus?.synced) syncedPlans++;
      
      if (plan.syncStatus?.lastSynced && (!lastSync || plan.syncStatus.lastSynced > lastSync)) {
        lastSync = plan.syncStatus.lastSynced;
      }
    });
    
    const averageRating = totalRatings > 0 ? ratingSum / totalRatings : 0;
    
    const mostUsedPlan = await Plan.findOne({ user: req.user._id })
      .sort({ 'stats.totalWorkouts': -1 })
      .select('name stats');
    
    const recentPlans = await Plan.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('name updatedAt stats');
    
    res.json({
      success: true,
      analytics: {
        totalPlans,
        totalWorkouts,
        totalTime,
        averageRating,
        categories: Array.from(categories),
        mostUsedPlan,
        recentPlans,
        
        // Real-time sync info
        sync: {
          totalPlans,
          syncedPlans,
          unsyncedPlans: totalPlans - syncedPlans,
          lastSync,
          syncPercentage: totalPlans > 0 ? Math.round((syncedPlans / totalPlans) * 100) : 100
        },
        
        // Real-time timestamp
        timestamp: new Date().toISOString(),
        isRealTime: true
      }
    });
  } catch (error) {
    console.error('Error fetching plan analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics',
      analytics: {
        totalPlans: 0,
        totalWorkouts: 0,
        totalTime: 0,
        averageRating: 0,
        categories: [],
        mostUsedPlan: null,
        recentPlans: [],
        sync: {
          totalPlans: 0,
          syncedPlans: 0,
          unsyncedPlans: 0,
          lastSync: null,
          syncPercentage: 100
        },
        timestamp: new Date().toISOString(),
        isRealTime: false
      }
    });
  }
});

// Real-time sync status endpoint
router.get('/sync/status', auth, async (req, res) => {
  try {
    const plans = await Plan.find({ user: req.user._id }).select('syncStatus');
    
    let totalPlans = plans.length;
    let syncedPlans = 0;
    let lastSync = null;
    let totalSyncVersion = 0;
    
    plans.forEach(plan => {
      if (plan.syncStatus?.synced) syncedPlans++;
      
      if (plan.syncStatus?.lastSynced && (!lastSync || plan.syncStatus.lastSynced > lastSync)) {
        lastSync = plan.syncStatus.lastSynced;
      }
      
      totalSyncVersion += plan.syncStatus?.syncVersion || 1;
    });
    
    res.json({
      success: true,
      data: {
        totalPlans,
        syncedPlans,
        unsyncedPlans: totalPlans - syncedPlans,
        syncPercentage: totalPlans > 0 ? Math.round((syncedPlans / totalPlans) * 100) : 100,
        lastSync,
        averageSyncVersion: totalPlans > 0 ? totalSyncVersion / totalPlans : 1,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching sync status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch sync status',
      data: {
        totalPlans: 0,
        syncedPlans: 0,
        unsyncedPlans: 0,
        syncPercentage: 100,
        lastSync: null,
        averageSyncVersion: 1,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Force sync all plans
router.post('/sync/force', auth, async (req, res) => {
  try {
    const plans = await Plan.find({ user: req.user._id });
    
    const updatePromises = plans.map(plan => {
      plan.syncStatus.synced = true;
      plan.syncStatus.lastSynced = new Date();
      plan.syncStatus.syncVersion += 1;
      return plan.save();
    });
    
    await Promise.all(updatePromises);
    
    // Emit real-time event
    if (global.io) {
      global.io.to(`user_${req.user._id}`).emit('plansForceSync', {
        count: plans.length,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: `Force synced ${plans.length} plans`,
      syncedCount: plans.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error force syncing plans:', error);
    res.status(500).json({ success: false, message: 'Failed to force sync plans' });
  }
});

// Real-time plan engagement tracking
router.post('/:id/engage/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ['views', 'shares', 'likes'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid engagement type' });
    }
    
    const plan = await Plan.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    
    await plan.incrementEngagement(type);
    
    // Emit real-time event
    if (global.io) {
      global.io.to(`user_${req.user._id}`).emit('planEngagement', {
        planId: plan._id,
        type,
        newValue: plan.engagement[type],
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({ success: true, engagement: plan.engagement });
  } catch (error) {
    console.error('Error tracking engagement:', error);
    res.status(500).json({ success: false, message: 'Failed to track engagement' });
  }
});

// Real-time plan progress tracking
router.post('/:id/progress', auth, async (req, res) => {
  try {
    const { note, metrics } = req.body;
    
    const plan = await Plan.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    
    await plan.addProgressNote(note, metrics);
    
    // Emit real-time event
    if (global.io) {
      global.io.to(`user_${req.user._id}`).emit('planProgress', {
        planId: plan._id,
        note,
        metrics,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({ 
      success: true, 
      progressNotes: plan.performance.progressNotes,
      message: 'Progress note added successfully'
    });
  } catch (error) {
    console.error('Error adding progress note:', error);
    res.status(500).json({ success: false, message: 'Failed to add progress note' });
  }
});

// Get popular plans (public)
router.get('/public/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const plans = await Plan.getPopularPlans(limit);
    
    res.json({
      success: true,
      plans,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching popular plans:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch popular plans' });
  }
});

export default router;
