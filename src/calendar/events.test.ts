import { describe, expect, it } from 'vitest';
import { en } from '../i18n/en';
import { tr } from '../i18n/tr';
import { CHURCHES, gregorianToJdn } from './index';
import {
  buildFastDayPlan,
  buildPhoneCalendarPlan,
  buildUpcomingPlan,
  SYNC_DAYS,
} from './events';

const greek = CHURCHES.greek;
const today = { year: 2026, month: 11, day: 20 };
const jdn = (d: { year: number; month: number; day: number }) =>
  gregorianToJdn(d.year, d.month, d.day);

describe('phone calendar plan', () => {
  const plan = buildPhoneCalendarPlan(today, greek, en);

  it('stays inside the next 12 months and is sorted by date', () => {
    const start = jdn(today);
    for (const e of plan) {
      expect(jdn(e.date)).toBeGreaterThanOrEqual(start);
      expect(jdn(e.date)).toBeLessThanOrEqual(start + SYNC_DAYS + 1);
    }
    const days = plan.map((e) => jdn(e.date));
    expect(days).toEqual([...days].sort((a, b) => a - b));
  });

  it('has unique ids, so a sync can never write the same event twice', () => {
    expect(new Set(plan.map((e) => e.uid)).size).toBe(plan.length);
  });

  it('includes today, major fast starts and feasts', () => {
    // The Nativity Fast begins on 15 November, so 20 November is a fast day (today itself).
    expect(plan.some((e) => jdn(e.date) === jdn(today) && e.uid.startsWith('fastday-'))).toBe(true);
    expect(plan.filter((e) => e.title.startsWith('Fast begins: ')).length).toBeGreaterThanOrEqual(3);
    expect(plan.some((e) => e.title === en.feast.nativityOfChrist)).toBe(true);
  });

  it('titles a fast day with its rule and explains it in the notes', () => {
    const fastDays = buildFastDayPlan(today, greek, en);
    const first = fastDays[0];
    expect(first.title.startsWith('Fast: ')).toBe(true);
    expect(first.notes.length).toBeGreaterThan(0);
    expect(fastDays.length).toBeGreaterThan(100);
  });

  it('uses the language of the messages', () => {
    const turkish = buildUpcomingPlan(today, greek, tr);
    expect(turkish.some((e) => e.title === tr.feast.nativityOfChrist)).toBe(true);
    expect(turkish.some((e) => e.title === en.feast.nativityOfChrist)).toBe(false);
  });
});
