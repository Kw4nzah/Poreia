// Not a behaviour test: prints how many readings of 2026-2027 have bundled verse text,
// and fails if coverage of the main liturgical readings drops (Epistle and Gospel).
import { describe, expect, it } from 'vitest';
import { gregorianToJdn, jdnToGregorian } from '../calendar';
import { getCommemoration } from './index';
import { readingVerses } from './text';

describe('text coverage', () => {
  it('covers Epistle and Gospel readings, and reports the rest', () => {
    const stats = {
      en: { all: 0, text: 0, liturgy: 0, liturgyText: 0 },
      ru: { all: 0, text: 0, liturgy: 0, liturgyText: 0 },
    };
    const lacking = new Map<string, number>();
    for (const church of ['greek', 'russian'] as const) {
      for (let jdn = gregorianToJdn(2026, 1, 1); jdn <= gregorianToJdn(2027, 12, 31); jdn++) {
        for (const reading of getCommemoration(jdnToGregorian(jdn), church)!.readings) {
          for (const lang of ['en', 'ru'] as const) {
            const liturgy = reading.kind === 'epistle' || reading.kind === 'gospel';
            const has = readingVerses(reading, lang) !== null;
            stats[lang].all++;
            if (has) stats[lang].text++;
            if (liturgy) {
              stats[lang].liturgy++;
              if (has) stats[lang].liturgyText++;
            }
            if (lang === 'en' && !has) {
              const key = reading.runs.length ? reading.runs[0][0] : 'composite';
              lacking.set(key, (lacking.get(key) ?? 0) + 1);
            }
          }
        }
      }
    }
    console.log(JSON.stringify(stats), 'en lacking by book:', JSON.stringify([...lacking]));
    // Every Epistle and Gospel is New Testament: only the numbering-differs ones lack text.
    expect(stats.en.liturgyText / stats.en.liturgy).toBeGreaterThan(0.98);
    expect(stats.ru.liturgyText / stats.ru.liturgy).toBeGreaterThan(0.98);
  });
});
