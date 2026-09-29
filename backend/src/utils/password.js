import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcrypt with 12 salt rounds
 * @param {string} password - Plaintext password
 * @returns {Promise<string>} Password hash
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares plaintext password against a bcrypt hash
 * @param {string} password - Plaintext password candidate
 * @param {string} hash - Stored bcrypt password hash
 * @returns {Promise<boolean>} True if matching, false otherwise
 */
export async function comparePassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}
