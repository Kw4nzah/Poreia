// Verse text of a reading, for the languages that have a public-domain source bundled.
// Built by scripts/build-reading-texts.mjs.
//   en: New Testament = World English Bible; Old Testament and deuterocanon = LXX2012
//       (Septuagint numbering, as the lectionary uses).
//   ru: New Testament = Synodal Translation (1876) only.
// Everything else (ru Old Testament, composite readings, Turkish) has no text and the
// screens show the reference alone.

import type { BookLanguage } from './books';
import type { Reading } from './index';

export interface ReadingVerse {
  chapter: number;
  verse: number;
  text: string;
}

type TextData = Record<string, Record<string, Record<string, string>>>;

const NEW_TESTAMENT = new Set(
  'MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' '),
);

/** Name of the translation the verses of this reading come from. */
export function translationName(reading: Reading, language: BookLanguage): string | undefined {
  if (language === 'ru') return 'Синодальный перевод (1876)';
  if (language !== 'en') return undefined;
  const book = reading.runs[0]?.[0] ?? '';
  return NEW_TESTAMENT.has(book) ? 'World English Bible' : 'LXX2012 (Septuagint)';
}

const cache: Partial<Record<BookLanguage, TextData>> = {};

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
      const last = c === c2 ? v2 : Math.max(...Object.keys(verses).map(Number));
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
