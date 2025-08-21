import type { CookstaInputRow, CookstaTier, EntityBundle, Id } from '../../src/lib/types.js';

// Pure functional, lazily memoized module factory. Consumers can pass dependencies
// and compute derived values on demand. Computations are cached within the factory
// context to avoid recomputation during a single build run.

function computeTiers(inputRows: CookstaInputRow[]): CookstaTier[] {
	const tiers: CookstaTier[] = inputRows
		.map((row, idx) => {
			const id: Id = idx + 1;
			return {
				id,
				name: row.name,
				rank: row.rank,
				customers: row.customers,
				customerNight: row.customerNight,
				partyCustomers: row.partyCustomers,
				followers: row.followers,
				recipes: row.recipes,
				bestTaste: row.bestTaste,
				operatingCost: row.operatingCost,
				kitchenStaff: row.kitchenStaff,
				servingStaff: row.servingStaff,
				sort: { order: row.rank }
			};
		})
		.sort((a, b) => a.sort.order - b.sort.order);
	return tiers;
}

export function buildCookstaBundle(inputRows: CookstaInputRow[]): EntityBundle<CookstaTier> {
	const rows = computeTiers(inputRows);
	const byId = Object.fromEntries(rows.map((t) => [t.id, t])) as Record<Id, CookstaTier>;
	return { rows, byId, facets: {} };
}
