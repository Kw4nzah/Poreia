import { describe, expect, it } from 'vitest';
import { CHURCHES, DayInfo, getDayInfo } from '../calendar';
import { MESSAGES } from '../i18n';
import { describeDay, planNotifications } from './content';

const en = MESSAGES.en;

function day(overrides: Partial<DayInfo>): DayInfo {
  return {
    date: { year: 2026, month: 12, day: 2 },
    churchDate: { year: 2026, month: 12, day: 2 },
    weekday: 3,
    level: 'none',
    period: null,
    fastDay: null,
    feasts: [],
    notes: [],
    daysToPascha: 100,
    ...overrides,
  };
}

describe('describeDay', () => {
  it('puts the weekday and the rule in the title', () => {
    const text = describeDay(day({ level: 'fish' }), en);
    expect(text.title).toBe('Wednesday · Fish allowed');
    expect(text.body).toBe('Fish, wine and oil are allowed.');
  });

  it('adds the period with the day count', () => {
    const period = {
      id: 'nativityFast' as const,
      day: 12,
      totalDays: 40,
      daysLeft: 28,
      start: { year: 2026, month: 11, day: 15 },
      end: { year: 2026, month: 12, day: 24 },
    };
    const text = describeDay(day({ level: 'oil', period }), en);
    expect(text.body).toBe('No fish today.\nNativity Fast · Day 12 of 40');
  });

  it('names a lone fast day and the feasts', () => {
    const text = describeDay(
      day({ level: 'noOil', fastDay: 'wednesday', feasts: ['annunciation'] }),
      en,
    );
    expect(text.body).toBe('Cooked food prepared without oil.\nWednesday fast\nAnnunciation');
  });

  it('has text in every language', () => {
    for (const m of Object.values(MESSAGES)) {
      const text = describeDay(day({ level: 'xerophagy', fastDay: 'friday' }), m);
      expect(text.title.trim()).not.toBe('');
      expect(text.body.trim()).not.toBe('');
    }
  });
});

describe('planNotifications', () => {
  const plan = planNotifications({ year: 2026, month: 12, day: 30 }, 4, CHURCHES.greek, en);

  it('covers consecutive days across a year boundary', () => {
    expect(plan.map((n) => n.date)).toEqual([
      { year: 2026, month: 12, day: 30 },
      { year: 2026, month: 12, day: 31 },
      { year: 2027, month: 1, day: 1 },
      { year: 2027, month: 1, day: 2 },
    ]);
  });

  it("describes each day with that day's own rule", () => {
    for (const n of plan) {
      expect(n).toMatchObject(describeDay(getDayInfo(n.date, CHURCHES.greek), en));
    }
  });
});
