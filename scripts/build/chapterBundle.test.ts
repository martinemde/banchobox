import { describe, it, expect, beforeEach } from 'vitest';
import { loadChapters, buildChapterBundle } from './chapterBundle.js';
import type { ChapterInputRow } from '../../src/lib/types.js';

describe('chapterBundle', () => {
	describe('buildChapterBundle', () => {
		let inputRows: ChapterInputRow[];

		beforeEach(() => {
			const { chapters } = loadChapters();
			inputRows = chapters;
		});

		it('should create a complete bundle with rows, byId, and facets', () => {
			const bundle = buildChapterBundle(inputRows);

			expect(bundle).toHaveProperty('rows');
			expect(bundle).toHaveProperty('byId');
			expect(bundle).toHaveProperty('facets');
		});

		it('should transform input rows into Chapter objects with computed fields', () => {
			const bundle = buildChapterBundle(inputRows);

			expect(bundle.rows).toHaveLength(9);

			bundle.rows.forEach((chapter) => {
				// Should have all original fields
				expect(chapter).toHaveProperty('id');
				expect(chapter).toHaveProperty('number');
				expect(chapter).toHaveProperty('name');
				expect(chapter).toHaveProperty('subtitle');

				// Should have computed fields
				expect(chapter).toHaveProperty('search');
				expect(chapter).toHaveProperty('sort');

				// Validate search field (lowercased name + subtitle)
				expect(typeof chapter.search).toBe('string');
				expect(chapter.search).toBe(
					[chapter.name, chapter.subtitle].map((s) => s.toLowerCase()).join(' ')
				);

				// Validate sort object
				expect(chapter.sort).toHaveProperty('order');
				expect(chapter.sort.order).toBe(chapter.number);
			});
		});

		it('should create correct byId mapping', () => {
			const bundle = buildChapterBundle(inputRows);

			// Should have entry for each chapter
			expect(Object.keys(bundle.byId)).toHaveLength(9);

			// Test specific mappings
			expect(bundle.byId[10]).toBeDefined();
			expect(bundle.byId[10].name).toBe('Prologue');
			expect(bundle.byId[13].name).toBe('Chapter 3');
			expect(bundle.byId[18].name).toBe('Epilogue');

			// Each entry should be a complete Chapter object
			Object.values(bundle.byId).forEach((chapter) => {
				expect(chapter).toHaveProperty('search');
				expect(chapter).toHaveProperty('sort');
			});
		});
	});
});
