import { z } from 'zod';
import type { DLCInputRow, DLC, EntityBundle, Id } from '../../src/lib/types.js';
import { intFromString, loadCsvFile, parseTable } from './load.js';

// dlc-data.csv schema -> normalized row
const dlcRowSchema = z
	.object({
		id: intFromString('id'),
		order: intFromString('order'),
		name: z.string().transform((s) => s.trim())
	})
	.transform((row) => ({
		id: row['id'],
		order: row['order'],
		name: row['name']
	})) as z.ZodType<DLCInputRow>;

export function loadDLCs() {
	const dlcCSV = loadCsvFile('dlc-data.csv');
	const normalized = parseTable(dlcCSV, dlcRowSchema, 'dlc-data.csv');
	return { dlcs: normalized };
}

function computeDLCs(inputRows: DLCInputRow[]): DLC[] {
	const rows: DLC[] = inputRows
		.filter((r) => r.name && r.name.trim() !== '')
		.map((row) => {
			const dlc: DLC = {
				id: row.id,
				name: row.name,
				sort: {
					order: row.order,
					name: row.name.toLowerCase()
				},
				search: row.name.toLowerCase()
			} as DLC;
			return dlc;
		})
		.sort((a, b) => a.sort.order - b.sort.order);
	return rows;
}

export function buildDLCBundle(inputRows: DLCInputRow[]): EntityBundle<DLC> {
	const rows = computeDLCs(inputRows);
	const byId = Object.fromEntries(rows.map((r) => [r.id, r])) as Record<Id, DLC>;
	const facets: EntityBundle<DLC>['facets'] = {};
	return { rows, byId, facets };
}
