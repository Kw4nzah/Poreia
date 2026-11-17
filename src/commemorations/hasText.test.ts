import { describe, expect, it } from 'vitest';
import { gregorianToJdn, jdnToGregorian } from '../calendar';
import { getCommemoration } from './index';
import { readingHasText, readingText } from './text';

describe('readingHasText', () => {
  it('agrees with readingText on every reading of 2026-2027', () => {
    for (const church of ['greek', 'russian'] as const) {
      for (let jdn = gregorianToJdn(2026, 1, 1); jdn <= gregorianToJdn(2027, 12, 31); jdn += 3) {
        for (const reading of getCommemoration(jdnToGregorian(jdn), church)!.readings) {
          for (const lang of ['tr', 'en', 'ru'] as const) {
            expect(readingHasText(reading, lang)).toBe(readingText(reading, lang) !== null);
          }
        }
      }
    }
  });
});
