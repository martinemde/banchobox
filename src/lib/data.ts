import type { Dish, Ingredient, Party } from './types.js';
import dishesData from './dishes.json';
import ingredientsData from './ingredients.json';
import partiesData from './parties.json';

export function loadDishes(): Dish[] {
  return dishesData as Dish[];
}

export function loadIngredients(): Ingredient[] {
  return ingredientsData as Ingredient[];
}

export function loadParties(): Party[] {
  return partiesData as Party[];
}
