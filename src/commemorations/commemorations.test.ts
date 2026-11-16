import { describe, expect, it } from 'vitest';
import { jdnToGregorian, gregorianToJdn } from '../calendar';
import {
  COMMEMORATION_YEARS,
  formatReference,
  getCommemoration,
  hasBookName,
  readingKind,
} from './index';
import { readingVerses, translationName } from './text';

describe('getCommemoration', () => {
  // Values checked against https://orthocal.info/api/{gregorian,julian}/2026/11/16/ on 2026-11-16.
  it('gives the Greek (new calendar) day', () => {
    const day = getCommemoration({ year: 2026, month: 11, day: 16 }, 'greek');
    expect(day?.names).toEqual(['Holy Apostle and Evangelist Matthew']);
    expect(day?.feastLevel).toBe(4);
    const gospel = day?.readings.find((r) => r.kind === 'gospel');
    expect(formatReference(gospel!.runs, 'en')).toBe('Matthew 9:9-13');
  });

  it('gives the Russian (old calendar) day for the same civil date', () => {
    const day = getCommemoration({ year: 2026, month: 11, day: 16 }, 'russian');
    expect(day?.names[0]).toBe('Martyrs Acepsimus, Joseph, Aithalas');
    const epistle = day?.readings.find((r) => r.kind === 'epistle');
    expect(formatReference(epistle!.runs, 'en')).toBe('2 Thessalonians 1:1-10');
  });

  it('returns null outside the bundled years', () => {
    expect(getCommemoration({ year: 2025, month: 1, day: 1 }, 'greek')).toBeNull();
    expect(getCommemoration({ year: 2040, month: 1, day: 1 }, 'russian')).toBeNull();
  });

  it('has names and readings for every day of every bundled year', () => {
    for (const church of ['greek', 'russian'] as const) {
      for (const year of COMMEMORATION_YEARS) {
        for (let jdn = gregorianToJdn(year, 1, 1); jdn <= gregorianToJdn(year, 12, 31); jdn++) {
          const day = getCommemoration(jdnToGregorian(jdn), church);
          expect(day, `${church} ${jdn}`).not.toBeNull();
          expect(day!.names.length).toBeGreaterThan(0);
          expect(day!.readings.length).toBeGreaterThan(0);
          for (const reading of day!.readings) {
            expect(reading.runs.length > 0 || !!reading.label, `${church} ${jdn}`).toBe(true);
            for (const [book] of reading.runs) expect(hasBookName(book), book).toBe(true);
          }
        }
      }
    }
  });
});

describe('formatReference', () => {
  it('formats the three languages and multi-chapter runs', () => {
    expect(formatReference([['MAT', 9, 9, 9, 13]], 'tr')).toBe('Matta 9:9-13');
    expect(formatReference([['MAT', 9, 9, 9, 13]], 'ru')).toBe('От Матфея 9:9-13');
    expect(formatReference([['1PE', 1, 1, 2, 6]], 'en')).toBe('1 Peter 1:1-2:6');
    expect(formatReference([['JHN', 3, 16, 3, 16]], 'en')).toBe('John 3:16');
    expect(formatReference([['GEN', 1, 1, 1, 13], ['GEN', 2, 1, 2, 3]], 'en')).toBe(
      'Genesis 1:1-13; Genesis 2:1-3',
    );
  });
});

describe('readingVerses', () => {
  const day = getCommemoration({ year: 2026, month: 11, day: 16 }, 'greek')!;
  const gospel = day.readings.find((r) => r.kind === 'gospel')!;

  it('gives the verses in en and ru, none in tr', () => {
    const en = readingVerses(gospel, 'en')!;
    expect(en.map((v) => v.verse)).toEqual([9, 10, 11, 12, 13]);
    expect(en[0].text).toContain('Matthew sitting at the tax collection office');
    const ru = readingVerses(gospel, 'ru')!;
    expect(ru).toHaveLength(5);
    expect(ru[0].text).toContain('по имени Матфея');
    expect(readingVerses(gospel, 'tr')).toBeNull();
  });

  it('follows a run across chapters', () => {
    const verses = readingVerses(
      { kind: 'other', source: 'x', runs: [['1PE', 1, 24, 2, 3]] },
      'en',
    )!;
    expect(verses[0]).toMatchObject({ chapter: 1, verse: 24 });
    expect(verses[verses.length - 1]).toMatchObject({ chapter: 2, verse: 3 });
    expect(verses.map((v) => v.chapter)).toContain(2);
  });

  it('has Old Testament and deuterocanon text in en (LXX numbering) but not in ru', () => {
    const isaiah = { kind: 'other', source: 'x', runs: [['ISA', 35, 1, 35, 10]] } as const;
    const en = readingVerses(isaiah, 'en')!;
    expect(en).toHaveLength(10);
    expect(en[0].text).toMatch(/wilderness/i);
    expect(translationName(isaiah, 'en')).toBe('LXX2012 (Septuagint)');
    const wisdom = readingVerses({ kind: 'other', source: 'x', runs: [['WIS', 3, 1, 3, 9]] }, 'en')!;
    expect(wisdom[0].text).toMatch(/righteous/i);
    expect(readingVerses(isaiah, 'ru')).toBeNull();
    expect(readingVerses({ kind: 'other', source: 'x', runs: [['WIS', 3, 1, 3, 9]] }, 'ru')).toBeNull();
  });

  it('has no text for composite or numbering-differs readings', () => {
    expect(readingVerses({ kind: 'other', source: 'x', runs: [], label: 'Genesis 1' }, 'en')).toBeNull();
    expect(readingVerses({ kind: 'other', source: 'x', runs: [['2CO', 13, 11, 13, 14]] }, 'ru')).toBeNull();
  });

  it('has text for every New Testament reading the data allows', () => {
    const NT = /^(MAT|MRK|LUK|JHN|ACT|ROM|[12]CO|GAL|EPH|PHP|COL|[12]TH|[12]TI|TIT|PHM|HEB|JAS|[12]PE|[123]JN|JUD|REV)$/;
    for (const church of ['greek', 'russian'] as const) {
      for (let jdn = gregorianToJdn(2026, 1, 1); jdn <= gregorianToJdn(2027, 12, 31); jdn += 1) {
        for (const reading of getCommemoration(jdnToGregorian(jdn), church)!.readings) {
          if (reading.runs.length === 0 || !reading.runs.every((r) => NT.test(r[0]))) continue;
          const en = readingVerses(reading, 'en');
          const ru = readingVerses(reading, 'ru');
          // Same readings are covered in both languages, except the few numbering differences.
          expect(en === null, `${church} ${jdn} ${reading.source}`).toBe(ru === null);
        }
      }
    }
  });
});

describe('readingKind', () => {
  it('classifies service labels', () => {
    expect(readingKind('Epistle')).toBe('epistle');
    expect(readingKind('Gospel')).toBe('gospel');
    expect(readingKind('Vespers')).toBe('vespers');
    expect(readingKind('3rd Matins Gospel')).toBe('matins');
    expect(readingKind('6th Hour, Prophecy')).toBe('hours');
    expect(readingKind('Cross Procession')).toBe('other');
  });
});
