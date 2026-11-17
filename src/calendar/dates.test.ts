import { describe, expect, it } from 'vitest';
import {
  CHURCHES,
  civilFromLocalDate,
  getDayInfo,
  getUpcomingFast,
  gregorianToJdn,
  isLeapYear,
  isSameCivilDate,
  jdnToGregorian,
  jdnToJulian,
  julianToJdn,
  msUntilNextLocalMidnight,
  weekdayOfJdn,
} from './index';

const HOUR = 60 * 60 * 1000;

describe('Julian day numbers', () => {
  it('round-trips every day from 1900 to 2100 in both calendars', () => {
    for (let jdn = gregorianToJdn(1900, 1, 1); jdn <= gregorianToJdn(2100, 12, 31); jdn++) {
      const g = jdnToGregorian(jdn);
      expect(gregorianToJdn(g.year, g.month, g.day)).toBe(jdn);
      const j = jdnToJulian(jdn);
      expect(julianToJdn(j.year, j.month, j.day)).toBe(jdn);
    }
  });

  it('knows the leap-year rules (1900 and 2100 are not leap, 2000 and 2028 are)', () => {
    expect([1900, 2000, 2026, 2028, 2100].map(isLeapYear)).toEqual([
      false,
      true,
      false,
      true,
      false,
    ]);
    for (const [year, leap] of [
      [1900, false],
      [2000, true],
      [2028, true],
      [2100, false],
    ] as const) {
      const length = gregorianToJdn(year + 1, 1, 1) - gregorianToJdn(year, 1, 1);
      expect(length).toBe(leap ? 366 : 365);
    }
  });

  it('steps over the end of February correctly', () => {
    const feb28 = gregorianToJdn(2028, 2, 28);
    expect(jdnToGregorian(feb28 + 1)).toEqual({ year: 2028, month: 2, day: 29 });
    expect(jdnToGregorian(feb28 + 2)).toEqual({ year: 2028, month: 3, day: 1 });
    const feb28b = gregorianToJdn(2027, 2, 28);
    expect(jdnToGregorian(feb28b + 1)).toEqual({ year: 2027, month: 3, day: 1 });
  });

  it('steps over the year boundary in both calendars', () => {
    const dec31 = gregorianToJdn(2026, 12, 31);
    expect(jdnToGregorian(dec31 + 1)).toEqual({ year: 2027, month: 1, day: 1 });
    // 1 Jan (Gregorian) is 19 Dec of the previous year in the Julian calendar (2026 to 2099).
    expect(jdnToJulian(dec31 + 1)).toEqual({ year: 2026, month: 12, day: 19 });
  });

  it('finds the weekday of known dates', () => {
    expect(weekdayOfJdn(gregorianToJdn(2026, 11, 18))).toBe(3); // Wednesday
    expect(weekdayOfJdn(gregorianToJdn(2000, 1, 1))).toBe(6); // Saturday
    expect(weekdayOfJdn(gregorianToJdn(2028, 2, 29))).toBe(2); // Tuesday
  });
});

describe('local dates', () => {
  it('reads the civil date in the device timezone', () => {
    expect(civilFromLocalDate(new Date(2028, 1, 29, 23, 59, 59))).toEqual({
      year: 2028,
      month: 2,
      day: 29,
    });
    expect(civilFromLocalDate(new Date(2027, 0, 1, 0, 0, 0))).toEqual({
      year: 2027,
      month: 1,
      day: 1,
    });
  });

  it('compares civil dates by value', () => {
    expect(
      isSameCivilDate({ year: 2026, month: 5, day: 1 }, { year: 2026, month: 5, day: 1 }),
    ).toBe(true);
    expect(
      isSameCivilDate({ year: 2026, month: 5, day: 1 }, { year: 2027, month: 5, day: 1 }),
    ).toBe(false);
    expect(
      isSameCivilDate({ year: 2026, month: 5, day: 1 }, { year: 2026, month: 5, day: 2 }),
    ).toBe(false);
  });

  it('waits until one second past the next local midnight', () => {
    const now = new Date(2026, 10, 18, 23, 0, 0);
    expect(msUntilNextLocalMidnight(now)).toBe(HOUR + 1000);
    expect(new Date(now.getTime() + msUntilNextLocalMidnight(now))).toEqual(
      new Date(2026, 10, 19, 0, 0, 1),
    );
  });

  it('never waits less than a second or more than a day and an hour, whatever the date', () => {
    // Covers every month end, the year end, the leap day and the DST changes of the test machine.
    for (let jdn = gregorianToJdn(2027, 12, 1); jdn <= gregorianToJdn(2028, 12, 31); jdn++) {
      const { year, month, day } = jdnToGregorian(jdn);
      for (const hour of [0, 1, 2, 3, 12, 23]) {
        const now = new Date(year, month - 1, day, hour, 30, 0);
        const wait = msUntilNextLocalMidnight(now);
        expect(wait).toBeGreaterThanOrEqual(1000);
        expect(wait).toBeLessThanOrEqual(25 * HOUR + 1000);
        // Lands on the next calendar day, never on the same one.
        const landing = civilFromLocalDate(new Date(now.getTime() + wait));
        expect(gregorianToJdn(landing.year, landing.month, landing.day)).toBe(jdn + 1);
      }
    }
  });
});

describe('calendar engine sweep', () => {
  it('gives a sound answer for every day of 2026-2031 in both churches', () => {
    const start = gregorianToJdn(2026, 1, 1);
    const end = gregorianToJdn(2031, 12, 31);
    for (const church of Object.values(CHURCHES)) {
      for (let jdn = start; jdn <= end; jdn++) {
        const date = jdnToGregorian(jdn);
        const info = getDayInfo(date, church);
        expect(info.weekday).toBe(weekdayOfJdn(jdn));
        expect(info.daysToPascha).toBeGreaterThanOrEqual(0);
        expect(info.daysToPascha).toBeLessThanOrEqual(385);
        const upcoming = getUpcomingFast(date, church);
        expect(upcoming.daysUntil).toBeGreaterThan(0);
        expect(upcoming.daysUntil).toBeLessThanOrEqual(366);
      }
    }
  });
});
