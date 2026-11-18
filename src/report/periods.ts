// The major fasts as dated stretches of days, for any year. Dates come from the calendar engine
// (getPeriods), never from a table, so they follow Pascha and the church's fixed calendar. Days
// are Julian Day Numbers (JDN), so a stretch that crosses New Year (the Nativity Fast on the
// Julian calendar) needs no special handling and no timezone ever matters.

import { Church, MAX_ISO_YEAR, MIN_ISO_YEAR, MajorFastId, getPeriods } from '../calendar';

/** The fasts a report is made for, in the order of the church year. */
export const REPORT_FAST_IDS: readonly MajorFastId[] = [
  'greatLent',
  'apostlesFast',
  'dormitionFast',
  'nativityFast',
];

export interface FastPeriod {
  id: MajorFastId;
  /**
   * The year the engine anchors the fast in: the year of Pascha, or of the fixed-date start.
   * The Nativity Fast of 2027 on the Julian calendar runs into January 2028 and is still "2027".
   */
  year: number;
  startJdn: number;
  /** Inclusive. */
  endJdn: number;
}

/**
 * One major fast of one year, or null when that year has none (on the new calendar a late Pascha
 * can leave no room for the Apostles' Fast). Great Lent runs through Holy Week up to the eve of
 * Pascha, as the "next fast" card on the Today screen does.
 */
export function getFastPeriod(id: MajorFastId, year: number, church: Church): FastPeriod | null {
  const periods = getPeriods(year, church);
  const range = periods.find((p) => p.id === id);
  if (!range) return null;
  let endJdn = range.endJdn;
  if (id === 'greatLent') {
    const holyWeek = periods.find((p) => p.id === 'holyWeek');
    if (holyWeek) endJdn = holyWeek.endJdn;
  }
  return { id, year, startJdn: range.startJdn, endJdn };
}

/** The major fasts anchored in a year, earliest first. */
export function getFastPeriodsOfYear(year: number, church: Church): FastPeriod[] {
  return REPORT_FAST_IDS.flatMap((id) => getFastPeriod(id, year, church) ?? []).sort(
    (a, b) => a.startJdn - b.startJdn,
  );
}

export interface PeriodRef {
  id: MajorFastId;
  year: number;
}

/** Address of a report: `greatLent-2027`. Also the suffix of its "seen" flag in storage. */
export function periodKey(ref: PeriodRef): string {
  return `${ref.id}-${ref.year}`;
}

/** The fast a key stands for, or null for anything else (a typo, an old link). Never throws. */
export function parsePeriodKey(value: unknown): PeriodRef | null {
  if (typeof value !== 'string') return null;
  const match = /^([A-Za-z]+)-(\d{4})$/.exec(value);
  if (!match) return null;
  const id = REPORT_FAST_IDS.find((candidate) => candidate === match[1]);
  const year = Number(match[2]);
  if (!id || year < MIN_ISO_YEAR || year > MAX_ISO_YEAR) return null;
  return { id, year };
}
