import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Generates a signed JWT with minimal identity payload
 * @param {Object} payload - Object containing sub (user id) and email
 * @returns {string} Signed JWT token
 */
export function generateToken(payload) {
  if (!payload || !payload.sub) {
    throw new Error('JWT payload must contain sub (user identifier)');
  }

  const safePayload = {
    sub: payload.sub,
    email: payload.email,
  };

  return jwt.sign(safePayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Verifies and decodes a JWT token
 * @param {string} token - Bearer JWT token
 * @returns {Object} Decoded payload
 */
export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}
