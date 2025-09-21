export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  res.status(200).json({
    status: 'SUCCESS',
    message: '✅ API is working perfectly!',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      register: '/api/auth/register', 
      login: '/api/auth/login'
    }
  });
}