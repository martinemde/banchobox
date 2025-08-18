export const prerender = true;

import type { LayoutServerLoad } from './$types';
import type { EntityBundle, Dish, Ingredient, Party, PartyDish } from '$lib/types.js';

// Import JSON bundles from $lib so they are included in the SSR bundle and get type safety
import dishes from '$lib/data/dishes.v1.json';
import ingredients from '$lib/data/ingredients.v1.json';
import parties from '$lib/data/parties.v1.json';
import partyDishes from '$lib/data/party-dishes.v1.json';

export const load: LayoutServerLoad = async () => {
	const dishesBundle = dishes as unknown as EntityBundle<Dish>;
	const ingredientsBundle = ingredients as unknown as EntityBundle<Ingredient>;
	const partiesBundle = parties as unknown as EntityBundle<Party>;
	const partyDishesBundle = partyDishes as unknown as EntityBundle<PartyDish>;
	return {
		dishes: dishesBundle,
		ingredients: ingredientsBundle,
		parties: partiesBundle,
		partyDishes: partyDishesBundle
	};
};
