import { describe, it, expect, beforeEach } from 'vitest';
import { buildIngredientsBundle } from './ingredientBundle.js';
import type { Ingredient, EntityBundle, Chapter } from '../../src/lib/types.js';

describe('buildIngredientsBundle', () => {
	let mockIngredients: Ingredient[];
	let mockChaptersBundle: EntityBundle<Chapter>;

	beforeEach(() => {
		// Create minimal mock ingredients for testing
		mockIngredients = [
			{
				id: 1,
				name: 'Apple',
				image: 'apple.png',
				type: 'Fruit',
				source: 'Farm',
				rank: 1,
				cost: 5,
				drone: false,
				harpoon: false,
				steelnet: false,
				crabtrap: false,
				bugnet: false,
				gloves: false,
				aberration: false,
				day: true,
				night: false,
				fog: false,
				chapter: 1,
				buyOtto: 4,
				sell: 10,
				kg: 2,
				maxMeats: 1,
				sellPerKg: 5,
				usedIn: [],
				usedForParties: [],
				vendors: { Otto: 4 },
				search: 'apple fruit farm'
			},
			{
				id: 2,
				name: 'Banana',
				image: 'banana.png',
				type: 'Fruit',
				source: 'Farm',
				rank: 1,
				cost: 3,
				drone: false,
				harpoon: false,
				steelnet: false,
				crabtrap: false,
				bugnet: false,
				gloves: false,
				aberration: false,
				day: true,
				night: false,
				fog: false,
				chapter: 1,
				buyJango: 2,
				sell: 8,
				kg: 1,
				maxMeats: 1,
				sellPerKg: 8,
				usedIn: [],
				usedForParties: [],
				vendors: { Jango: 2 },
				search: 'banana fruit farm'
			},
			{
				id: 3,
				name: 'Zucchini',
				image: 'zucchini.png',
				type: 'Vegetable',
				source: 'Farm',
				rank: 2,
				cost: 7,
				drone: false,
				harpoon: false,
				steelnet: false,
				crabtrap: false,
				bugnet: false,
				gloves: false,
				aberration: false,
				day: true,
				night: false,
				fog: false,
				chapter: 2,
				buyOtto: 6,
				buyJango: 5,
				sell: 15,
				kg: 3,
				maxMeats: 2,
				sellPerKg: 10,
				usedIn: [],
				usedForParties: [],
				vendors: { Otto: 6, Jango: 5 },
				search: 'zucchini vegetable farm'
			}
		] as Ingredient[];

		mockChaptersBundle = {
			sorted: {
				default: 'order',
				order: {
					asc: [1, 2, 3],
					display: 'Order'
				}
			},
			byId: {
				1: { id: 1, number: 1, name: 'Chapter 1', subtitle: 'Test', search: 'chapter 1' },
				2: { id: 2, number: 2, name: 'Chapter 2', subtitle: 'Test', search: 'chapter 2' },
				3: { id: 3, number: 3, name: 'Chapter 3', subtitle: 'Test', search: 'chapter 3' }
			},
			facets: {}
		};
	});

	describe('sorted structure', () => {
		it('should create sorted structure with default and display metadata', () => {
			const bundle = buildIngredientsBundle(mockIngredients, mockChaptersBundle);

			// Verify structure
			expect(bundle).toHaveProperty('sorted');
			expect(bundle.sorted).toHaveProperty('default');
			expect(typeof bundle.sorted.default).toBe('string');

			// Verify default points to valid key
			const defaultKey = bundle.sorted.default;
			expect(bundle.sorted[defaultKey]).toBeDefined();
			expect(typeof bundle.sorted[defaultKey]).not.toBe('string'); // Should be SortedIds object, not string
		});

		it('should have correct sort keys with display names', () => {
			const bundle = buildIngredientsBundle(mockIngredients, mockChaptersBundle);

			const expectedSortKeys = ['name', 'buy', 'sell', 'kg', 'sellPerKg'];

			for (const key of expectedSortKeys) {
				expect(bundle.sorted[key]).toBeDefined();
				const sortDef = bundle.sorted[key];
				expect(typeof sortDef).not.toBe('string'); // Should be SortedIds object
				expect(sortDef).toHaveProperty('display');
				expect(typeof sortDef.display).toBe('string');

				// Should have at least one direction
				const hasDirection = sortDef.asc || sortDef.desc;
				expect(hasDirection).toBeDefined();
				expect(Array.isArray(hasDirection)).toBe(true);
			}
		});

		it('should use "name" as default sort key', () => {
			const bundle = buildIngredientsBundle(mockIngredients, mockChaptersBundle);
			expect(bundle.sorted.default).toBe('name');
		});

		it('should have correct sort directions and display names', () => {
			const bundle = buildIngredientsBundle(mockIngredients, mockChaptersBundle);

			// name: ascending
			expect(bundle.sorted.name).toHaveProperty('asc');
			expect(bundle.sorted.name.display).toBe('Name');

			// buy: ascending
			expect(bundle.sorted.buy).toHaveProperty('asc');
			expect(bundle.sorted.buy.display).toBe('Buy Price');

			// sell: descending
			expect(bundle.sorted.sell).toHaveProperty('desc');
			expect(bundle.sorted.sell.display).toBe('Sell Price');

			// kg: descending
			expect(bundle.sorted.kg).toHaveProperty('desc');
			expect(bundle.sorted.kg.display).toBe('Weight');

			// sellPerKg: descending
			expect(bundle.sorted.sellPerKg).toHaveProperty('desc');
			expect(bundle.sorted.sellPerKg.display).toBe('Value/kg');
		});

		it('should NOT have a rows property', () => {
			const bundle = buildIngredientsBundle(mockIngredients, mockChaptersBundle);
			expect(bundle).not.toHaveProperty('rows');
		});
	});

	describe('sorted arrays', () => {
		it('should sort ingredients by name ascending correctly', () => {
			const bundle = buildIngredientsBundle(mockIngredients, mockChaptersBundle);

			const sortedIds = bundle.sorted.name.asc!;
			const sortedIngredients = sortedIds.map((id) => bundle.byId[id]);
			const names = sortedIngredients.map((i) => i.name.toLowerCase());

			// Verify ascending order
			for (let i = 1; i < names.length; i++) {
				expect(names[i].localeCompare(names[i - 1])).toBeGreaterThanOrEqual(0);
			}

			// Verify specific order: Apple, Banana, Zucchini
			expect(sortedIngredients[0].name).toBe('Apple');
			expect(sortedIngredients[1].name).toBe('Banana');
			expect(sortedIngredients[2].name).toBe('Zucchini');
		});

		it('should sort ingredients by buy price ascending correctly', () => {
			const bundle = buildIngredientsBundle(mockIngredients, mockChaptersBundle);

			const sortedIds = bundle.sorted.buy.asc!;
			const sortedIngredients = sortedIds.map((id) => bundle.byId[id]);

			// Buy prices: Banana (2), Apple (4), Zucchini (5)
			expect(sortedIngredients[0].name).toBe('Banana'); // cheapest
			expect(sortedIngredients[1].name).toBe('Apple');
			expect(sortedIngredients[2].name).toBe('Zucchini'); // most expensive
		});

		it('should sort ingredients by sell price descending correctly', () => {
			const bundle = buildIngredientsBundle(mockIngredients, mockChaptersBundle);

			const sortedIds = bundle.sorted.sell.desc!;
			const sortedIngredients = sortedIds.map((id) => bundle.byId[id]);

			// Sell prices: Zucchini (15), Apple (10), Banana (8)
			expect(sortedIngredients[0].name).toBe('Zucchini'); // highest
			expect(sortedIngredients[1].name).toBe('Apple');
			expect(sortedIngredients[2].name).toBe('Banana'); // lowest
		});

		it('should sort ingredients by kg descending correctly', () => {
			const bundle = buildIngredientsBundle(mockIngredients, mockChaptersBundle);

			const sortedIds = bundle.sorted.kg.desc!;
			const sortedIngredients = sortedIds.map((id) => bundle.byId[id]);

			// Weight: Zucchini (3), Apple (2), Banana (1)
			expect(sortedIngredients[0].name).toBe('Zucchini'); // heaviest
			expect(sortedIngredients[1].name).toBe('Apple');
			expect(sortedIngredients[2].name).toBe('Banana'); // lightest
		});

		it('should sort ingredients by sellPerKg descending correctly', () => {
			const bundle = buildIngredientsBundle(mockIngredients, mockChaptersBundle);

			const sortedIds = bundle.sorted.sellPerKg.desc!;
			const sortedIngredients = sortedIds.map((id) => bundle.byId[id]);

			// Value/kg: Zucchini (10), Banana (8), Apple (5)
			expect(sortedIngredients[0].name).toBe('Zucchini'); // best value
			expect(sortedIngredients[1].name).toBe('Banana');
			expect(sortedIngredients[2].name).toBe('Apple'); // worst value
		});

		it('should have all ingredient IDs in each sorted array', () => {
			const bundle = buildIngredientsBundle(mockIngredients, mockChaptersBundle);

			const expectedIds = mockIngredients.map((i) => i.id).sort((a, b) => a - b);

			// Check each sort key
			const sortKeys = ['name', 'buy', 'sell', 'kg', 'sellPerKg'];
			for (const key of sortKeys) {
				const sortDef = bundle.sorted[key];
				const direction = sortDef.asc ? 'asc' : 'desc';
				const sortedIds = sortDef[direction]!;

				expect(sortedIds).toHaveLength(expectedIds.length);

				const actualIds = [...sortedIds].sort((a, b) => a - b);
				expect(actualIds).toEqual(expectedIds);
			}
		});

		it('should map all sorted IDs to valid entities in byId', () => {
			const bundle = buildIngredientsBundle(mockIngredients, mockChaptersBundle);

			const nameIds = bundle.sorted.name.asc!;
			nameIds.forEach((id) => {
				expect(bundle.byId[id]).toBeDefined();
				expect(bundle.byId[id].id).toBe(id);
			});
		});
	});

	describe('byId and facets', () => {
		it('should create correct byId mapping', () => {
			const bundle = buildIngredientsBundle(mockIngredients, mockChaptersBundle);

			expect(Object.keys(bundle.byId)).toHaveLength(3);
			expect(bundle.byId[1].name).toBe('Apple');
			expect(bundle.byId[2].name).toBe('Banana');
			expect(bundle.byId[3].name).toBe('Zucchini');
		});

		it('should create facets structure', () => {
			const bundle = buildIngredientsBundle(mockIngredients, mockChaptersBundle);

			expect(bundle.facets).toHaveProperty('Type');
			expect(bundle.facets).toHaveProperty('Source');
			expect(bundle.facets).toHaveProperty('Time');
			expect(bundle.facets).toHaveProperty('Vendor');
			expect(bundle.facets).toHaveProperty('Catch');
			expect(bundle.facets).toHaveProperty('Aberration');
			expect(bundle.facets).toHaveProperty('Farm');
			expect(bundle.facets).toHaveProperty('Chapter');
		});

		it('should correctly categorize ingredients by type', () => {
			const bundle = buildIngredientsBundle(mockIngredients, mockChaptersBundle);

			expect(bundle.facets.Type['Fruit']).toContain(1); // Apple
			expect(bundle.facets.Type['Fruit']).toContain(2); // Banana
			expect(bundle.facets.Type['Vegetable']).toContain(3); // Zucchini
		});

		it('should create cumulative chapter facets', () => {
			const bundle = buildIngredientsBundle(mockIngredients, mockChaptersBundle);

			// Apple and Banana are chapter 1, so they appear in chapters 1, 2, 3
			expect(bundle.facets.Chapter['1']).toContain(1);
			expect(bundle.facets.Chapter['1']).toContain(2);
			expect(bundle.facets.Chapter['2']).toContain(1);
			expect(bundle.facets.Chapter['2']).toContain(2);
			expect(bundle.facets.Chapter['3']).toContain(1);
			expect(bundle.facets.Chapter['3']).toContain(2);

			// Zucchini is chapter 2, so it appears in chapters 2 and 3 only
			expect(bundle.facets.Chapter['1']).not.toContain(3);
			expect(bundle.facets.Chapter['2']).toContain(3);
			expect(bundle.facets.Chapter['3']).toContain(3);
		});
	});
});
