import { describe, expect, it } from 'vitest';
import { COMMEMORATION_YEARS, getCommemoration } from './index';

const CHURCHES = ['greek', 'russian'] as const;

describe('getCommemoration lookup edge cases', () => {
  it('has the leap day in 2028 and no 29 February in the other years', () => {
    for (const church of CHURCHES) {
      const leap = getCommemoration({ year: 2028, month: 2, day: 29 }, church);
      expect(leap?.names.length).toBeGreaterThan(0);
      for (const year of [2026, 2027, 2029, 2030]) {
        expect(getCommemoration({ year, month: 2, day: 29 }, church)).toBeNull();
      }
    }
  });

  it('answers on both sides of every year boundary and stops at the edges of the bundled range', () => {
    for (const church of CHURCHES) {
      for (const year of COMMEMORATION_YEARS) {
        expect(getCommemoration({ year, month: 1, day: 1 }, church)).not.toBeNull();
        expect(getCommemoration({ year, month: 12, day: 31 }, church)).not.toBeNull();
      }
      expect(getCommemoration({ year: 2025, month: 12, day: 31 }, church)).toBeNull();
      expect(getCommemoration({ year: 2031, month: 1, day: 1 }, church)).toBeNull();
    }
  });

  it('is repeatable: the second lookup of a year (served from the cache) equals the first', () => {
    const date = { year: 2029, month: 4, day: 8 };
    const first = getCommemoration(date, 'greek');
    expect(getCommemoration(date, 'greek')).toEqual(first);
    // Orthodox Pascha 2029 is 8 April: a great feast.
    expect(first?.feastLevel).toBeGreaterThanOrEqual(7);
  });

  it('does not answer for impossible dates', () => {
    const impossible = [
      [0, 1],
      [13, 1],
      [2, 30],
      [4, 31],
      [1, 0],
      [1, 32],
    ];
    for (const [month, day] of impossible) {
      expect(getCommemoration({ year: 2027, month, day }, 'greek')).toBeNull();
    }
  });

  it('gives different saints for Greek and Russian on the same civil date', () => {
    const date = { year: 2027, month: 12, day: 25 };
    expect(getCommemoration(date, 'greek')?.names).not.toEqual(
      getCommemoration(date, 'russian')?.names,
    );
  });
});
