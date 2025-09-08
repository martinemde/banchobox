import { describe, it, expect } from 'vitest';
import { buildDishesBundle } from './dishBundle.js';
import type {
	Dish,
	EntityBundle,
	Chapter,
	Ingredient,
	Party,
	CookstaTier
} from '../../src/lib/types.js';

// Mock data for testing
const mockDishes: Dish[] = [
	{
		id: 1,
		name: 'Test Dish A',
		image: 'test.png',
		chapter: 1,
		maxLevel: 1,
		basePrice: 100,
		baseTaste: 50,
		baseServings: 2,
		finalPrice: 100,
		finalTaste: 50,
		finalServings: 2,
		ingredients: [],
		recipeCost: 10,
		partyDishIds: [],
		partyIds: [],
		finalRevenue: 200,
		finalProfit: 190,
		finalProfitPerServing: 95,
		maxProfitPerServing: 95,
		upgradeCost: 0,
		ingredientCount: 0,
		search: 'test dish a'
	},
	{
		id: 2,
		name: 'Test Dish B',
		image: 'test2.png',
		chapter: 1,
		maxLevel: 1,
		basePrice: 200,
		baseTaste: 75,
		baseServings: 3,
		finalPrice: 200,
		finalTaste: 75,
		finalServings: 3,
		ingredients: [],
		recipeCost: 20,
		partyDishIds: [],
		partyIds: [],
		finalRevenue: 600,
		finalProfit: 580,
		finalProfitPerServing: 193,
		maxProfitPerServing: 193,
		upgradeCost: 0,
		ingredientCount: 0,
		search: 'test dish b'
	}
];

const mockChaptersBundle: EntityBundle<Chapter> = {
	sorted: { order: { asc: [1] } },
	byId: {
		1: { id: 1, number: 1, name: 'Chapter 1', subtitle: 'Test', search: '' }
	},
	facets: {}
};

const mockIngredientsBundle: EntityBundle<Ingredient> = {
	sorted: {},
	byId: {},
	facets: {}
};

const mockPartiesBundle: EntityBundle<Party> = {
	sorted: {},
	byId: {},
	facets: {}
};

const mockCookstaBundle: EntityBundle<CookstaTier> = {
	sorted: { order: { asc: [1] } },
	byId: {
		1: {
			id: 1,
			name: 'Bronze',
			rank: 1,
			customers: 10,
			customerNight: 5,
			partyCustomers: 15,
			followers: 100,
			recipes: 5,
			bestTaste: 100,
			operatingCost: 50,
			kitchenStaff: 2,
			servingStaff: 2
		}
	},
	facets: {}
};

describe('buildDishesBundle', () => {
	it('should create bundle with sorted, byId, and facets', () => {
		const bundle = buildDishesBundle({
			dishes: mockDishes,
			chaptersBundle: mockChaptersBundle,
			ingredientsBundle: mockIngredientsBundle,
			partiesBundle: mockPartiesBundle,
			cookstaBundle: mockCookstaBundle
		});

		// Check structure
		expect(bundle).toHaveProperty('sorted');
		expect(bundle).toHaveProperty('byId');
		expect(bundle).toHaveProperty('facets');
	});

	it('should create correct sorted arrays', () => {
		const bundle = buildDishesBundle({
			dishes: mockDishes,
			chaptersBundle: mockChaptersBundle,
			ingredientsBundle: mockIngredientsBundle,
			partiesBundle: mockPartiesBundle,
			cookstaBundle: mockCookstaBundle
		});

		// Check that sorted has expected keys with nested structure
		expect(bundle.sorted).toHaveProperty('name');
		expect(bundle.sorted).toHaveProperty('finalProfitPerServing');
		expect(bundle.sorted).toHaveProperty('finalPrice');
		expect(bundle.sorted.name).toHaveProperty('asc');
		expect(bundle.sorted.finalProfitPerServing).toHaveProperty('desc');
		expect(bundle.sorted.finalPrice).toHaveProperty('desc');

		// Check sorting correctness
		const nameAsc = bundle.sorted.name.asc;
		expect(nameAsc).toHaveLength(2);
		expect(nameAsc[0]).toBe(1); // "Test Dish A" comes first
		expect(nameAsc[1]).toBe(2); // "Test Dish B" comes second

		const profitDesc = bundle.sorted.finalProfitPerServing.desc;
		expect(profitDesc).toHaveLength(2);
		expect(profitDesc[0]).toBe(2); // Dish B has higher profit (193)
		expect(profitDesc[1]).toBe(1); // Dish A has lower profit (95)
	});

	it('should populate byId correctly', () => {
		const bundle = buildDishesBundle({
			dishes: mockDishes,
			chaptersBundle: mockChaptersBundle,
			ingredientsBundle: mockIngredientsBundle,
			partiesBundle: mockPartiesBundle,
			cookstaBundle: mockCookstaBundle
		});

		expect(Object.keys(bundle.byId)).toHaveLength(2);
		expect(bundle.byId[1]).toEqual(mockDishes[0]);
		expect(bundle.byId[2]).toEqual(mockDishes[1]);
	});

	it('should create facets', () => {
		const bundle = buildDishesBundle({
			dishes: mockDishes,
			chaptersBundle: mockChaptersBundle,
			ingredientsBundle: mockIngredientsBundle,
			partiesBundle: mockPartiesBundle,
			cookstaBundle: mockCookstaBundle
		});

		expect(bundle.facets).toHaveProperty('Chapter');
		expect(bundle.facets).toHaveProperty('Cooksta');
		expect(bundle.facets).toHaveProperty('DLC');
		expect(bundle.facets).toHaveProperty('Party');
		expect(bundle.facets).toHaveProperty('Unlock Condition');
	});

	it('should have all expected sort keys with correct directions', () => {
		const bundle = buildDishesBundle({
			dishes: mockDishes,
			chaptersBundle: mockChaptersBundle,
			ingredientsBundle: mockIngredientsBundle,
			partiesBundle: mockPartiesBundle,
			cookstaBundle: mockCookstaBundle
		});

		// Expected sort keys and their directions
		const expectedSorts = [
			{ key: 'name', direction: 'asc' },
			{ key: 'finalPrice', direction: 'desc' },
			{ key: 'finalServings', direction: 'desc' },
			{ key: 'finalProfitPerServing', direction: 'desc' },
			{ key: 'maxProfitPerServing', direction: 'desc' },
			{ key: 'upgradeCost', direction: 'asc' },
			{ key: 'ingredientCount', direction: 'asc' }
		];

		// Verify each expected sort key exists with the correct direction
		for (const { key, direction } of expectedSorts) {
			expect(bundle.sorted).toHaveProperty(key);
			expect(bundle.sorted[key]).toHaveProperty(direction);
			expect(Array.isArray(bundle.sorted[key][direction])).toBe(true);
			expect(bundle.sorted[key][direction]).toHaveLength(mockDishes.length);

			// Verify all IDs are present
			const sortedIds = bundle.sorted[key][direction];
			const expectedIds = mockDishes.map((d) => d.id).sort((a, b) => a - b);
			const actualIds = [...sortedIds].sort((a, b) => a - b);
			expect(actualIds).toEqual(expectedIds);
		}

		// Verify we have exactly the expected number of sort keys (no more, no less)
		expect(Object.keys(bundle.sorted)).toHaveLength(expectedSorts.length);
	});
});
