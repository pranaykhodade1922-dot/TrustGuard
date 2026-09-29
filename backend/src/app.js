import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { generalLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import scanRoutes from './routes/scan.routes.js';
import analyzeRoutes from './routes/analyze.routes.js';

const app = express();

// 1. Security HTTP Headers
app.use(helmet());

// 2. CORS Configuration (Restricted to frontend origin)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      const allowedOrigins = [env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Cross-Origin Request Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Request Body Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. Global Rate Limiter
app.use('/api', generalLimiter);

// 5. Mount API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/analyze', analyzeRoutes);

// 6. 404 Handler for Unrecognized Endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// 7. Centralized Error Handler
app.use(errorHandler);

export default app;
