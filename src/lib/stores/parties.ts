import { createEntityStores } from './entityBundle.js';
import type { EnrichedParty, Id, PartyDish } from '$lib/types.js';
import { writable } from 'svelte/store';

export const partiesStores = createEntityStores<EnrichedParty>({
  sortKey: 'order',
  sortDir: 'asc',
});

export const partiesBundleStore = partiesStores.bundle;

export function clearPartyFilters() {
  partiesStores.filters.set({});
}

export type PartiesDishSubBundle = { rows: PartyDish[]; byId: Record<Id, PartyDish>; facets: Record<string, Record<string, Id[]>> };

export function createPartyDishesStores(subBundle: PartiesDishSubBundle) {
  return createEntityStores<PartyDish>({
    bundle: subBundle,
    sortKey: 'profitPerServing',
    sortDir: 'desc',
  });
}

export const dishesByPartyStore = writable<Record<Id, PartiesDishSubBundle> | null>(null);
