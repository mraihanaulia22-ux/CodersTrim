/**
 * Calculates the Levenshtein distance between two strings.
 * Space-optimized dynamic programming implementation O(min(m, n)).
 */
export function calculateDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const v0: number[] = new Array<number>(b.length + 1);
  const v1: number[] = new Array<number>(b.length + 1);

  for (let i = 0; i <= b.length; i++) {
    v0[i] = i;
  }

  for (let i = 0; i < a.length; i++) {
    v1[0] = i + 1;

    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      const insertion = (v1[j] ?? 0) + 1;
      const deletion = (v0[j + 1] ?? 0) + 1;
      const substitution = (v0[j] ?? 0) + cost;

      v1[j + 1] = Math.min(insertion, deletion, substitution);
    }

    for (let j = 0; j <= b.length; j++) {
      v0[j] = v1[j] ?? 0;
    }
  }

  return v1[b.length] ?? 0;
}

/**
 * Calculates similarity percentage (0.0 to 1.0).
 */
export function calculateSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  const distance = calculateDistance(a, b);
  return 1.0 - distance / maxLen;
}

/**
 * Finds the closest matching string from a dictionary within an allowed distance threshold.
 */
export function findClosest(
  input: string,
  dictionary: string[],
  maxDistance: number = 2
): { match: string; distance: number; similarity: number } | null {
  let bestMatch: string | null = null;
  let minDistance = Infinity;

  const normalizedInput = input.trim().toLowerCase();

  for (const candidate of dictionary) {
    const normalizedCandidate = candidate.trim().toLowerCase();
    const dist = calculateDistance(normalizedInput, normalizedCandidate);

    if (dist < minDistance && dist <= maxDistance) {
      minDistance = dist;
      bestMatch = candidate;
    }
  }

  if (bestMatch === null) {
    return null;
  }

  const similarity = calculateSimilarity(input, bestMatch);
  return {
    match: bestMatch,
    distance: minDistance,
    similarity,
  };
}
