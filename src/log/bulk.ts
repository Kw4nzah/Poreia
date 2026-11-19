// Pure rules of the calendar's "Mark days" mode, so they can be tested without a device.

import { CivilDate, FastLevel, gregorianToJdn } from '../calendar';

export const jdnOf = (date: CivilDate): number => gregorianToJdn(date.year, date.month, date.day);

/**
 * Whether a day may carry the "I am fasting" mark. The same rule as the day screen: a fasting day
 * that has begun (today or any day before it), never a day to come and never a day without a fast.
 */
export function isMarkableDay(date: CivilDate, today: CivilDate, level: FastLevel): boolean {
  return level !== 'none' && jdnOf(date) <= jdnOf(today);
}

/** The selection with one day added, or removed when it was already in it. Never mutates. */
export function toggleSelected(selected: ReadonlySet<number>, jdn: number): Set<number> {
  const next = new Set(selected);
  if (!next.delete(jdn)) next.add(jdn);
  return next;
}

/** Which bulk actions have something to do for a selection: days to mark and days to clear. */
export function bulkActions(selected: ReadonlySet<number>, done: ReadonlySet<number>) {
  let canMark = false;
  let canClear = false;
  for (const jdn of selected) {
    if (done.has(jdn)) canClear = true;
    else canMark = true;
  }
  return { canMark, canClear };
}
