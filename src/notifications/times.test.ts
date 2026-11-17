import { describe, expect, it } from 'vitest';
import { CHURCHES } from '../calendar';
import { en } from '../i18n/en';
import {
  REPEAT_COUNT,
  REPEAT_DAYS,
  REPEAT_EVERY_MINUTES,
  notificationTimes,
  planNotifications,
} from './content';

const plan = (year: number, month: number, day: number, days: number) =>
  planNotifications({ year, month, day }, days, CHURCHES.greek, en);

describe('notificationTimes', () => {
  it('schedules each day once at the chosen local hour, nothing in the past', () => {
    const now = new Date(2026, 10, 18, 9, 0, 0);
    const times = notificationTimes(plan(2026, 11, 18, 3), 8, false, now);
    // 8:00 on the 18th has passed already.
    expect(times.map((t) => t.when)).toEqual([
      new Date(2026, 10, 19, 8),
      new Date(2026, 10, 20, 8),
    ]);
  });

  it('keeps today when the hour is still ahead', () => {
    const now = new Date(2026, 10, 18, 6, 59, 0);
    const times = notificationTimes(plan(2026, 11, 18, 1), 7, false, now);
    expect(times).toHaveLength(1);
    expect(times[0].when).toEqual(new Date(2026, 10, 18, 7));
  });

  it('drops a moment that equals "now" (it would fire at once)', () => {
    const now = new Date(2026, 10, 18, 8, 0, 0);
    expect(notificationTimes(plan(2026, 11, 18, 1), 8, false, now)).toEqual([]);
  });

  it('carries the title and body of its own day', () => {
    const now = new Date(2026, 10, 17, 12);
    const p = plan(2026, 11, 18, 2);
    const times = notificationTimes(p, 8, false, now);
    expect(times.map((t) => [t.title, t.body])).toEqual(p.map((n) => [n.title, n.body]));
  });

  it('adds repeats after today, never on today itself', () => {
    const now = new Date(2026, 10, 18, 6, 0, 0);
    const times = notificationTimes(plan(2026, 11, 18, 2), 8, true, now);
    // Today: only the 8:00 one. Tomorrow: 8:00 plus the repeats.
    expect(times).toHaveLength(1 + 1 + REPEAT_COUNT);
    const tomorrow = times.slice(1).map((t) => t.when.getTime());
    const first = new Date(2026, 10, 19, 8).getTime();
    expect(tomorrow).toEqual(
      Array.from({ length: REPEAT_COUNT + 1 }, (_, k) => first + k * REPEAT_EVERY_MINUTES * 60_000),
    );
  });

  it('gives repeats only to the first days of the plan', () => {
    const now = new Date(2026, 10, 17, 12);
    const days = REPEAT_DAYS + 10;
    const times = notificationTimes(plan(2026, 11, 18, days), 8, true, now);
    // Day 1 is not today here (now is the 17th), so it gets repeats too.
    expect(times).toHaveLength(REPEAT_DAYS * (1 + REPEAT_COUNT) + 10);
  });

  it('crosses a year boundary and the leap day', () => {
    const now = new Date(2026, 11, 30, 12);
    const times = notificationTimes(plan(2026, 12, 31, 3), 9, false, now);
    expect(times.map((t) => t.when)).toEqual([
      new Date(2026, 11, 31, 9),
      new Date(2027, 0, 1, 9),
      new Date(2027, 0, 2, 9),
    ]);
    const leap = notificationTimes(plan(2028, 2, 28, 3), 9, false, new Date(2028, 1, 27, 12));
    expect(leap.map((t) => t.when.getDate())).toEqual([28, 29, 1]);
  });

  it('keeps the wall-clock hour on every day of a 30-day window, whatever the DST changes', () => {
    // Runs in the machine's timezone; the hour must not drift when the clocks change.
    for (const [y, m, d] of [
      [2027, 3, 10],
      [2027, 10, 20],
      [2028, 3, 20],
    ] as const) {
      const times = notificationTimes(plan(y, m, d, 30), 8, false, new Date(y, m - 1, d - 1));
      expect(times).toHaveLength(30);
      for (const t of times) expect([t.when.getHours(), t.when.getMinutes()]).toEqual([8, 0]);
    }
  });

  it('returns nothing for an empty plan', () => {
    expect(notificationTimes([], 8, true, new Date())).toEqual([]);
  });
});
