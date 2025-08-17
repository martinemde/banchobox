import { createEntityStores } from './entityBundle.js';
import type { Dish } from '$lib/types.js';

export const dishesStores = createEntityStores<Dish>({
	sortKey: 'finalProfitPerServing',
	sortDir: 'desc'
});

export const bundle = dishesStores.bundle;

export function setDishSort(key: string, dir: 'asc' | 'desc' = 'asc') {
	dishesStores.sortKey.set(key);
	dishesStores.sortDir.set(dir);
}

export function clearDishFilters() {
	dishesStores.filters.set({});
}
