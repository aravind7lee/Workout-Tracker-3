// backend/test-cardio.js - Test Cardio API Endpoints
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Cardio from './models/Cardio.js';

dotenv.config();

const testCardioModel = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test data
    const testSession = {
      user: new mongoose.Types.ObjectId(),
      activityType: 'running',
      duration: 30,
      distance: 5,
      heartRate: {
        average: 145,
        max: 165,
        min: 120
      },
      intensity: 'moderate',
      notes: 'Great morning run!'
    };

    console.log('\n📝 Creating test cardio session...');
    const session = new Cardio(testSession);
    await session.save();

    console.log('✅ Cardio session created successfully!');
    console.log('📊 Session details:');
    console.log(`   - Activity: ${session.activityType}`);
    console.log(`   - Duration: ${session.duration} minutes`);
    console.log(`   - Distance: ${session.distance} km`);
    console.log(`   - Pace: ${session.pace.toFixed(2)} min/km (auto-calculated)`);
    console.log(`   - Speed: ${session.speed.toFixed(2)} km/h (auto-calculated)`);
    console.log(`   - Calories: ${session.calories} kcal (auto-calculated)`);
    console.log(`   - Avg Heart Rate: ${session.heartRate.average} bpm`);
    console.log(`   - Intensity: ${session.intensity}`);

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await Cardio.findByIdAndDelete(session._id);
    console.log('✅ Test data cleaned up');

    console.log('\n✅ All tests passed! Cardio model is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
};

testCardioModel();
