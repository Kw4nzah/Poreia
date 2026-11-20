// Small pure helpers of the reading screen.

import { LiturgySection, LiturgySpeaker } from './types';

/** Section chips are only worth their space when there is more than one section. */
export const showSectionChips = (sections: readonly unknown[]) => sections.length > 1;

/** Line height for long reading: 1.65x, a touch more for Church Slavonic with its tall accents. */
export function readingLineHeight(fontSize: number, slavonic: boolean): number {
  return Math.round(fontSize * (slavonic ? 1.8 : 1.65));
}

/** The section the block at `index` belongs to: the last section starting at or before it. */
export function sectionAtIndex(
  starts: Partial<Record<LiturgySection, number>>,
  index: number,
): LiturgySection | null {
  let best: LiturgySection | null = null;
  let bestStart = -1;
  for (const [section, start] of Object.entries(starts) as [LiturgySection, number][]) {
    if (start <= index && start > bestStart) {
      best = section;
      bestStart = start;
    }
  }
  return best;
}

/** The "back to top" control shows once the reader is this many blocks down. */
export const BACK_TO_TOP_AFTER = 12;
export const showBackToTop = (firstIndex: number) => firstIndex >= BACK_TO_TOP_AFTER;

/** Speaker label colours, chosen for 4.5:1 on the page background of each theme. */
const SPEAKER_COLORS: Record<'light' | 'dark', Partial<Record<LiturgySpeaker, string>>> = {
  light: {
    priest: '#7A1F2B',
    deacon: '#1F5A7A',
    choir: '#4F6B2A',
    reader: '#6B4A8C',
    people: '#7A4F0E',
  },
  dark: {
    priest: '#E0959D',
    deacon: '#8FC3E0',
    choir: '#B5CC9A',
    reader: '#C9AEE6',
    people: '#E3BD7A',
  },
};

/** Colour of a speaker's label, or null for speakers without one (rubric, omitted). */
export function speakerColor(who: LiturgySpeaker, dark: boolean): string | null {
  return SPEAKER_COLORS[dark ? 'dark' : 'light'][who] ?? null;
}
