import { describe, expect, it } from 'vitest';
import {
  CHURCHES,
  CivilDate,
  DayInfo,
  FastLevel,
  GREEK_FISH_PRACTICES,
  getDayInfo,
  gregorianToJdn,
  jdnToGregorian,
} from '../calendar';
import { getCommemoration } from '../commemorations';
import { LANGUAGES, MESSAGES } from '../i18n';
import { readingsLine, summarizeDay } from './summary';

const { en, tr, ru } = MESSAGES;

function day(overrides: Partial<DayInfo>): DayInfo {
  return {
    date: { year: 2026, month: 12, day: 2 },
    churchDate: { year: 2026, month: 12, day: 2 },
    weekday: 3,
    level: 'none',
    period: null,
    fastDay: null,
    feasts: [],
    notes: [],
    daysToPascha: 100,
    ...overrides,
  };
}

const d = (year: number, month: number, dayOfMonth: number): CivilDate => ({
  year,
  month,
  day: dayOfMonth,
});

describe('summarizeDay: every fast level', () => {
  it('no fast says so and lists nothing', () => {
    const s = summarizeDay(day({ level: 'none' }), en);
    expect(s).toMatchObject({
      headline: 'No fast today.',
      foods: '',
      allowed: null,
      avoided: null,
    });
  });

  it('no meat', () => {
    const s = summarizeDay(day({ level: 'noMeat' }), en);
    expect(s.headline).toBe('Today: No meat.');
    expect(s.foods).toBe('Allowed: dairy, eggs, fish, oil, wine. Avoid: meat.');
  });

  it('fish allowed', () => {
    const s = summarizeDay(day({ level: 'fish' }), en);
    expect(s.foods).toBe('Allowed: fish, oil, wine. Avoid: meat, dairy, eggs.');
  });

  it('wine and oil, no fish', () => {
    const s = summarizeDay(day({ level: 'oil' }), en);
    expect(s.foods).toBe('Allowed: oil, wine. Avoid: meat, dairy, eggs, fish.');
  });

  it('no oil: cooked food is the only thing allowed', () => {
    const s = summarizeDay(day({ level: 'noOil' }), en);
    expect(s.headline).toBe('Today: No oil.');
    expect(s.foods).toBe(
      'Allowed: food cooked without oil. Avoid: meat, dairy, eggs, fish, oil, wine.',
    );
  });

  it('dry eating', () => {
    const s = summarizeDay(day({ level: 'xerophagy' }), en);
    expect(s.foods).toBe(
      'Allowed: bread, fruit, vegetables, nuts. Avoid: meat, dairy, eggs, fish, oil, wine.',
    );
  });

  it('reads the same in Turkish and Russian', () => {
    expect(summarizeDay(day({ level: 'oil' }), tr)).toMatchObject({
      headline: 'Bugün: Şarap ve zeytinyağı serbest.',
      foods: 'Serbest: zeytinyağı, şarap. Yasak: et, süt ürünleri, yumurta, balık.',
    });
    expect(summarizeDay(day({ level: 'noMeat' }), ru)).toMatchObject({
      headline: 'Сегодня: Без мяса.',
      foods: 'Можно: молочное, яйца, рыба, масло, вино. Нельзя: мясо.',
    });
    expect(summarizeDay(day({ level: 'none' }), tr).headline).toBe('Bugün oruç yok.');
    expect(summarizeDay(day({ level: 'none' }), ru).headline).toBe('Сегодня поста нет.');
  });
});

describe('summarizeDay: feasts', () => {
  it('a feast without a fast keeps the feast first, then says there is no fast', () => {
    const s = summarizeDay(day({ level: 'none', feasts: ['pascha'] }), en);
    expect(s.feast).toBe(`Feast: ${en.feast.pascha}.`);
    expect(s.headline).toBe(`Feast: ${en.feast.pascha}. No fast today.`);
    expect(s.foods).toBe('');
  });

  it('a feast inside a fast shows both and the relaxed foods', () => {
    const info = getDayInfo(d(2026, 3, 25), CHURCHES.greek);
    expect(info.feasts).toContain('annunciation');
    const s = summarizeDay(info, en);
    expect(s.headline).toBe(`Feast: ${en.feast.annunciation}. Today: Fish allowed.`);
    expect(s.foods).toBe('Allowed: fish, oil, wine. Avoid: meat, dairy, eggs.');
  });

  it('several feasts are joined', () => {
    const s = summarizeDay(day({ level: 'fish', feasts: ['pascha', 'annunciation'] }), en);
    expect(s.feast).toBe(`Feast: ${en.feast.pascha} · ${en.feast.annunciation}.`);
  });

  it('Pascha itself is a feast without a fast in all three languages', () => {
    const info = getDayInfo(d(2026, 4, 12), CHURCHES.greek);
    expect(info.feasts).toContain('pascha');
    expect(info.level).toBe('none');
    for (const m of Object.values(MESSAGES)) {
      expect(summarizeDay(info, m).headline).toBe(
        `${m.summary.feast(m.feast.pascha)} ${m.summary.noFast}`,
      );
    }
  });
});

