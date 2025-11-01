// Test script to verify meal count fix
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Meal from './models/Meal.js';

dotenv.config();

async function testMealCount() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test user ID (replace with actual user ID)
    const testUserId = '507f1f77bcf86cd799439011'; // Example ObjectId

    console.log('\n🔍 Testing meal count for user:', testUserId);

    // Count meals with userId field (correct)
    const mealsWithUserId = await Meal.countDocuments({ userId: testUserId });
    console.log('📊 Meals with userId field:', mealsWithUserId);

    // Count meals with user field (incorrect - should be migrated)
    const mealsWithUser = await Meal.countDocuments({ user: testUserId });
    console.log('📊 Meals with user field (should be 0 after migration):', mealsWithUser);

    // Total meals
    const totalMeals = mealsWithUserId + mealsWithUser;
    console.log('📊 Total meals:', totalMeals);

    // If there are meals with wrong field, migrate them
    if (mealsWithUser > 0) {
      console.log('\n🔄 Migrating meals with wrong field name...');
      
      const result = await Meal.updateMany(
        { user: testUserId },
        { 
          $set: { userId: testUserId },
          $unset: { user: 1 }
        }
      );
      
      console.log('✅ Migration completed:', result.modifiedCount, 'meals updated');
      
      // Verify migration
      const mealsAfterMigration = await Meal.countDocuments({ userId: testUserId });
      const wrongFieldAfterMigration = await Meal.countDocuments({ user: testUserId });
      
      console.log('📊 Meals with userId after migration:', mealsAfterMigration);
      console.log('📊 Meals with user field after migration:', wrongFieldAfterMigration);
    }

    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testMealCount();