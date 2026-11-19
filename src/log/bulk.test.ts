import { describe, expect, it } from 'vitest';
import { CivilDate, gregorianToJdn } from '../calendar';
import { bulkActions, isMarkableDay, jdnOf, toggleSelected } from './bulk';

const d = (year: number, month: number, day: number): CivilDate => ({ year, month, day });
const j = (year: number, month: number, day: number) => gregorianToJdn(year, month, day);
const today = d(2026, 11, 19);

describe('isMarkableDay', () => {
  it('allows a fasting day that is today or earlier', () => {
    expect(isMarkableDay(today, today, 'noMeat')).toBe(true);
    expect(isMarkableDay(d(2026, 11, 18), today, 'xerophagy')).toBe(true);
    expect(isMarkableDay(d(2025, 1, 1), today, 'fish')).toBe(true);
  });

  it('refuses days to come, whatever their level', () => {
    expect(isMarkableDay(d(2026, 11, 20), today, 'noOil')).toBe(false);
    expect(isMarkableDay(d(2027, 1, 1), today, 'oil')).toBe(false);
  });

  it('refuses days without a fast', () => {
    expect(isMarkableDay(d(2026, 11, 18), today, 'none')).toBe(false);
    expect(isMarkableDay(today, today, 'none')).toBe(false);
  });

  it('compares across month and year ends', () => {
    expect(isMarkableDay(d(2026, 12, 31), d(2027, 1, 1), 'fish')).toBe(true);
    expect(isMarkableDay(d(2027, 1, 1), d(2026, 12, 31), 'fish')).toBe(false);
  });
});

describe('toggleSelected', () => {
  it('adds a missing day and removes a present one without mutating', () => {
    const empty: ReadonlySet<number> = new Set();
    const one = toggleSelected(empty, j(2026, 11, 18));
    expect([...one]).toEqual([j(2026, 11, 18)]);
    expect(empty.size).toBe(0);
    const none = toggleSelected(one, j(2026, 11, 18));
    expect(none.size).toBe(0);
    expect(one.size).toBe(1);
  });
});

describe('bulkActions', () => {
  const done = new Set([j(2026, 11, 17)]);

  it('offers nothing for an empty selection', () => {
    expect(bulkActions(new Set(), done)).toEqual({ canMark: false, canClear: false });
  });

  it('offers marking for unmarked days and clearing for marked ones', () => {
    expect(bulkActions(new Set([j(2026, 11, 18)]), done)).toEqual({
      canMark: true,
      canClear: false,
    });
    expect(bulkActions(new Set([j(2026, 11, 17)]), done)).toEqual({
      canMark: false,
      canClear: true,
    });
    expect(bulkActions(new Set([j(2026, 11, 17), j(2026, 11, 18)]), done)).toEqual({
      canMark: true,
      canClear: true,
    });
  });
});

describe('jdnOf', () => {
  it('matches the calendar day number', () => {
    expect(jdnOf(d(2026, 11, 19))).toBe(j(2026, 11, 19));
  });
});
