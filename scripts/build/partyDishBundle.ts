import type { Id, PartyDish, EntityBundle } from '../../src/lib/types.js';

export function buildPartyDishesBundle(partyDishes: PartyDish[]): EntityBundle<PartyDish> {
	const byId = Object.fromEntries(partyDishes.map((pd) => [pd.id, pd])) as Record<Id, PartyDish>;

	const facets: EntityBundle<PartyDish>['facets'] = {
		Party: {},
		Dish: {},
		DLC: {},
		Unlock: {}
	};

	for (const pd of partyDishes) {
		const partyKey = String(pd.partyId);
		(facets.Party[partyKey] ??= []).push(pd.id);

		const dishKey = String(pd.dishId);
		(facets.Dish[dishKey] ??= []).push(pd.id);

		const dlc = (pd.dlc ?? 'Base').toString();
		(facets.DLC[dlc] ??= []).push(pd.id);

		const unlock = (pd.unlock ?? '').toString();
		if (unlock) (facets.Unlock[unlock] ??= []).push(pd.id);
	}

	return {
		rows: partyDishes,
		byId,
		facets
	};
}
