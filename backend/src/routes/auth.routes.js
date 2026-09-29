import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { signupSchema, loginSchema } from '../schemas/auth.schema.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Apply stricter rate limit to authentication endpoints
router.use(authLimiter);

// POST /api/auth/signup
router.post('/signup', validate(signupSchema), authController.signup);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// GET /api/auth/me (Protected route verification)
router.get('/me', authenticateToken, authController.getMe);

export default router;
