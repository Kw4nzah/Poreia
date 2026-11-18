import { describe, expect, it, vi } from 'vitest';
import { CHURCHES, CivilDate, getDayInfo, gregorianToJdn } from '../calendar';
import { computeStats, currentStreak, doneDaysFromEntries, parseDoneKey } from './log';

const d = (year: number, month: number, day: number): CivilDate => ({ year, month, day });
const j = (year: number, month: number, day: number) => gregorianToJdn(year, month, day);
const days = (...list: [number, number, number][]) => new Set(list.map((x) => j(...x)));

const isFasting = (date: CivilDate) => getDayInfo(date, CHURCHES.greek).level !== 'none';

describe('parseDoneKey', () => {
  it('reads valid keys', () => {
    expect(parseDoneKey('poreia.done.2026-11-17')).toEqual(d(2026, 11, 17));
    expect(parseDoneKey('poreia.done.2028-02-29')).toEqual(d(2028, 2, 29));
  });

  it.each([
    'poreia.done.2026-02-30',
    'poreia.done.2027-02-29',
    'poreia.done.2026-13-01',
    'poreia.done.2026-00-10',
    'poreia.done.2026-1-5',
    'poreia.done.2026-11-17 ',
    'poreia.done.',
    'poreia.done.0001-01-01',
    'poreia.done.9999-01-01',
    'poreia.settings',
    'other.poreia.done.2026-11-17',
  ])('rejects %s', (key) => {
    expect(parseDoneKey(key)).toBeNull();
  });

  it('rejects non-strings without throwing', () => {
    for (const bad of [null, undefined, 5, {}, ['poreia.done.2026-11-17']]) {
      expect(parseDoneKey(bad)).toBeNull();
    }
  });
});

describe('doneDaysFromEntries', () => {
  it('keeps only valid keys with the marked value', () => {
    const result = doneDaysFromEntries([
      ['poreia.done.2026-11-17', '1'],
      ['poreia.done.2026-11-18', '0'],
      ['poreia.done.2026-11-19', 'true'],
      ['poreia.done.2026-11-20', null],
      ['poreia.done.2026-11-21', 1],
      ['poreia.done.2026-02-31', '1'],
      ['poreia.settings', '1'],
      [null, '1'],
      ['poreia.done.2026-11-22', '1'],
    ]);
    expect([...result].sort()).toEqual([j(2026, 11, 17), j(2026, 11, 22)]);
  });

  it('accepts an empty list', () => {
    expect(doneDaysFromEntries([]).size).toBe(0);
  });
});

describe('currentStreak (synthetic fasting days)', () => {
  // Fasting every day except days divisible by 5 (by day-of-month), to test skipping.
  const skipFifth = (date: CivilDate) => date.day % 5 !== 0;

  it('is 0 with no marks and does not walk the calendar', () => {
    const spy = vi.fn(() => true);
    expect(currentStreak(d(2026, 11, 17), new Set(), spy)).toBe(0);
    expect(spy).not.toHaveBeenCalled();
  });

  it('counts consecutive marked days ending today', () => {
    const done = days([2026, 11, 16], [2026, 11, 17], [2026, 11, 18]);
    expect(currentStreak(d(2026, 11, 18), done, () => true)).toBe(3);
  });

  it('an open today does not break the streak', () => {
    const done = days([2026, 11, 16], [2026, 11, 17]);
    expect(currentStreak(d(2026, 11, 18), done, () => true)).toBe(2);
  });

  it('a missed fasting day in the past ends the streak', () => {
    const done = days([2026, 11, 14], [2026, 11, 16], [2026, 11, 17], [2026, 11, 18]);
    expect(currentStreak(d(2026, 11, 18), done, () => true)).toBe(3);
  });

  it('skips days without a fast without breaking or adding', () => {
    // 15th is not a fasting day, 14th and 16th are marked.
    const done = days([2026, 11, 13], [2026, 11, 14], [2026, 11, 16], [2026, 11, 17]);
    expect(currentStreak(d(2026, 11, 17), done, skipFifth)).toBe(4);
  });

  it('is not broken by a non-fasting today and counts back from the last fasting day', () => {
    const done = days([2026, 11, 13], [2026, 11, 14]);
    expect(currentStreak(d(2026, 11, 15), done, skipFifth)).toBe(2);
  });

  it('a mark on a non-fasting day does not count', () => {
    const done = days([2026, 11, 14], [2026, 11, 15], [2026, 11, 16]);
    expect(currentStreak(d(2026, 11, 16), done, skipFifth)).toBe(2);
  });

  it('crosses month and year boundaries', () => {
    const done = days([2026, 12, 30], [2026, 12, 31], [2027, 1, 1], [2027, 1, 2]);
    expect(currentStreak(d(2027, 1, 2), done, () => true)).toBe(4);
  });

  it('ignores marks in the future', () => {
    const done = days([2026, 11, 17], [2026, 11, 18], [2026, 11, 19]);
    expect(currentStreak(d(2026, 11, 18), done, () => true)).toBe(2);
  });
});

