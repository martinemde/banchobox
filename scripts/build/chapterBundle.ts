import { z } from 'zod';
import type { ChapterInputRow, Chapter } from '../../src/lib/types.js';
import { loadCsvFile, parseTable } from './load.js';

// chapters-data.csv schema -> normalized row
const chapterRowSchema = z.object({
	id: z.coerce.number().int().positive(),
	number: z.coerce.number().int().nonnegative(),
	name: z.string().trim(),
	subtitle: z.string().trim()
}) as z.ZodType<ChapterInputRow>;

export function loadChapters() {
	const chaptersCSV = loadCsvFile('chapters-data.csv');
	const normalized = parseTable(chaptersCSV, chapterRowSchema, 'chapters-data.csv');
	return { chapters: normalized };
}

export function buildChapters(inputRows: ChapterInputRow[]): Chapter[] {
	return inputRows
		.filter((r) => r.name && r.name.trim() !== '')
		.map((row) => ({
			id: row.id,
			number: row.number,
			name: row.name,
			subtitle: row.subtitle
		}))
		.sort((a, b) => a.number - b.number);
}
