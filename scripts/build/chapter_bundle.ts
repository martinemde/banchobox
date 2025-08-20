import type { ChapterInputRow, Chapter, EntityBundle, Id } from '../../src/lib/types.js';

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
	const facets: EntityBundle<Chapter>['facets'] = {
		number: {}
	};

	for (const r of rows) {
		(facets['number'][r.number] ??= []).push(r.id);
	}

	return { rows, byId, facets };
}
