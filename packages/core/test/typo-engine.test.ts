import { describe, it, expect } from 'vitest';
import { calculateDistance, calculateSimilarity, findClosest } from '../src/services/typo-engine.js';

describe('TypoEngine Service', () => {
  it('correctly calculates Levenshtein distance', () => {
    expect(calculateDistance('paddng-4', 'padding-4')).toBe(1);
    expect(calculateDistance('flx', 'flex')).toBe(1);
    expect(calculateDistance('bg-blu-500', 'bg-blue-500')).toBe(1);
    expect(calculateDistance('identical', 'identical')).toBe(0);
    expect(calculateDistance('', 'abc')).toBe(3);
  });

  it('correctly computes similarity ratios', () => {
    expect(calculateSimilarity('test', 'test')).toBe(1.0);
    expect(calculateSimilarity('flx', 'flex')).toBeGreaterThan(0.7);
  });

  it('finds the closest match from a given dictionary', () => {
    const dictionary = ['flex', 'grid', 'block', 'hidden', 'p-4', 'm-4', 'bg-blue-500'];

    const result1 = findClosest('flx', dictionary, 2);
    expect(result1).not.toBeNull();
    expect(result1?.match).toBe('flex');
    expect(result1?.distance).toBe(1);

    const result2 = findClosest('bg-blu-500', dictionary, 2);
    expect(result2).not.toBeNull();
    expect(result2?.match).toBe('bg-blue-500');

    const result3 = findClosest('completely_unknown_token', dictionary, 2);
    expect(result3).toBeNull();
  });
});
