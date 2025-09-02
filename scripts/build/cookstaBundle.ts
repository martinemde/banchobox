import { z } from 'zod';
import type { CookstaInputRow, CookstaTier, EntityBundle, Id } from '../../src/lib/types.js';
import { loadCsvFile, parseTable } from './load.js';

// cooksta-data.csv schema
const cookstaRowSchema = z.object({
	id: z.coerce.number().int().positive(),
	name: z.string().trim(),
	rank: z.coerce.number().int().nonnegative().max(5),
	customers: z.coerce.number().int().nonnegative().max(45),
	customerNight: z.coerce.number().int().nonnegative(),
	partyCustomers: z.coerce.number().int().nonnegative(),
	followers: z.coerce.number().int().nonnegative(),
	recipes: z.coerce.number().int().nonnegative(),
	bestTaste: z.coerce.number().int().nonnegative(),
	operatingCost: z.coerce.number().int().nonnegative(),
	kitchenStaff: z.coerce.number().int().nonnegative().max(2),
	servingStaff: z.coerce.number().int().nonnegative().max(2)
}) satisfies z.ZodType<CookstaInputRow>;

export function loadCooksta() {
	const cookstaCSV = loadCsvFile('cooksta-data.csv');
	const normalized = parseTable(cookstaCSV, cookstaRowSchema, 'cooksta-data.csv');
	return { cooksta: normalized };
}

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