describe('real calendar', () => {
  it('Great Lent: a Wednesday and Friday of the Nativity fast are fasting days, a Sunday after Pascha is not', () => {
    // Sanity of the fixtures used below.
    expect(isFasting(d(2026, 12, 24))).toBe(true); // Eve of Nativity
    expect(isFasting(d(2026, 12, 28))).toBe(false); // Christmastide
    expect(isFasting(d(2027, 1, 5))).toBe(true); // Eve of Theophany
  });

  it('the streak survives the fast-free Christmastide across the year boundary', () => {
    const done = days([2026, 12, 23], [2026, 12, 24], [2027, 1, 5]);
    expect(currentStreak(d(2027, 1, 5), done, isFasting)).toBe(3);
    // The next fasting day not yet marked still keeps it alive, a missed one ends it.
    expect(currentStreak(d(2027, 1, 6), done, isFasting)).toBe(3);
    expect(currentStreak(d(2027, 1, 7), done, isFasting)).toBe(3); // 6th and 7th are free
    expect(currentStreak(d(2027, 1, 8), done, isFasting)).toBe(3); // Friday today, open
    expect(currentStreak(d(2027, 1, 11), done, isFasting)).toBe(0); // Friday the 8th was missed
  });

  it('is unaffected by the device timezone: only civil dates are used', () => {
    const original = process.env.TZ;
    const done = days([2026, 3, 28], [2026, 3, 29]); // around the EU DST change
    const results = ['UTC', 'Pacific/Auckland', 'America/Los_Angeles'].map((tz) => {
      process.env.TZ = tz;
      return currentStreak(d(2026, 3, 29), done, () => true);
    });
    process.env.TZ = original;
    expect(results).toEqual([2, 2, 2]);
  });
});

describe('computeStats', () => {
  it('counts the year only within the calendar year of today, on fasting days', () => {
    const done = days(
      [2026, 12, 23],
      [2026, 12, 24],
      [2026, 12, 28], // not a fasting day: ignored
      [2027, 1, 5],
      [2027, 1, 8],
    );
    const stats = computeStats(d(2027, 1, 8), done, isFasting, null);
    expect(stats.year).toBe(2); // Jan 5 and Jan 8 2027
    expect(computeStats(d(2026, 12, 24), done, isFasting, null).year).toBe(2); // Dec 23 and 24
    expect(stats.fast).toBeNull();
  });

  it('counts the current fast against its fasting days', () => {
    // Dormition fast 2026: 1 to 14 August, every day fasting.
    const done = days([2026, 8, 1], [2026, 8, 2], [2026, 8, 3], [2026, 7, 31]);
    const info = getDayInfo(d(2026, 8, 3), CHURCHES.greek);
    expect(info.period?.id).toBe('dormitionFast');
    const stats = computeStats(d(2026, 8, 3), done, isFasting, info.period);
    expect(stats.fast).toEqual({ id: 'dormitionFast', completed: 3, total: 14 });
    expect(stats.streak).toBe(4);
    expect(stats.year).toBe(4);
  });

  it('a fast that spans the new year counts marks from both years', () => {
    const info = getDayInfo(d(2027, 1, 5), CHURCHES.greek);
    const stats = computeStats(
      d(2027, 1, 5),
      days([2026, 12, 24], [2027, 1, 5]),
      isFasting,
      info.period,
    );
    expect(stats.year).toBe(1);
    expect(stats.streak).toBe(2);
  });
});
