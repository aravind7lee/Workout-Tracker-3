// Test backend connectivity and analytics endpoint
const BASE_URL = 'https://workout-tracker-backend-wga7.onrender.com/api';

async function testBackend() {
  console.log('🔍 Testing backend connectivity...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData);
    
    // Test analytics endpoint without auth (should fail with 401)
    console.log('\n2. Testing analytics endpoint (without auth)...');
    try {
      const analyticsResponse = await fetch(`${BASE_URL}/analytics`);
      if (analyticsResponse.status === 401) {
        console.log('✅ Analytics endpoint correctly requires authentication');
      } else {
        const analyticsData = await analyticsResponse.json();
        console.log('❌ Analytics endpoint should require auth but returned:', analyticsData);
      }
    } catch (error) {
      console.log('❌ Analytics endpoint error:', error.message);
    }
    
    // Test specific analytics endpoints
    console.log('\n3. Testing specific analytics endpoints...');
    const endpoints = ['/analytics/stats', '/analytics/hero-stats', '/analytics/achievements'];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (response.status === 401) {
          console.log(`✅ ${endpoint} correctly requires authentication`);
        } else {
          console.log(`❌ ${endpoint} should require auth but returned status:`, response.status);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} error:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
  }
}

// Run the test
testBackend().catch(console.error);