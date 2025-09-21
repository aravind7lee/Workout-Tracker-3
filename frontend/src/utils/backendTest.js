// frontend/src/utils/backendTest.js
// Backend connectivity and deployment verification

const BACKEND_URL = import.meta.env.VITE_API_BASE || 'https://grindx-backend.vercel.app/api';

export const testBackendDeployment = async () => {
  console.log('🔍 Testing backend deployment at:', BACKEND_URL);
  
  const tests = [
    { name: 'Root API', endpoint: '' },
    { name: 'Health Check', endpoint: '/health' },
    { name: 'Auth Routes', endpoint: '/auth' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const response = await fetch(`${BACKEND_URL}${test.endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      results.push({
        test: test.name,
        status: response.ok ? '✅ PASS' : '❌ FAIL',
        code: response.status,
        data: data
      });
      
      console.log(`${test.name}: ${response.status} - ${response.ok ? 'PASS' : 'FAIL'}`);
      
    } catch (error) {
      results.push({
        test: test.name,
        status: '❌ ERROR',
        error: error.message
      });
      
      console.error(`${test.name}: ERROR -`, error.message);
    }
  }
  
  return results;
};

export const testAuthEndpoints = async () => {
  console.log('🔐 Testing authentication endpoints...');
  
  // Test registration endpoint
  try {
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'test123456'
    };
    
    const response = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Registration endpoint working:', data.message);
      return { success: true, message: 'Authentication endpoints are working' };
    } else {
      const error = await response.json();
      console.log('❌ Registration endpoint failed:', error.message);
      return { success: false, message: error.message };
    }
    
  } catch (error) {
    console.error('❌ Auth endpoint test failed:', error.message);
    return { success: false, message: error.message };
  }
};

export const verifyMongoDBConnection = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const dbStatus = data.database || 'Unknown';
      
      console.log('🗄️ MongoDB Status:', dbStatus);
      
      return {
        connected: dbStatus === 'Connected',
        status: dbStatus,
        message: dbStatus === 'Connected' ? 'MongoDB Atlas connected' : 'MongoDB connection issue'
      };
    }
    
    return { connected: false, status: 'Unknown', message: 'Cannot check database status' };
    
  } catch (error) {
    console.error('❌ MongoDB check failed:', error.message);
    return { connected: false, status: 'Error', message: error.message };
  }
};