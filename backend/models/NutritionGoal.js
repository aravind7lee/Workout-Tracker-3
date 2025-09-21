// backend/models/NutritionGoal.js
import mongoose from 'mongoose';

const NutritionGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  // Daily targets
  dailyCalories: { type: Number, required: true, default: 2000 },
  dailyProtein: { type: Number, required: true, default: 150 },
  dailyCarbs: { type: Number, required: true, default: 200 },
  dailyFat: { type: Number, required: true, default: 65 },
  
  // User goals
  goal: { 
    type: String, 
    enum: ['deficit', 'maintenance', 'bulk', 'recomposition'], 
    default: 'maintenance' 
  },
  
  // User stats for calculation
  weight: { type: Number, default: 70 },
  height: { type: Number, default: 170 },
  age: { type: Number, default: 25 },
  gender: { type: String, enum: ['male', 'female'], default: 'male' },
  activityLevel: { 
    type: String, 
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'], 
    default: 'moderate' 
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model('NutritionGoal', NutritionGoalSchema);