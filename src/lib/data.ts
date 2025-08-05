import type { Dish } from './types.js';
import dishesData from './dishes.json';

export function loadDishes(): Dish[] {
  return dishesData as Dish[];
}
