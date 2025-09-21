import mongoose from 'mongoose';

const MealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: 'serving' },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], default: 'snack' },
  consumedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'meals'
});

MealSchema.index({ userId: 1, consumedAt: -1 });

export default mongoose.model('Meal', MealSchema);