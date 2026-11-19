// Favourite prayers and the "continue where you left off" bookmark. Pure, so it can be tested
// without a device. Everything read from storage or a backup is untrusted.

import { PRAYER_IDS, PrayerId, isPrayerId } from '.';

/** The most favourites kept: every prayer there is, so a real list never hits it. */
export const MAX_FAVORITE_PRAYERS = PRAYER_IDS.length;
/** Largest scroll offset kept, in pixels; a prayer page is never anywhere near this long. */
export const MAX_SCROLL_OFFSET = 100_000;

/** Known ids only, each once, in stored order, capped. Anything else is dropped; never throws. */
export function cleanFavoritePrayers(value: unknown): PrayerId[] {
  if (!Array.isArray(value)) return [];
  const out: PrayerId[] = [];
  // Look at no more entries than a sane list could hold, so a huge array costs nothing.
  for (const item of value.slice(0, MAX_FAVORITE_PRAYERS * 4)) {
    if (isPrayerId(item) && !out.includes(item)) out.push(item);
    if (out.length === MAX_FAVORITE_PRAYERS) break;
  }
  return out;
}

/** The list with `id` removed if it is there, else added at the end. */
export function toggleFavoritePrayer(favorites: readonly PrayerId[], id: PrayerId): PrayerId[] {
  const cleaned = cleanFavoritePrayers(favorites);
  return cleaned.includes(id)
    ? cleaned.filter((item) => item !== id)
    : cleanFavoritePrayers([...cleaned, id]);
}

/** The prayer last opened and how far down it the user had read. */
export interface PrayerBookmark {
  id: PrayerId;
  /** Scroll offset in pixels: a whole number from 0 up. */
  scroll: number;
}

/** A well-formed bookmark of a prayer that still exists, or null. Never throws. */
export function cleanPrayerBookmark(value: unknown): PrayerBookmark | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const { id, scroll } = value as Record<string, unknown>;
  if (!isPrayerId(id)) return null;
  const y = typeof scroll === 'number' && Number.isFinite(scroll) ? scroll : 0;
  return { id, scroll: Math.round(Math.min(Math.max(y, 0), MAX_SCROLL_OFFSET)) };
}
