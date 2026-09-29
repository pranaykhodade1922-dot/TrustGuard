import app from './app.js';
import { env } from './config/env.js';
import { supabase, isSupabaseConfigured } from './config/supabase.js';

const server = app.listen(env.PORT, async () => {
  let dbReport = 'In-Memory Development Store';

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('users').select('id').limit(1);
      if (!error) {
        dbReport = 'Supabase PostgreSQL (Connected)';
      } else {
        dbReport = `Supabase PostgreSQL (Disconnected: ${error.message})`;
      }
    } catch (err) {
      dbReport = `Supabase PostgreSQL (Connection Error: ${err.message})`;
    }
  }

  console.log(`\n=================================================`);
  console.log(`🛡️  TrustGuard AI — Backend Service Active`);
  console.log(`=================================================`);
  console.log(`• Environment:  ${env.NODE_ENV}`);
  console.log(`• Port:         ${env.PORT}`);
  console.log(`• Database:     ${dbReport}`);
  console.log(`• CORS Origin:  ${env.FRONTEND_URL}`);
  console.log(`• Health Check: http://localhost:${env.PORT}/api/health`);
  console.log(`=================================================\n`);
});

// Graceful process termination
const gracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down TrustGuard server gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
