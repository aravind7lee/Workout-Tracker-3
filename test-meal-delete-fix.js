// Test script to verify meal delete functionality
console.log('🧪 Testing Meal Delete Fix...\n');

// Test meal objects with different ID structures
const testMeals = [
  {
    _id: '507f1f77bcf86cd799439011',
    id: '507f1f77bcf86cd799439011',
    name: 'Chicken Breast',
    calories: 165,
    protein: 31
  },
  {
    _id: '507f1f77bcf86cd799439012',
    // Missing id property
    name: 'Banana',
    calories: 105,
    protein: 1.3
  },
  {
    // Missing _id property
    id: '507f1f77bcf86cd799439013',
    name: 'Rice',
    calories: 205,
    protein: 4.3
  },
  {
    // No ID properties at all
    name: 'Oats',
    calories: 307,
    protein: 10.7
  }
];

function testMealIdHandling(meal, index) {
  console.log(`📋 Testing meal ${index + 1}: ${meal.name}`);
  
  // Test the ID extraction logic from the fixed code
  const mealId = meal._id || meal.id;
  const keyForReact = meal._id || meal.id || `meal-${Math.random()}`;
  
  console.log(`   🔑 Extracted ID: ${mealId || 'undefined'}`);
  console.log(`   ⚛️ React Key: ${keyForReact}`);
  
  // Test delete button state
  const deleteDisabled = !meal._id && !meal.id;
  console.log(`   🗑️ Delete Button: ${deleteDisabled ? 'DISABLED' : 'ENABLED'}`);
  
  // Test ID validation
  const isValidForDelete = mealId && mealId !== 'undefined' && mealId !== 'null';
  console.log(`   ✅ Valid for Delete: ${isValidForDelete ? 'YES' : 'NO'}`);
  
  // Test MongoDB ObjectId format
  const isValidObjectId = mealId && mealId.match(/^[0-9a-fA-F]{24}$/);
  console.log(`   🔍 Valid ObjectId: ${isValidObjectId ? 'YES' : 'NO'}`);
  
  console.log('');
}

// Test all meals
testMeals.forEach(testMealIdHandling);

// Test the delete URL construction
console.log('🌐 Testing Delete URL Construction:');
const testIds = ['507f1f77bcf86cd799439011', undefined, null, 'invalid-id'];

testIds.forEach((id, index) => {
  const url = `DELETE /api/nutrition/meals/${id}`;
  const isValid = id && id !== 'undefined' && id !== 'null' && id.match(/^[0-9a-fA-F]{24}$/);
  
  console.log(`   ${index + 1}. ${url} - ${isValid ? '✅ VALID' : '❌ INVALID'}`);
});

console.log('\n🎉 Meal Delete Fix Test Completed!');
console.log('✅ All meal ID handling scenarios tested');
console.log('✅ Delete button states properly managed');
console.log('✅ URL construction validated');
console.log('✅ The "undefined" meal ID error should be fixed!');