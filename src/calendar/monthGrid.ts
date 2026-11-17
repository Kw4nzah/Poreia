// Pure month-grid arithmetic for the calendar screen (weeks start on Monday).

import { CivilDate, gregorianToJdn, weekdayOfJdn } from './dates';

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/** Month `delta` months away, wrapping across years. */
export function shiftMonth(year: number, month: number, delta: number) {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (((index % 12) + 12) % 12) + 1 };
}

/** Empty cells before day 1 when weeks start on Monday (Mon = 0 ... Sun = 6). */
export function leadingBlanks(year: number, month: number): number {
  const weekday = weekdayOfJdn(gregorianToJdn(year, month, 1));
  return (weekday + 6) % 7;
}

/** Weeks of the month; `null` pads days outside it. Every week has 7 cells. */
export function buildMonthGrid(year: number, month: number): (CivilDate | null)[][] {
  const cells: (CivilDate | null)[] = Array.from(
    { length: leadingBlanks(year, month) },
    () => null,
  );
  for (let day = 1; day <= daysInMonth(year, month); day++) cells.push({ year, month, day });
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (CivilDate | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Weekday indexes (0 = Sunday) in Monday-first display order. */
export const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0] as const;
