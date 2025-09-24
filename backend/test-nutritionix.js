import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testNutritionixAPI() {
  console.log('🧪 Testing Nutritionix API...');
  
  const testQueries = [
    '1 large egg',
    'chicken breast 100g',
    '1 cup white rice',
    'banana',
    '2 tbsp peanut butter'
  ];

  for (const query of testQueries) {
    try {
      console.log(`\n🔍 Testing: "${query}"`);
      
      const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
        method: 'POST',
        headers: {
          'x-app-id': process.env.NUTRITIONIX_APP_ID,
          'x-app-key': process.env.NUTRITIONIX_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query,
          timezone: 'US/Eastern'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const food = data.foods[0];
      
      console.log('✅ Success:');
      console.log(`   Name: ${food.food_name}`);
      console.log(`   Serving: ${food.serving_qty} ${food.serving_unit} (${food.serving_weight_grams}g)`);
      console.log(`   Calories: ${Math.round(food.nf_calories)}`);
      console.log(`   Protein: ${Math.round(food.nf_protein * 10) / 10}g`);
      console.log(`   Carbs: ${Math.round(food.nf_total_carbohydrate * 10) / 10}g`);
      console.log(`   Fat: ${Math.round(food.nf_total_fat * 10) / 10}g`);
      
    } catch (error) {
      console.log('❌ Failed:', error.message);
    }
  }
  
  console.log('\n🏁 Nutritionix API test completed!');
}

testNutritionixAPI();