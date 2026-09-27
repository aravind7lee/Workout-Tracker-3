import jwt from 'jsonwebtoken';

export default function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;
  
  if (!token || token === 'null' || token === 'undefined') {
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
    if (error.name === 'TokenExpiredError') {
      try {
        // Authenticate cryptographically using the server secret ignoring expiration
        const decoded = jwt.verify(token, jwtSecret, { ignoreExpiration: true });
        const userId = decoded.id || decoded.userId;
        
        if (userId) {
          req.user = { id: userId, _id: userId };
          
          // Generate renewed 30-day token
          const refreshedToken = jwt.sign(
            { id: userId, email: decoded.email },
            jwtSecret,
            { expiresIn: '30d' }
          );
          
          res.setHeader('X-New-Token', refreshedToken);
          res.setHeader('Access-Control-Expose-Headers', 'X-New-Token');
          console.log(`🔄 [Auth Middleware] Seamlessly renewed expired token for user: ${userId}`);
          return next();
        }
      } catch (renewalErr) {
        console.warn('Token signature check failed during renewal attempt:', renewalErr.message);
      }
      
      return res.status(401).json({ success: false, message: 'Token expired', expired: true });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token format', invalid: true });
    }
    
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
}