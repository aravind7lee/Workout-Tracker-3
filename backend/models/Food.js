// backend/models/Food.js
import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  serving: {
    type: String,
    required: true
  },
  servingGrams: {
    type: Number,
    default: 100
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  protein: {
    type: Number,
    required: true,
    min: 0
  },
  carbs: {
    type: Number,
    required: true,
    min: 0
  },
  fat: {
    type: Number,
    required: true,
    min: 0
  },
  fiber: {
    type: Number,
    default: 0,
    min: 0
  },
  sugar: {
    type: Number,
    default: 0,
    min: 0
  },
  sodium: {
    type: Number,
    default: 0,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['animal_protein', 'plant_protein', 'carbohydrates', 'vegetables', 'fruits', 'dairy', 'nuts_seeds', 'fats_oils', 'beverages', 'snacks']
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['nutritionix', 'usda', 'manual', 'database'],
    default: 'database'
  },
  tags: [{
    type: String,
    trim: true
  }],
  popularity: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better search performance
foodSchema.index({ name: 'text', tags: 'text' });
foodSchema.index({ category: 1 });
foodSchema.index({ popularity: -1 });
foodSchema.index({ verified: 1 });

// Virtual for nutrition density score
foodSchema.virtual('nutritionScore').get(function() {
  const proteinScore = (this.protein / this.calories) * 100;
  const fiberScore = (this.fiber / this.calories) * 100;
  return Math.round((proteinScore + fiberScore) * 10) / 10;
});

// Method to scale nutrition based on serving size
foodSchema.methods.scaleNutrition = function(multiplier) {
  return {
    name: this.name,
    serving: this.serving,
    calories: Math.round(this.calories * multiplier),
    protein: Math.round(this.protein * multiplier * 10) / 10,
    carbs: Math.round(this.carbs * multiplier * 10) / 10,
    fat: Math.round(this.fat * multiplier * 10) / 10,
    fiber: Math.round(this.fiber * multiplier * 10) / 10,
    sugar: Math.round(this.sugar * multiplier * 10) / 10,
    sodium: Math.round(this.sodium * multiplier * 10) / 10
  };
};

// Static method to search foods
foodSchema.statics.searchFoods = function(query, limit = 10) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  })
  .sort({ popularity: -1, verified: -1 })
  .limit(limit);
};

// Static method to get foods by category
foodSchema.statics.getFoodsByCategory = function(category) {
  return this.find({ category })
    .sort({ popularity: -1, name: 1 });
};

export default mongoose.model('Food', foodSchema);