// Prayer search: case- and accent-insensitive match on a prayer's title and text.

import type { PrayerId, PrayerText } from './index';

/** Lower-case, strip combining marks (NFD) and fold Turkish dotless i. */
export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/ı/g, 'i')
    .toLowerCase();
}

function haystack(prayer: PrayerText): string {
  const parts = [prayer.title];
  for (const section of prayer.sections) {
    if (section.heading) parts.push(section.heading);
    parts.push(...section.paragraphs);
  }
  return normalizeForSearch(parts.join('\n'));
}

/** Ids of the prayers matching `query`; an empty query matches every prayer. */
export function searchPrayers(
  query: string,
  ids: readonly PrayerId[],
  texts: Record<PrayerId, PrayerText>,
): PrayerId[] {
  const needle = normalizeForSearch(query.trim());
  if (!needle) return [...ids];
  return ids.filter((id) => haystack(texts[id]).includes(needle));
}
