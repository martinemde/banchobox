import { describe, it, expect, beforeEach } from 'vitest';
import { loadChapters, buildChapters } from './chapterBundle.js';
import type { ChapterInputRow } from '../../src/lib/types.js';

describe('chapterBundle', () => {
	describe('buildChapters', () => {
		let inputRows: ChapterInputRow[];

		beforeEach(() => {
			const { chapters } = loadChapters();
			inputRows = chapters;
		});

		it('should create a sorted array of chapters', () => {
			const chapters = buildChapters(inputRows);

			expect(Array.isArray(chapters)).toBe(true);
			expect(chapters).toHaveLength(9);
		});

		it('should transform input rows into Chapter objects', () => {
			const chapters = buildChapters(inputRows);

			expect(chapters).toHaveLength(9);

			chapters.forEach((chapter) => {
				// Should have all required fields
				expect(chapter).toHaveProperty('id');
				expect(chapter).toHaveProperty('number');
				expect(chapter).toHaveProperty('name');
				expect(chapter).toHaveProperty('subtitle');

				// Should NOT have computed sort or search fields
				expect(chapter).not.toHaveProperty('search');
				expect(chapter).not.toHaveProperty('sort');
			});
		});

		it('should allow looking up chapters by id', () => {
			const chapters = buildChapters(inputRows);

			// Test specific chapter lookups
			const prologue = chapters.find((c) => c.id === 10);
			expect(prologue).toBeDefined();
			expect(prologue?.name).toBe('Prologue');

			const chapter3 = chapters.find((c) => c.id === 13);
			expect(chapter3).toBeDefined();
			expect(chapter3?.name).toBe('Chapter 3');

			const epilogue = chapters.find((c) => c.id === 18);
			expect(epilogue).toBeDefined();
			expect(epilogue?.name).toBe('Epilogue');
		});

		it('should sort chapters by number in ascending order', () => {
			const chapters = buildChapters(inputRows);

			const numbers = chapters.map((c) => c.number);
			const sortedNumbers = [...numbers].sort((a, b) => a - b);
			expect(numbers).toEqual(sortedNumbers);
		});
	});
});
