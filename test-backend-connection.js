// Test Backend Connection
const axios = require('axios');

const BACKEND_URL = 'https://workout-tracker-backend-wga7.onrender.com/api';

async function testBackend() {
  console.log('🔍 Testing backend connection...');
  console.log(`📡 Backend URL: ${BACKEND_URL}`);
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BACKEND_URL}/health`, {
      timeout: 10000
    });
    
    console.log('✅ Health check passed');
    console.log('📊 Response:', healthResponse.data);
    
    // Test CORS
    console.log('\n2. Testing CORS headers...');
    console.log('🌐 CORS Origin:', healthResponse.headers['access-control-allow-origin']);
    
    return true;
    
  } catch (error) {
    console.log('❌ Backend connection failed');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🚫 Connection refused - backend server is not running');
    } else if (error.code === 'ENOTFOUND') {
      console.log('🌐 DNS resolution failed - check the backend URL');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('⏰ Connection timeout - backend server is slow or unreachable');
    } else if (error.response) {
      console.log(`📄 HTTP ${error.response.status}: ${error.response.statusText}`);
      console.log('📝 Response:', error.response.data);
    } else {
      console.log('🔧 Error:', error.message);
    }
    
    return false;
  }
}

// Run the test
testBackend().then(success => {
  if (success) {
    console.log('\n🎉 Backend is working correctly!');
  } else {
    console.log('\n💡 Suggestions:');
    console.log('   1. Check if the backend server is running');
    console.log('   2. Verify the backend URL is correct');
    console.log('   3. Check your internet connection');
    console.log('   4. Try running the backend locally on port 5001');
  }
  
  process.exit(success ? 0 : 1);
});