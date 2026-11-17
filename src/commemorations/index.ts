// Saints, feasts and scripture readings of a day, from the bundled orthocal.info data
// (see scripts/build-commemorations.mjs). Names and verse references only: no lives of
// saints and no verse text here.

import type { CivilDate } from '../calendar';
import type { ChurchId } from '../calendar';
import { bookName, type BookLanguage } from './books';

export { bookName, hasBookName, type BookLanguage } from './books';

/** [book, chapter1, verse1, chapter2, verse2] */
export type VerseRun = readonly [string, number, number, number, number];

export type ReadingKind = 'epistle' | 'gospel' | 'vespers' | 'matins' | 'hours' | 'other';

export interface Reading {
  kind: ReadingKind;
  /** Service label as published, e.g. "Epistle", "3rd Matins Gospel". English only. */
  source: string;
  /** Empty for composite readings; use `label` instead. */
  runs: readonly VerseRun[];
  /** Composite readings only: reference as published, e.g. "Genesis 17.1-2, 4, 5-7". English only. */
  label?: string;
}

export interface Commemoration {
  /** Weekday title, e.g. "Monday of the 25th week after Pentecost". English only. */
  title: string;
  /** Feast and saint names, feast first. English only. */
  names: readonly string[];
  /** 0 = no feast .. 8 = great feast (orthocal feast level). */
  feastLevel: number;
  readings: readonly Reading[];
}

interface RawDay {
  t: string[];
  n: string[];
  l: number;
  r: { s: string; d?: string; v: (string | number)[][] }[];
}

type RawYear = Record<string, RawDay>;

// Each year file is required on first use, not at startup: the app only ever reads the files of
// the user's church and the year being looked at. Metro needs the literal paths.
const LOADERS: Record<string, () => unknown> = {
  'greek-2026': () => require('./data/gregorian-2026.json'),
  'greek-2027': () => require('./data/gregorian-2027.json'),
  'greek-2028': () => require('./data/gregorian-2028.json'),
  'greek-2029': () => require('./data/gregorian-2029.json'),
  'greek-2030': () => require('./data/gregorian-2030.json'),
  'russian-2026': () => require('./data/julian-2026.json'),
  'russian-2027': () => require('./data/julian-2027.json'),
  'russian-2028': () => require('./data/julian-2028.json'),
  'russian-2029': () => require('./data/julian-2029.json'),
  'russian-2030': () => require('./data/julian-2030.json'),
};

const loaded = new Map<string, RawYear>();

function yearData(church: ChurchId, year: number): RawYear | null {
  const id = `${church}-${year}`;
  const cached = loaded.get(id);
  if (cached) return cached;
  const load = Object.hasOwn(LOADERS, id) ? LOADERS[id] : undefined;
  if (!load) return null;
  const data = load() as RawYear;
  loaded.set(id, data);
  return data;
}

/** Years with bundled data. Rerun scripts/build-commemorations.mjs to add more. */
export const COMMEMORATION_YEARS: readonly number[] = [2026, 2027, 2028, 2029, 2030];

export function readingKind(source: string): ReadingKind {
  if (source === 'Epistle') return 'epistle';
  if (source === 'Gospel') return 'gospel';
  if (/Vespers/.test(source)) return 'vespers';
  if (/Matins/.test(source)) return 'matins';
  if (/Hour/.test(source)) return 'hours';
  return 'other';
}

export const READING_GROUPS = ['liturgy', 'vespers', 'matins', 'hours', 'other'] as const;
export type ReadingGroupId = (typeof READING_GROUPS)[number];

function groupOf(kind: ReadingKind): ReadingGroupId {
  return kind === 'epistle' || kind === 'gospel' ? 'liturgy' : kind;
}

/** Readings split by service, in READING_GROUPS order; empty groups are left out. */
export function groupReadings(
  readings: readonly Reading[],
): { id: ReadingGroupId; readings: Reading[] }[] {
  return READING_GROUPS.map((id) => ({
    id,
    readings: readings.filter((r) => groupOf(r.kind) === id),
  })).filter((group) => group.readings.length > 0);
}

/** One line for a reading in the given language; composite readings keep the published label. */
export function readingReference(reading: Reading, language: BookLanguage): string {
  return reading.runs.length > 0 ? formatReference(reading.runs, language) : (reading.label ?? '');
}

/** The Greek church follows the new calendar, the Russian church the old one. */
export function getCommemoration(date: CivilDate, church: ChurchId): Commemoration | null {
  const year = yearData(church, date.year);
  if (!year) return null;
  const key = `${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
  const day = year[key];
  if (!day) return null;
  return {
    title: day.t[0] ?? '',
    names: day.n,
    feastLevel: day.l,
    readings: day.r.map((r) => ({
      kind: readingKind(r.s),
      source: r.s,
      runs: r.v as unknown as VerseRun[],
      ...(r.d ? { label: r.d.replace(/^Composite \d+ - /, '') } : {}),
    })),
  };
}

/** "Matta 9:9-13", runs joined with "; ". */
export function formatReference(runs: readonly VerseRun[], language: BookLanguage): string {
  return runs
    .map(([book, c1, v1, c2, v2]) => {
      const start = `${bookName(book, language)} ${c1}:${v1}`;
      if (c1 === c2) return v1 === v2 ? start : `${start}-${v2}`;
      return `${start}-${c2}:${v2}`;
    })
    .join('; ');
}
