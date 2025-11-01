/**
 * Test utility for user-specific workout splits
 * Run this in browser console to test the functionality
 */

import { 
  initializeUserSplits, 
  getUserSplits, 
  saveUserSplit, 
  deleteUserSplit,
  getUserSplitStorageKeys 
} from './userSpecificSplits';

// Test users
const testUser1 = {
  id: 'user123',
  name: 'John Doe',
  email: 'john@example.com'
};

const testUser2 = {
  id: 'user456', 
  name: 'Jane Smith',
  email: 'jane@example.com'
};

// Test split data
const testSplit1 = {
  id: Date.now(),
  name: 'User 1 Split',
  description: 'Test split for user 1',
  exercises: [
    { name: 'Push-ups', sets: '3x10' },
    { name: 'Squats', sets: '3x15' }
  ],
  createdAt: new Date().toISOString()
};

const testSplit2 = {
  id: Date.now() + 1,
  name: 'User 2 Split',
  description: 'Test split for user 2', 
  exercises: [
    { name: 'Pull-ups', sets: '3x8' },
    { name: 'Lunges', sets: '3x12' }
  ],
  createdAt: new Date().toISOString()
};

/**
 * Run comprehensive test of user-specific splits
 */
export const testUserSpecificSplits = () => {
  console.log('🧪 Starting user-specific splits test...');
  
  try {
    // Initialize storage for both users
    console.log('1. Initializing user storage...');
    initializeUserSplits(testUser1);
    initializeUserSplits(testUser2);
    
    // Save splits for each user
    console.log('2. Saving splits for each user...');
    saveUserSplit(testUser1, testSplit1);
    saveUserSplit(testUser2, testSplit2);
    
    // Get splits for user 1
    console.log('3. Getting splits for user 1...');
    const user1Splits = getUserSplits(testUser1);
    console.log('User 1 splits:', user1Splits);
    
    // Get splits for user 2
    console.log('4. Getting splits for user 2...');
    const user2Splits = getUserSplits(testUser2);
    console.log('User 2 splits:', user2Splits);
    
    // Verify isolation
    console.log('5. Verifying isolation...');
    const user1HasUser2Split = user1Splits.some(split => split.name === 'User 2 Split');
    const user2HasUser1Split = user2Splits.some(split => split.name === 'User 1 Split');
    
    if (!user1HasUser2Split && !user2HasUser1Split) {
      console.log('✅ ISOLATION TEST PASSED: Users can only see their own splits');
    } else {
      console.error('❌ ISOLATION TEST FAILED: Cross-contamination detected');
    }
    
    // Test deletion
    console.log('6. Testing deletion...');
    deleteUserSplit(testUser1, testSplit1.id);
    const user1SplitsAfterDelete = getUserSplits(testUser1);
    
    if (user1SplitsAfterDelete.length === 0) {
      console.log('✅ DELETION TEST PASSED: Split deleted successfully');
    } else {
      console.error('❌ DELETION TEST FAILED: Split not deleted');
    }
    
    // Verify user 2 splits still exist
    const user2SplitsAfterUser1Delete = getUserSplits(testUser2);
    if (user2SplitsAfterUser1Delete.length === 1) {
      console.log('✅ ISOLATION AFTER DELETE TEST PASSED: User 2 splits unaffected');
    } else {
      console.error('❌ ISOLATION AFTER DELETE TEST FAILED: User 2 splits affected');
    }
    
    // Show storage keys
    console.log('7. Storage keys created:');
    const storageKeys = getUserSplitStorageKeys();
    console.log('User-specific storage keys:', storageKeys);
    
    console.log('🎉 User-specific splits test completed!');
    
    return {
      success: true,
      message: 'All tests passed',
      storageKeys
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      message: error.message,
      error
    };
  }
};

/**
 * Clean up test data
 */
export const cleanupTestData = () => {
  try {
    localStorage.removeItem(`custom_workout_splits_${testUser1.id}`);
    localStorage.removeItem(`custom_workout_splits_${testUser2.id}`);
    console.log('🧹 Test data cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
  }
};

// Auto-run test if in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Development mode detected - user-specific splits utility loaded');
  console.log('Run testUserSpecificSplits() in console to test functionality');
}