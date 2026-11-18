// Fasting log: the days the user marked as fasting. Pure, so it can be tested without a device.
// Days are whole-number Julian Day Numbers (JDN), so there are no timezone or DST pitfalls: a civil
// date maps to one integer and the arithmetic never touches a clock.

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
