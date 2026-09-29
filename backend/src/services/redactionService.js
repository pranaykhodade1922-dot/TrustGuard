/**
 * TrustGuard AI — Redaction Engine
 * Generates protected text versions by replacing verified sensitive spans with [REDACTED] tokens.
 * Handles multiple spans and overlapping boundaries safely without corrupting surrounding text.
 */

export const redactionService = {
  /**
   * Redacts verified spans from the input text.
   * @param {string} inputText - Original raw text
   * @param {Array<{ span: string, category: string }>} verifiedFlags - Verified findings
   * @param {string} [replacementToken='[REDACTED]'] - Token to replace sensitive spans
   * @returns {string} Protected/redacted text string
   */
  redact(inputText, verifiedFlags = [], replacementToken = '[REDACTED]') {
    if (!inputText || typeof inputText !== 'string') return '';
    if (!Array.isArray(verifiedFlags) || verifiedFlags.length === 0) return inputText;

    // Collect all occurrence intervals [start, end] for all verified spans
    const intervals = [];

    for (const flag of verifiedFlags) {
      if (!flag || !flag.span || typeof flag.span !== 'string') continue;
      const span = flag.span;
      
      let searchIndex = 0;
      while ((searchIndex = inputText.indexOf(span, searchIndex)) !== -1) {
        intervals.push({
          start: searchIndex,
          end: searchIndex + span.length,
        });
        searchIndex += span.length;
      }
    }

    if (intervals.length === 0) return inputText;

    // 1. Sort intervals by start index ascending, then by end index descending
    intervals.sort((a, b) => a.start - b.start || b.end - a.end);

    // 2. Merge overlapping intervals
    const mergedIntervals = [];
    let current = intervals[0];

    for (let i = 1; i < intervals.length; i++) {
      const next = intervals[i];
      if (next.start <= current.end) {
        // Overlapping or adjacent
        current.end = Math.max(current.end, next.end);
      } else {
        mergedIntervals.push(current);
        current = next;
      }
    }
    mergedIntervals.push(current);

    // 3. Apply redactions from end to start to maintain index validity
    let result = inputText;
    for (let i = mergedIntervals.length - 1; i >= 0; i--) {
      const { start, end } = mergedIntervals[i];
      result = result.slice(0, start) + replacementToken + result.slice(end);
    }

    return result;
  },
};
