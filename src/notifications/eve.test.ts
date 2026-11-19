import { describe, expect, it } from 'vitest';
import { CHURCHES } from '../calendar';
import { LANGUAGES, MESSAGES } from '../i18n';
import { EVE_HOUR, MAX_EVE_REMINDERS, planEveReminders } from './content';

const en = MESSAGES.en;
const longBefore = new Date(2000, 0, 1);

const plan = (
  from: [number, number, number],
  days: number,
  church: keyof typeof CHURCHES = 'greek',
  m = en,
  now = longBefore,
) =>
  planEveReminders(
    { year: from[0], month: from[1], day: from[2] },
    days,
    CHURCHES[church],
    m,
    {},
    now,
  );

describe('planEveReminders', () => {
  it('reminds at 20:00 the evening before Great Lent begins (Clean Monday 2027-03-15)', () => {
    const [first, ...rest] = plan([2027, 3, 10], 10);
    expect(first.when).toEqual(new Date(2027, 2, 14, EVE_HOUR, 0, 0));
    expect(first.title).toContain(en.eve.tomorrow);
    expect(first.title).toContain(en.period.greatLent);
    expect(first.body).toContain(en.eve.fastBegins);
    expect(rest).toEqual([]);
  });

  it('reminds before the Nativity Fast, the Entry of the Theotokos and Christmas (Greek, new calendar)', () => {
    const moments = plan([2026, 11, 10], 45).map((r) => [r.when.getMonth() + 1, r.when.getDate()]);
    expect(moments).toEqual([
      [11, 14],
      [11, 20],
      [12, 24],
    ]);
  });

  it('names the feast tomorrow, not the fast, when a feast is not a fast start', () => {
    const [christmas] = plan([2026, 12, 20], 10);
    expect(christmas.title).toBe(`${en.eve.tomorrow} · ${en.feast.nativityOfChrist}`);
    expect(christmas.body).not.toContain(en.eve.fastBegins);
  });

  it('leads with the change when tomorrow differs from today', () => {
    // Sunday 2027-03-14 (cheese fare, no meat) -> Clean Monday: the fast begins and the level changes.
    const [lent] = plan([2027, 3, 10], 10);
    expect(lent.body.split('\n').slice(0, 2)).toEqual([
      en.eve.fastBegins,
      en.eve.changes(en.level.noMeat.title, en.level.noOil.title),
    ]);
  });

  it('reminds across a year boundary', () => {
    const days = plan([2026, 12, 30], 10).map(
      (r) => r.when.getMonth() + 1 + '-' + r.when.getDate(),
    );
    expect(days).toContain('1-5');
  });

  it('stays simple when tomorrow has the same rule as today', () => {
    const same = plan([2026, 11, 10], 60).filter(
      (r) => !r.body.includes(en.eve.changes('', '').slice(0, 6)),
    );
    for (const r of same) expect(r.body.split('\n').length).toBeLessThanOrEqual(2);
  });

  it('does not remind on ordinary days', () => {
    // 2027-06-01 .. 06-04: nothing begins or falls within.
    expect(plan([2027, 6, 1], 3)).toEqual([]);
  });

  it('leaves out evenings that are already past', () => {
    const afterTheEvening = new Date(2027, 2, 14, EVE_HOUR, 0, 1);
    expect(plan([2027, 3, 10], 10, 'greek', en, afterTheEvening)).toEqual([]);
    const justBefore = new Date(2027, 2, 14, EVE_HOUR - 1, 59, 59);
    expect(plan([2027, 3, 10], 10, 'greek', en, justBefore)).toHaveLength(1);
  });

  it('keeps the alarm count small over a whole year, and within the cap in any 30 days', () => {
    for (const church of Object.keys(CHURCHES) as (keyof typeof CHURCHES)[]) {
      for (let month = 1; month <= 12; month++) {
        const count = plan([2027, month, 1], 30, church).length;
        expect(count, `${church} ${month}`).toBeLessThanOrEqual(MAX_EVE_REMINDERS);
      }
    }
    expect(plan([2027, 1, 1], 365).length).toBeLessThanOrEqual(MAX_EVE_REMINDERS);
  });

  it('works for a zero-day window', () => {
    expect(plan([2027, 3, 10], 0)).toEqual([]);
  });

  it.each(LANGUAGES)('writes complete, placeholder-free text in %s', (language) => {
    const m = MESSAGES[language];
    const [first] = plan([2027, 3, 10], 10, 'greek', m);
    expect(first.title).toContain(m.eve.tomorrow);
    expect(first.title).toContain(m.period.greatLent);
    expect(first.title + first.body).not.toMatch(/undefined|NaN|\[object|\{|\}/);
  });
});
