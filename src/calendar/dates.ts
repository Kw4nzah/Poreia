// Calendar arithmetic on Julian Day Numbers (JDN).
// Everything works on whole civil days, so there are no timezone or DST pitfalls.

export interface CivilDate {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
}

/** 0 = Sunday ... 6 = Saturday */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

export function julianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
}

export function jdnToGregorian(jdn: number): CivilDate {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  return fromCycle(c, 100 * b - 4800);
}

export function jdnToJulian(jdn: number): CivilDate {
  return fromCycle(jdn + 32082, -4800);
}

function fromCycle(c: number, yearBase: number): CivilDate {
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: yearBase + d + Math.floor(m / 10),
  };
}

export function weekdayOfJdn(jdn: number): Weekday {
  return ((((jdn + 1) % 7) + 7) % 7) as Weekday;
}

/** JDN of Orthodox Pascha (Julian paschalion) for a Gregorian civil year. */
export function paschaJdn(year: number): number {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  return julianToJdn(year, month, day);
}

/** Today's civil date in the device's local timezone. */
export function civilFromLocalDate(date: Date): CivilDate {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

export function isSameCivilDate(a: CivilDate, b: CivilDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

/**
 * Milliseconds from `now` to one second after the next local midnight. Built from calendar
 * fields, so a 23- or 25-hour day (DST change) still ends at the right wall-clock midnight.
 */
export function msUntilNextLocalMidnight(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  return Math.max(1000, next.getTime() - now.getTime());
}
