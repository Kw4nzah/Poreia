import { describe, expect, it } from 'vitest';
import {
  CHURCHES,
  PeriodId,
  getDayInfo,
  getPeriods,
  getUpcomingFast,
  gregorianToJdn,
  jdnToGregorian,
  jdnToJulian,
  julianToJdn,
  paschaJdn,
  weekdayOfJdn,
} from './index';

const { greek, russian } = CHURCHES;
const d = (year: number, month: number, day: number) => ({ year, month, day });
const jdn = (year: number, month: number, day: number) => gregorianToJdn(year, month, day);
const period = (year: number, id: PeriodId, church: typeof greek | typeof russian) => {
  const p = getPeriods(year, church).find((r) => r.id === id);
  return (
    p && {
      start: jdnToGregorian(p.startJdn),
      end: jdnToGregorian(p.endJdn),
      len: p.endJdn - p.startJdn + 1,
    }
  );
};

// Orthodox Pascha (Gregorian civil dates) from published tables, independent of the code.
const PASCHA: [number, number, number][] = [
  [2024, 5, 5],
  [2025, 4, 20],
  [2026, 4, 12],
  [2027, 5, 2],
  [2028, 4, 16],
  [2029, 4, 8],
  [2030, 4, 28],
  [2031, 4, 13],
  [2032, 5, 2],
  [2033, 4, 24],
  [2034, 4, 9],
  [2035, 4, 29],
];

describe('Orthodox Pascha dates', () => {
  it.each(PASCHA)('Pascha %i is %i/%i and a Sunday', (year, month, day) => {
    const j = paschaJdn(year);
    expect(jdnToGregorian(j)).toEqual(d(year, month, day));
    expect(weekdayOfJdn(j)).toBe(0);
  });

  it('is always a Sunday, in the Julian year, between Julian 22 Mar+1 and 25 Apr', () => {
    for (let y = 1990; y <= 2100; y++) {
      const j = jdnToJulian(paschaJdn(y));
      expect(weekdayOfJdn(paschaJdn(y))).toBe(0);
      expect(j.year).toBe(y);
      const key = j.month * 100 + j.day;
      expect(key).toBeGreaterThanOrEqual(322);
      expect(key).toBeLessThanOrEqual(425);
    }
  });
});

describe('Pascha-anchored counts', () => {
  it.each(PASCHA)('year %i: Clean Monday is 48 days before Pascha', (y, m, dd) => {
    const lent = period(y, 'greatLent', greek)!;
    const p = jdn(y, m, dd);
    expect(lent.len).toBe(42); // Clean Monday to Palm Sunday inclusive
    expect(gregorianToJdn(lent.start.year, lent.start.month, lent.start.day)).toBe(p - 48);
    expect(weekdayOfJdn(p - 48)).toBe(1);
    expect(getDayInfo(lent.start, greek).daysToPascha).toBe(48);
    expect(getDayInfo(lent.start, greek).period).toMatchObject({ id: 'greatLent', day: 1 });
    expect(period(y, 'holyWeek', greek)!.len).toBe(6);
    expect(getDayInfo(d(y, m, dd), greek)).toMatchObject({ daysToPascha: 0, feasts: ['pascha'] });
    expect(getDayInfo(d(y, m, dd), greek).period).toMatchObject({
      id: 'brightWeek',
      day: 1,
      totalDays: 7,
    });
  });

  it('Clean Monday 2028, 2029 and 2030', () => {
    expect(period(2028, 'greatLent', greek)!.start).toEqual(d(2028, 2, 28));
    expect(period(2029, 'greatLent', greek)!.start).toEqual(d(2029, 2, 19));
    expect(period(2030, 'greatLent', greek)!.start).toEqual(d(2030, 3, 11));
  });

  it('Ascension and Pentecost are 39 and 49 days after Pascha', () => {
    expect(getDayInfo(d(2026, 5, 21), greek).feasts).toEqual(['ascension']);
    expect(getDayInfo(d(2026, 5, 31), greek).feasts).toEqual(['pentecost']);
    expect(getDayInfo(d(2027, 6, 20), greek).feasts).toEqual(['pentecost']);
  });
});

