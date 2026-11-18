import { describe, expect, it } from 'vitest';
import { CHURCHES, getUpcomingEvents, gregorianToJdn } from './index';

const { greek, russian } = CHURCHES;
const d = (year: number, month: number, day: number) => ({ year, month, day });
const jdn = (x: { year: number; month: number; day: number }) =>
  gregorianToJdn(x.year, x.month, x.day);

describe('getUpcomingEvents', () => {
  it('lists feasts and fasts soonest first, never today', () => {
    const from = d(2026, 11, 18);
    const events = getUpcomingEvents(from, greek, { limit: 30 });
    expect(events.length).toBeGreaterThan(20);
    for (let i = 0; i < events.length; i++) {
      expect(events[i].daysUntil).toBeGreaterThan(0);
      expect(events[i].daysUntil).toBe(jdn(events[i].date) - jdn(from));
      if (i > 0) expect(events[i].daysUntil).toBeGreaterThanOrEqual(events[i - 1].daysUntil);
    }
    expect(events[0]).toMatchObject({ kind: 'feast', id: 'entryOfTheotokos', daysUntil: 3 });
  });

  it('returns 12 events by default', () => {
    expect(getUpcomingEvents(d(2026, 11, 18), greek)).toHaveLength(12);
  });

  it('runs across the year boundary (revised calendar)', () => {
    const events = getUpcomingEvents(d(2026, 12, 20), greek);
    const ids = events.map((e) => e.id);
    expect(ids.slice(0, 3)).toEqual(['nativityOfChrist', 'circumcision', 'theophany']);
    expect(events[0].daysUntil).toBe(5);
    expect(events[1].date).toEqual(d(2027, 1, 1));
    expect(events[2].date).toEqual(d(2027, 1, 6));
  });

  it('follows the Julian fixed calendar for the Russian church', () => {
    const events = getUpcomingEvents(d(2026, 12, 20), russian);
    const nativity = events.find((e) => e.id === 'nativityOfChrist');
    expect(nativity?.date).toEqual(d(2027, 1, 7));
    expect(events.find((e) => e.id === 'theophany')?.date).toEqual(d(2027, 1, 19));
  });

  it('includes Pascha and Great Lent from the engine dates', () => {
    const events = getUpcomingEvents(d(2027, 1, 20), greek);
    const pascha = events.find((e) => e.id === 'pascha');
    expect(pascha?.date).toEqual(d(2027, 5, 2));
    expect(pascha?.daysUntil).toBe(jdn(d(2027, 5, 2)) - jdn(d(2027, 1, 20)));
    const lent = events.find((e) => e.kind === 'fast' && e.id === 'greatLent');
    expect(lent?.date).toEqual(d(2027, 3, 15));
  });

  it('lists the next major fast when the previous one has started', () => {
    // Nativity Fast started on 15 Nov, so the next one listed is Great Lent.
    const fasts = getUpcomingEvents(d(2026, 11, 18), greek).filter((e) => e.kind === 'fast');
    expect(fasts[0]).toMatchObject({ id: 'greatLent' });
  });

  it('lists a fast starting tomorrow with one day to go', () => {
    const events = getUpcomingEvents(d(2026, 11, 14), greek);
    expect(events[0]).toMatchObject({ kind: 'fast', id: 'nativityFast', daysUntil: 1 });
  });

  it('respects the horizon', () => {
    const events = getUpcomingEvents(d(2026, 1, 1), greek, { limit: 100, horizonDays: 30 });
    expect(events.every((e) => e.daysUntil <= 30)).toBe(true);
  });

  it('covers a whole year: every feast once and all four fasts', () => {
    const events = getUpcomingEvents(d(2026, 11, 18), greek, { limit: 100, horizonDays: 365 });
    const fasts = events.filter((e) => e.kind === 'fast').map((e) => e.id);
    expect(new Set(fasts).size).toBe(fasts.length);
    expect(fasts).toEqual(expect.arrayContaining(['greatLent', 'apostlesFast', 'dormitionFast']));
    const feasts = events.filter((e) => e.kind === 'feast').map((e) => e.id);
    expect(feasts).toContain('pascha');
    expect(feasts).toContain('pentecost');
  });
});
