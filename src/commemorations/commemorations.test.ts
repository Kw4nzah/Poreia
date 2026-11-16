import { describe, expect, it } from 'vitest';
import { jdnToGregorian, gregorianToJdn } from '../calendar';
import {
  COMMEMORATION_YEARS,
  formatReference,
  getCommemoration,
  hasBookName,
  readingKind,
} from './index';

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
