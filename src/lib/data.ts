import type { Dish, Ingredient } from './types.js';
import dishesData from './dishes.json';
import ingredientsData from './ingredients.json';

export function loadDishes(): Dish[] {
  return dishesData as Dish[];
}

export function loadIngredients(): Ingredient[] {
  return ingredientsData as Ingredient[];
}
