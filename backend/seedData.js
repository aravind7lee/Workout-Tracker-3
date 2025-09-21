// backend/seedData.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exercise from './models/Exercise.js';

dotenv.config();

const sampleExercises = [
  {
    name: "Push-ups",
    category: "Strength",
    muscles: ["Chest", "Shoulders", "Triceps"],
    instructions: "Start in a plank position with hands shoulder-width apart. Lower your body until your chest nearly touches the floor, then push back up.",
    difficulty: "Beginner",
    reviewStats: { averageRating: 4.5, totalReviews: 12 }
  },
  {
    name: "Squats",
    category: "Strength",
    muscles: ["Quadriceps", "Glutes", "Hamstrings"],
    instructions: "Stand with feet shoulder-width apart. Lower your body as if sitting back into a chair, keeping your chest up and knees behind toes.",
    difficulty: "Beginner",
    reviewStats: { averageRating: 4.7, totalReviews: 18 }
  },
  {
    name: "Deadlifts",
    category: "Strength",
    muscles: ["Hamstrings", "Glutes", "Lower Back"],
    instructions: "Stand with feet hip-width apart, barbell over mid-foot. Hinge at hips and knees to grab the bar, then stand up straight.",
    difficulty: "Intermediate",
    reviewStats: { averageRating: 4.8, totalReviews: 25 }
  },
  {
    name: "Plank",
    category: "Core",
    muscles: ["Core", "Shoulders"],
    instructions: "Hold a push-up position with forearms on the ground. Keep your body in a straight line from head to heels.",
    difficulty: "Beginner",
    reviewStats: { averageRating: 4.3, totalReviews: 15 }
  },
  {
    name: "Burpees",
    category: "Cardio",
    muscles: ["Full Body"],
    instructions: "Start standing, drop into a squat, kick feet back into plank, do a push-up, jump feet back to squat, then jump up with arms overhead.",
    difficulty: "Advanced",
    reviewStats: { averageRating: 4.1, totalReviews: 22 }
  },
  {
    name: "Pull-ups",
    category: "Strength",
    muscles: ["Lats", "Biceps", "Rhomboids"],
    instructions: "Hang from a pull-up bar with palms facing away. Pull your body up until your chin clears the bar, then lower with control.",
    difficulty: "Intermediate",
    reviewStats: { averageRating: 4.6, totalReviews: 19 }
  },
  {
    name: "Lunges",
    category: "Strength",
    muscles: ["Quadriceps", "Glutes", "Calves"],
    instructions: "Step forward with one leg, lowering your hips until both knees are bent at 90 degrees. Push back to starting position.",
    difficulty: "Beginner",
    reviewStats: { averageRating: 4.4, totalReviews: 14 }
  },
  {
    name: "Mountain Climbers",
    category: "Cardio",
    muscles: ["Core", "Shoulders", "Legs"],
    instructions: "Start in plank position. Alternate bringing knees to chest in a running motion while maintaining plank form.",
    difficulty: "Intermediate",
    reviewStats: { averageRating: 4.2, totalReviews: 16 }
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
    await Exercise.insertMany(sampleExercises);
    console.log('Sample exercises inserted successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedExercises();