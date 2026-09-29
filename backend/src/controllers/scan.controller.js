import { scanService } from '../services/scan.service.js';

export const scanController = {
  /**
   * Retrieves all scan records belonging strictly to the authenticated user
   * GET /api/scans
   */
  async getScans(req, res, next) {
    try {
      const userId = req.user.id || req.user.sub;
      const scans = await scanService.getUserScans(userId);

      return res.status(200).json({
        success: true,
        count: scans.length,
        data: scans,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieves a single scan record with verified user ownership
   * GET /api/scans/:id
   */
  async getScanById(req, res, next) {
    try {
      const userId = req.user.id || req.user.sub;
      const { id } = req.params;

      const scan = await scanService.getScanById(userId, id);
      if (!scan) {
        return res.status(404).json({
          success: false,
          message: 'Scan record not found or access denied.',
        });
      }

      const score = typeof scan.risk_score === 'number' ? scan.risk_score : 0;
      let riskLevel = 'LOW';
      if (score >= 80) riskLevel = 'CRITICAL';
      else if (score >= 55) riskLevel = 'HIGH';
      else if (score >= 20) riskLevel = 'MEDIUM';

      return res.status(200).json({
        success: true,
        scan: {
          id: scan.id,
          userId: scan.user_id,
          riskScore: score,
          riskLevel,
          flags: scan.flags || [],
          inputText: scan.input_text || '',
          redactedText: scan.redacted_text || '',
          actionTaken: scan.action_taken || null,
          createdAt: scan.created_at,
        },
        data: scan,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Updates the user decision action on an owned scan record
   * PATCH /api/scans/:id/action
   */
  async updateAction(req, res, next) {
    try {
      const userId = req.user.id || req.user.sub;
      const { id } = req.params;
      const { action } = req.body;

      const updated = await scanService.updateScanAction(userId, id, action);

      const score = typeof updated.risk_score === 'number' ? updated.risk_score : 0;
      let riskLevel = 'LOW';
      if (score >= 80) riskLevel = 'CRITICAL';
      else if (score >= 55) riskLevel = 'HIGH';
      else if (score >= 20) riskLevel = 'MEDIUM';

      return res.status(200).json({
        success: true,
        message: 'Scan action updated successfully.',
        scan: {
          id: updated.id,
          userId: updated.user_id,
          riskScore: score,
          riskLevel,
          flags: updated.flags || [],
          inputText: updated.input_text || '',
          redactedText: updated.redacted_text || '',
          actionTaken: updated.action_taken || null,
          createdAt: updated.created_at,
        },
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },
};
