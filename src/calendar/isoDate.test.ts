import { describe, expect, it } from 'vitest';
import { formatIsoDate, parseIsoDate, shiftDay } from './isoDate';

describe('parseIsoDate', () => {
  it('reads real days', () => {
    expect(parseIsoDate('2026-11-18')).toEqual({ year: 2026, month: 11, day: 18 });
    expect(parseIsoDate('2028-02-29')).toEqual({ year: 2028, month: 2, day: 29 });
    expect(parseIsoDate('2000-01-01')).toEqual({ year: 2000, month: 1, day: 1 });
    expect(parseIsoDate('2200-12-31')).toEqual({ year: 2200, month: 12, day: 31 });
  });

  it('rejects invented days and odd spellings', () => {
    for (const bad of [
      '2027-02-29',
      '2100-02-29',
      '2026-13-01',
      '2026-00-10',
      '2026-04-31',
      '2026-04-00',
      '2026-1-5',
      '26-11-18',
      '2026/11/18',
      '2026-11-18T00:00',
      ' 2026-11-18',
      '2026-11-18 ',
      '2026-11-18\n',
      '１２３４-11-18',
      '1999-12-31',
      '2201-01-01',
      '',
    ]) {
      expect(parseIsoDate(bad), bad).toBeNull();
    }
  });

  it('rejects values that are not strings', () => {
    for (const bad of [undefined, null, 20261118, ['2026-11-18'], {}, true]) {
      expect(parseIsoDate(bad)).toBeNull();
    }
  });
});

describe('formatIsoDate', () => {
  it('pads and round-trips', () => {
    expect(formatIsoDate({ year: 2026, month: 3, day: 5 })).toBe('2026-03-05');
    const date = { year: 2030, month: 12, day: 31 };
    expect(parseIsoDate(formatIsoDate(date))).toEqual(date);
  });
});

describe('shiftDay', () => {
  it('moves across month and year ends', () => {
    expect(shiftDay({ year: 2026, month: 12, day: 31 }, 1)).toEqual({
      year: 2027,
      month: 1,
      day: 1,
    });
    expect(shiftDay({ year: 2026, month: 3, day: 1 }, -1)).toEqual({
      year: 2026,
      month: 2,
      day: 28,
    });
    expect(shiftDay({ year: 2028, month: 3, day: 1 }, -1)).toEqual({
      year: 2028,
      month: 2,
      day: 29,
    });
  });

  it('stops at the edges of the supported range', () => {
    expect(shiftDay({ year: 2000, month: 1, day: 1 }, -1)).toBeNull();
    expect(shiftDay({ year: 2200, month: 12, day: 31 }, 1)).toBeNull();
  });
});
