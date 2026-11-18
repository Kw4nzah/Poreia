import { describe, expect, it } from 'vitest';
import { titleFontSize } from './layout';

describe('titleFontSize', () => {
  it('keeps the full size when the longest word fits', () => {
    expect(titleFontSize('Great Lent 2027', 312, 1)).toBe(44);
  });

  it('shrinks for a long Russian word on a 320dp phone, never below the floor', () => {
    const size = titleFontSize('Рождественский пост 2026', 272, 1);
    expect(size).toBeLessThan(44);
    expect(size).toBeGreaterThanOrEqual(24);
    // The word fits the line at that size.
    expect('Рождественский'.length * 0.6 * size).toBeLessThanOrEqual(272);
  });

  it('accounts for the system font size, but only up to the title cap', () => {
    const normal = titleFontSize('Апостольский пост 2027', 272, 1);
    const large = titleFontSize('Апостольский пост 2027', 272, 1.2);
    const huge = titleFontSize('Апостольский пост 2027', 272, 2);
    expect(large).toBeLessThanOrEqual(normal);
    expect(huge).toBe(large);
  });

  it('handles an empty title', () => {
    expect(titleFontSize('', 272, 1)).toBe(44);
  });
});
