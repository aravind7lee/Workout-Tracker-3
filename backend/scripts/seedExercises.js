// backend/scripts/seedExercises.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exercise from '../models/Exercise.js';

dotenv.config();

const sampleExercises = [
  {
    name: 'Push-ups',
    category: 'Chest',
    muscles: ['Chest', 'Shoulders', 'Triceps', 'Core'],
    instructions: 'Start in a plank position with hands slightly wider than shoulders. Lower your body until chest nearly touches the floor. Push back up to starting position. Keep your core tight throughout the movement.',
    difficulty: 'Beginner',
    reviewStats: { averageRating: 4.5, totalReviews: 120 }
  },
  {
    name: 'Chest Press',
    category: 'Chest',
    muscles: ['Chest', 'Shoulders', 'Triceps'],
    instructions: 'Lie on a bench with dumbbells in each hand. Start with arms extended above chest. Lower weights to chest level. Press back up to starting position.',
    difficulty: 'Intermediate',
    reviewStats: { averageRating: 4.3, totalReviews: 85 }
  },
  {
    name: 'Chest Fly',
    category: 'Chest',
    muscles: ['Chest', 'Front Deltoids'],
    instructions: 'Lie on a bench with dumbbells in each hand. Start with arms extended above chest. Lower weights in a wide arc until you feel a stretch. Bring weights back together above chest.',
    difficulty: 'Intermediate',
    reviewStats: { averageRating: 4.2, totalReviews: 67 }
  },
  {
    name: 'Squats',
    category: 'Legs',
    muscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
    instructions: 'Stand with feet shoulder-width apart. Lower body by bending knees and hips. Keep chest up and knees behind toes. Return to standing position.',
    difficulty: 'Beginner',
    reviewStats: { averageRating: 4.7, totalReviews: 200 }
  },
  {
    name: 'Deadlifts',
    category: 'Back',
    muscles: ['Hamstrings', 'Glutes', 'Lower Back', 'Traps'],
    instructions: 'Stand with feet hip-width apart, barbell over mid-foot. Bend at hips and knees to grip bar. Keep back straight, lift by extending hips and knees.',
    difficulty: 'Advanced',
    reviewStats: { averageRating: 4.8, totalReviews: 156 }
  },
  {
    name: 'Pull-ups',
    category: 'Back',
    muscles: ['Latissimus Dorsi', 'Biceps', 'Rhomboids'],
    instructions: 'Hang from pull-up bar with overhand grip. Pull body up until chin clears bar. Lower with control to full arm extension.',
    difficulty: 'Intermediate',
    reviewStats: { averageRating: 4.5, totalReviews: 134 }
  },
  {
    name: 'Bench Press',
    category: 'Chest',
    muscles: ['Chest', 'Shoulders', 'Triceps'],
    instructions: 'Lie on bench with feet flat on floor. Grip barbell slightly wider than shoulders. Lower bar to chest. Press up to full arm extension.',
    difficulty: 'Intermediate',
    reviewStats: { averageRating: 4.6, totalReviews: 178 }
  },
  {
    name: 'Shoulder Press',
    category: 'Shoulders',
    muscles: ['Shoulders', 'Triceps', 'Upper Chest'],
    instructions: 'Stand or sit with dumbbells at shoulder level. Press weights overhead until arms are fully extended. Lower with control back to starting position.',
    difficulty: 'Beginner',
    reviewStats: { averageRating: 4.3, totalReviews: 98 }
  },
  {
    name: 'Bicep Curls',
    category: 'Arms',
    muscles: ['Biceps', 'Forearms'],
    instructions: 'Stand with dumbbells at sides. Keep elbows close to body. Curl weights up by flexing biceps. Lower with control.',
    difficulty: 'Beginner',
    reviewStats: { averageRating: 4.1, totalReviews: 145 }
  },
  {
    name: 'Tricep Dips',
    category: 'Arms',
    muscles: ['Triceps', 'Shoulders', 'Chest'],
    instructions: 'Sit on edge of bench with hands beside hips. Lower body by bending elbows. Push back up to starting position.',
    difficulty: 'Intermediate',
    reviewStats: { averageRating: 4.4, totalReviews: 87 }
  },
  {
    name: 'Lunges',
    category: 'Legs',
    muscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Calves'],
    instructions: 'Step forward with one leg. Lower hips until both knees are bent at 90 degrees. Push back to starting position. Alternate legs.',
    difficulty: 'Beginner',
    reviewStats: { averageRating: 4.5, totalReviews: 112 }
  },
  {
    name: 'Plank',
    category: 'Core',
    muscles: ['Core', 'Shoulders', 'Glutes'],
    instructions: 'Start in push-up position. Hold body in straight line from head to heels. Keep core tight and breathe normally.',
    difficulty: 'Beginner',
    reviewStats: { averageRating: 4.6, totalReviews: 167 }
  },
  {
    name: 'Mountain Climbers',
    category: 'Cardio',
    muscles: ['Core', 'Shoulders', 'Legs'],
    instructions: 'Start in plank position. Alternate bringing knees to chest in running motion. Keep hips level and core engaged.',
    difficulty: 'Intermediate',
    reviewStats: { averageRating: 4.2, totalReviews: 89 }
  },
  {
    name: 'Burpees',
    category: 'Cardio',
    muscles: ['Full Body'],
    instructions: 'Start standing. Drop to squat, jump back to plank. Do push-up. Jump feet to squat. Jump up with arms overhead.',
    difficulty: 'Advanced',
    reviewStats: { averageRating: 4.0, totalReviews: 76 }
  },
  {
    name: 'Russian Twists',
    category: 'Core',
    muscles: ['Obliques', 'Core', 'Hip Flexors'],
    instructions: 'Sit with knees bent, lean back slightly. Lift feet off ground. Rotate torso left and right, touching ground beside hips.',
    difficulty: 'Intermediate',
    reviewStats: { averageRating: 4.3, totalReviews: 95 }
  },
  {
    name: 'Jumping Jacks',
    category: 'Cardio',
    muscles: ['Full Body', 'Calves', 'Shoulders'],
    instructions: 'Start with feet together, arms at sides. Jump feet apart while raising arms overhead. Jump back to starting position.',
    difficulty: 'Beginner',
    reviewStats: { averageRating: 4.1, totalReviews: 123 }
  }
];

async function seedExercises() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing exercises
    await Exercise.deleteMany({});
    console.log('Cleared existing exercises');
    
    // Insert sample exercises
    const exercises = await Exercise.insertMany(sampleExercises);
    console.log(`Inserted ${exercises.length} exercises`);
    
    console.log('Exercise seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding exercises:', error);
    process.exit(1);
  }
}

seedExercises();