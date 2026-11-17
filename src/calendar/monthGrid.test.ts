import { describe, expect, it } from 'vitest';
import { buildMonthGrid, daysInMonth, isLeapYear, leadingBlanks, shiftMonth } from './monthGrid';

describe('month grid', () => {
  it('knows leap years', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2026, 11)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });

  it('shifts Monday-first: 1 Nov 2026 is a Sunday, 1 Jun 2026 a Monday', () => {
    expect(leadingBlanks(2026, 11)).toBe(6);
    expect(leadingBlanks(2026, 6)).toBe(0);
  });

  it('builds full weeks padded with null', () => {
    const weeks = buildMonthGrid(2026, 11);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks[0].slice(0, 6).every((c) => c === null)).toBe(true);
    expect(weeks[0][6]).toEqual({ year: 2026, month: 11, day: 1 });
    expect(weeks.flat().filter(Boolean)).toHaveLength(30);
    // 1 Jun 2026 is a Monday and June has 30 days: five weeks.
    expect(buildMonthGrid(2026, 6)).toHaveLength(5);
    // Feb 2027 starts on a Monday and has 28 days: exactly four weeks.
    expect(buildMonthGrid(2027, 2)).toHaveLength(4);
  });

  it('shifts months across years', () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftMonth(2026, 3, -15)).toEqual({ year: 2024, month: 12 });
  });
});
