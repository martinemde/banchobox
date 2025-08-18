import { createEntityStores } from './entityBundle.js';
import type { Party } from '$lib/types.js';

export const partiesStores = createEntityStores<Party>({
	sortKey: 'order',
	sortDir: 'asc'
});

export const bundle = partiesStores.bundle;

export function clearPartyFilters() {
	partiesStores.filters.set({});
}
