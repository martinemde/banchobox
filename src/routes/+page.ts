import { Data } from '$lib/data/runtime.js';

export const prerender = true;

export async function load() {
	return {
		dishes: Data.dishes,
		ingredients: Data.ingredients,
		parties: Data.parties,
		partyDishes: Data.partyDishes
	};
}
