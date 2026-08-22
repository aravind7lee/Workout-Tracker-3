import jwt from 'jsonwebtoken';

export default function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('FATAL: JWT_SECRET environment variable is not defined!');
    return res.status(500).json({ success: false, message: 'Server authentication configuration error' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.id || decoded.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    req.user = { id: userId, _id: userId };
    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired', expired: true });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token format', invalid: true });
    }
    
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
}