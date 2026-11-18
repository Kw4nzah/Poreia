// "Can I eat this?": concrete foods mapped to the engine's four food groups, and a search over
// their names. Whether a food is allowed comes from the engine (isFoodAllowed for the group).
// Ids only; names live in the i18n layer in all three languages.

import { FastLevel, FoodId, NoteId, isFoodAllowed } from '../calendar';
import { normalizeForSearch } from '../prayers/search';

/** Each food and the group it belongs to, in the order shown. */
export const FOOD_ITEMS = {
  meat: 'meat',
  beef: 'meat',
  pork: 'meat',
  lamb: 'meat',
  chicken: 'meat',
  sausage: 'meat',
  broth: 'meat',
  milk: 'dairy',
  cheese: 'dairy',
  yogurt: 'dairy',
  butter: 'dairy',
  cream: 'dairy',
  eggs: 'dairy',
  iceCream: 'dairy',
  fish: 'fish',
  salmon: 'fish',
  tuna: 'fish',
  sardine: 'fish',
  oliveOil: 'oil',
  sunflowerOil: 'oil',
  fried: 'oil',
  wine: 'oil',
} as const satisfies Record<string, FoodId>;

export type FoodItemId = keyof typeof FOOD_ITEMS;

export const FOOD_ITEM_IDS = Object.keys(FOOD_ITEMS) as FoodItemId[];

/** `disputed`: published practice differs and the stricter reading is shown (not allowed). */
export type FoodStatus = 'allowed' | 'forbidden' | 'disputed';

export function getFoodStatus(
  item: FoodItemId,
  level: FastLevel,
  notes: readonly NoteId[] = [],
): FoodStatus {
  const group: FoodId = FOOD_ITEMS[item];
  if (isFoodAllowed(level, group)) return 'allowed';
  // Holy Week Monday to Wednesday and Great Saturday: wine, but not oil.
  if (item === 'wine' && notes.includes('wineOnly')) return 'allowed';
  if (group === 'fish' && notes.includes('fishDisputed')) return 'disputed';
  return 'forbidden';
}

/** All foods split into what is allowed today and what is avoided (disputed ones included). */
export function groupFoodItems(
  level: FastLevel,
  notes: readonly NoteId[] = [],
): { allowed: FoodItemId[]; avoided: FoodItemId[] } {
  const allowed: FoodItemId[] = [];
  const avoided: FoodItemId[] = [];
  for (const item of FOOD_ITEM_IDS) {
    (getFoodStatus(item, level, notes) === 'allowed' ? allowed : avoided).push(item);
  }
  return { allowed, avoided };
}

/** Names of the foods in one language; search tries every language given. */
export type FoodNames = Record<FoodItemId, string>;

const words = (value: string) => value.split(/[^\p{L}\p{N}]+/u).filter(Boolean);

/**
 * Foods whose name, in any of the given languages, contains `query` (case- and accent-
 * insensitive). Names with a word starting with the query come first. An empty query matches
 * every food.
 */
export function searchFoods(query: string, names: readonly FoodNames[]): FoodItemId[] {
  const needle = normalizeForSearch(query.trim());
  if (!needle) return [...FOOD_ITEM_IDS];
  const hits: { id: FoodItemId; rank: number }[] = [];
  for (const id of FOOD_ITEM_IDS) {
    let rank = Infinity;
    for (const language of names) {
      const name = normalizeForSearch(language[id]);
      if (words(name).some((w) => w.startsWith(needle))) rank = 0;
      else if (name.includes(needle)) rank = Math.min(rank, 1);
    }
    if (rank !== Infinity) hits.push({ id, rank });
  }
  // Array.sort is stable, so catalogue order is kept within a rank.
  return hits.sort((a, b) => a.rank - b.rank).map((h) => h.id);
}
