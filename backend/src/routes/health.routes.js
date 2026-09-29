import { Router } from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

const router = Router();

/**
 * Health check endpoint for deployment orchestration and monitoring.
 * Performs a live, safe database query against Supabase to verify actual connectivity.
 * GET /api/health
 */
router.get('/', async (req, res) => {
  let dbStatus = 'disconnected';

  if (isSupabaseConfigured() && supabase) {
    try {
      // Execute a real, safe query against Supabase
      const { error } = await supabase.from('users').select('id').limit(1);
      if (!error) {
        dbStatus = 'connected';
      } else {
        // Query failed or table not found
        dbStatus = 'disconnected';
      }
    } catch {
      dbStatus = 'disconnected';
    }
  }

  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    service: 'TrustGuard API',
    status: isHealthy ? 'healthy' : 'degraded',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

export default router;
