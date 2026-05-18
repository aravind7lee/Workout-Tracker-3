const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const SetSchema = new mongoose.Schema({
  reps: Number,
  weight: Number,
  rest: Number
});

const ExerciseLogSchema = new mongoose.Schema({
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
  exerciseName: String,
  sets: [SetSchema],
  notes: String
});

const WorkoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  title: String,
  exercises: [ExerciseLogSchema],
  durationMinutes: Number,
  calories: Number,
  isPublic: { type: Boolean, default: false },
  reviewStats: {
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

const Workout = mongoose.model('Workout', WorkoutSchema);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log("Connected to MongoDB");
    
    try {
        const workoutData = {
          user: new mongoose.Types.ObjectId(), // fake user
          title: "My test workout fixed",
          exercises: [{
            exerciseName: "Bench Press", // Passing name instead of ID
            sets: [{
              reps: 10,
              weight: 50,
              rest: 60
            }],
            notes: ""
          }],
          durationMinutes: 10,
          calories: 100,
          date: new Date(),
          isPublic: false
        };
        
        const workout = new Workout(workoutData);
        await workout.save();
        console.log("Saved successfully! ID:", workout._id);
        
        // Let's delete it so we don't pollute the DB
        await Workout.deleteOne({ _id: workout._id });
        console.log("Test workout deleted.");
    } catch(err) {
        console.log("Error caught:");
        console.log(err.message);
    }
    
    mongoose.disconnect();
}).catch(err => {
    console.error("Connection error:", err);
});