describe('fast boundaries', () => {
  it('Nativity Fast: 15 Nov-24 Dec (40 days) new calendar, 28 Nov-6 Jan old calendar', () => {
    for (const y of [2026, 2027, 2028, 2029, 2030]) {
      expect(period(y, 'nativityFast', greek)).toEqual({
        start: d(y, 11, 15),
        end: d(y, 12, 24),
        len: 40,
      });
      expect(period(y, 'nativityFast', russian)).toEqual({
        start: d(y, 11, 28),
        end: d(y + 1, 1, 6),
        len: 40,
      });
    }
  });

  it('Nativity Fast edges', () => {
    expect(getDayInfo(d(2026, 11, 14), greek).period).toBeNull();
    expect(getDayInfo(d(2026, 11, 15), greek).period?.id).toBe('nativityFast');
    expect(getDayInfo(d(2026, 12, 24), greek).period).toMatchObject({ day: 40, daysLeft: 0 });
    expect(getDayInfo(d(2026, 12, 25), greek).period?.id).toBe('christmastide');
    expect(getDayInfo(d(2026, 12, 25), greek).level).toBe('none');
    expect(getDayInfo(d(2026, 12, 25), greek).feasts).toEqual(['nativityOfChrist']);
    expect(getDayInfo(d(2027, 1, 6), russian).period).toMatchObject({ id: 'nativityFast', day: 40 });
    expect(getDayInfo(d(2027, 1, 7), russian).feasts).toEqual(['nativityOfChrist']);
    expect(getDayInfo(d(2027, 1, 7), russian).period?.id).toBe('christmastide');
  });

  it('Dormition Fast: 1-14 Aug new calendar, 14-27 Aug (Gregorian) old calendar', () => {
    for (const y of [2026, 2028, 2030]) {
      expect(period(y, 'dormitionFast', greek)).toEqual({ start: d(y, 8, 1), end: d(y, 8, 14), len: 14 });
      expect(period(y, 'dormitionFast', russian)).toEqual({ start: d(y, 8, 14), end: d(y, 8, 27), len: 14 });
    }
    expect(getDayInfo(d(2026, 8, 15), greek).feasts).toEqual(['dormition']);
    expect(getDayInfo(d(2026, 8, 15), greek).period).toBeNull();
    expect(getDayInfo(d(2026, 8, 28), russian).feasts).toEqual(['dormition']);
  });

  it("Apostles' Fast starts Pascha+57 (a Monday) and ends 28 June of the church calendar", () => {
    expect(period(2026, 'apostlesFast', greek)).toEqual({ start: d(2026, 6, 8), end: d(2026, 6, 28), len: 21 });
    expect(period(2026, 'apostlesFast', russian)).toEqual({ start: d(2026, 6, 8), end: d(2026, 7, 11), len: 34 });
    for (const y of [2026, 2027, 2028, 2029, 2030, 2035]) {
      const a = period(y, 'apostlesFast', russian)!;
      const start = gregorianToJdn(a.start.year, a.start.month, a.start.day);
      expect(weekdayOfJdn(start)).toBe(1);
      expect(start).toBe(paschaJdn(y) + 57);
      expect(jdnToJulian(gregorianToJdn(a.end.year, a.end.month, a.end.day))).toMatchObject({
        month: 6,
        day: 28,
      });
    }
  });

  it("Apostles' Fast on the new calendar is one day in 2032 and absent when Pascha+57 passes 28 June", () => {
    expect(period(2032, 'apostlesFast', greek)).toMatchObject({ len: 1 });
    for (let y = 2020; y <= 2100; y++) {
      const exists = !!period(y, 'apostlesFast', greek);
      expect(exists).toBe(paschaJdn(y) + 57 <= jdn(y, 6, 28));
    }
  });

  it('Trinity week is fast-free and the Apostles Fast follows it', () => {
    const p = paschaJdn(2026);
    expect(getDayInfo(jdnToGregorian(p + 50), greek).level).toBe('none');
    expect(getDayInfo(jdnToGregorian(p + 56), greek).period?.id).toBe('trinityWeek');
    expect(getDayInfo(jdnToGregorian(p + 57), greek).period?.id).toBe('apostlesFast');
  });

  it('periods of one year never overlap', () => {
    for (const church of [greek, russian]) {
      for (let y = 2020; y <= 2060; y++) {
        const ps = getPeriods(y, church)
          .slice()
          .sort((a, b) => a.startJdn - b.startJdn);
        for (let i = 1; i < ps.length; i++) {
          expect(ps[i].startJdn, `${church.id} ${y} ${ps[i - 1].id}/${ps[i].id}`).toBeGreaterThan(
            ps[i - 1].endJdn,
          );
        }
      }
    }
  });
});

