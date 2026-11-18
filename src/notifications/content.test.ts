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
    expect(text.body).toBe('Fish, wine and oil are allowed');
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
    expect(text.body).toBe('No fish today\nNativity Fast · Day 12 of 40');
  });

  it('names a lone fast day and the feasts', () => {
    const text = describeDay(
      day({ level: 'noOil', fastDay: 'wednesday', feasts: ['annunciation'] }),
      en,
    );
    expect(text.body).toBe('Cooked food prepared without oil\nWednesday fast\nAnnunciation');
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

describe('describeDay edge cases', () => {
  it('lists several feasts one per line, in order', () => {
    const text = describeDay(day({ level: 'fish', feasts: ['pascha', 'annunciation'] }), en);
    expect(text.body.split('\n').slice(-2)).toEqual([en.feast.pascha, en.feast.annunciation]);
  });

  it('prefers the period over a lone fast day when both are set', () => {
    const period = {
      id: 'greatLent' as const,
      day: 1,
      totalDays: 42,
      daysLeft: 41,
      start: { year: 2026, month: 2, day: 23 },
      end: { year: 2026, month: 4, day: 5 },
    };
    const text = describeDay(day({ level: 'noOil', period, fastDay: 'wednesday' }), en);
    expect(text.body).not.toContain(en.fastDay.wednesday);
    expect(text.body).toContain(en.period.greatLent);
  });

  it('has a title and body for every level, weekday and language', () => {
    for (const m of Object.values(MESSAGES)) {
      for (const level of Object.keys(m.level) as (keyof typeof m.level)[]) {
        for (const weekday of [0, 1, 2, 3, 4, 5, 6] as const) {
          const text = describeDay(day({ level, weekday }), m);
          expect(text.title).toBe(`${m.weekdays[weekday]} · ${m.level[level].title}`);
          expect(text.body.trim()).not.toBe('');
          expect(text.title).not.toContain('undefined');
          expect(text.body).not.toContain('undefined');
        }
      }
    }
  });

  it('describes a fast-free day without a period line', () => {
    expect(describeDay(day({ level: 'none' }), en).body.split('\n')).toHaveLength(1);
  });
});

describe('planNotifications edge cases', () => {
  it('returns nothing for zero days', () => {
    expect(planNotifications({ year: 2026, month: 1, day: 1 }, 0, CHURCHES.greek, en)).toEqual([]);
  });

  it('includes the leap day 29 Feb 2028', () => {
    const plan = planNotifications({ year: 2028, month: 2, day: 28 }, 3, CHURCHES.russian, en);
    expect(plan.map((n) => n.date)).toEqual([
      { year: 2028, month: 2, day: 28 },
      { year: 2028, month: 2, day: 29 },
      { year: 2028, month: 3, day: 1 },
    ]);
  });

  it('does not add a 29 Feb in a non-leap year', () => {
    const plan = planNotifications({ year: 2027, month: 2, day: 28 }, 2, CHURCHES.greek, en);
    expect(plan[1].date).toEqual({ year: 2027, month: 3, day: 1 });
  });

  it('plans a full 60-day window with unique dates in every language', () => {
    for (const m of Object.values(MESSAGES)) {
      const plan = planNotifications({ year: 2026, month: 12, day: 1 }, 60, CHURCHES.greek, m);
      expect(plan).toHaveLength(60);
      expect(new Set(plan.map((n) => JSON.stringify(n.date))).size).toBe(60);
    }
  });

  it('passes the Greek fish option through', () => {
    const date = { year: 2026, month: 11, day: 28 };
    for (const greekFish of ['greece', 'weekends'] as const) {
      const [n] = planNotifications(date, 1, CHURCHES.greek, en, { greekFish });
      expect(n).toMatchObject(describeDay(getDayInfo(date, CHURCHES.greek, { greekFish }), en));
    }
  });
});
