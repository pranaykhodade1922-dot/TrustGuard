import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

let supabaseClient = null;

export const isSupabaseConfigured = () => {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
};

if (isSupabaseConfigured()) {
  try {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error.message);
  }
} else {
  console.warn(
    '\n[TrustGuard Warning] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not configured in backend/.env.\n' +
    'The server will operate with a temporary in-memory user repository for local testing until Supabase credentials are provided.\n'
  );
}

export const supabase = supabaseClient;
export default supabase;
