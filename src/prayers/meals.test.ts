import { describe, expect, it } from 'vitest';
import { LANGUAGES, MESSAGES } from '../i18n';
import { PRAYER_GROUPS, PRAYER_IDS, isPrayerId, resolvePrayerId } from '.';
import { searchPrayers } from './search';

const MEAL_IDS = ['mealsBreakfast', 'mealsLunch', 'mealsDinner'] as const;

describe('table prayer ids', () => {
  it('are in the daily group, once each, and the old "meals" id resolves to lunch', () => {
    const daily = PRAYER_GROUPS.find((group) => group.id === 'daily');
    for (const id of MEAL_IDS) {
      expect(daily?.prayers).toContain(id);
      expect(isPrayerId(id)).toBe(true);
    }
    expect(isPrayerId('meals')).toBe(false);
    expect(resolvePrayerId('meals')).toBe('mealsLunch');
    expect(resolvePrayerId('mealsDinner')).toBe('mealsDinner');
    expect(resolvePrayerId('toString')).toBeNull();
    expect(resolvePrayerId(5)).toBeNull();
  });
});

describe.each(LANGUAGES)('table prayer texts (%s)', (language) => {
  const text = MESSAGES[language].prayers.text;

  it('has a before and an after section for every meal, with text', () => {
    for (const id of MEAL_IDS) {
      const prayer = text[id];
      expect(prayer.title.trim(), id).not.toBe('');
      expect(prayer.sections, id).toHaveLength(2);
      for (const section of prayer.sections) {
        expect(section.heading?.trim(), id).toBeTruthy();
        expect(section.paragraphs.length, id).toBeGreaterThan(2);
        for (const paragraph of section.paragraphs) {
          expect(paragraph.trim().length, id).toBeGreaterThan(10);
          expect(paragraph, id).not.toMatch(/undefined|\[object|[{}]/);
        }
      }
    }
  });

  it('gives each meal its own text', () => {
    const before = MEAL_IDS.map((id) => JSON.stringify(text[id].sections[0].paragraphs));
    expect(new Set(before).size).toBe(MEAL_IDS.length);
  });

  it('is found by searching for the meal title', () => {
    for (const id of MEAL_IDS) {
      expect(searchPrayers(text[id].title, PRAYER_IDS, text)).toContain(id);
    }
  });
});

describe('table prayers match their published sources', () => {
  const words = (id: (typeof MEAL_IDS)[number], language: (typeof LANGUAGES)[number]) =>
    MESSAGES[language].prayers.text[id].sections.flatMap((s) => s.paragraphs).join(' ');

  it('Russian: Sakharov, "Молитвословия за трапезой"', () => {
    expect(words('mealsBreakfast', 'ru')).toContain('Очи всех на Тя, Господи, уповают');
    expect(words('mealsLunch', 'ru')).toContain('Отче наш, Иже еси на небесех');
    expect(words('mealsLunch', 'ru')).toContain(
      'Благословен Бог, милуяй и питаяй нас от юности нашея',
    );
    expect(words('mealsDinner', 'ru')).toContain('Ядят убозии, и насытятся');
    expect(words('mealsDinner', 'ru')).toContain('Бысть чрево Твое Святая Трапеза');
  });

  it('English: Orthodox Daily Prayers, "Prayers at the Table"', () => {
    expect(words('mealsBreakfast', 'en')).toContain('O Most Holy Trinity, have mercy on us!');
    expect(words('mealsLunch', 'en')).toContain('We thank Thee, Christ our God');
    expect(words('mealsDinner', 'en')).toContain('The poor shall eat and be satisfied');
    expect(words('mealsDinner', 'en')).toContain('Your womb became a Heavenly Table');
  });

  it('Turkish: Ortodokslar Topluluğu İbâdetnâme; only the breakfast carries a note', () => {
    const tr = MESSAGES.tr.prayers.text;
    expect(words('mealsLunch', 'tr')).toContain('Gençliğimizden beri bizlere merhamet eden');
    expect(words('mealsDinner', 'tr')).toContain('Fakirler yiyecek ve doyacak');
    expect(tr.mealsBreakfast.note).toMatch(/gözden geçirilmemiştir/);
    expect(tr.mealsLunch.note).toBeUndefined();
    expect(tr.mealsDinner.note).toBeUndefined();
    for (const id of MEAL_IDS) expect(words(id, 'tr'), id).not.toMatch(/esenlik|\bTanrı/i);
  });
});
