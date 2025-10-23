import jwt from 'jsonwebtoken';

export default function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'workout_tracker_super_secret_jwt_key_2024_secure_token_generator');
    req.user = { id: decoded.id || decoded.userId };
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