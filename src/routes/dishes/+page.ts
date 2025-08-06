import { Data } from '$lib/data/runtime.js';

export const prerender = true;

export async function load() {
  return {
    dishes: Data.dishes
  };
}
