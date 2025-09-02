import { z } from 'zod';
import type { ChapterInputRow, Chapter, EntityBundle, Id } from '../../src/lib/types.js';
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

function computeChapters(inputRows: ChapterInputRow[]): Chapter[] {
	const rows: Chapter[] = inputRows
		.filter((r) => r.name && r.name.trim() !== '')
		.map((row) => {
			const chapter: Chapter = {
				id: row.id,
				number: row.number,
				name: row.name,
				subtitle: row.subtitle,
				search: [row.name, row.subtitle].map((s) => s.toLowerCase()).join(' '),
				sort: {
					order: row.number
				}
			} as Chapter;
			return chapter;
		})
		.sort((a, b) => a.sort.order - b.sort.order);
	return rows;
}

export function buildChapterBundle(inputRows: ChapterInputRow[]): EntityBundle<Chapter> {
	const rows = computeChapters(inputRows);
	const byId = Object.fromEntries(rows.map((r) => [r.id, r])) as Record<Id, Chapter>;
	return { rows, byId, facets: {} };
}
