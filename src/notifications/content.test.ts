import { describe, expect, it } from 'vitest';
import {
  CHURCHES,
  DayInfo,
  GREEK_FISH_PRACTICES,
  getDayInfo,
  gregorianToJdn,
  jdnToGregorian,
} from '../calendar';
import { MESSAGES } from '../i18n';
import { COLLAPSED_LINE_MAX, describeDay, planNotifications } from './content';

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
  it('puts the fast in the title and what is allowed and avoided on the first line', () => {
    const text = describeDay(day({ level: 'fish' }), en);
    expect(text.title).toBe('Fish allowed');
    expect(text.body).toBe('Allowed: fish, oil, wine. Avoid: meat, dairy, eggs.');
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
    expect(text.body).toBe(
      'Allowed: oil, wine. Avoid: meat, dairy, eggs, fish.\nNativity Fast · Day 12 of 40',
    );
  });

  it('puts a feast in the title and keeps the fast on a later line', () => {
    const text = describeDay(
      day({ level: 'noOil', fastDay: 'wednesday', feasts: ['annunciation'] }),
      en,
    );
    expect(text.title).toBe('Annunciation');
    expect(text.body.split('\n').slice(1)).toEqual(['Today: No oil.', 'Wednesday fast']);
  });

  it('a feast without a fast says everything is allowed', () => {
    const text = describeDay(day({ level: 'none', feasts: ['pascha'] }), en);
    expect(text.title).toBe(en.feast.pascha);
    expect(text.body).toBe(en.level.none.detail);
  });

  it('adds the readings line last when given', () => {
    const text = describeDay(day({ level: 'fish', fastDay: 'friday' }), en, 'Epistle: A 1:1');
    expect(text.body.split('\n').at(-1)).toBe('Epistle: A 1:1');
    expect(text.body.split('\n')).toHaveLength(3);
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
  it('joins several feasts in the title, in order', () => {
    const text = describeDay(day({ level: 'fish', feasts: ['pascha', 'annunciation'] }), en);
    expect(text.title).toBe(`${en.feast.pascha} · ${en.feast.annunciation}`);
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

  it('has a title and body for every level and language', () => {
    for (const m of Object.values(MESSAGES)) {
      for (const level of Object.keys(m.level) as (keyof typeof m.level)[]) {
        const text = describeDay(day({ level }), m);
        expect(text.title).toBe(m.level[level].title);
        expect(text.body.trim()).not.toBe('');
        expect(text.title).not.toContain('undefined');
        expect(text.body).not.toContain('undefined');
      }
    }
  });

  it('keeps the collapsed first line within the limit on every day, church and language', () => {
    const start = gregorianToJdn(2026, 1, 1);
    for (const m of Object.values(MESSAGES)) {
      for (const church of Object.values(CHURCHES)) {
        for (const greekFish of GREEK_FISH_PRACTICES) {
          for (let i = 0; i < 730; i++) {
            const info = getDayInfo(jdnToGregorian(start + i), church, { greekFish });
            const [first] = describeDay(info, m).body.split('\n');
            expect(first.length).toBeLessThanOrEqual(COLLAPSED_LINE_MAX);
          }
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

describe('planNotifications readings', () => {
  const date = { year: 2026, month: 11, day: 20 };

  it('adds the epistle and gospel of the day when a language is given', () => {
    const [n] = planNotifications(date, 1, CHURCHES.greek, en, {}, 'en');
    const last = n.body.split('\n').at(-1)!;
    expect(last).toContain(`${en.readings.epistle}: `);
    expect(last).toContain(`${en.readings.gospel}: `);
  });

  it('uses the book names of the given language', () => {
    const [n] = planNotifications(date, 1, CHURCHES.greek, MESSAGES.tr, {}, 'tr');
    expect(n.body.split('\n').at(-1)).toContain(`${MESSAGES.tr.readings.gospel}: `);
  });

  it('leaves the line out without a language or without data', () => {
    const [plain] = planNotifications(date, 1, CHURCHES.greek, en);
    expect(plain.body).not.toContain(en.readings.gospel);
    const far = planNotifications(
      { year: 2040, month: 1, day: 5 },
      1,
      CHURCHES.greek,
      en,
      {},
      'en',
    );
    expect(far[0].body).not.toContain(en.readings.gospel);
  });

  it('works for the Russian church', () => {
    const [n] = planNotifications(date, 1, CHURCHES.russian, en, {}, 'en');
    expect(n.body).toContain(en.readings.gospel);
  });
});
