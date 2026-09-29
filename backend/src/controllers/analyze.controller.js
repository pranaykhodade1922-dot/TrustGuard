import { detectionService } from '../services/detectionService.js';
import { aiAnalyzer } from '../services/aiAnalyzer.js';
import { spanVerifier } from '../services/spanVerifier.js';
import { flagMerger } from '../services/flagMerger.js';
import { riskScorer } from '../services/riskScorer.js';
import { redactionService } from '../services/redactionService.js';
import { scanService } from '../services/scan.service.js';

export const analyzeController = {
  /**
   * Primary TrustGuard Security Analysis Pipeline
   * POST /api/analyze
   */
  async analyze(req, res, next) {
    try {
      // 1. Identify owner strictly from verified JWT (Section 1)
      const userId = req.user.id || req.user.sub;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication session required.',
        });
      }

      // 2. Input validation passed via Zod middleware
      const { inputText } = req.body;

      // 3. Deterministic Detection (Section 4)
      const deterministicFlags = detectionService.detectAll(inputText);

      // 4. AI Contextual Analysis (Section 6)
      let aiResult;
      try {
        aiResult = await aiAnalyzer.analyze(inputText);
      } catch (aiErr) {
        console.warn('[TrustGuard AI] AI analysis provider error:', aiErr.message);
        // Fall back gracefully to deterministic analysis without crashing
        aiResult = { riskScore: 0, flags: [] };
      }

      // 5. Exact-Span Verification of AI Flags (Section 7 - Core Differentiator)
      // Reject any span not verbatim in the original input text
      const verifiedAiFlags = spanVerifier.verifySpans(aiResult.flags || [], inputText);

      // 6. Merge Deterministic + Verified AI Results (Section 8)
      const mergedFlags = flagMerger.merge(deterministicFlags, verifiedAiFlags);

      // 7. Defense-in-depth span verification on all final findings
      const finalVerifiedFlags = spanVerifier.verifySpans(mergedFlags, inputText);

      // 8. Calculate Dynamic Risk Score and Risk Level (Section 9)
      const { riskScore, riskLevel } = riskScorer.calculateScore(finalVerifiedFlags);

      // 9. Generate Redacted / Protected Version (Section 10)
      const redactedText = redactionService.redact(inputText, finalVerifiedFlags);

      // 10. Persist Verified Scan Record in Database (Section 11)
      // Privacy check: No logging of raw sensitive input to console
      const createdScan = await scanService.createScan({
        userId,
        inputText,
        riskScore,
        flags: finalVerifiedFlags,
        redactedText,
      });

      // 11. Return Strict Product Response (Section 14)
      return res.status(200).json({
        success: true,
        scan: {
          id: createdScan.id,
          riskScore,
          riskLevel,
          flags: finalVerifiedFlags,
          redactedText,
          actionTaken: createdScan.action_taken || null,
          createdAt: createdScan.created_at,
        },
      });
    } catch (error) {
      console.error('[TrustGuard API] Error during analysis pipeline execution:', error.message);
      next(error);
    }
  },
};
