import { describe, expect, it } from 'vitest';
import { hebrewPsalm, readingUrl } from './links';
import type { Reading } from './index';

const reading = (book: string, c: number, v: number): Reading => ({
  kind: 'other',
  source: 'x',
  runs: [[book, c, v, c, v + 2]],
});

describe('readingUrl', () => {
  it('links the New Testament and deuterocanon to the verse', () => {
    expect(readingUrl(reading('MAT', 9, 9), 'tr')).toBe('https://www.bible.com/bible/2308/MAT.9.9.KKDEU');
    expect(readingUrl(reading('WIS', 3, 1), 'tr')).toBe('https://www.bible.com/bible/2308/WIS.3.1.KKDEU');
  });
  it('maps Septuagint psalm numbers to Hebrew ones, chapter only', () => {
    expect(readingUrl(reading('PSA', 50, 1), 'tr')).toBe('https://www.bible.com/bible/2308/PSA.51.KKDEU');
    expect(hebrewPsalm(22)).toBe(23);
    expect(hebrewPsalm(113)).toBeNull();
    expect(hebrewPsalm(150)).toBe(150);
  });
  it('uses the version of the user’s language', () => {
    expect(readingUrl(reading('MAT', 9, 9), 'en')).toBe('https://www.bible.com/bible/3548/MAT.9.9.RSVCI');
    expect(readingUrl(reading('MAT', 9, 9), 'ru')).toBe('https://www.bible.com/bible/400/MAT.9.9.SYNO');
    // the Synodal psalter on YouVersion keeps the Septuagint numbers, RSVCI uses the Hebrew ones
    expect(readingUrl(reading('PSA', 50, 1), 'ru')).toBe('https://www.bible.com/bible/400/PSA.50.SYNO');
    expect(readingUrl(reading('PSA', 50, 1), 'en')).toBe('https://www.bible.com/bible/3548/PSA.51.RSVCI');
    expect(readingUrl(reading('WIS', 3, 1), 'ru')).toBeNull();
  });
  it('gives no link where numbering is unsafe or the reading has no runs', () => {
    expect(readingUrl(reading('JER', 1, 1), 'tr')).toBeNull();
    expect(readingUrl(reading('PRO', 1, 1), 'tr')).toBeNull();
    expect(readingUrl({ kind: 'other', source: 'x', runs: [] }, 'tr')).toBeNull();
  });
});
