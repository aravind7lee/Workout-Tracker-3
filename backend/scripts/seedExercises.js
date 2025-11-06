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
  },
  {
    name: 'Bayesian Cable Curl',
    category: 'Arms',
    muscles: ['Biceps', 'Forearms'],
    instructions: 'Stand facing away from cable machine with handle behind you. Keep elbow stationary at your side. Curl the cable forward while maintaining constant tension on biceps. Focus on peak contraction.',
    difficulty: 'Intermediate',
    reviewStats: { averageRating: 4.5, totalReviews: 45 }
  },
  {
    name: 'Incline Dumbbell Curl',
    category: 'Arms',
    muscles: ['Biceps', 'Forearms'],
    instructions: 'Sit on incline bench set at 45-60 degrees. Let arms hang straight down with dumbbells. Curl weights up while keeping elbows stationary. Lower with control for full stretch.',
    difficulty: 'Beginner',
    reviewStats: { averageRating: 4.6, totalReviews: 78 }
  },
  {
    name: 'Close Grip Lat Pulldown',
    category: 'Back',
    muscles: ['Latissimus Dorsi', 'Biceps', 'Middle Back'],
    instructions: 'Sit at lat pulldown machine with close grip attachment. Pull bar down to upper chest while keeping torso upright. Squeeze shoulder blades together at bottom. Control the weight back up.',
    difficulty: 'Beginner',
    reviewStats: { averageRating: 4.4, totalReviews: 92 }
  },
  {
    name: 'Rowing Machine',
    category: 'Back',
    muscles: ['Back', 'Legs', 'Core', 'Arms'],
    instructions: 'Sit on rowing machine with feet secured. Push with legs first, then lean back slightly and pull handle to lower chest. Extend arms, lean forward, then bend knees to return. Maintain smooth rhythm.',
    difficulty: 'Beginner',
    reviewStats: { averageRating: 4.7, totalReviews: 156 }
  },
  {
    name: 'Svend Press',
    category: 'Chest',
    muscles: ['Chest', 'Front Deltoids'],
    instructions: 'Hold weight plates together at chest level. Press plates forward while squeezing them together. Return to chest with control.',
    difficulty: 'Beginner',
    reviewStats: { averageRating: 4.2, totalReviews: 34 }
  },
  {
    name: 'Floor Press',
    category: 'Chest',
    muscles: ['Chest', 'Triceps', 'Shoulders'],
    instructions: 'Lie on floor with barbell. Lower bar until elbows touch floor. Press back up explosively.',
    difficulty: 'Intermediate',
    reviewStats: { averageRating: 4.4, totalReviews: 56 }
  },
  {
    name: 'Bradford Press',
    category: 'Shoulders',
    muscles: ['Shoulders', 'Traps'],
    instructions: 'Press barbell from front to behind head and back. Keep weight light and controlled.',
    difficulty: 'Intermediate',
    reviewStats: { averageRating: 4.3, totalReviews: 41 }
  },
  {
    name: 'Seal Rows',
    category: 'Back',
    muscles: ['Latissimus Dorsi', 'Rhomboids', 'Traps'],
    instructions: 'Lie face down on elevated bench. Row dumbbells or barbell to chest. Eliminate momentum.',
    difficulty: 'Intermediate',
    reviewStats: { averageRating: 4.6, totalReviews: 67 }
  },
  {
    name: 'Straight Arm Pulldown',
    category: 'Back',
    muscles: ['Latissimus Dorsi', 'Serratus'],
    instructions: 'Stand at cable machine with straight arms. Pull bar down to thighs keeping arms straight.',
    difficulty: 'Beginner',
    reviewStats: { averageRating: 4.3, totalReviews: 52 }
  },
  {
    name: 'EZ Bar Curls',
    category: 'Arms',
    muscles: ['Biceps', 'Forearms'],
    instructions: 'Hold EZ bar with underhand grip. Curl bar up keeping elbows stationary. Lower with control.',
    difficulty: 'Beginner',
    reviewStats: { averageRating: 4.5, totalReviews: 89 }
  },
  {
    name: 'JM Press',
    category: 'Arms',
    muscles: ['Triceps', 'Chest'],
    instructions: 'Lie on bench with close grip. Lower bar to neck/chin area. Press back up focusing on triceps.',
    difficulty: 'Advanced',
    reviewStats: { averageRating: 4.4, totalReviews: 38 }
  },
  {
    name: 'Box Squats',
    category: 'Legs',
    muscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
    instructions: 'Squat down to box. Pause briefly on box. Explode back up.',
    difficulty: 'Intermediate',
    reviewStats: { averageRating: 4.5, totalReviews: 71 }
  },
  {
    name: 'Hip Thrusts',
    category: 'Legs',
    muscles: ['Glutes', 'Hamstrings'],
    instructions: 'Lean upper back on bench. Place barbell over hips. Thrust hips up squeezing glutes.',
    difficulty: 'Beginner',
    reviewStats: { averageRating: 4.7, totalReviews: 124 }
  },
  {
    name: 'Nordic Curls',
    category: 'Legs',
    muscles: ['Hamstrings', 'Glutes'],
    instructions: 'Kneel with ankles secured. Lower body forward with control. Use hamstrings to pull back up.',
    difficulty: 'Advanced',
    reviewStats: { averageRating: 4.8, totalReviews: 43 }
  },
  {
    name: 'Pallof Press',
    category: 'Core',
    muscles: ['Core', 'Obliques'],
    instructions: 'Stand sideways to cable. Press handle straight out resisting rotation. Return with control.',
    difficulty: 'Intermediate',
    reviewStats: { averageRating: 4.6, totalReviews: 58 }
  },
  {
    name: 'Landmine Rotation',
    category: 'Core',
    muscles: ['Obliques', 'Core', 'Shoulders'],
    instructions: 'Hold end of barbell. Rotate from side to side keeping core tight.',
    difficulty: 'Intermediate',
    reviewStats: { averageRating: 4.4, totalReviews: 49 }
  },
  {
    name: 'L-Sit Hold',
    category: 'Core',
    muscles: ['Core', 'Hip Flexors', 'Shoulders'],
    instructions: 'Support body on parallel bars or floor. Lift legs to 90 degrees. Hold position.',
    difficulty: 'Advanced',
    reviewStats: { averageRating: 4.7, totalReviews: 36 }
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