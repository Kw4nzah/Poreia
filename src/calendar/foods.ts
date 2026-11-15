// Which food groups a fasting level permits. Ids only; the UI translates them.

import { FastLevel } from './fasting';

export type FoodId = 'meat' | 'dairy' | 'fish' | 'oil';

export const FOOD_IDS: readonly FoodId[] = ['meat', 'dairy', 'fish', 'oil'];

const ALLOWED: Record<FastLevel, readonly FoodId[]> = {
  none: ['meat', 'dairy', 'fish', 'oil'],
  noMeat: ['dairy', 'fish', 'oil'],
  fish: ['fish', 'oil'],
  oil: ['oil'],
  noOil: [],
  xerophagy: [],
};

/** `oil` stands for wine and oil together, as the parish calendars list them. */
export function isFoodAllowed(level: FastLevel, food: FoodId): boolean {
  return ALLOWED[level].includes(food);
}
