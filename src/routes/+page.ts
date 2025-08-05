import { loadDishes, loadIngredients } from '$lib/data.js';

export const prerender = true;

export async function load() {
  const dishes = loadDishes();
  const ingredients = loadIngredients();

  return {
    dishes,
    ingredients
  };
}
