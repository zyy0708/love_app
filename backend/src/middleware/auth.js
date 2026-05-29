import { verifyToken } from '../utils/auth.js';
import { isProduction } from '../config/env.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token has expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    return res.status(403).json({ error: 'Authentication failed' });
  }
}

export function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);
  
  if (isProduction()) {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message,
      stack: err.stack
    });
  }
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Resource not found' });
}

export function validateRequest(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }
    next();
  };
}
