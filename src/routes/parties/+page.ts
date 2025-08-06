import { loadDishes, loadParties } from '$lib/data.js';

export const prerender = true;

export async function load() {
  const dishes = loadDishes();
  const parties = loadParties();

  return {
    dishes,
    parties
  };
}
