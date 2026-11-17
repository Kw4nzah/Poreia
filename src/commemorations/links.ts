// Links from a reading to the same passage in YouVersion (bible.com), which opens the YouVersion
// app when it is installed. The translations behind the links are copyrighted, so nothing of them
// is stored in this app:
//   tr  KKDEU   Kutsal Kitap ve Deuterokanonik Kitaplar (Bible Society in Turkey), version 2308
//   en  RSVCI   Revised Standard Version, Catholic Interconfessional,               version 3548
//   ru  SYNO    Synodal Translation,                                                version 400
// The lectionary uses Septuagint numbering. KKDEU and RSVCI follow the Hebrew numbers for psalms
// (the Synodal psalter on YouVersion uses the Septuagint ones), and a few books are arranged
// differently, so only books and chapters that line up get a link.

import type { BookLanguage } from './books';
import type { Reading } from './index';
import { NEW_TESTAMENT } from './text';

interface Version {
  id: number;
  code: string;
  /** Does the translation include the deuterocanon? */
  deuterocanon: boolean;
  /** Psalm chapters are Hebrew-numbered (the lectionary's are Septuagint-numbered). */
  hebrewPsalms: boolean;
}

const VERSIONS: Record<BookLanguage, Version> = {
  tr: { id: 2308, code: 'KKDEU', deuterocanon: true, hebrewPsalms: true },
  en: { id: 3548, code: 'RSVCI', deuterocanon: true, hebrewPsalms: true },
  ru: { id: 400, code: 'SYNO', deuterocanon: false, hebrewPsalms: false },
};

// Deuterocanon with the same chapter numbers as the Septuagint.
const DEUTEROCANON = new Set('TOB JDT WIS SIR BAR 1MA 2MA 3MA 1ES'.split(' '));
// Old Testament books whose chapters line up closely enough; the link goes to the chapter only.
const OLD_TESTAMENT = new Set(
  'GEN EXO LEV NUM DEU JOS JDG 1SA 2SA 1KI 2KI ISA EZK HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL'.split(' '),
);

/** Hebrew psalm number for a Septuagint psalm, or null where the two do not map one to one. */
export function hebrewPsalm(lxx: number): number | null {
  if (lxx >= 1 && lxx <= 9) return lxx;
  if (lxx >= 10 && lxx <= 112) return lxx + 1;
  if (lxx >= 116 && lxx <= 145) return lxx + 1;
  if (lxx >= 148 && lxx <= 150) return lxx;
  return null;
}

/** YouVersion address of the start of a reading, or null when there is no safe link. */
export function readingUrl(reading: Reading, language: BookLanguage): string | null {
  const first = reading.runs[0];
  if (!first) return null;
  const version = VERSIONS[language];
  const base = `https://www.bible.com/bible/${version.id}`;
  const [book, chapter, verse] = first;
  if (NEW_TESTAMENT.has(book)) return `${base}/${book}.${chapter}.${verse}.${version.code}`;
  if (DEUTEROCANON.has(book)) {
    return version.deuterocanon ? `${base}/${book}.${chapter}.${verse}.${version.code}` : null;
  }
  if (book === 'PSA') {
    const psalm = version.hebrewPsalms ? hebrewPsalm(chapter) : chapter;
    return psalm === null ? null : `${base}/PSA.${psalm}.${version.code}`;
  }
  if (OLD_TESTAMENT.has(book)) return `${base}/${book}.${chapter}.${version.code}`;
  return null;
}
