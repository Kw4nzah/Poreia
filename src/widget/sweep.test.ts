import { describe, expect, it } from 'vitest';
import { CHURCHES, gregorianToJdn, jdnToGregorian } from '../calendar';
import { LANGUAGES } from '../i18n';
import { widgetContentFor } from './content';

describe('widgetContentFor over whole years', () => {
  it('words every day of 2026-2031 in every church and language (including the bundle edge)', () => {
    const start = gregorianToJdn(2026, 1, 1);
    const end = gregorianToJdn(2031, 12, 31);
    for (const church of Object.values(CHURCHES)) {
      for (const language of LANGUAGES) {
        for (let jdn = start; jdn <= end; jdn++) {
          const content = widgetContentFor(jdnToGregorian(jdn), church, language);
          const texts = [content.dateLine, content.title, content.status, content.allowedFoods];
          for (const text of texts) {
            expect(text.trim()).not.toBe('');
            expect(text).not.toMatch(/undefined|NaN/);
          }
          if (content.progress) {
            expect(content.progress.percent).toBeGreaterThan(0);
            expect(content.progress.percent).toBeLessThanOrEqual(100);
            expect(content.progress.day).toBeLessThanOrEqual(content.progress.total);
          }
        }
      }
    }
  });
});
