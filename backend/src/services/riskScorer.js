/**
 * TrustGuard AI — Transparent Risk Scoring Engine
 * Computes deterministic, signal-based risk scores (0–100) and derived risk levels.
 */

export const riskScorer = {
  /**
   * Computes risk score based on verified findings and their category severity weights.
   * @param {Array<{ span: string, category: string, reason: string }>} flags
   * @returns {{ riskScore: number, riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }}
   */
  calculateScore(flags = []) {
    if (!Array.isArray(flags) || flags.length === 0) {
      return {
        riskScore: 0,
        riskLevel: 'LOW',
      };
    }

    let rawScore = 0;
    const categoryCounts = new Map();

    for (const flag of flags) {
      const cat = flag.category || 'OTHER';
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);

      switch (cat) {
        case 'CREDENTIAL':
          // Highest severity: exposed tokens, passwords, private keys
          rawScore += 50;
          break;

        case 'FINANCIAL':
          // High severity: payment card numbers, bank accounts, wire sums
          rawScore += 40;
          break;

        case 'SOCIAL_ENGINEERING':
          // High severity: authority impersonation, coercive threats, OTP demands
          rawScore += 35;
          break;

        case 'PII': {
          // National IDs carry higher risk than simple contact info
          const reason = (flag.reason || '').toLowerCase();
          if (reason.includes('aadhaar') || reason.includes('ssn') || reason.includes('pan')) {
            rawScore += 35;
          } else {
            rawScore += 15;
          }
          break;
        }

        default:
          rawScore += 10;
          break;
      }
    }

    // Synergy risk: Mixed attacks (e.g. Social Engineering + Credentials or Financial)
    if (categoryCounts.has('SOCIAL_ENGINEERING') && (categoryCounts.has('CREDENTIAL') || categoryCounts.has('FINANCIAL'))) {
      rawScore += 15;
    }

    // Cap between 0 and 100
    const riskScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    // Derive Risk Level
    let riskLevel = 'LOW';
    if (riskScore >= 80) {
      riskLevel = 'CRITICAL';
    } else if (riskScore >= 55) {
      riskLevel = 'HIGH';
    } else if (riskScore >= 20) {
      riskLevel = 'MEDIUM';
    }

    return {
      riskScore,
      riskLevel,
    };
  },
};
