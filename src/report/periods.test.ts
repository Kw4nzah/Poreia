import { describe, expect, it } from 'vitest';
import { CHURCHES, gregorianToJdn, jdnToGregorian, paschaJdn } from '../calendar';
import {
  REPORT_FAST_IDS,
  getFastPeriod,
  getFastPeriodsOfYear,
  parsePeriodKey,
  periodKey,
} from './periods';

const { greek, russian } = CHURCHES;
const jdn = (year: number, month: number, day: number) => gregorianToJdn(year, month, day);

describe('getFastPeriod', () => {
  it('Great Lent runs from Clean Monday through Holy Week to the eve of Pascha', () => {
    const lent = getFastPeriod('greatLent', 2027, greek)!;
    expect(lent.startJdn).toBe(jdn(2027, 3, 15));
    expect(lent.endJdn).toBe(paschaJdn(2027) - 1);
    expect(lent.endJdn - lent.startJdn + 1).toBe(48);
  });

  it('follows a moved Pascha in any year', () => {
    for (const year of [2026, 2028, 2031, 2045]) {
      const lent = getFastPeriod('greatLent', year, greek)!;
      expect(lent.endJdn).toBe(paschaJdn(year) - 1);
      expect(lent.startJdn).toBe(paschaJdn(year) - 48);
    }
  });

  it('Great Lent of a leap year contains 29 February', () => {
    const lent = getFastPeriod('greatLent', 2028, greek)!;
    expect(jdnToGregorian(lent.startJdn)).toEqual({ year: 2028, month: 2, day: 28 });
    expect(lent.startJdn + 1).toBe(jdn(2028, 2, 29));
    expect(lent.endJdn - lent.startJdn + 1).toBe(48);
  });

  it('the Nativity Fast stays in one year on the revised calendar', () => {
    const fast = getFastPeriod('nativityFast', 2026, greek)!;
    expect(fast.startJdn).toBe(jdn(2026, 11, 15));
    expect(fast.endJdn).toBe(jdn(2026, 12, 24));
  });

  it('the Nativity Fast of the Julian calendar crosses New Year and keeps its anchor year', () => {
    const fast = getFastPeriod('nativityFast', 2026, russian)!;
    expect(jdnToGregorian(fast.startJdn)).toEqual({ year: 2026, month: 11, day: 28 });
    expect(jdnToGregorian(fast.endJdn)).toEqual({ year: 2027, month: 1, day: 6 });
    expect(fast.year).toBe(2026);
    expect(fast.endJdn - fast.startJdn + 1).toBe(40);
  });

  it('gives the Dormition Fast its fixed dates on each calendar', () => {
    const revised = getFastPeriod('dormitionFast', 2027, greek)!;
    expect([revised.startJdn, revised.endJdn]).toEqual([jdn(2027, 8, 1), jdn(2027, 8, 14)]);
    const julian = getFastPeriod('dormitionFast', 2027, russian)!;
    expect([julian.startJdn, julian.endJdn]).toEqual([jdn(2027, 8, 14), jdn(2027, 8, 27)]);
  });

  it('the Apostles’ Fast starts the Monday after the week after Pentecost', () => {
    const fast = getFastPeriod('apostlesFast', 2026, russian)!;
    expect(fast.startJdn).toBe(paschaJdn(2026) + 57);
    expect(fast.endJdn).toBe(jdn(2026, 7, 11)); // 28 June, Julian
  });

  it('never returns an empty or backwards stretch, over many years and both churches', () => {
    for (const church of [greek, russian]) {
      for (let year = 2000; year <= 2100; year++) {
        for (const period of getFastPeriodsOfYear(year, church)) {
          expect(period.endJdn).toBeGreaterThanOrEqual(period.startJdn);
        }
      }
    }
  });

  it('lists a year earliest first, the Nativity Fast last', () => {
    const periods = getFastPeriodsOfYear(2027, russian);
    expect(periods.map((p) => p.id)).toEqual([
      'greatLent',
      'apostlesFast',
      'dormitionFast',
      'nativityFast',
    ]);
    for (let i = 1; i < periods.length; i++) {
      expect(periods[i].startJdn).toBeGreaterThan(periods[i - 1].endJdn);
    }
  });
});

describe('period keys', () => {
  it('round-trips every fast', () => {
    for (const id of REPORT_FAST_IDS) {
      expect(parsePeriodKey(periodKey({ id, year: 2027 }))).toEqual({ id, year: 2027 });
    }
  });

  it('rejects anything that is not a fast and a sensible year', () => {
    for (const bad of [
      '',
      'greatLent',
      'greatLent-27',
      'greatLent-1999',
      'greatLent-2201',
      'holyWeek-2027',
      '__proto__-2027',
      'greatLent-2027-x',
      undefined,
      null,
      7,
      {},
    ]) {
      expect(parsePeriodKey(bad)).toBeNull();
    }
  });
});
