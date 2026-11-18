// Dates written `YYYY-MM-DD` in route parameters. Strict: anything that is not a real day in a
// sensible year range is rejected, so a hand-typed or stale link never reaches the calendar code.

import { CivilDate, gregorianToJdn, jdnToGregorian } from './dates';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const MIN_ISO_YEAR = 2000;
export const MAX_ISO_YEAR = 2200;

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function daysIn(year: number, month: number): number {
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return month === 2 && leap ? 29 : DAYS_IN_MONTH[month - 1];
}

/** The date for a real day written `YYYY-MM-DD`, or null for anything else. Never throws. */
export function parseIsoDate(value: unknown): CivilDate | null {
  if (typeof value !== 'string') return null;
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < MIN_ISO_YEAR || year > MAX_ISO_YEAR) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysIn(year, month)) return null;
  return { year, month, day };
}

/** `YYYY-MM-DD` for a date. */
export function formatIsoDate(date: CivilDate): string {
  const pad = (n: number, width: number) => String(n).padStart(width, '0');
  return `${pad(date.year, 4)}-${pad(date.month, 2)}-${pad(date.day, 2)}`;
}

/** The date `delta` days away, or null when that falls outside the supported year range. */
export function shiftDay(date: CivilDate, delta: number): CivilDate | null {
  const next = jdnToGregorian(gregorianToJdn(date.year, date.month, date.day) + delta);
  return next.year < MIN_ISO_YEAR || next.year > MAX_ISO_YEAR ? null : next;
}
