// Fasting log: streak and totals from the "complete today" marks. Pure, so it can be tested
// without a device. Days are whole-number Julian Day Numbers (JDN), so there are no timezone or
// DST pitfalls: a civil date maps to one integer and the arithmetic never touches a clock.

import { CivilDate, PeriodId, gregorianToJdn, jdnToGregorian } from '../calendar';
import { DONE_PREFIX, isDone } from '../widget/done';

/** Marks outside this range of years are treated as garbage and ignored. */
const MIN_YEAR = 1900;
const MAX_YEAR = 2200;

/** The streak walk never looks further back than this, whatever is in storage. */
const MAX_WALK_DAYS = 3700;

const KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** The date a storage key stands for, or null when it is not a valid `poreia.done.` key. */
export function parseDoneKey(key: unknown): CivilDate | null {
  if (typeof key !== 'string' || !key.startsWith(DONE_PREFIX)) return null;
  const match = KEY_PATTERN.exec(key.slice(DONE_PREFIX.length));
  if (!match) return null;
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  if (date.year < MIN_YEAR || date.year > MAX_YEAR) return null;
  // Rejects 2026-02-31 and the like: a real date survives the round trip unchanged.
  const back = jdnToGregorian(gregorianToJdn(date.year, date.month, date.day));
  if (back.year !== date.year || back.month !== date.month || back.day !== date.day) return null;
  return date;
}

/**
 * JDNs of the marked days among raw storage entries. Anything that is not a valid key with the
 * marked value is dropped, so foreign keys and garbage never reach the statistics.
 */
export function doneDaysFromEntries(entries: Iterable<readonly [unknown, unknown]>): Set<number> {
  const days = new Set<number>();
  for (const [key, value] of entries) {
    if (typeof value !== 'string' || !isDone(value)) continue;
    const date = parseDoneKey(key);
    if (date) days.add(gregorianToJdn(date.year, date.month, date.day));
  }
  return days;
}

export type IsFasting = (date: CivilDate) => boolean;

/**
 * Consecutive fasting days completed, counted back from today. Days without a fast are skipped:
 * they neither add to the streak nor break it. Today still being open does not break it either.
 */
export function currentStreak(
  today: CivilDate,
  done: ReadonlySet<number>,
  isFasting: IsFasting,
): number {
  if (done.size === 0) return 0;
  const todayJdn = gregorianToJdn(today.year, today.month, today.day);
  // Nothing earlier than the oldest mark can extend the streak.
  let oldest = Infinity;
  for (const jdn of done) if (jdn < oldest) oldest = jdn;
  const stop = Math.max(oldest, todayJdn - MAX_WALK_DAYS);

  let streak = 0;
  for (let jdn = todayJdn; jdn >= stop; jdn--) {
    if (!isFasting(jdnToGregorian(jdn))) continue;
    if (done.has(jdn)) streak++;
    else if (jdn !== todayJdn) break;
  }
  return streak;
}

/** Marked fasting days within `[startJdn, endJdn]` (inclusive). */
export function completedInRange(
  done: ReadonlySet<number>,
  startJdn: number,
  endJdn: number,
  isFasting: IsFasting,
): number {
  let count = 0;
  for (const jdn of done) {
    if (jdn >= startJdn && jdn <= endJdn && isFasting(jdnToGregorian(jdn))) count++;
  }
  return count;
}

/** Fasting days within `[startJdn, endJdn]` (inclusive). */
export function fastingDaysInRange(startJdn: number, endJdn: number, isFasting: IsFasting): number {
  let count = 0;
  for (let jdn = startJdn; jdn <= endJdn; jdn++) {
    if (isFasting(jdnToGregorian(jdn))) count++;
  }
  return count;
}

export interface FastProgress {
  id: PeriodId;
  completed: number;
  /** Fasting days of the whole period, including those still to come. */
  total: number;
}

export interface LogStats {
  streak: number;
  /** Completed fasting days in today's calendar year. */
  year: number;
  /** The fast or fasting season that contains today; null on a day outside any period. */
  fast: FastProgress | null;
}

export interface StatsPeriod {
  id: PeriodId;
  start: CivilDate;
  end: CivilDate;
}

export function computeStats(
  today: CivilDate,
  done: ReadonlySet<number>,
  isFasting: IsFasting,
  period: StatsPeriod | null,
): LogStats {
  const yearStart = gregorianToJdn(today.year, 1, 1);
  const yearEnd = gregorianToJdn(today.year, 12, 31);
  let fast: FastProgress | null = null;
  if (period) {
    const start = gregorianToJdn(period.start.year, period.start.month, period.start.day);
    const end = gregorianToJdn(period.end.year, period.end.month, period.end.day);
    fast = {
      id: period.id,
      completed: completedInRange(done, start, end, isFasting),
      total: fastingDaysInRange(start, end, isFasting),
    };
  }
  return {
    streak: currentStreak(today, done, isFasting),
    year: completedInRange(done, yearStart, yearEnd, isFasting),
    fast,
  };
}
