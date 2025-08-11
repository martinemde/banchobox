import { createEntityStores } from './entityBundle.js';
import type { Id, PartyDish, EntityBundle } from '$lib/types.js';
import { derived } from 'svelte/store';

export type PartyDishesBundle = EntityBundle<PartyDish>;

export const partyDishesStores = createEntityStores<PartyDish>({
  sortKey: 'profitPerServing',
  sortDir: 'desc',
});

export const bundle = partyDishesStores.bundle;

export type PartiesDishSubBundle = { rows: PartyDish[]; byId: Record<Id, PartyDish>; facets: Record<string, Record<string, Id[]>> };

export function createPartyDishesStores(subBundle: PartiesDishSubBundle) {
  return createEntityStores<PartyDish>({
    bundle: subBundle,
    sortKey: 'profitPerServing',
    sortDir: 'desc',
  });
}

// Derived: byId over all party-dishes for quick lookup
export const partyDishByIdStore = derived(bundle, ($bundle) => ($bundle ? $bundle.byId : (null as unknown as Record<Id, PartyDish> | null)));

// Build per-party sub-bundles from the full party-dishes bundle
export const dishesByPartyStore = derived(bundle, ($bundle) => {
  if (!$bundle) return null as Record<Id, PartiesDishSubBundle> | null;
  const map: Record<Id, PartiesDishSubBundle> = Object.create(null) as Record<Id, PartiesDishSubBundle>;
  const partyFacet = $bundle.facets?.party ?? {};
  for (const [partyKey, pdIds] of Object.entries(partyFacet)) {
    const rows = pdIds.map((id) => $bundle.byId[id]).filter(Boolean) as PartyDish[];
    // Build light facets for this sub-bundle
    const facets: Record<string, Record<string, Id[]>> = { dlc: {}, unlock: {} };
    const byId: Record<Id, PartyDish> = Object.create(null) as Record<Id, PartyDish>;
    for (const r of rows) {
      byId[r.id] = r;
      const dlc = (r.dlc ?? 'base').toString();
      (facets.dlc[dlc] ??= []).push(r.id);
      const unlock = (r.unlock ?? '').toString();
      if (unlock) (facets.unlock[unlock] ??= []).push(r.id);
    }
    const pid = Number(partyKey) as Id;
    map[pid] = { rows, byId, facets };
  }
  return map;
});
