// Turkish readings are not bundled: the only Turkish Bible with the deuterocanon (KKDEU, Kutsal
// Kitap ve Deuterokanonik Kitaplar, Bible Society in Turkey) is under copyright, so the app links
// to it on bible.com instead. The lectionary uses Septuagint numbering and KKDEU follows the
// Hebrew one, so only books and chapters that line up get a link.

import type { Reading } from './index';
import { NEW_TESTAMENT } from './text';

const VERSION = 'https://www.bible.com/bible/2308';

// Deuterocanon present in KKDEU with the same chapter numbers as the Septuagint.
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

/** bible.com address of the start of a reading in KKDEU, or null when there is no safe link. */
export function turkishReadingUrl(reading: Reading): string | null {
  const first = reading.runs[0];
  if (!first) return null;
  const [book, chapter, verse] = first;
  if (NEW_TESTAMENT.has(book) || DEUTEROCANON.has(book)) {
    return `${VERSION}/${book}.${chapter}.${verse}.KKDEU`;
  }
  if (book === 'PSA') {
    const hebrew = hebrewPsalm(chapter);
    return hebrew === null ? null : `${VERSION}/PSA.${hebrew}.KKDEU`;
  }
  if (OLD_TESTAMENT.has(book)) return `${VERSION}/${book}.${chapter}.KKDEU`;
  return null;
}
