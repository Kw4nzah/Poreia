import { describe, expect, it } from 'vitest';
import {
  CHURCHES,
  getDayInfo,
  getPeriods,
  getUpcomingFast,
  jdnToGregorian,
  jdnToJulian,
  gregorianToJdn,
  paschaJdn,
} from './index';

const { greek, russian } = CHURCHES;
const d = (year: number, month: number, day: number) => ({ year, month, day });

describe('dates', () => {
  it.each([
    [2024, 5, 5],
    [2025, 4, 20],
    [2026, 4, 12],
    [2027, 5, 2],
    [2028, 4, 16],
  ])('Pascha %i falls on %i/%i', (year, month, day) => {
    expect(jdnToGregorian(paschaJdn(year))).toEqual(d(year, month, day));
  });

  it('converts between Gregorian and Julian', () => {
    expect(jdnToJulian(gregorianToJdn(2027, 1, 7))).toEqual(d(2026, 12, 25));
    expect(jdnToJulian(gregorianToJdn(2026, 3, 1))).toEqual(d(2026, 2, 16));
  });
});

describe('Nativity Fast', () => {
  it('starts on 15 Nov for the Greek church', () => {
    const info = getDayInfo(d(2026, 11, 15), greek);
    expect(info.weekday).toBe(0);
    expect(info.period).toMatchObject({ id: 'nativityFast', day: 1, totalDays: 40, daysLeft: 39 });
    expect(info.level).toBe('fish');
  });

  it('has not started yet on 15 Nov for the Russian church', () => {
    const info = getDayInfo(d(2026, 11, 15), russian);
    expect(info.period).toBeNull();
    expect(info.level).toBe('none');
    expect(getUpcomingFast(d(2026, 11, 15), russian)).toEqual({
      id: 'nativityFast',
      start: d(2026, 11, 28),
      end: d(2027, 1, 6),
      daysUntil: 13,
    });
  });

  it('crosses the civil new year on the old calendar', () => {
    const eve = getDayInfo(d(2027, 1, 6), russian);
    expect(eve.period).toMatchObject({ id: 'nativityFast', day: 40, daysLeft: 0 });
    expect(eve.level).toBe('xerophagy');

    const feast = getDayInfo(d(2027, 1, 7), russian);
    expect(feast.feasts).toEqual(['nativityOfChrist']);
    expect(feast.period?.id).toBe('christmastide');
    expect(feast.level).toBe('none');
  });

  it('tightens before the feast (Greek)', () => {
    expect(getDayInfo(d(2026, 12, 15), greek).level).toBe('fish'); // Tuesday
    expect(getDayInfo(d(2026, 12, 16), greek).level).toBe('noOil'); // Wednesday
    expect(getDayInfo(d(2026, 12, 22), greek).level).toBe('oil'); // Tuesday
    expect(getDayInfo(d(2026, 12, 24), greek).level).toBe('noOil'); // Thursday
    expect(getDayInfo(d(2026, 12, 25), greek).level).toBe('none');
  });

  it('allows fish on the Entry of the Theotokos', () => {
    // 4 Dec 2026 is a Friday; 21 Nov on the old calendar.
    const info = getDayInfo(d(2026, 12, 4), russian);
    expect(info.feasts).toEqual(['entryOfTheotokos']);
    expect(info.level).toBe('fish');
  });
});

describe('Great Lent and Holy Week', () => {
  it('starts on Clean Monday', () => {
    const g = getDayInfo(d(2026, 2, 23), greek);
    expect(g.period).toMatchObject({ id: 'greatLent', day: 1 });
    expect(g.level).toBe('noOil');
    expect(g.daysToPascha).toBe(48);
    expect(getDayInfo(d(2026, 2, 23), russian).level).toBe('xerophagy');
    expect(getDayInfo(d(2026, 2, 22), greek).period?.id).toBe('cheesefareWeek');
  });

  it('allows oil on weekends and fish on Palm Sunday', () => {
    expect(getDayInfo(d(2026, 2, 28), greek).level).toBe('oil');
    expect(getDayInfo(d(2026, 4, 5), greek).level).toBe('fish');
    expect(getDayInfo(d(2026, 4, 4), russian).notes).toEqual(['caviarAllowed']);
  });

  it('handles the Annunciation on both calendars', () => {
    expect(getDayInfo(d(2026, 3, 25), greek).level).toBe('fish');
    // 7 Apr 2026 is Holy Tuesday on the old calendar: oil, no fish.
    const r = getDayInfo(d(2026, 4, 7), russian);
    expect(r.feasts).toEqual(['annunciation']);
    expect(r.period?.id).toBe('holyWeek');
    expect(r.level).toBe('oil');
  });

  it('keeps Great Friday as the strictest day', () => {
    const info = getDayInfo(d(2026, 4, 10), greek);
    expect(info.period).toMatchObject({ id: 'holyWeek', day: 5 });
    expect(info.level).toBe('xerophagy');
    expect(info.notes).toEqual(['totalAbstinence']);
  });

  it('is fast-free in Bright Week', () => {
    const info = getDayInfo(d(2026, 4, 15), greek); // Wednesday
    expect(info.period?.id).toBe('brightWeek');
    expect(info.level).toBe('none');
    expect(getDayInfo(d(2026, 4, 12), greek).feasts).toEqual(['pascha']);
  });

  it('allows dairy all Cheesefare week', () => {
    expect(getDayInfo(d(2026, 2, 18), russian).level).toBe('noMeat'); // Wednesday
  });
});

