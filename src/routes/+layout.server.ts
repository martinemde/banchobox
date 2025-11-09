export const prerender = true;

import type { LayoutServerLoad } from './$types';
import type {
	EntityBundle,
	Dish,
	Ingredient,
	Party,
	PartyDish,
	CookstaTier,
	DLC,
	Chapter,
	Staff
} from '$lib/types.js';

// Import the manifest to get hashed file paths
import manifest from '$lib/data/manifest.json';

// Import JSON bundles from $lib so they are included in the SSR bundle and get type safety
// (keeping these for gradual migration - ingredients and dishes will be loaded via fetch)
import parties from '$lib/data/parties.v1.json';
import partyDishes from '$lib/data/party-dishes.v1.json';
import cooksta from '$lib/data/cooksta.v1.json';
import dlc from '$lib/data/dlc.v1.json';
import chapters from '$lib/data/chapters.v1.json';
import staff from '$lib/data/staff.v1.json';

export const load: LayoutServerLoad = async ({ fetch }) => {
	// Load ingredients and dishes from the hashed static files using fetch
	const ingredientsResponse = await fetch(manifest.ingredients);
	const ingredientsBundle = (await ingredientsResponse.json()) as EntityBundle<Ingredient>;

	const dishesResponse = await fetch(manifest.dishes);
	const dishesBundle = (await dishesResponse.json()) as EntityBundle<Dish>;

	// Keep other bundles as direct imports for now (gradual migration)
	const partiesBundle = parties as unknown as EntityBundle<Party>;
	const partyDishesBundle = partyDishes as unknown as EntityBundle<PartyDish>;
	const cookstaBundle = cooksta as unknown as EntityBundle<CookstaTier>;
	const dlcBundle = dlc as unknown as EntityBundle<DLC>;
	const chaptersBundle = chapters as unknown as EntityBundle<Chapter>;
	const staffBundle = staff as unknown as EntityBundle<Staff>;

	return {
		dishes: dishesBundle,
		ingredients: ingredientsBundle,
		parties: partiesBundle,
		partyDishes: partyDishesBundle,
		cooksta: cookstaBundle,
		dlc: dlcBundle,
		chapters: chaptersBundle,
		staff: staffBundle
	};
};
