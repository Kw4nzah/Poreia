// The numbers behind a fast's report: which days of the fast the user marked as fasting. Pure
// (no storage, no clock), so it is tested without a device. Days are Julian Day Numbers (JDN);
// "today" is passed in as one, and nothing here reads the device's timezone.

import { Church, CivilDate, DayOptions, getDayInfo, jdnToGregorian } from '../calendar';
import { FastPeriod, PeriodRef, getFastPeriod, getFastPeriodsOfYear } from './periods';

export type ReportDayState =
  /** A fasting day the user marked. */
  | 'marked'
  /** A fasting day, past or today, that was not marked. */
  | 'unmarked'
  /** A day of the stretch without fasting. Never counted. */
  | 'free'
  /** A fasting day that has not come yet. */
  | 'upcoming';

export interface ReportDay {
  jdn: number;
  state: ReportDayState;
}

export interface ReportWeek {
  /** 1-based; the fast is cut into runs of seven days from its first day. */
  index: number;
  days: number;
  fastingDays: number;
  markedDays: number;
}

export interface PeriodReport {
  period: FastPeriod;
  start: CivilDate;
  end: CivilDate;
  /** Every day of the stretch, fasting or not. */
  totalDays: number;
  fastingDays: number;
  markedDays: number;
  /** Whole percent of the fasting days that were marked, 0-100. */
  percent: number;
  weeks: ReportWeek[];
  days: ReportDay[];
  /** The fast is over (today is after its last day). */
  ended: boolean;
  /** The fast has begun (today is its first day or later). */
  started: boolean;
}

const DAYS_PER_WEEK = 7;

export function percentOf(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

/**
 * The report of one fast. A mark counts only on a fasting day inside the stretch: marks on other
 * days (a day after the fast, a fast-free day) are ignored, as is anything that is not a day
 * number. `done` holds the JDNs of the marked days.
 */
export function buildReport(
  period: FastPeriod,
  done: ReadonlySet<number>,
  church: Church,
  todayJdn: number,
  options: DayOptions = {},
): PeriodReport {
  const days: ReportDay[] = [];
  for (let jdn = period.startJdn; jdn <= period.endJdn; jdn++) {
    const fasting = getDayInfo(jdnToGregorian(jdn), church, options).level !== 'none';
    let state: ReportDayState;
    if (!fasting) state = 'free';
    else if (jdn > todayJdn) state = 'upcoming';
    else state = done.has(jdn) ? 'marked' : 'unmarked';
    days.push({ jdn, state });
  }

  const weeks: ReportWeek[] = [];
  for (let from = 0; from < days.length; from += DAYS_PER_WEEK) {
    const slice = days.slice(from, from + DAYS_PER_WEEK);
    weeks.push({
      index: weeks.length + 1,
      days: slice.length,
      fastingDays: slice.filter((d) => d.state !== 'free').length,
      markedDays: slice.filter((d) => d.state === 'marked').length,
    });
  }

  const fastingDays = days.filter((d) => d.state !== 'free').length;
  const markedDays = days.filter((d) => d.state === 'marked').length;
  return {
    period,
    start: jdnToGregorian(period.startJdn),
    end: jdnToGregorian(period.endJdn),
    totalDays: days.length,
    fastingDays,
    markedDays,
    percent: percentOf(markedDays, fastingDays),
    weeks,
    days,
    ended: todayJdn > period.endJdn,
    started: todayJdn >= period.startJdn,
  };
}

/**
 * The report of a fast named by a key, or null when that year has no such fast or the fast has not
 * begun (there is nothing to look back on, whatever a hand-typed link says).
 */
export function reportFor(
  ref: PeriodRef,
  done: ReadonlySet<number>,
  church: Church,
  todayJdn: number,
  options?: DayOptions,
): PeriodReport | null {
  const period = getFastPeriod(ref.id, ref.year, church);
  if (!period || todayJdn < period.startJdn) return null;
  return buildReport(period, done, church, todayJdn, options);
}

/**
 * The reports worth listing, most recent first: a fast that has ended or has at least one mark,
 * going back to the earliest mark (or just this year when nothing is marked yet). A fast that
 * has not begun is left out.
 */
export function listReports(
  done: ReadonlySet<number>,
  church: Church,
  todayJdn: number,
  options?: DayOptions,
): PeriodReport[] {
  const thisYear = jdnToGregorian(todayJdn).year;
  const earliest = done.size > 0 ? Math.min(...done) : null;
  const firstYear = earliest === null ? thisYear : jdnToGregorian(earliest).year - 1;

  const reports: PeriodReport[] = [];
  for (let year = thisYear; year >= firstYear; year--) {
    for (const period of getFastPeriodsOfYear(year, church)) {
      // Before the first mark there is nothing to look back on (an app that was not yet in use).
      if (earliest !== null && period.endJdn < earliest) continue;
      const report = buildReport(period, done, church, todayJdn, options);
      if (!report.started) continue;
      if (report.ended || report.markedDays > 0) reports.push(report);
    }
  }
  return reports.sort((a, b) => b.period.startJdn - a.period.startJdn);
}

/** How long after a fast ends its "report is ready" card is still offered, in days. */
export const READY_WINDOW_DAYS = 30;

/**
 * The fast whose report Today should offer: the latest one that ended within the last month, has
 * at least one mark and has not been seen. `seen` holds period keys. Null when there is none.
 */
export function pendingReport(
  done: ReadonlySet<number>,
  seen: ReadonlySet<string>,
  church: Church,
  todayJdn: number,
  options?: DayOptions,
): PeriodReport | null {
  const thisYear = jdnToGregorian(todayJdn).year;
  const candidates: FastPeriod[] = [thisYear - 1, thisYear].flatMap((year) =>
    getFastPeriodsOfYear(year, church),
  );
  const ready = candidates
    .filter((p) => p.endJdn < todayJdn && todayJdn - p.endJdn <= READY_WINDOW_DAYS)
    .filter((p) => !seen.has(`${p.id}-${p.year}`))
    .sort((a, b) => b.endJdn - a.endJdn);
  for (const period of ready) {
    const report = buildReport(period, done, church, todayJdn, options);
    if (report.markedDays > 0) return report;
  }
  return null;
}
