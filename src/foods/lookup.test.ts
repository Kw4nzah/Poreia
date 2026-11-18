import { describe, expect, it } from 'vitest';
import { CHURCHES, FOOD_IDS, getDayInfo, isFoodAllowed } from '../calendar';
import { LANGUAGES, MESSAGES } from '../i18n';
import {
  FOOD_ITEMS,
  FOOD_ITEM_IDS,
  FoodNames,
  getFoodStatus,
  groupFoodItems,
  searchFoods,
} from './lookup';

const names: FoodNames[] = LANGUAGES.map((l) => MESSAGES[l].foodItem);
const d = (year: number, month: number, day: number) => ({ year, month, day });

describe('searchFoods', () => {
  it('finds cheese by its name in any of the three languages', () => {
    expect(searchFoods('peynir', names)).toEqual(['cheese']);
    expect(searchFoods('cheese', names)).toEqual(['cheese']);
    expect(searchFoods('сыр', names)).toEqual(['cheese']);
  });

  it('ignores case and accents', () => {
    expect(searchFoods('YOĞURT', names)).toContain('yogurt');
    expect(searchFoods('yogurt', names)).toContain('yogurt');
    expect(searchFoods('YOGURT', names)).toContain('yogurt');
    expect(searchFoods('Zeytinyagi', names)).toContain('oliveOil');
    expect(searchFoods('ZEYTİNYAĞI', names)).toContain('oliveOil');
    expect(searchFoods('рыба', names)).toContain('fish');
    expect(searchFoods('РЫБА', names)).toContain('fish');
    expect(searchFoods('Kuzu', names)).toContain('lamb');
  });

  it('returns every food for an empty or blank query', () => {
    expect(searchFoods('', names)).toEqual(FOOD_ITEM_IDS);
    expect(searchFoods('   ', names)).toEqual(FOOD_ITEM_IDS);
  });

  it('returns nothing for an unknown food', () => {
    expect(searchFoods('zzzxq', names)).toEqual([]);
  });

  it('finds every kind of oil', () => {
    expect(searchFoods('oil', names)).toEqual(expect.arrayContaining(['oliveOil', 'sunflowerOil']));
  });

  it('ranks names with a word starting with the query first', () => {
    const ids = searchFoods('et', names);
    // "Et" (meat) starts with the query; others only contain it.
    expect(ids[0]).toBe('meat');
  });

  it('has a name in every language for every food', () => {
    for (const language of names) {
      for (const id of FOOD_ITEM_IDS) expect(language[id].trim(), id).not.toBe('');
    }
  });
});

describe('getFoodStatus', () => {
  it('follows the engine for the food group', () => {
    for (const level of ['none', 'noMeat', 'fish', 'oil', 'noOil', 'xerophagy'] as const) {
      for (const id of FOOD_ITEM_IDS) {
        const group = FOOD_ITEMS[id];
        expect(FOOD_IDS).toContain(group);
        expect(getFoodStatus(id, level) === 'allowed', `${level} ${id}`).toBe(
          isFoodAllowed(level, group),
        );
      }
    }
  });

  it('allows wine, not oil, when the day says wine only', () => {
    expect(getFoodStatus('wine', 'xerophagy', ['wineOnly'])).toBe('allowed');
    expect(getFoodStatus('oliveOil', 'xerophagy', ['wineOnly'])).toBe('forbidden');
    expect(getFoodStatus('wine', 'xerophagy')).toBe('forbidden');
  });

  it('marks fish as disputed only when the day is flagged', () => {
    expect(getFoodStatus('salmon', 'oil', ['fishDisputed'])).toBe('disputed');
    expect(getFoodStatus('salmon', 'oil')).toBe('forbidden');
    expect(getFoodStatus('cheese', 'oil', ['fishDisputed'])).toBe('forbidden');
  });

  it('uses the real day: a Great Lent Wednesday forbids cheese, an ordinary Tuesday allows it', () => {
    const lent = getDayInfo(d(2027, 3, 24), CHURCHES.greek);
    expect(getFoodStatus('cheese', lent.level, lent.notes)).toBe('forbidden');
    const ordinary = getDayInfo(d(2026, 11, 10), CHURCHES.greek);
    expect(getFoodStatus('cheese', ordinary.level, ordinary.notes)).toBe('allowed');
    expect(getFoodStatus('meat', ordinary.level, ordinary.notes)).toBe('allowed');
  });

  it('follows the greekFish setting on a Nativity Fast Monday', () => {
    const date = d(2026, 12, 7);
    const greece = getDayInfo(date, CHURCHES.greek, { greekFish: 'greece' });
    const weekends = getDayInfo(date, CHURCHES.greek, { greekFish: 'weekends' });
    const unsure = getDayInfo(date, CHURCHES.greek, { greekFish: 'unsure' });
    expect(getFoodStatus('salmon', greece.level, greece.notes)).toBe('allowed');
    expect(getFoodStatus('salmon', weekends.level, weekends.notes)).toBe('forbidden');
    expect(getFoodStatus('salmon', unsure.level, unsure.notes)).toBe('disputed');
  });
});

describe('groupFoodItems', () => {
  it('splits all foods into allowed and avoided', () => {
    const { allowed, avoided } = groupFoodItems('noMeat');
    expect([...allowed, ...avoided].sort()).toEqual([...FOOD_ITEM_IDS].sort());
    expect(allowed).toContain('cheese');
    expect(avoided).toContain('beef');
  });

  it('has nothing to avoid when there is no fast', () => {
    expect(groupFoodItems('none').avoided).toEqual([]);
  });

  it('puts disputed fish among the avoided foods', () => {
    expect(groupFoodItems('oil', ['fishDisputed']).avoided).toContain('tuna');
  });
});
