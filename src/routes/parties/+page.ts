import { Data } from '$lib/data/runtime.js';

export const prerender = true;

export async function load() {
	return {
		dishes: Data.dishes,
		parties: Data.parties,
		partyDishes: Data.partyDishes
	};
}
