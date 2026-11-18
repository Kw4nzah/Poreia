// "Complete today" mark of the home-screen widget. Pure, so it can be tested without a device.
//
// One AsyncStorage key per day, `poreia.done.YYYY-MM-DD`, holding "1" while the day is marked.
// Un-marking removes the key, so only marked days occupy storage.

import type { CivilDate } from '../calendar';

/** clickAction the widget's button sends to the task handler. */
export const TOGGLE_DONE_ACTION = 'TOGGLE_DONE';

export const DONE_PREFIX = 'poreia.done.';
const MARKED = '1';

const pad = (n: number, width: number) => String(n).padStart(width, '0');

/** Storage key of a day, e.g. `poreia.done.2026-11-17`. */
export function doneKey(date: CivilDate): string {
  return `${DONE_PREFIX}${pad(date.year, 4)}-${pad(date.month, 2)}-${pad(date.day, 2)}`;
}

/** Whether a stored value means "marked". Anything else (missing, garbage) is not marked. */
export function isDone(stored: string | null | undefined): boolean {
  return stored === MARKED;
}

/** Value to store after a tap: marks an unmarked day, `null` (remove the key) un-marks it. */
export function toggledValue(stored: string | null | undefined): string | null {
  return isDone(stored) ? null : MARKED;
}
