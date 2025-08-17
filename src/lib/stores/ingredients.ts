import { createEntityStores } from './entityBundle.js';
import type { Ingredient } from '$lib/types.js';

export const ingredientsStores = createEntityStores<Ingredient>({
	sortKey: 'sellPerKg',
	sortDir: 'desc'
});

export const bundle = ingredientsStores.bundle;

export function setIngredientSort(key: string, dir: 'asc' | 'desc' = 'asc') {
	ingredientsStores.sortKey.set(key);
	ingredientsStores.sortDir.set(dir);
}

export function clearIngredientFilters() {
	ingredientsStores.filters.set({});
}
