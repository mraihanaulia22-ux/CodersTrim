import type { LintIssue } from '../types/lint.js';

export interface PatchResult {
  patchedContent: string;
  appliedCount: number;
}

/**
 * Applies fixes using reverse-offset patching.
 * Sorts issues in descending order of character start index so earlier replacements
 * do not shift the character offsets of subsequent replacements.
 */
export function applyReverseOffsetPatches(
  originalContent: string,
  issues: LintIssue[]
): PatchResult {
  if (issues.length === 0) {
    return {
      patchedContent: originalContent,
      appliedCount: 0,
    };
  }

  // Filter issues with valid ranges and sort in descending order of range[0]
  const sortedIssues = [...issues]
    .filter((issue) => Array.isArray(issue.range) && issue.range.length === 2 && issue.range[0] >= 0)
    .sort((a, b) => b.range[0] - a.range[0]);

  let currentContent = originalContent;
  let appliedCount = 0;

  for (const issue of sortedIssues) {
    const [start, end] = issue.range;

    // Safety bounds check
    if (start < 0 || end > currentContent.length || start > end) {
      continue;
    }

    // Verify target content matches expected original to prevent accidental overwrite
    const actualSnippet = currentContent.slice(start, end);
    if (actualSnippet !== issue.original) {
      // Offset was invalidated or snippet mismatch, skip for safety
      continue;
    }

    const before = currentContent.slice(0, start);
    const after = currentContent.slice(end);

    currentContent = before + issue.suggested + after;
    appliedCount++;
  }

  return {
    patchedContent: currentContent,
    appliedCount,
  };
}
