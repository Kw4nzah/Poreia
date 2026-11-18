// The next feasts and major fasts after a date, for the countdown list. Dates come from the
// engine's own rules (getDayInfo for feasts, getUpcomingFast for fasts), never from a table.

import { Church } from './churches';
import { CivilDate, gregorianToJdn, jdnToGregorian } from './dates';
import { FeastId, MajorFastId, getDayInfo, getUpcomingFast } from './fasting';

export type UpcomingEvent =
  | { kind: 'feast'; id: FeastId; date: CivilDate; daysUntil: number }
  | { kind: 'fast'; id: MajorFastId; date: CivilDate; daysUntil: number };

export interface UpcomingOptions {
  /** How many events to return. */
  limit?: number;
  /** How far ahead to look, in days. */
  horizonDays?: number;
}

/** Longest stretch searched: a full year, so every feast and fast shows up once. */
const DEFAULT_HORIZON_DAYS = 366;
const DEFAULT_LIMIT = 12;

/**
 * The next feasts and fasts that begin strictly after `from`, soonest first. A fast is listed
 * on the day it starts. Works across year boundaries.
 */
export function getUpcomingEvents(
  from: CivilDate,
  church: Church,
  { limit = DEFAULT_LIMIT, horizonDays = DEFAULT_HORIZON_DAYS }: UpcomingOptions = {},
): UpcomingEvent[] {
  const startJdn = gregorianToJdn(from.year, from.month, from.day);
  const events: UpcomingEvent[] = [];

  let cursor = from;
  // There are four major fasts a year; the bound only guards against a loop that never ends.
  for (let i = 0; i < 8; i++) {
    const fast = getUpcomingFast(cursor, church);
    const daysUntil = gregorianToJdn(fast.start.year, fast.start.month, fast.start.day) - startJdn;
    if (daysUntil > horizonDays) break;
    events.push({ kind: 'fast', id: fast.id, date: fast.start, daysUntil });
    cursor = fast.start;
  }

  for (let daysUntil = 1; daysUntil <= horizonDays; daysUntil++) {
    const date = jdnToGregorian(startJdn + daysUntil);
    for (const id of getDayInfo(date, church).feasts) {
      events.push({ kind: 'feast', id, date, daysUntil });
    }
  }

  // A fast listed before a feast on the same day; otherwise the sort keeps engine order.
  events.sort(
    (a, b) => a.daysUntil - b.daysUntil || (a.kind === b.kind ? 0 : a.kind === 'fast' ? -1 : 1),
  );
  return events.slice(0, limit);
}
