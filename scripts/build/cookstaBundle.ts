import { z } from 'zod';
import type { CookstaInputRow, CookstaTier, EntityBundle, Id } from '../../src/lib/types.js';
import { intFromString, loadCsvFile, parseTable } from './load.js';

// cooksta-data.csv schema -> normalized row
const cookstaRowSchema = z
	.object({
		id: intFromString('id'),
		name: z.string().transform((s) => s.trim()),
		rank: intFromString('rank'),
		customers: intFromString('customers'),
		customer_night: intFromString('customer_night'),
		party_customers: intFromString('party_customers'),
		followers: intFromString('followers'),
		recipes: intFromString('recipes'),
		best_taste: intFromString('best_taste'),
		operating_cost: intFromString('operating_cost'),
		kitchen_staff: intFromString('kitchen_staff'),
		serving_staff: intFromString('serving_staff')
	})
	.transform((row) => ({
		id: row['id'],
		name: row['name'],
		rank: row['rank'],
		customers: row['customers'],
		customerNight: row['customer_night'],
		partyCustomers: row['party_customers'],
		followers: row['followers'],
		recipes: row['recipes'],
		bestTaste: row['best_taste'],
		operatingCost: row['operating_cost'],
		kitchenStaff: row['kitchen_staff'],
		servingStaff: row['serving_staff']
	})) as z.ZodType<CookstaInputRow>;

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