describe("Apostles' Fast", () => {
  it('has a different length on each calendar', () => {
    expect(getDayInfo(d(2026, 6, 8), greek).period).toMatchObject({
      id: 'apostlesFast',
      day: 1,
      totalDays: 21,
    });
    expect(getDayInfo(d(2026, 6, 8), russian).period).toMatchObject({
      id: 'apostlesFast',
      day: 1,
      totalDays: 34,
      end: d(2026, 7, 11),
    });
    expect(getDayInfo(d(2026, 6, 29), greek).period).toBeNull();
  });

  it('disappears on the new calendar when Pascha is late', () => {
    expect(getPeriods(2024, greek).some((p) => p.id === 'apostlesFast')).toBe(false);
    expect(getPeriods(2024, russian).some((p) => p.id === 'apostlesFast')).toBe(true);
  });
});

describe('Dormition Fast', () => {
  it('follows the fixed calendar', () => {
    expect(getDayInfo(d(2026, 8, 1), greek).period).toMatchObject({
      id: 'dormitionFast',
      day: 1,
      totalDays: 14,
    });
    expect(getDayInfo(d(2026, 8, 1), russian).period).toBeNull();
    expect(getDayInfo(d(2026, 8, 14), russian).period?.id).toBe('dormitionFast');
    expect(getDayInfo(d(2026, 8, 6), greek).level).toBe('fish'); // Transfiguration
    expect(getDayInfo(d(2026, 8, 15), greek).level).toBe('none'); // Saturday
  });
});

describe('single fast days', () => {
  it('fasts on ordinary Wednesdays and Fridays', () => {
    const wed = getDayInfo(d(2026, 10, 14), greek);
    expect(wed.fastDay).toBe('wednesday');
    expect(wed.level).toBe('noOil');
    expect(getDayInfo(d(2026, 10, 15), greek).level).toBe('none');
    expect(getDayInfo(d(2026, 10, 16), russian).level).toBe('xerophagy');
  });

  it('relaxes Wednesdays and Fridays in the Paschal season', () => {
    expect(getDayInfo(d(2026, 4, 22), greek).level).toBe('oil');
    expect(getDayInfo(d(2026, 5, 6), greek).level).toBe('fish'); // Mid-Pentecost
    expect(getDayInfo(d(2026, 4, 22), russian).level).toBe('fish');
  });

  it('keeps the eve of Theophany', () => {
    const g = getDayInfo(d(2026, 1, 5), greek); // Monday
    expect(g.fastDay).toBe('theophanyEve');
    expect(g.level).toBe('noOil');
    expect(getDayInfo(d(2026, 1, 18), russian).level).toBe('oil'); // Sunday
    expect(getDayInfo(d(2026, 1, 6), greek).level).toBe('none');
  });

  it('keeps the Beheading and the Exaltation on any weekday', () => {
    expect(getDayInfo(d(2026, 8, 29), greek).level).toBe('oil'); // Saturday
    expect(getDayInfo(d(2026, 9, 14), greek).fastDay).toBe('exaltationOfCross');
    expect(getDayInfo(d(2026, 9, 27), russian).level).toBe('oil'); // Sunday
  });
});

describe('upcoming fast', () => {
  it('reports Great Lent through Holy Saturday', () => {
    expect(getUpcomingFast(d(2026, 12, 30), greek)).toEqual({
      id: 'greatLent',
      start: d(2027, 3, 15),
      end: d(2027, 5, 1),
      daysUntil: 75,
    });
  });
});
