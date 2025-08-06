import { loadIngredients } from '$lib/data.js';

export const prerender = true;

export async function load() {
  const ingredients = loadIngredients();

  return {
    ingredients
  };
}
