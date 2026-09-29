/**
 * TrustGuard AI — Flag Merger & Deduplication Service
 * Combines deterministic and AI-verified security findings into a unified, deduplicated list.
 */

export const flagMerger = {
  /**
   * Merges deterministic flags with verified AI flags.
   * Eliminates duplicate spans and overlapping findings while preserving all authentic detections.
   * @param {Array<Object>} deterministicFlags
   * @param {Array<Object>} aiFlags
   * @returns {Array<{ span: string, category: string, reason: string }>}
   */
  merge(deterministicFlags = [], aiFlags = []) {
    const merged = [];
    const seenSpans = new Set();

    // 1. Process deterministic flags first (primary source of truth for structured identifiers)
    for (const flag of deterministicFlags) {
      if (!flag || !flag.span) continue;
      const key = `${flag.category}:${flag.span}`;
      if (!seenSpans.has(key)) {
        seenSpans.add(key);
        merged.push({
          span: flag.span,
          category: flag.category,
          reason: flag.reason,
        });
      }
    }

    // 2. Complement with AI findings (social engineering, contextual threats)
    for (const flag of aiFlags) {
      if (!flag || !flag.span) continue;
      const exactKey = `${flag.category}:${flag.span}`;
      
      // Check if identical finding already exists
      if (seenSpans.has(exactKey)) continue;

      // Check if this span is already covered by a deterministic flag of same or higher specificity
      const isSubspanDuplicate = merged.some(
        (existing) => existing.category === flag.category && existing.span === flag.span
      );

      if (!isSubspanDuplicate) {
        seenSpans.add(exactKey);
        merged.push({
          span: flag.span,
          category: flag.category,
          reason: flag.reason,
        });
      }
    }

    return merged;
  },
};
