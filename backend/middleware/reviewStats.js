// backend/middleware/reviewStats.js
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Workout from '../models/Workout.js';
import Exercise from '../models/Exercise.js';
import Meal from '../models/Meal.js';
import Plan from '../models/Plan.js';

const modelMap = {
  workout: Workout,
  exercise: Exercise,
  meal: Meal,
  plan: Plan
};

export const updateReviewStats = async (targetType, targetId) => {
  try {
    const Model = modelMap[targetType];
    if (!Model) return;

    const stats = await Review.aggregate([
      { $match: { targetType, targetId: new mongoose.Types.ObjectId(targetId) } },
      { 
        $group: { 
          _id: null, 
          averageRating: { $avg: '$rating' }, 
          totalReviews: { $sum: 1 } 
        } 
      }
    ]);

    const reviewStats = stats[0] || { averageRating: 0, totalReviews: 0 };
    
    await Model.findByIdAndUpdate(targetId, {
      reviewStats: {
        averageRating: Math.round(reviewStats.averageRating * 10) / 10,
        totalReviews: reviewStats.totalReviews
      }
    });
  } catch (error) {
    console.error('Error updating review stats:', error);
  }
};

export default updateReviewStats;