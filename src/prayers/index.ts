// Which prayers exist and how they are grouped. Ids only; the texts live in the i18n layer.

export const PRAYER_GROUPS = [
  { id: 'basic', prayers: ['lordsPrayer', 'creed', 'heavenlyKing'] },
  { id: 'daily', prayers: ['morning', 'evening', 'meals'] },
  { id: 'lent', prayers: ['ephrem'] },
] as const;

export type PrayerGroupId = (typeof PRAYER_GROUPS)[number]['id'];
export type PrayerId = (typeof PRAYER_GROUPS)[number]['prayers'][number];

export const PRAYER_IDS: readonly PrayerId[] = PRAYER_GROUPS.flatMap((group) => group.prayers);

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