describe('year rollover and leap years', () => {
  it('converts 29 Feb 2028 between calendars', () => {
    expect(jdnToJulian(gregorianToJdn(2028, 2, 29))).toEqual(d(2028, 2, 16));
    expect(jdnToGregorian(julianToJdn(2028, 2, 29))).toEqual(d(2028, 3, 13));
    expect(jdn(2028, 3, 1) - jdn(2028, 2, 28)).toBe(2);
    expect(jdn(2027, 3, 1) - jdn(2027, 2, 28)).toBe(1);
  });

  it('gives a sound DayInfo on 29 Feb 2028 (Great Lent, day 2)', () => {
    const g = getDayInfo(d(2028, 2, 29), greek);
    expect(g.weekday).toBe(2);
    expect(g.churchDate).toEqual(d(2028, 2, 29));
    expect(g.daysToPascha).toBe(47);
    expect(g.period).toMatchObject({ id: 'greatLent', day: 2, totalDays: 42 });
    expect(g.level).toBe('noOil');
    const r = getDayInfo(d(2028, 2, 29), russian);
    expect(r.churchDate).toEqual(d(2028, 2, 16));
    expect(r.level).toBe('noOil'); // Tuesday: Slavic dry-eating days are Mon/Wed/Fri
  });

  it('28 Feb, 29 Feb and 1 Mar 2028 are consecutive Lent days', () => {
    const days = [d(2028, 2, 28), d(2028, 2, 29), d(2028, 3, 1)].map(
      (x) => getDayInfo(x, greek).period!.day,
    );
    expect(days).toEqual([1, 2, 3]);
  });

  it('counts days to the next Pascha across the year boundary', () => {
    for (const x of [d(2026, 4, 13), d(2026, 12, 31), d(2027, 1, 1)]) {
      expect(getDayInfo(x, greek).daysToPascha).toBe(jdn(2027, 5, 2) - jdn(x.year, x.month, x.day));
    }
  });

  it('Christmastide crosses the new year; Theophany Eve and Theophany follow (Greek)', () => {
    for (const day of [1, 2, 3, 4]) {
      const i = getDayInfo(d(2027, 1, day), greek);
      expect(i.period?.id).toBe('christmastide');
      expect(i.level).toBe('none');
    }
    expect(getDayInfo(d(2027, 1, 5), greek).fastDay).toBe('theophanyEve');
    expect(getDayInfo(d(2027, 1, 6), greek).feasts).toEqual(['theophany']);
  });

  it('every day of 2028 (leap) and 2029 yields consistent period counters', () => {
    for (const y of [2028, 2029]) {
      const start = jdn(y, 1, 1);
      const days = jdn(y + 1, 1, 1) - start;
      expect(days).toBe(y === 2028 ? 366 : 365);
      for (let i = 0; i < days; i++) {
        for (const church of [greek, russian]) {
          const info = getDayInfo(jdnToGregorian(start + i), church);
          if (info.period) {
            expect(info.period.day).toBeGreaterThanOrEqual(1);
            expect(info.period.day).toBeLessThanOrEqual(info.period.totalDays);
            expect(info.period.daysLeft).toBe(info.period.totalDays - info.period.day);
          }
        }
      }
    }
  });

  it('upcoming fast only looks forward: from the eve of Clean Monday 2028 it is Great Lent, after it the Apostles Fast', () => {
    expect(getUpcomingFast(d(2028, 2, 27), greek)).toEqual({
      id: 'greatLent',
      start: d(2028, 2, 28),
      end: d(2028, 4, 15),
      daysUntil: 1,
    });
    // 29 Feb 2028 is inside Great Lent: the next fast to start is the Apostles Fast
    expect(getUpcomingFast(d(2028, 2, 29), greek).id).toBe('apostlesFast');
  });
});
