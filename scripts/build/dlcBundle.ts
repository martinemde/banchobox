import { z } from 'zod';
import type { DLCInputRow, DLC } from '../../src/lib/types.js';
import { loadCsvFile, parseTable } from './load.js';

// dlc-data.csv schema -> normalized row
const dlcRowSchema = z.object({
	id: z.coerce.number().int().positive(),
	order: z.coerce.number().int().nonnegative(),
	name: z.string().trim()
}) as z.ZodType<DLCInputRow>;

export function loadDLCs() {
	const dlcCSV = loadCsvFile('dlc-data.csv');
	const normalized = parseTable(dlcCSV, dlcRowSchema, 'dlc-data.csv');
	return { dlcs: normalized };
}

export function buildDLCs(inputRows: DLCInputRow[]): DLC[] {
	return inputRows
		.filter((r) => r.name && r.name.trim() !== '')
		.map((row) => ({
			id: row.id,
			name: row.name
		}))
		.sort((a, b) => a.order - b.order);
}
