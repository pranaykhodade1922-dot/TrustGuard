import crypto from 'crypto';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

// In-memory fallback repository when Supabase tables are not yet created
const inMemoryUsers = new Map();

/**
 * Checks if the Supabase users table exists and is accessible
 */
async function canQuerySupabaseUsers() {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Service handling user registration, credential verification, and token issuance
 */
export const authService = {
  /**
   * Registers a new user account
   * @param {string} rawEmail - User email
   * @param {string} password - Plaintext password
   * @returns {Promise<{ user: { id: string, email: string }, token: string }>}
   */
  async signup(rawEmail, password) {
    const email = rawEmail.trim().toLowerCase();
    const useSupabase = await canQuerySupabaseUsers();

    // Check for existing account
    if (useSupabase) {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (checkError) {
        throw new Error(`Database query error: ${checkError.message}`);
      }

      if (existingUser) {
        const error = new Error('An account with this email already exists.');
        error.statusCode = 409;
        throw error;
      }
    } else {
      if (inMemoryUsers.has(email)) {
        const error = new Error('An account with this email already exists.');
        error.statusCode = 409;
        throw error;
      }
    }

    // Hash the password securely with bcrypt
    const password_hash = await hashPassword(password);
    const userId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    let createdUser = null;

    if (useSupabase) {
      const { data, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            email,
            password_hash,
            created_at: createdAt,
          },
        ])
        .select('id, email, created_at')
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          const error = new Error('An account with this email already exists.');
          error.statusCode = 409;
          throw error;
        }
        throw new Error(`Failed to create user account: ${insertError.message}`);
      }

      createdUser = data;
    } else {
      const newUser = {
        id: userId,
        email,
        password_hash,
        created_at: createdAt,
      };
      inMemoryUsers.set(email, newUser);
      createdUser = { id: newUser.id, email: newUser.email, created_at: newUser.created_at };
    }

    // Generate JWT
    const token = generateToken({
      sub: createdUser.id,
      email: createdUser.email,
    });

    return {
      user: {
        id: createdUser.id,
        email: createdUser.email,
      },
      token,
    };
  },

  /**
   * Authenticates user credentials and generates access token
   * @param {string} rawEmail - User email
   * @param {string} password - Plaintext password
   * @returns {Promise<{ user: { id: string, email: string }, token: string }>}
   */
  async login(rawEmail, password) {
    const email = rawEmail.trim().toLowerCase();
    let userRecord = null;
    const useSupabase = await canQuerySupabaseUsers();

    if (useSupabase) {
      const { data, error: findError } = await supabase
        .from('users')
        .select('id, email, password_hash')
        .eq('email', email)
        .maybeSingle();

      if (findError) {
        throw new Error(`Database query error: ${findError.message}`);
      }

      userRecord = data;
    } else {
      userRecord = inMemoryUsers.get(email);
    }

    // Generic error to prevent account enumeration
    if (!userRecord || !userRecord.password_hash) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Secure password comparison
    const isPasswordValid = await comparePassword(password, userRecord.password_hash);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT
    const token = generateToken({
      sub: userRecord.id,
      email: userRecord.email,
    });

    return {
      user: {
        id: userRecord.id,
        email: userRecord.email,
      },
      token,
    };
  },
};
