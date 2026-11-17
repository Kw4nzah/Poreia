import { describe, expect, it } from 'vitest';
import { doneKey, isDone, toggledValue } from './done';

describe('doneKey', () => {
  it('is poreia.done.YYYY-MM-DD with zero padding', () => {
    expect(doneKey({ year: 2026, month: 11, day: 17 })).toBe('poreia.done.2026-11-17');
    expect(doneKey({ year: 2027, month: 3, day: 5 })).toBe('poreia.done.2027-03-05');
  });
});

describe('done state', () => {
  it('only the stored mark counts as done', () => {
    expect(isDone('1')).toBe(true);
    expect(isDone(null)).toBe(false);
    expect(isDone(undefined)).toBe(false);
    expect(isDone('')).toBe(false);
    expect(isDone('true')).toBe(false);
  });

  it('a tap marks an unmarked day and un-marks a marked one', () => {
    expect(toggledValue(null)).toBe('1');
    expect(toggledValue('1')).toBeNull();
    // Garbage in storage counts as not done, so one tap marks it properly.
    expect(toggledValue('x')).toBe('1');
    // Two taps are back where they started.
    expect(toggledValue(toggledValue(null))).toBeNull();
  });
});
