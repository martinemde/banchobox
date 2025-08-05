import { loadDishes, loadIngredients, loadParties } from '$lib/data.js';

export const prerender = true;

export async function load() {
  const dishes = loadDishes();
  const ingredients = loadIngredients();
  const parties = loadParties();

  return {
    dishes,
    ingredients,
    parties
  };
}
