import { z } from 'zod';
import type { Party, PartyDish, Id, EntityBundle } from '../../src/lib/types.js';
import type { PartyInputRow } from './types.js';
import { intFromString, floatFromString, loadCsvFile, parseTable } from './load.js';

// parties-data.csv schema -> normalized row
const partyRowSchema = z
	.object({
		id: intFromString('id'),
		order: intFromString('order'),
		name: z.string().transform((s) => s.trim()),
		bonus: floatFromString('bonus')
	})
	.transform((row) => ({
		id: row['id'],
		order: row['order'],
		name: row['name'],
		bonus: row['bonus']
	}));

export function loadParties() {
	const partiesCSV = loadCsvFile('parties-data.csv');
	const normalized = parseTable(partiesCSV, partyRowSchema, 'parties-data.csv');

	const parties: PartyInputRow[] = [];
	const partyNameToId = new Map<string, Id>();

	normalized.forEach((row) => {
		const party: PartyInputRow = row as unknown as PartyInputRow;
		parties.push(party);
		partyNameToId.set(row.name, row.id);
	});

	// Sort parties by order to ensure static ordering
	parties.sort((a, b) => a.order - b.order);

	return { parties, partyNameToId };
}

function computeParties(
	partyInputRows: PartyInputRow[],
	partyDishesByPartyId: Map<Id, PartyDish[]>
): Party[] {
	const parties: Party[] = partyInputRows.map((row) => {
		const partyDishIds = (partyDishesByPartyId.get(row.id) ?? [])
			.sort((a, b) => b.finalProfit - a.finalProfit)
			.map((pd) => pd.id);

		const enrichedParty: Party = {
			id: row.id,
			name: row.name,
			bonus: row.bonus,
			partyDishIds,
			search: [row.name.toLowerCase(), `${row.bonus}x`].join(' '),
			sort: {
				order: row.order,
				name: row.name.toLowerCase(),
				bonus: row.bonus,
				dishCount: partyDishIds.length
			}
		} as Party;

		return enrichedParty;
	});

	parties.sort((a, b) => a.sort.order - b.sort.order);
	return parties;
}

export function buildPartiesBundle(
	partyInputRows: PartyInputRow[],
	partyDishesByPartyId: Map<Id, PartyDish[]>
): EntityBundle<Party> {
	const parties = computeParties(partyInputRows, partyDishesByPartyId);
	const byId = Object.fromEntries(parties.map((p) => [p.id, p])) as Record<Id, Party>;

	const partyFacets: EntityBundle<Party>['facets'] = {
		// Placeholders for future party-level facets
	};

	return {
		rows: parties,
		byId,
		facets: partyFacets
	};
}
