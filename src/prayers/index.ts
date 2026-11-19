// Which prayers exist and how they are grouped. Ids only; the texts live in the i18n layer.

import type { FeastId } from '../calendar';

/**
 * The feasts that have a prayer page (troparion and kontakion). A feast prayer's id is the
 * feast's own id, so the calendar can link to it directly. A test fails to compile if a feast
 * is added to the calendar without one.
 */
export const FEAST_PRAYER_IDS = [
  'pascha',
  'palmSunday',
  'lazarusSaturday',
  'ascension',
  'pentecost',
  'nativityOfTheotokos',
  'exaltationOfCross',
  'protectionOfTheotokos',
  'entryOfTheotokos',
  'nativityOfChrist',
  'circumcision',
  'theophany',
  'meetingOfTheLord',
  'annunciation',
  'nativityOfForerunner',
  'peterAndPaul',
  'transfiguration',
  'dormition',
  'beheadingOfJohn',
] as const satisfies readonly FeastId[];

export type FeastPrayerId = (typeof FEAST_PRAYER_IDS)[number];

export const PRAYER_GROUPS = [
  { id: 'basic', prayers: ['lordsPrayer', 'creed', 'heavenlyKing', 'trisagion'] },
  { id: 'daily', prayers: ['morning', 'evening', 'meals'] },
  { id: 'lent', prayers: ['ephrem', 'manasseh'] },
  { id: 'feasts', prayers: FEAST_PRAYER_IDS },
] as const;

export type PrayerGroupId = (typeof PRAYER_GROUPS)[number]['id'];
export type PrayerId = (typeof PRAYER_GROUPS)[number]['prayers'][number];

export const PRAYER_IDS: readonly PrayerId[] = PRAYER_GROUPS.flatMap((group) => group.prayers);

/** Prayers that are not feast hymns. */
export type RegularPrayerId = Exclude<PrayerId, FeastPrayerId>;

export function isFeastPrayerId(value: unknown): value is FeastPrayerId {
  return FEAST_PRAYER_IDS.includes(value as FeastPrayerId);
}

export function isPrayerId(value: unknown): value is PrayerId {
  return PRAYER_IDS.includes(value as PrayerId);
}

export interface PrayerSection {
  /** Shown above the section when a prayer has several parts. */
  heading?: string;
  paragraphs: readonly string[];
}

export interface PrayerText {
  title: string;
  /** A small muted line under the text, e.g. that a translation is not yet reviewed. */
  note?: string;
  sections: readonly PrayerSection[];
}

/** Reading sizes for the prayer text, smallest first. */
export const PRAYER_TEXT_SIZES = [
  { fontSize: 17, lineHeight: 27 },
  { fontSize: 19, lineHeight: 31 },
  { fontSize: 22, lineHeight: 36 },
] as const;

export type PrayerTextSize = 0 | 1 | 2;

export const DEFAULT_PRAYER_TEXT_SIZE: PrayerTextSize = 1;

export function isPrayerTextSize(value: unknown): value is PrayerTextSize {
  return value === 0 || value === 1 || value === 2;
}
