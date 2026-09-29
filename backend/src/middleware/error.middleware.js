import { env } from '../config/env.js';

/**
 * Centralized application error handling middleware
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  // Log only unexpected 5xx errors server-side
  if (statusCode >= 500 && env.NODE_ENV !== 'test') {
    console.error(`[Internal Error] ${req.method} ${req.originalUrl}:`, err);
  }

  // Handle client errors (4xx) cleanly
  if (statusCode < 500) {
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'Request error.',
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Generic 500 error response without leaking internal server information
  return res.status(500).json({
    success: false,
    message: 'Internal server error.',
  });
}
