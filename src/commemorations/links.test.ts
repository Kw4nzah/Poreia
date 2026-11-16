import { describe, expect, it } from 'vitest';
import { hebrewPsalm, turkishReadingUrl } from './links';
import type { Reading } from './index';

const reading = (book: string, c: number, v: number): Reading => ({
  kind: 'other',
  source: 'x',
  runs: [[book, c, v, c, v + 2]],
});

describe('turkishReadingUrl', () => {
  it('links the New Testament and deuterocanon to the verse', () => {
    expect(turkishReadingUrl(reading('MAT', 9, 9))).toBe('https://www.bible.com/bible/2308/MAT.9.9.KKDEU');
    expect(turkishReadingUrl(reading('WIS', 3, 1))).toBe('https://www.bible.com/bible/2308/WIS.3.1.KKDEU');
  });
  it('maps Septuagint psalm numbers to Hebrew ones, chapter only', () => {
    expect(turkishReadingUrl(reading('PSA', 50, 1))).toBe('https://www.bible.com/bible/2308/PSA.51.KKDEU');
    expect(hebrewPsalm(22)).toBe(23);
    expect(hebrewPsalm(113)).toBeNull();
    expect(hebrewPsalm(150)).toBe(150);
  });
  it('gives no link where numbering is unsafe or the reading has no runs', () => {
    expect(turkishReadingUrl(reading('JER', 1, 1))).toBeNull();
    expect(turkishReadingUrl(reading('PRO', 1, 1))).toBeNull();
    expect(turkishReadingUrl({ kind: 'other', source: 'x', runs: [] })).toBeNull();
  });
});