describe('summarizeDay: Holy Week', () => {
  it('Holy Thursday allows wine and oil', () => {
    const info = getDayInfo(d(2026, 4, 9), CHURCHES.greek);
    expect(info.level).toBe('oil');
    expect(summarizeDay(info, en).foods).toBe(
      'Allowed: oil, wine. Avoid: meat, dairy, eggs, fish.',
    );
  });

  it('Holy Friday is dry eating', () => {
    const info = getDayInfo(d(2026, 4, 10), CHURCHES.greek);
    expect(info.level).toBe('xerophagy');
    expect(summarizeDay(info, en).avoided).toContain('oil, wine');
  });

  it('a wine-only day moves wine to allowed and keeps oil avoided', () => {
    const info = getDayInfo(d(2026, 4, 11), CHURCHES.greek);
    expect(info.notes).toContain('wineOnly');
    const s = summarizeDay(info, en);
    expect(s.allowed).toBe('Allowed: wine, food cooked without oil.');
    expect(s.avoided).toBe('Avoid: meat, dairy, eggs, fish, oil.');
    expect(summarizeDay(info, tr).avoided).toBe(
      'Yasak: et, süt ürünleri, yumurta, balık, zeytinyağı.',
    );
    expect(summarizeDay(info, ru).allowed).toContain('вино');
  });
});

describe('summarizeDay: disputed fish', () => {
  // Greek practice, Nativity Fast, rule not chosen: the stricter reading is shown and flagged.
  const start = gregorianToJdn(2026, 11, 15);
  const days = Array.from({ length: 40 }, (_, i) => jdnToGregorian(start + i));
  const disputed = days.find((date) =>
    getDayInfo(date, CHURCHES.greek, { greekFish: 'unsure' }).notes.includes('fishDisputed'),
  );

  it('finds a disputed day in the Nativity Fast', () => {
    expect(disputed).toBeDefined();
  });

  it('keeps fish avoided and says the traditions differ, in every language', () => {
    const info = getDayInfo(disputed!, CHURCHES.greek, { greekFish: 'unsure' });
    for (const m of Object.values(MESSAGES)) {
      const s = summarizeDay(info, m);
      expect(s.disputed).toBe(m.summary.fishDisputed);
      expect(s.avoided).toContain(m.summary.food.fish);
      expect(s.foods.endsWith(m.summary.fishDisputed)).toBe(true);
    }
  });

  it('a chosen rule leaves no dispute', () => {
    for (const greekFish of GREEK_FISH_PRACTICES.filter((id) => id !== 'unsure')) {
      for (const date of days) {
        expect(
          summarizeDay(getDayInfo(date, CHURCHES.greek, { greekFish }), en).disputed,
        ).toBeNull();
      }
    }
  });

  it('follows the chosen rule for fish', () => {
    const fishDays = (greekFish: 'weekends' | 'greece') =>
      days.filter((date) =>
        summarizeDay(getDayInfo(date, CHURCHES.greek, { greekFish }), en).allowed?.includes('fish'),
      ).length;
    // Fish every day but Wednesday and Friday is more permissive than weekends only.
    expect(fishDays('greece')).toBeGreaterThan(fishDays('weekends'));
  });
});

describe('summarizeDay: both churches', () => {
  it('the Russian church is stricter than the Greek on a Great Lent Monday', () => {
    // Monday 2027-03-29: Greek noOil, Russian xerophagy.
    const greek = summarizeDay(getDayInfo(d(2027, 3, 29), CHURCHES.greek), en);
    const russian = summarizeDay(getDayInfo(d(2027, 3, 29), CHURCHES.russian), en);
    expect(greek.headline).toBe('Today: No oil.');
    expect(russian.headline).toBe('Today: Dry eating.');
    expect(russian.allowed).toBe('Allowed: bread, fruit, vegetables, nuts.');
  });

  it('answers every day of two years in every language, for both churches and fish rules', () => {
    const start = gregorianToJdn(2026, 1, 1);
    for (const church of Object.values(CHURCHES)) {
      for (const greekFish of GREEK_FISH_PRACTICES) {
        for (let i = 0; i < 730; i++) {
          const info = getDayInfo(jdnToGregorian(start + i), church, { greekFish });
          for (const language of LANGUAGES) {
            const s = summarizeDay(info, MESSAGES[language]);
            expect(s.headline).not.toMatch(/undefined|NaN/);
            expect(s.foods).not.toMatch(/undefined|NaN/);
            // Fasting days always name something to avoid; free days name nothing.
            expect(s.avoided === null).toBe(info.level === 'none');
            expect(s.foods === '').toBe(info.level === 'none');
          }
        }
      }
    }
  });
});

describe('readingsLine', () => {
  it('lists the epistle and the gospel with book names in the chosen language', () => {
    const commemoration = getCommemoration(d(2026, 11, 20), 'greek');
    expect(commemoration).not.toBeNull();
    const line = readingsLine(commemoration, en, 'en');
    expect(line).toContain(`${en.readings.epistle}: `);
    expect(line).toContain(` · ${en.readings.gospel}: `);
    expect(readingsLine(commemoration, tr, 'tr')).toContain(`${tr.readings.gospel}: `);
  });

  it('is null without data', () => {
    expect(readingsLine(null, en, 'en')).toBeNull();
    expect(
      readingsLine({ title: '', names: [], feastLevel: 0, readings: [] }, en, 'en'),
    ).toBeNull();
  });
});

describe('levels are covered', () => {
  it('has a summary for each fast level in each language', () => {
    const levels: FastLevel[] = ['none', 'noMeat', 'fish', 'oil', 'noOil', 'xerophagy'];
    for (const m of Object.values(MESSAGES)) {
      for (const level of levels) {
        expect(summarizeDay(day({ level }), m).headline.trim()).not.toBe('');
      }
    }
  });
});
