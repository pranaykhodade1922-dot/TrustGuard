import { verifyToken } from '../utils/jwt.js';

/**
 * Authentication middleware that verifies JWT bearer tokens
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token missing or invalid.',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token missing.',
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      ...decoded,
      id: decoded.sub || decoded.id,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please sign in again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
}
