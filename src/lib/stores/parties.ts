import { createEntityStores } from './entityBundle.js';
import type { EnrichedParty } from '$lib/types.js';

export const partiesStores = createEntityStores<EnrichedParty>({
  sortKey: 'order',
  sortDir: 'asc'
});

export const bundle = partiesStores.bundle;

export function clearPartyFilters() {
  partiesStores.filters.set({});
}
