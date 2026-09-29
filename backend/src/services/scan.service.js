import crypto from 'crypto';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

// In-memory fallback for local development if Supabase database tables are not yet created
const inMemoryScans = new Map(); // key: userId -> array of scan objects

/**
 * Checks if the Supabase scans table exists and is accessible
 */
async function canQuerySupabaseScans() {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const { error } = await supabase.from('scans').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

export const scanService = {
  /**
   * Creates and persists a new verified scan record scoped strictly to the authenticated user.
   * @param {Object} params
   * @param {string} params.userId - Authenticated user UUID
   * @param {string} params.inputText - Original input content
   * @param {number} params.riskScore - Calculated risk score (0-100)
   * @param {Array} params.flags - Verified flags array
   * @param {string} params.redactedText - Redacted text content
   * @returns {Promise<Object>} Created scan record
   */
  async createScan({ userId, inputText, riskScore, flags, redactedText }) {
    if (!userId) {
      throw new Error('User identity required to create scan.');
    }

    const scanId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const scanRecord = {
      id: scanId,
      user_id: userId,
      input_text: inputText,
      risk_score: riskScore,
      flags: flags || [],
      redacted_text: redactedText,
      action_taken: null,
      created_at: createdAt,
    };

    const useSupabase = await canQuerySupabaseScans();
    if (useSupabase) {
      const { data, error } = await supabase
        .from('scans')
        .insert([scanRecord])
        .select()
        .single();

      if (error) {
        throw new Error(`Database error creating scan: ${error.message}`);
      }

      return data;
    }

    // In-memory fallback
    if (!inMemoryScans.has(userId)) {
      inMemoryScans.set(userId, []);
    }
    inMemoryScans.get(userId).unshift(scanRecord);
    return scanRecord;
  },

  /**
   * Retrieves all scans belonging strictly to the authenticated user
   * @param {string} userId - Authenticated user UUID extracted from JWT
   * @returns {Promise<Array>} Array of user's scan records
   */
  async getUserScans(userId) {
    if (!userId) {
      throw new Error('User identity required.');
    }

    const useSupabase = await canQuerySupabaseScans();
    if (useSupabase) {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Database error retrieving scans: ${error.message}`);
      }

      return data || [];
    }

    const userRecords = inMemoryScans.get(userId) || [];
    return [...userRecords].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  /**
   * Retrieves a single scan by ID with strict ownership validation
   * @param {string} userId - Authenticated user UUID
   * @param {string} scanId - Target scan ID
   * @returns {Promise<Object|null>} Scan record if owned by user, otherwise null
   */
  async getScanById(userId, scanId) {
    if (!userId || !scanId) {
      throw new Error('User identity and Scan ID are required.');
    }

    const useSupabase = await canQuerySupabaseScans();
    if (useSupabase) {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw new Error(`Database error retrieving scan: ${error.message}`);
      }

      return data;
    }

    const userRecords = inMemoryScans.get(userId) || [];
    const scan = userRecords.find((s) => s.id === scanId && s.user_id === userId);
    return scan || null;
  },

  /**
   * Updates the action taken for a specific scan belonging to the user
   * @param {string} userId - Authenticated user UUID
   * @param {string} scanId - Target scan ID
   * @param {'SEND_ANYWAY'|'USE_REDACTED'|'DISCARD'} action - Allowed PRD action
   * @returns {Promise<Object>} Updated scan record
   */
  async updateScanAction(userId, scanId, action) {
    if (!userId || !scanId || !action) {
      throw new Error('User identity, Scan ID, and Action are required.');
    }

    // First verify scan exists and belongs to user
    const existing = await this.getScanById(userId, scanId);
    if (!existing) {
      const error = new Error('Scan record not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    const useSupabase = await canQuerySupabaseScans();
    if (useSupabase) {
      const { data, error } = await supabase
        .from('scans')
        .update({ action_taken: action })
        .eq('id', scanId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error updating scan: ${error.message}`);
      }

      return data;
    }

    const userRecords = inMemoryScans.get(userId) || [];
    const index = userRecords.findIndex((s) => s.id === scanId);
    if (index !== -1) {
      userRecords[index].action_taken = action;
      return userRecords[index];
    }

    const error = new Error('Scan record not found.');
    error.statusCode = 404;
    throw error;
  },
};
