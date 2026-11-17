// Verse text of a reading, for the languages that have a public-domain source bundled.
// Built by scripts/build-reading-texts.mjs.
//   en: New Testament = Berean Standard Bible (public domain); Old Testament and deuterocanon = LXX2012
//       (Septuagint numbering, as the lectionary uses).
//   ru: Synodal Translation (1876); Old Testament only for chapters that match the Septuagint verse for verse.
// Everything else (unmatched ru Old Testament chapters, composite readings, Turkish) has no text and the
// screens show the reference alone.

import type { BookLanguage } from './books';
import type { Reading } from './index';

export interface ReadingVerse {
  chapter: number;
  verse: number;
  text: string;
}

type TextData = Record<string, Record<string, Record<string, string>>>;

export const NEW_TESTAMENT = new Set(
  'MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(
    ' ',
  ),
);

/** Name of the translation the verses of this reading come from. */
export function translationName(reading: Reading, language: BookLanguage): string | undefined {
  if (language === 'ru') return 'Синодальный перевод (1876)';
  if (language !== 'en') return undefined;
  const book = reading.runs[0]?.[0] ?? '';
  return NEW_TESTAMENT.has(book) ? 'Berean Standard Bible' : 'LXX2012 (Septuagint)';
}

const cache: Partial<Record<BookLanguage, TextData>> = {};

// Highest verse number of a chapter, computed once per chapter object (Object.keys over a long
// chapter on every lookup showed up in the readings lists).
const lastVerses = new WeakMap<object, number>();

function lastVerseOf(verses: Record<string, string>): number {
  let last = lastVerses.get(verses);
  if (last === undefined) {
    last = 0;
    for (const key in verses) last = Math.max(last, Number(key));
    lastVerses.set(verses, last);
  }
  return last;
}

// Required lazily: each file is large and only the user's language is ever needed.
function load(language: BookLanguage): TextData | null {
  if (language === 'tr') return null;
  cache[language] ??=
    language === 'en'
      ? (require('./data/text-en.json') as TextData)
      : (require('./data/text-ru.json') as TextData);
  return cache[language] ?? null;
}

/** Verses of a reading in order, or null when any verse of it has no bundled text. */
export function readingVerses(reading: Reading, language: BookLanguage): ReadingVerse[] | null {
  const data = load(language);
  if (!data || reading.runs.length === 0) return null;
  const out: ReadingVerse[] = [];
  for (const [book, c1, v1, c2, v2] of reading.runs) {
    const chapters = data[book];
    if (!chapters) return null;
    for (let c = c1; c <= c2; c++) {
      const verses = chapters[c];
      if (!verses) return null;
      const last = c === c2 ? v2 : lastVerseOf(verses);
      for (let v = c === c1 ? v1 : 1; v <= last; v++) {
        const text = verses[v];
        if (text === undefined) return null;
        // Verse bridges and verses a translation leaves out are empty: skip them.
        if (text !== '') out.push({ chapter: c, verse: v, text });
      }
    }
  }
  return out.length > 0 ? out : null;
}

/**
 * Text to show for a reading: the user's language when bundled, otherwise English (so every
 * reading with any bundled text can be opened). `fallback` tells the screen to say so.
 */
export function readingText(
  reading: Reading,
  language: BookLanguage,
): { verses: ReadingVerse[]; language: BookLanguage; fallback: boolean } | null {
  const own = readingVerses(reading, language);
  if (own) return { verses: own, language, fallback: false };
  if (language === 'en') return null;
  const english = readingVerses(reading, 'en');
  return english ? { verses: english, language: 'en', fallback: true } : null;
}

function hasVerses(reading: Reading, language: BookLanguage): boolean {
  const data = load(language);
  if (!data || reading.runs.length === 0) return false;
  let any = false;
  for (const [book, c1, v1, c2, v2] of reading.runs) {
    const chapters = data[book];
    if (!chapters) return false;
    for (let c = c1; c <= c2; c++) {
      const verses = chapters[c];
      if (!verses) return false;
      // Only the verses at the edges can be missing in a chapter that exists.
      const first = c === c1 ? v1 : 1;
      const last = c === c2 ? v2 : lastVerseOf(verses);
      for (let v = first; v <= last; v++) {
        const text = verses[v];
        if (text === undefined) return false;
        if (text !== '') any = true;
      }
    }
  }
  return any;
}

/** Same answer as `readingText(...) !== null`, without building the verse arrays. */
export function readingHasText(reading: Reading, language: BookLanguage): boolean {
  return hasVerses(reading, language) || (language !== 'en' && hasVerses(reading, 'en'));
}
