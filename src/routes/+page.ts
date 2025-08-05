import { loadDishes } from '$lib/data.js';

export const prerender = true;

export async function load() {
  const dishes = loadDishes();

  return {
    dishes
  };
}
