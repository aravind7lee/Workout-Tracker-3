import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Workout from '../models/Workout.js';
import Plan from '../models/Plan.js';
import Meal from '../models/Meal.js';
import FitnessIntelligenceService from '../services/fitnessIntelligenceService.js';

dotenv.config();

async function runProductionSmokeTest() {
  console.log('🚀 Starting GrindX Production Readiness & Smoke Test Suite...');
  let testsPassed = 0;
  let testsFailed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      testsFailed++;
    }
  };

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI missing from environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Atlas connected for test suite');

    // 1. Test User Token Generation & Auth Payload Structure
    const dummyUserId = new mongoose.Types.ObjectId();
    const testSecret = process.env.JWT_SECRET || 'test_secret_for_suite';
    const token = jwt.sign({ id: dummyUserId.toString() }, testSecret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, testSecret);

    assert(decoded.id === dummyUserId.toString(), 'JWT authentication payload contains valid user ID');

    // 2. Test Workout Creation & Pre-save Hooks
    const testWorkout = new Workout({
      user: dummyUserId,
      title: 'Production Smoke Test Session',
      status: 'completed',
      durationMinutes: 45,
      calories: 350,
      exercises: [
        {
          exerciseName: 'Barbell Bench Press',
          sets: [
            { reps: 10, weight: 60, rest: 60 },
            { reps: 10, weight: 60, rest: 60 },
            { reps: 8, weight: 65, rest: 60 }
          ]
        },
        {
          exerciseName: 'Barbell Squat',
          sets: [
            { reps: 10, weight: 80, rest: 90 },
            { reps: 10, weight: 80, rest: 90 }
          ]
        }
      ]
    });

    await testWorkout.save();
    assert(testWorkout.completed === true, 'Mongoose pre-save hook syncs status="completed" to completed=true');
    assert(testWorkout.totalVolume === (60*10 + 60*10 + 65*8 + 80*10 + 80*10), 'Mongoose pre-save hook correctly calculates total volume (3320 kg)');

    // 3. Test Fitness Intelligence Engine
    const overloadRecs = await FitnessIntelligenceService.getProgressiveOverload(dummyUserId);
    assert(Array.isArray(overloadRecs), 'Fitness Intelligence progressive overload returns array');

    const todayFocus = await FitnessIntelligenceService.getTodayFocus(dummyUserId);
    assert(todayFocus.recommendation !== undefined, 'Fitness Intelligence today focus returns actionable recommendation');

    const muscleBalance = await FitnessIntelligenceService.getMuscleBalance(dummyUserId);
    assert(muscleBalance.totalSets >= 5, 'Fitness Intelligence muscle balance calculates total logged sets correctly');

    // 4. Cleanup Test Artifacts
    await Workout.deleteOne({ _id: testWorkout._id });
    console.log('🧹 Cleaned up test workout document');

    console.log('\n==================================================');
    console.log(`SUMMARY: Passed ${testsPassed} / ${testsPassed + testsFailed} Tests`);
    console.log('==================================================');

    if (testsFailed === 0) {
      console.log('🎉 ALL PRODUCTION SMOKE TESTS PASSED SUCCESSFULLY!');
    }

  } catch (err) {
    console.error('❌ Exception during production smoke test:', err);
  } finally {
    await mongoose.disconnect();
    console.log('👋 MongoDB disconnected');
  }
}

runProductionSmokeTest();
