import { Router } from 'express';
import { z } from 'zod';
import { analyzeController } from '../controllers/analyze.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { analyzeLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// Zod Schema for Analyze Request (Section 2)
const analyzeSchema = z.object({
  inputText: z
    .string({ required_error: 'inputText is required' })
    .trim()
    .min(1, 'inputText cannot be empty or whitespace-only')
    .max(25000, 'inputText exceeds maximum allowed length of 25,000 characters'),
});

/**
 * POST /api/analyze
 * Authenticated security checkpoint analysis endpoint
 * Applies rate limiting, JWT authentication, and strict Zod validation
 */
router.post(
  '/',
  analyzeLimiter,
  authenticateToken,
  validate(analyzeSchema),
  analyzeController.analyze
);

export default router;
