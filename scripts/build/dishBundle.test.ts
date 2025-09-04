import { describe, it, expect } from 'vitest';
import { buildDishesBundle } from './dishBundle.js';
import type { Dish, EntityBundle, Chapter, Ingredient, Party, CookstaTier } from '../../src/lib/types.js';

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
		search: 'test dish a',
		sort: {
			name: 'test dish a',
			finalPrice: 100,
			finalServings: 2,
			finalRevenue: 200,
			finalProfit: 190,
			finalProfitPerServing: 95,
			maxProfitPerServing: 95,
			recipeCost: 10,
			upgradeCost: 0,
			ingredientCount: 0
		}
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
		search: 'test dish b',
		sort: {
			name: 'test dish b',
			finalPrice: 200,
			finalServings: 3,
			finalRevenue: 600,
			finalProfit: 580,
			finalProfitPerServing: 193,
			maxProfitPerServing: 193,
			recipeCost: 20,
			upgradeCost: 0,
			ingredientCount: 0
		}
	}
];

const mockChaptersBundle: EntityBundle<Chapter> = {
	sortedIds: { 'order_asc': [1] },
	byId: { 1: { id: 1, number: 1, name: 'Chapter 1', subtitle: 'Test', search: '', sort: { order: 1 } } },
	facets: {}
};

const mockIngredientsBundle: EntityBundle<Ingredient> = {
	sortedIds: {},
	byId: {},
	facets: {}
};

const mockPartiesBundle: EntityBundle<Party> = {
	sortedIds: {},
	byId: {},
	facets: {}
};

const mockCookstaBundle: EntityBundle<CookstaTier> = {
	sortedIds: { 'order_asc': [1] },
	byId: { 1: { id: 1, name: 'Bronze', rank: 1, customers: 10, customerNight: 5, partyCustomers: 15, followers: 100, recipes: 5, bestTaste: 100, operatingCost: 50, kitchenStaff: 2, servingStaff: 2, sort: { order: 1 } } },
	facets: {}
};

describe('buildDishesBundle', () => {
	it('should create bundle with sortedIds instead of rows', () => {
		const bundle = buildDishesBundle({
			dishes: mockDishes,
			chaptersBundle: mockChaptersBundle,
			ingredientsBundle: mockIngredientsBundle,
			partiesBundle: mockPartiesBundle,
			cookstaBundle: mockCookstaBundle
		});

		// Check structure
		expect(bundle).toHaveProperty('sortedIds');
		expect(bundle).toHaveProperty('byId');
		expect(bundle).toHaveProperty('facets');
		expect(bundle).not.toHaveProperty('rows');
	});

	it('should create correct sortedIds arrays', () => {
		const bundle = buildDishesBundle({
			dishes: mockDishes,
			chaptersBundle: mockChaptersBundle,
			ingredientsBundle: mockIngredientsBundle,
			partiesBundle: mockPartiesBundle,
			cookstaBundle: mockCookstaBundle
		});

		// Check that sortedIds has expected keys
		expect(bundle.sortedIds).toHaveProperty('name_asc');
		expect(bundle.sortedIds).toHaveProperty('finalProfitPerServing_desc');
		expect(bundle.sortedIds).toHaveProperty('finalPrice_desc');

		// Check sorting correctness
		const nameAsc = bundle.sortedIds.name_asc;
		expect(nameAsc).toHaveLength(2);
		expect(nameAsc[0]).toBe(1); // "Test Dish A" comes first
		expect(nameAsc[1]).toBe(2); // "Test Dish B" comes second

		const profitDesc = bundle.sortedIds.finalProfitPerServing_desc;
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
});