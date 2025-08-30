import type { PartyInputRow, Party, PartyDish, Id, EntityBundle } from '../../src/lib/types.js';

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
