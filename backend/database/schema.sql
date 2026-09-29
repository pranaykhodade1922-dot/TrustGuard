-- ============================================================================
-- TrustGuard AI — Database Schema (Supabase PostgreSQL)
-- Phase 1 Foundation: Users & Scans Architecture
-- ============================================================================

-- Ensure UUID generation functions are available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- Stores authenticated identity records with bcrypt password hashes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for normalized email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Service role has full access; users can only read their own profile
CREATE POLICY "Users can read own profile"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 2. SCANS TABLE (Future Checkpoint Records)
--
-- PRIVACY ARCHITECTURE NOTICE:
-- TrustGuard AI is built on a "Privacy & Zero-Retention First" philosophy.
-- The raw `input_text` column is defined here to support the schema contract,
-- but the application default in future phases will enforce either:
--   a) Zero raw input persistence (NULL/purged upon dispatch)
--   b) Short-lived volatile retention (e.g. 24h TTL)
--   c) Client-side envelope encryption before storage
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    input_text TEXT, -- Retained conditionally based on user data-retention policy
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    flags JSONB DEFAULT '[]'::jsonb,
    redacted_text TEXT,
    action_taken TEXT CHECK (action_taken IN ('SEND_ANYWAY', 'USE_REDACTED', 'DISCARD', 'protected', 'send_anyway', 'discarded', 'reviewed', 'safe')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for user scan history queries
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON public.scans (user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON public.scans (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Users can only view and manage their own scan audit history
CREATE POLICY "Users can view own scans"
    ON public.scans
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
    ON public.scans
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
