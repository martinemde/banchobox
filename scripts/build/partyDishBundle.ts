import { z } from 'zod';
import type { Id, PartyDish, EntityBundle } from '../../src/lib/types.js';
import type { PartyDishJoinRow } from './types.js';
import { loadCsvFile, parseTable } from './load.js';

interface PartyDishInputRow {
	dish: string;
	party: string;
}

// party-dishes-data.csv schema -> normalized row
const partyDishRowSchema = z.object({
	party: z.string().trim(),
	dish: z.string().trim()
}) as z.ZodType<PartyDishInputRow>;

export function loadPartyDishes(dishNameToId: Map<string, Id>, partyNameToId: Map<string, Id>) {
	// Load party-dish relationships
	const partyDishesCSV = loadCsvFile('party-dishes-data.csv');
	const partyDishRows = parseTable(partyDishesCSV, partyDishRowSchema, 'party-dishes-data.csv');

	const dishParties: PartyDishJoinRow[] = [];
	for (const row of partyDishRows) {
		const partyId = partyNameToId.get(row.party);
		const dishId = dishNameToId.get(row.dish);
		if (partyId && dishId) {
			dishParties.push({
				dishId: dishId,
				partyId: partyId
			});
		} else {
			console.warn(`\x1b[31mCould not find party "${row.party}" or dish "${row.dish}"\x1b[0m`);
		}
	}

	return { dishParties };
}

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
