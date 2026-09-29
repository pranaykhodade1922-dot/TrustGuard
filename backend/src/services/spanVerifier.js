/**
 * TrustGuard AI — Exact-Span Verification Service
 * Enforces strict span validation. Every candidate flag must exist verbatim
 * in the original user content. Any hallucinated or altered span is strictly rejected.
 */

export const spanVerifier = {
  /**
   * Verifies that candidate flags contain authentic, non-empty verbatim substrings of the original input.
   * @param {Array<{ span: string, category: string, reason: string }>} candidateFlags
   * @param {string} inputText - Original raw input string
   * @returns {Array<{ span: string, category: string, reason: string, startIndex: number, endIndex: number }>}
   */
  verifySpans(candidateFlags, inputText) {
    if (!Array.isArray(candidateFlags) || !inputText || typeof inputText !== 'string') {
      return [];
    }

    const verified = [];

    for (const flag of candidateFlags) {
      // 1. Confirm span is a string
      if (!flag || typeof flag.span !== 'string') {
        console.warn('[TrustGuard SpanVerifier] Rejected flag: span is not a valid string.');
        continue;
      }

      const trimmedSpan = flag.span.trim();

      // 2. Confirm span is not empty
      if (trimmedSpan.length === 0) {
        console.warn('[TrustGuard SpanVerifier] Rejected flag: span is empty.');
        continue;
      }

      // 3. Confirm span exists verbatim in original input
      const startIndex = inputText.indexOf(flag.span);
      if (startIndex === -1) {
        // Hallucinated or paraphrased span
        console.warn(`[TrustGuard SpanVerifier] Rejected hallucinated span: span does not exist verbatim in input.`);
        continue;
      }

      verified.push({
        span: flag.span,
        category: flag.category || 'OTHER',
        reason: flag.reason || 'Flagged security or privacy finding.',
        startIndex,
        endIndex: startIndex + flag.span.length,
      });
    }

    return verified;
  },
};
