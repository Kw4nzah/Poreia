import { describe, expect, it } from 'vitest';
import app from '../../app.json';
import { CHURCHES } from '../calendar';
import { LANGUAGES, MESSAGES } from '../i18n';
import { FAST_WIDGET_NAME, pickReading, widgetContentFor } from './content';

const greek = CHURCHES.greek;

describe('widgetContentFor', () => {
  it('names the fast, its progress, the food lists and the reading', () => {
    const content = widgetContentFor({ year: 2026, month: 11, day: 17 }, greek, 'tr');
    expect(content.title).toBe('Noel Orucu');
    expect(content.weekday).toBe('Salı');
    expect(content.fasting).toBe(true);
    expect(content.feast).toBeNull();
    expect(content.levelShort).toBe('Et, Süt, Balık Yok');
    // The wine-and-oil level: only oil and wine among the food groups, plus the basics.
    expect(content.allowedFoods).toBe('Zeytinyağı, şarap, ekmek, sebze, meyve');
    expect(content.avoidedFoods).toBe('Et, süt, yumurta, balık');
    expect(content.progress).toEqual({
      text: '40 günün 3. günü',
      day: 3,
      total: 40,
      badge: '3 / 40. Gün',
      badgeShort: '3. Gün',
      percent: 8,
      percentText: '%8',
    });
    expect(content.labels).toEqual({
      allowed: 'Serbest',
      avoided: 'Uzak Durulan',
      complete: 'Bugün oruç tutuyorum',
      completed: 'Oruç tutuyorum',
      noFast: 'Oruç yok',
    });
  });

  it('rounds the percent from day / total', () => {
    // Day 35 of 40 is 87.5 %, shown as 88.
    const lent = widgetContentFor({ year: 2026, month: 3, day: 27 }, greek, 'tr');
    const { day, total, percent } = lent.progress!;
    expect(percent).toBe(Math.round((day / total) * 100));
    const last = widgetContentFor({ year: 2026, month: 12, day: 24 }, greek, 'en');
    expect(last.progress?.percent).toBe(100);
    expect(last.progress?.percentText).toBe('100%');
  });

  it('has a reference for the day without verse text', () => {
    const content = widgetContentFor({ year: 2026, month: 11, day: 17 }, greek, 'tr');
    expect(content.reading).toMatch(/\d+:\d+/);
    expect(content.reading).not.toMatch(/\n/);
  });

  it('is calm on a day without fasting: weekday as title, no counter, no bar', () => {
    const content = widgetContentFor({ year: 2026, month: 10, day: 3 }, greek, 'tr');
    expect(content.title).toBe(content.weekday);
    expect(content.fasting).toBe(false);
    expect(content.progress).toBeNull();
    expect(content.levelShort).toBe(MESSAGES.tr.level.none.title);
    expect(content.avoidedFoods).toBe(MESSAGES.tr.widget.nothing);
  });

  it('keeps a calm day calm inside a period without fasting (Bright Week)', () => {
    // Bright Week 2026: Pascha is 12 April.
    const content = widgetContentFor({ year: 2026, month: 4, day: 15 }, greek, 'en');
    expect(content.fasting).toBe(false);
    expect(content.progress).toBeNull();
    expect(content.title).toBe(content.weekday);
  });

  it('adds the feast name', () => {
    const content = widgetContentFor({ year: 2026, month: 12, day: 25 }, greek, 'en');
    expect(content.feast).toBe(MESSAGES.en.feast.nativityOfChrist);
    expect(content.fasting).toBe(false);
  });

  it('is worded in every language without empty lines', () => {
    for (const language of LANGUAGES) {
      for (const day of [17, 3]) {
        const month = day === 17 ? 11 : 10;
        const content = widgetContentFor({ year: 2026, month, day }, greek, language);
        expect(content.title).not.toBe('');
        expect(content.status).not.toBe('');
        expect(content.levelShort).not.toBe('');
        expect(content.allowedFoods).not.toBe('');
        expect(content.avoidedFoods).not.toBe('');
        expect(content.dateLine).not.toBe('');
        expect(content.reading ?? 'x').not.toBe('');
        if (day === 17) {
          expect(content.progress?.text).toContain('40');
          expect(content.progress?.badge).toContain('40');
        }
      }
    }
  });

  it('localizes the reading reference', () => {
    const tr = widgetContentFor({ year: 2026, month: 3, day: 27 }, greek, 'tr').reading;
    const ru = widgetContentFor({ year: 2026, month: 3, day: 27 }, greek, 'ru').reading;
    expect(tr).toBe('Yeşaya 45:11-17');
    expect(ru).toBe('Исаия 45:11-17');
  });
});

describe('pickReading', () => {
  const run = (book: string) => [book, 1, 1, 1, 2] as const;
  const gospel = { kind: 'gospel', source: 'Gospel', runs: [run('Matthew')] } as const;
  const epistle = { kind: 'epistle', source: 'Epistle', runs: [run('Romans')] } as const;
  const vespers = { kind: 'vespers', source: 'Vespers', runs: [run('Genesis')] } as const;

  it('prefers the Gospel, then the Epistle, then anything else', () => {
    expect(pickReading([epistle, vespers, gospel], 'en')).toBe('Matthew 1:1-2');
    expect(pickReading([vespers, epistle], 'en')).toBe('Romans 1:1-2');
    expect(pickReading([vespers], 'en')).toBe('Genesis 1:1-2');
    expect(pickReading([], 'en')).toBeNull();
  });

  it('skips readings that have no reference', () => {
    const empty = { kind: 'gospel', source: 'Gospel', runs: [] } as const;
    expect(pickReading([empty, epistle], 'en')).toBe('Romans 1:1-2');
  });
});

describe('widget registration', () => {
  it('app.json declares the widget under the name the task handler uses', () => {
    const plugin = app.expo.plugins.find(
      (entry) => Array.isArray(entry) && entry[0] === 'react-native-android-widget',
    ) as [string, { widgets: { name: string; updatePeriodMillis: number }[] }] | undefined;
    expect(plugin).toBeDefined();
    const widget = plugin?.[1].widgets.find((w) => w.name === FAST_WIDGET_NAME);
    expect(widget).toBeDefined();
    expect(widget?.updatePeriodMillis).toBeGreaterThanOrEqual(30 * 60 * 1000);
  });
});
