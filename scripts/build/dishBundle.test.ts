import { describe, it, expect, beforeEach } from 'vitest';
import { buildDishesBundle } from './dishBundle.js';
import type {
	Dish,
	EntityBundle,
	Chapter,
	Ingredient,
	Party,
	CookstaTier
} from '../../src/lib/types.js';

describe('buildDishesBundle', () => {
	let mockDishes: Dish[];
	let mockChaptersBundle: EntityBundle<Chapter>;
	let mockIngredientsBundle: EntityBundle<Ingredient>;
	let mockPartiesBundle: EntityBundle<Party>;
	let mockCookstaBundle: EntityBundle<CookstaTier>;

	beforeEach(() => {
		// Create mock dishes with varying properties for testing sort
		mockDishes = [
			{
				id: 1,
				name: 'Sushi Roll A',
				image: 'sushi-a.png',
				chapter: 1,
				maxLevel: 1,
				basePrice: 100,
				baseTaste: 50,
				baseServings: 2,
				finalPrice: 150,
				finalTaste: 60,
				finalServings: 3,
				ingredients: [],
				recipeCost: 30,
				partyDishIds: [],
				partyIds: [],
				finalRevenue: 450,
				finalProfit: 420,
				finalProfitPerServing: 140,
				maxProfitPerServing: 140,
				upgradeCost: 10,
				ingredientCount: 2,
				search: 'sushi roll a'
			},
			{
				id: 2,
				name: 'Sushi Roll B',
				image: 'sushi-b.png',
				chapter: 1,
				maxLevel: 2,
				basePrice: 80,
				baseTaste: 40,
				baseServings: 2,
				finalPrice: 120,
				finalTaste: 50,
				finalServings: 2,
				ingredients: [],
				recipeCost: 20,
				partyDishIds: [],
				partyIds: [],
				finalRevenue: 240,
				finalProfit: 220,
				finalProfitPerServing: 110,
				maxProfitPerServing: 110,
				upgradeCost: 20,
				ingredientCount: 3,
				search: 'sushi roll b'
			},
			{
				id: 3,
				name: 'Sashimi',
				image: 'sashimi.png',
				chapter: 2,
				maxLevel: 1,
				basePrice: 200,
				baseTaste: 80,
				baseServings: 1,
				finalPrice: 250,
				finalTaste: 90,
				finalServings: 2,
				ingredients: [],
				recipeCost: 50,
				partyDishIds: [],
				partyIds: [],
				finalRevenue: 500,
				finalProfit: 450,
				finalProfitPerServing: 225,
				maxProfitPerServing: 225,
				upgradeCost: 5,
				ingredientCount: 1,
				search: 'sashimi'
			}
		] as Dish[];

		mockChaptersBundle = {
			rows: [
				{ id: 1, number: 1, name: 'Chapter 1', subtitle: 'Test', search: '', sort: { order: 1 } },
				{ id: 2, number: 2, name: 'Chapter 2', subtitle: 'Test', search: '', sort: { order: 2 } }
			],
			byId: {
				1: { id: 1, number: 1, name: 'Chapter 1', subtitle: 'Test', search: '', sort: { order: 1 } },
				2: { id: 2, number: 2, name: 'Chapter 2', subtitle: 'Test', search: '', sort: { order: 2 } }
			},
			facets: {}
		} as any;

		mockIngredientsBundle = {
			sorted: {},
			byId: {},
			facets: {}
		};

		mockPartiesBundle = {
			sorted: { default: 'order', order: { asc: [], display: 'Order' } },
			byId: {},
			facets: {}
		};

		mockCookstaBundle = {
			rows: [
				{ id: 1, name: 'Bronze', rank: 1, customers: 10, customerNight: 5, partyCustomers: 15, followers: 100, recipes: 5, bestTaste: 100, operatingCost: 50, kitchenStaff: 2, servingStaff: 2, sort: { order: 1 } },
				{ id: 2, name: 'Silver', rank: 2, customers: 20, customerNight: 10, partyCustomers: 20, followers: 200, recipes: 10, bestTaste: 200, operatingCost: 100, kitchenStaff: 3, servingStaff: 3, sort: { order: 2 } }
			],
			byId: {
				1: { id: 1, name: 'Bronze', rank: 1, customers: 10, customerNight: 5, partyCustomers: 15, followers: 100, recipes: 5, bestTaste: 100, operatingCost: 50, kitchenStaff: 2, servingStaff: 2, sort: { order: 1 } },
				2: { id: 2, name: 'Silver', rank: 2, customers: 20, customerNight: 10, partyCustomers: 20, followers: 200, recipes: 10, bestTaste: 200, operatingCost: 100, kitchenStaff: 3, servingStaff: 3, sort: { order: 2 } }
			},
			facets: {}
		} as any;
	});

	describe('sorted structure', () => {
		it('should create sorted structure with default and display metadata', () => {
			const bundle = buildDishesBundle({
				dishes: mockDishes,
				chaptersBundle: mockChaptersBundle,
				ingredientsBundle: mockIngredientsBundle,
				partiesBundle: mockPartiesBundle,
				cookstaBundle: mockCookstaBundle
			});

			expect(bundle).toHaveProperty('sorted');
			expect(bundle.sorted).toHaveProperty('default');
			expect(typeof bundle.sorted.default).toBe('string');

			const defaultKey = bundle.sorted.default;
			expect(bundle.sorted[defaultKey]).toBeDefined();
			expect(typeof bundle.sorted[defaultKey]).not.toBe('string');
		});

		it('should use "finalProfitPerServing" as default sort key', () => {
			const bundle = buildDishesBundle({
				dishes: mockDishes,
				chaptersBundle: mockChaptersBundle,
				ingredientsBundle: mockIngredientsBundle,
				partiesBundle: mockPartiesBundle,
				cookstaBundle: mockCookstaBundle
			});

			expect(bundle.sorted.default).toBe('finalProfitPerServing');
		});

		it('should have all expected sort keys with correct directions and displays', () => {
			const bundle = buildDishesBundle({
				dishes: mockDishes,
				chaptersBundle: mockChaptersBundle,
				ingredientsBundle: mockIngredientsBundle,
				partiesBundle: mockPartiesBundle,
				cookstaBundle: mockCookstaBundle
			});

			// name: ascending
			expect(bundle.sorted.name).toHaveProperty('asc');
			expect(bundle.sorted.name.display).toBe('Name');

			// finalPrice: descending
			expect(bundle.sorted.finalPrice).toHaveProperty('desc');
			expect(bundle.sorted.finalPrice.display).toBe('Price');

			// finalServings: descending
			expect(bundle.sorted.finalServings).toHaveProperty('desc');
			expect(bundle.sorted.finalServings.display).toBe('Servings');

			// finalProfitPerServing: descending
			expect(bundle.sorted.finalProfitPerServing).toHaveProperty('desc');
			expect(bundle.sorted.finalProfitPerServing.display).toBe('Profit/Serving');

			// maxProfitPerServing: descending
			expect(bundle.sorted.maxProfitPerServing).toHaveProperty('desc');
			expect(bundle.sorted.maxProfitPerServing.display).toBe('Max Profit/Serving');

			// upgradeCost: ascending
			expect(bundle.sorted.upgradeCost).toHaveProperty('asc');
			expect(bundle.sorted.upgradeCost.display).toBe('Upgrade Cost');

			// ingredientCount: ascending
			expect(bundle.sorted.ingredientCount).toHaveProperty('asc');
			expect(bundle.sorted.ingredientCount.display).toBe('Ingredients');
		});

		it('should NOT have a rows property', () => {
			const bundle = buildDishesBundle({
				dishes: mockDishes,
				chaptersBundle: mockChaptersBundle,
				ingredientsBundle: mockIngredientsBundle,
				partiesBundle: mockPartiesBundle,
				cookstaBundle: mockCookstaBundle
			});

			expect(bundle).not.toHaveProperty('rows');
		});
	});

	describe('sorted arrays', () => {
		it('should sort dishes by name ascending correctly', () => {
			const bundle = buildDishesBundle({
				dishes: mockDishes,
				chaptersBundle: mockChaptersBundle,
				ingredientsBundle: mockIngredientsBundle,
				partiesBundle: mockPartiesBundle,
				cookstaBundle: mockCookstaBundle
			});

			const sortedIds = bundle.sorted.name.asc!;
			const sortedDishes = sortedIds.map((id) => bundle.byId[id]);
			const names = sortedDishes.map((d) => d.name.toLowerCase());

			// Verify ascending order
			for (let i = 1; i < names.length; i++) {
				expect(names[i].localeCompare(names[i - 1])).toBeGreaterThanOrEqual(0);
			}

			// Verify specific order: Sashimi, Sushi Roll A, Sushi Roll B
			expect(sortedDishes[0].name).toBe('Sashimi');
			expect(sortedDishes[1].name).toBe('Sushi Roll A');
			expect(sortedDishes[2].name).toBe('Sushi Roll B');
		});

		it('should sort dishes by finalPrice descending correctly', () => {
			const bundle = buildDishesBundle({
				dishes: mockDishes,
				chaptersBundle: mockChaptersBundle,
				ingredientsBundle: mockIngredientsBundle,
				partiesBundle: mockPartiesBundle,
				cookstaBundle: mockCookstaBundle
			});

			const sortedIds = bundle.sorted.finalPrice.desc!;
			const sortedDishes = sortedIds.map((id) => bundle.byId[id]);

			// Sashimi (250), Sushi Roll A (150), Sushi Roll B (120)
			expect(sortedDishes[0].name).toBe('Sashimi');
			expect(sortedDishes[1].name).toBe('Sushi Roll A');
			expect(sortedDishes[2].name).toBe('Sushi Roll B');
		});

		it('should sort dishes by finalProfitPerServing descending correctly', () => {
			const bundle = buildDishesBundle({
				dishes: mockDishes,
				chaptersBundle: mockChaptersBundle,
				ingredientsBundle: mockIngredientsBundle,
				partiesBundle: mockPartiesBundle,
				cookstaBundle: mockCookstaBundle
			});

			const sortedIds = bundle.sorted.finalProfitPerServing.desc!;
			const sortedDishes = sortedIds.map((id) => bundle.byId[id]);

			// Sashimi (225), Sushi Roll A (140), Sushi Roll B (110)
			expect(sortedDishes[0].name).toBe('Sashimi');
			expect(sortedDishes[1].name).toBe('Sushi Roll A');
			expect(sortedDishes[2].name).toBe('Sushi Roll B');
		});

		it('should sort dishes by upgradeCost ascending correctly', () => {
			const bundle = buildDishesBundle({
				dishes: mockDishes,
				chaptersBundle: mockChaptersBundle,
				ingredientsBundle: mockIngredientsBundle,
				partiesBundle: mockPartiesBundle,
				cookstaBundle: mockCookstaBundle
			});

			const sortedIds = bundle.sorted.upgradeCost.asc!;
			const sortedDishes = sortedIds.map((id) => bundle.byId[id]);

			// Sashimi (5), Sushi Roll A (10), Sushi Roll B (20)
			expect(sortedDishes[0].name).toBe('Sashimi');
			expect(sortedDishes[1].name).toBe('Sushi Roll A');
			expect(sortedDishes[2].name).toBe('Sushi Roll B');
		});

		it('should sort dishes by ingredientCount ascending correctly', () => {
			const bundle = buildDishesBundle({
				dishes: mockDishes,
				chaptersBundle: mockChaptersBundle,
				ingredientsBundle: mockIngredientsBundle,
				partiesBundle: mockPartiesBundle,
				cookstaBundle: mockCookstaBundle
			});

			const sortedIds = bundle.sorted.ingredientCount.asc!;
			const sortedDishes = sortedIds.map((id) => bundle.byId[id]);

			// Sashimi (1), Sushi Roll A (2), Sushi Roll B (3)
			expect(sortedDishes[0].name).toBe('Sashimi');
			expect(sortedDishes[1].name).toBe('Sushi Roll A');
			expect(sortedDishes[2].name).toBe('Sushi Roll B');
		});

		it('should have all dish IDs in each sorted array', () => {
			const bundle = buildDishesBundle({
				dishes: mockDishes,
				chaptersBundle: mockChaptersBundle,
				ingredientsBundle: mockIngredientsBundle,
				partiesBundle: mockPartiesBundle,
				cookstaBundle: mockCookstaBundle
			});

			const expectedIds = mockDishes.map((d) => d.id).sort((a, b) => a - b);
			const sortKeys = ['name', 'finalPrice', 'finalServings', 'finalProfitPerServing', 'maxProfitPerServing', 'upgradeCost', 'ingredientCount'];

			for (const key of sortKeys) {
				const sortDef = bundle.sorted[key];
				const direction = sortDef.asc ? 'asc' : 'desc';
				const sortedIds = sortDef[direction]!;

				expect(sortedIds).toHaveLength(expectedIds.length);

				const actualIds = [...sortedIds].sort((a, b) => a - b);
				expect(actualIds).toEqual(expectedIds);
			}
		});
	});

	describe('byId and facets', () => {
		it('should create correct byId mapping', () => {
			const bundle = buildDishesBundle({
				dishes: mockDishes,
				chaptersBundle: mockChaptersBundle,
				ingredientsBundle: mockIngredientsBundle,
				partiesBundle: mockPartiesBundle,
				cookstaBundle: mockCookstaBundle
			});

			expect(Object.keys(bundle.byId)).toHaveLength(3);
			expect(bundle.byId[1].name).toBe('Sushi Roll A');
			expect(bundle.byId[2].name).toBe('Sushi Roll B');
			expect(bundle.byId[3].name).toBe('Sashimi');
		});

		it('should create facets structure', () => {
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
});
