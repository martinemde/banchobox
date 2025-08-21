import { createEntityStores } from './entityBundle.js';
import type { Staff } from '$lib/types.js';

export const staffStores = createEntityStores<Staff>({
	sortKey: 'wageMax',
	sortDir: 'desc'
});

export const bundle = staffStores.bundle;

export function setStaffSort(key: string, dir: 'asc' | 'desc' = 'asc') {
	staffStores.sortKey.set(key);
	staffStores.sortDir.set(dir);
}

export function clearStaffFilters() {
	staffStores.filters.set({});
}

export const query = staffStores.query;
export const sortKey = staffStores.sortKey;
export const sortDir = staffStores.sortDir;
export const filters = staffStores.filters;
export const visible = staffStores.visible;
