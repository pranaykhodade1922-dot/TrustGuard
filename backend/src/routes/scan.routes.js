import { Router } from 'express';
import { z } from 'zod';
import { scanController } from '../controllers/scan.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Strict Zod schema for scan decision updates (Section 5 & 18)
const updateActionSchema = z.object({
  action: z.enum(['SEND_ANYWAY', 'USE_REDACTED', 'DISCARD'], {
    errorMap: () => ({
      message: "Action must be one of: 'SEND_ANYWAY', 'USE_REDACTED', 'DISCARD'",
    }),
  }),
});

// All scan endpoints require verified JWT authentication (Section 10 & 12)
router.use(authenticateToken);

/**
 * GET /api/scans
 * Lists all scans belonging strictly to the authenticated user
 */
router.get('/', scanController.getScans);

/**
 * GET /api/scans/:id
 * Retrieves a single scan with verified user ownership
 */
router.get('/:id', scanController.getScanById);

/**
 * PATCH /api/scans/:id/action
 * Updates user decision action on an owned scan
 */
router.patch('/:id/action', validate(updateActionSchema), scanController.updateAction);

export default router;
