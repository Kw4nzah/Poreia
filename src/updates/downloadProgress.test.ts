import { describe, expect, it } from 'vitest';
import { computeProgress, formatMegabytes } from './downloadProgress';

describe('computeProgress', () => {
  it('computes the percentage of a known total', () => {
    expect(computeProgress(25, 100)).toEqual({
      written: 25,
      total: 100,
      fraction: 0.25,
      percent: 25,
    });
  });

  it('starts at 0 percent with 0 bytes', () => {
    expect(computeProgress(0, 1000).percent).toBe(0);
    expect(computeProgress(0, 1000).fraction).toBe(0);
  });

  it('rounds down, so 100 means complete', () => {
    expect(computeProgress(999, 1000).percent).toBe(99);
    expect(computeProgress(1000, 1000).percent).toBe(100);
  });

  it('clamps bytes above the total', () => {
    expect(computeProgress(1500, 1000)).toEqual({
      written: 1000,
      total: 1000,
      fraction: 1,
      percent: 100,
    });
  });

  it('has no percentage when the total is unknown', () => {
    for (const total of [-1, 0, NaN, null, undefined, Infinity]) {
      expect(computeProgress(500, total)).toEqual({
        written: 500,
        total: null,
        fraction: null,
        percent: null,
      });
    }
  });

  it('falls back to the expected total when the server reports none', () => {
    expect(computeProgress(50, -1, 200)).toMatchObject({ total: 200, percent: 25 });
    expect(computeProgress(50, 100, 200)).toMatchObject({ total: 100, percent: 50 });
  });

  it('treats negative or invalid byte counts as 0', () => {
    expect(computeProgress(-5, 100).written).toBe(0);
    expect(computeProgress(NaN, 100).percent).toBe(0);
  });
});

describe('formatMegabytes', () => {
  it('uses one decimal and the language decimal mark', () => {
    expect(formatMegabytes(12_345_678, 'en')).toBe('12.3');
    expect(formatMegabytes(12_345_678, 'tr')).toBe('12,3');
    expect(formatMegabytes(12_345_678, 'ru')).toBe('12,3');
  });

  it('handles zero and invalid input', () => {
    expect(formatMegabytes(0, 'en')).toBe('0.0');
    expect(formatMegabytes(-1, 'en')).toBe('0.0');
    expect(formatMegabytes(NaN, 'tr')).toBe('0,0');
  });
});
