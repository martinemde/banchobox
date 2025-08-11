import type { Id, PartyDish, EntityBundle } from '../../src/lib/types.js';

export function buildPartyDishesBundle(partyDishes: PartyDish[]): EntityBundle<PartyDish> {
  const byId = Object.fromEntries(partyDishes.map((pd) => [pd.id, pd])) as Record<Id, PartyDish>;

  const facets: EntityBundle<PartyDish>['facets'] = {
    party: {},
    dish: {},
    dlc: {},
    unlock: {},
  };

  for (const pd of partyDishes) {
    const partyKey = String(pd.partyId);
    (facets.party[partyKey] ??= []).push(pd.id);

    const dishKey = String(pd.dishId);
    (facets.dish[dishKey] ??= []).push(pd.id);

    const dlc = (pd.dlc ?? 'base').toString();
    (facets.dlc[dlc] ??= []).push(pd.id);

    const unlock = (pd.unlock ?? '').toString();
    if (unlock) (facets.unlock[unlock] ??= []).push(pd.id);
  }

  return {
    rows: partyDishes,
    byId,
    facets,
  };
}
