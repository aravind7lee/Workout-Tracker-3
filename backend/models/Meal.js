// backend/models/Meal.js
import mongoose from 'mongoose';

const MealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Original query and parsed data
  rawQuery: { type: String, required: true, trim: true },
  parsedName: { type: String, required: true, trim: true },
  
  // Serving information
  servingText: { type: String, required: true }, // "150 g", "1 cup", "2 pieces"
  servingGrams: { type: Number, required: true }, // actual weight in grams
  multiplier: { type: Number, default: 1 }, // how query relates to standard serving
  
  // Nutrition data (per actual serving consumed)
  calories: { type: Number, required: true },
  protein: { type: Number, required: true }, // grams
  carbs: { type: Number, required: true }, // grams
  fat: { type: Number, required: true }, // grams
  
  // Additional nutrition info
  fiber: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 }, // mg
  
  // Data source and metadata
  source: { 
    type: String, 
    enum: ['nutritionix', 'edamam', 'fallback', 'offline'], 
    default: 'nutritionix' 
  },
  meta: { type: mongoose.Schema.Types.Mixed }, // API response metadata
  
  // Meal timing and categorization
  mealType: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner', 'snack'], 
    default: 'snack' 
  },
  consumedAt: { type: Date, default: Date.now },
  
  // Sync status for offline support
  synced: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'meals'
});

// Indexes for efficient queries
MealSchema.index({ userId: 1, consumedAt: -1 });
MealSchema.index({ userId: 1, mealType: 1 });
MealSchema.index({ 
  userId: 1, 
  consumedAt: 1 
}, {
  partialFilterExpression: { synced: true }
});

// Static method to get daily totals
MealSchema.statics.getDailyTotals = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        consumedAt: { $gte: startOfDay, $lte: endOfDay },
        synced: true
      }
    },
    {
      $group: {
        _id: null,
        calories: { $sum: '$calories' },
        protein: { $sum: '$protein' },
        carbs: { $sum: '$carbs' },
        fat: { $sum: '$fat' },
        fiber: { $sum: '$fiber' },
        sugar: { $sum: '$sugar' },
        sodium: { $sum: '$sodium' },
        mealsCount: { $sum: 1 }
      }
    }
  ]);
  
  return result[0] || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    mealsCount: 0
  };
};

export default mongoose.model('Meal', MealSchema);