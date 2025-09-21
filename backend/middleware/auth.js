// backend/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async function (req, res, next) {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '') || req.query.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    return res.status(500).json({ message: 'Server error during authentication.' });
  }
}
