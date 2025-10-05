import { describe, it, expect, beforeEach } from 'vitest';
import { loadIngredients, prepareIngredients, buildIngredientsBundle } from './ingredientBundle.js';
import type {
	IngredientInputRow,
	DishInputRow,
	PartyInputRow,
	DishIngredientJoinRow,
	PartyDishJoinRow
} from './types.js';
import type { Ingredient, EntityBundle, Chapter } from '../../src/lib/types.js';

describe('ingredientBundle', () => {
	describe('loadIngredients', () => {
		it('should load and parse all ingredients from CSV', () => {
			const result = loadIngredients();

			expect(result).toHaveProperty('ingredients');
			expect(result).toHaveProperty('ingredientNameToId');
			expect(Array.isArray(result.ingredients)).toBe(true);
			expect(result.ingredients.length).toBeGreaterThan(0);
			expect(result.ingredientNameToId instanceof Map).toBe(true);
		});

		it('should parse ingredient data with correct types and values', () => {
			const { ingredients } = loadIngredients();

			// Test first ingredient
			const firstIngredient = ingredients[0];
			expect(firstIngredient).toBeDefined();
			expect(typeof firstIngredient.id).toBe('number');
			expect(typeof firstIngredient.name).toBe('string');
			expect(typeof firstIngredient.image).toBe('string');
			expect(typeof firstIngredient.cost).toBe('number');
			expect(typeof firstIngredient.source).toBe('string');
			expect(typeof firstIngredient.type).toBe('string');
			expect(typeof firstIngredient.rank).toBe('number');
		});

		it('should create ingredientNameToId mapping correctly', () => {
			const { ingredients, ingredientNameToId } = loadIngredients();

			// Every ingredient should have an entry in the map
			ingredients.forEach((ingredient) => {
				expect(ingredientNameToId.has(ingredient.name)).toBe(true);
				expect(ingredientNameToId.get(ingredient.name)).toBe(ingredient.id);
			});
		});

		it('should ensure all fields have correct types and constraints', () => {
			const { ingredients } = loadIngredients();

			ingredients.forEach((ingredient) => {
				expect(typeof ingredient.id).toBe('number');
				expect(typeof ingredient.name).toBe('string');
				expect(typeof ingredient.image).toBe('string');
				expect(typeof ingredient.cost).toBe('number');
				expect(typeof ingredient.rank).toBe('number');

				// Validate constraints
				expect(ingredient.id).toBeGreaterThan(0);
				expect(ingredient.cost).toBeGreaterThanOrEqual(0);
				expect(ingredient.rank).toBeGreaterThanOrEqual(0);

				// Should be trimmed
				expect(ingredient.name.trim()).toBe(ingredient.name);
				expect(ingredient.image.trim()).toBe(ingredient.image);

				// Image should be a valid filename
				expect(ingredient.image).toMatch(/\.png$/);
			});
		});

		it('should handle optional boolean fields correctly', () => {
			const { ingredients } = loadIngredients();

			ingredients.forEach((ingredient) => {
				// Optional booleans should be boolean or undefined
				if (ingredient.day !== undefined) {
					expect(typeof ingredient.day).toBe('boolean');
				}
				if (ingredient.night !== undefined) {
					expect(typeof ingredient.night).toBe('boolean');
				}
				if (ingredient.fog !== undefined) {
					expect(typeof ingredient.fog).toBe('boolean');
				}
				if (ingredient.aberration !== undefined) {
					expect(typeof ingredient.aberration).toBe('boolean');
				}
			});
		});

		it('should handle catch method fields correctly', () => {
			const { ingredients } = loadIngredients();

			ingredients.forEach((ingredient) => {
				// Catch method booleans should be boolean or undefined
				if (ingredient.drone !== undefined) {
					expect(typeof ingredient.drone).toBe('boolean');
				}
				if (ingredient.crabtrap !== undefined) {
					expect(typeof ingredient.crabtrap).toBe('boolean');
				}
				if (ingredient.bugnet !== undefined) {
					expect(typeof ingredient.bugnet).toBe('boolean');
				}
				if (ingredient.gloves !== undefined) {
					expect(typeof ingredient.gloves).toBe('boolean');
				}
				if (ingredient.steelnet !== undefined) {
					expect(typeof ingredient.steelnet).toBe('boolean');
				}
				if (ingredient.harpoon !== undefined) {
					expect(typeof ingredient.harpoon).toBe('boolean');
				}
			});
		});
	});

	describe('prepareIngredients', () => {
		let ingredientInputRows: IngredientInputRow[];
		let dishInputRows: DishInputRow[];
		let partyInputRows: PartyInputRow[];

		beforeEach(() => {
			ingredientInputRows = [
				{
					id: 1,
					name: 'Test Ingredient',
					image: 'ing.png',
					type: 'Vegetable',
					cost: 10,
					source: 'Farm',
					rank: 1,
					buyOtto: 8,
					buyJango: 9,
					sell: 15,
					kg: 2,
					maxMeats: 3
				} as IngredientInputRow,
				{
					id: 2,
					name: 'Catch Ingredient',
					image: 'fish.png',
					type: 'Fish',
					cost: 5,
					source: 'Ocean',
					rank: 1,
					drone: true,
					day: true
				} as IngredientInputRow
			];

			dishInputRows = [
				{
					id: 1,
					name: 'Test Dish',
					image: 'dish.png',
					finalPrice: 100,
					finalServings: 2
				} as DishInputRow
			];

			partyInputRows = [
				{
					id: 1,
					name: 'Test Party',
					bonus: 1.5
				} as PartyInputRow
			];
		});

		it('should enrich ingredients with computed fields', () => {
			const ingredients = prepareIngredients(
				ingredientInputRows,
				[],
				[],
				partyInputRows,
				dishInputRows
			);

			const ingredient = ingredients[0];
			expect(ingredient).toHaveProperty('usedIn');
			expect(ingredient).toHaveProperty('usedForParties');
			expect(ingredient).toHaveProperty('vendors');
			expect(ingredient).toHaveProperty('search');
			expect(ingredient).toHaveProperty('sellPerKg');
		});

		it('should build vendors object from buy prices', () => {
			const ingredients = prepareIngredients(
				ingredientInputRows,
				[],
				[],
				partyInputRows,
				dishInputRows
			);

			const ingredient = ingredients[0];
			expect(ingredient.vendors).toHaveProperty('Otto');
			expect(ingredient.vendors).toHaveProperty('Jango');
			expect(ingredient.vendors.Otto).toBe(8);
			expect(ingredient.vendors.Jango).toBe(9);
		});

		it('should calculate sellPerKg correctly', () => {
			const ingredients = prepareIngredients(
				ingredientInputRows,
				[],
				[],
				partyInputRows,
				dishInputRows
			);

			const ingredient = ingredients[0];
			// sellPerKg = (sell * maxMeats) / kg = (15 * 3) / 2 = 22.5
			expect(ingredient.sellPerKg).toBe(22.5);
		});

		it('should handle missing sellPerKg data', () => {
			const ingredientWithoutSell: IngredientInputRow = {
				...ingredientInputRows[0],
				sell: undefined
			};

			const ingredients = prepareIngredients(
				[ingredientWithoutSell],
				[],
				[],
				partyInputRows,
				dishInputRows
			);

			expect(ingredients[0].sellPerKg).toBeUndefined();
		});

		it('should build usedIn array for ingredients used in dishes', () => {
			const dishIngredients: DishIngredientJoinRow[] = [
				{ dishId: 1, ingredientId: 1, count: 2, upgradeCount: 1 }
			];

			const ingredients = prepareIngredients(
				ingredientInputRows,
				dishIngredients,
				[],
				partyInputRows,
				dishInputRows
			);

			const ingredient = ingredients[0];
			expect(ingredient.usedIn).toHaveLength(1);
			expect(ingredient.usedIn[0]).toHaveProperty('dishId');
			expect(ingredient.usedIn[0]).toHaveProperty('dishName');
			expect(ingredient.usedIn[0]).toHaveProperty('dishImage');
			expect(ingredient.usedIn[0]).toHaveProperty('count');
			expect(ingredient.usedIn[0]).toHaveProperty('upgradeCount');
			expect(ingredient.usedIn[0].dishId).toBe(1);
			expect(ingredient.usedIn[0].count).toBe(2);
			expect(ingredient.usedIn[0].upgradeCount).toBe(1);
		});

		it('should sort usedIn by price descending', () => {
			const expensiveDish: DishInputRow = {
				id: 2,
				name: 'Expensive Dish',
				image: 'expensive.png',
				finalPrice: 200,
				finalServings: 1
			} as DishInputRow;

			const dishIngredients: DishIngredientJoinRow[] = [
				{ dishId: 1, ingredientId: 1, count: 1, upgradeCount: 0 },
				{ dishId: 2, ingredientId: 1, count: 1, upgradeCount: 0 }
			];

			const ingredients = prepareIngredients(
				ingredientInputRows,
				dishIngredients,
				[],
				partyInputRows,
				[...dishInputRows, expensiveDish]
			);

			const ingredient = ingredients[0];
			expect(ingredient.usedIn).toHaveLength(2);
			expect(ingredient.usedIn[0].price).toBe(200); // Expensive first
			expect(ingredient.usedIn[1].price).toBe(100);
		});

		it('should track party associations for ingredients', () => {
			const dishIngredients: DishIngredientJoinRow[] = [
				{ dishId: 1, ingredientId: 1, count: 1, upgradeCount: 0 }
			];
			const dishParties: PartyDishJoinRow[] = [{ dishId: 1, partyId: 1 }];

			const ingredients = prepareIngredients(
				ingredientInputRows,
				dishIngredients,
				dishParties,
				partyInputRows,
				dishInputRows
			);

			const ingredient = ingredients[0];
			expect(ingredient.usedForParties).toContain(1);
			expect(ingredient.usedIn[0].partyIds).toContain(1);
			expect(ingredient.usedIn[0].partyNames).toContain('Test Party');
		});

		it('should build search index including name, type, source, and parties', () => {
			const dishIngredients: DishIngredientJoinRow[] = [
				{ dishId: 1, ingredientId: 1, count: 1, upgradeCount: 0 }
			];
			const dishParties: PartyDishJoinRow[] = [{ dishId: 1, partyId: 1 }];

			const ingredients = prepareIngredients(
				ingredientInputRows,
				dishIngredients,
				dishParties,
				partyInputRows,
				dishInputRows
			);

			const ingredient = ingredients[0];
			expect(ingredient.search).toContain('test ingredient');
			expect(ingredient.search).toContain('vegetable');
			expect(ingredient.search).toContain('farm');
			expect(ingredient.search).toContain('test party');
			expect(ingredient.search).toContain('party'); // Generic party keyword
		});

		it('should compute vendor minimum buy price', () => {
			const ingredients = prepareIngredients(
				ingredientInputRows,
				[],
				[],
				partyInputRows,
				dishInputRows
			);

			const ingredient = ingredients[0];
			// Min of Otto (8) and Jango (9) is 8
			const minVendorPrice = Math.min(...Object.values(ingredient.vendors));
			expect(minVendorPrice).toBe(8);
		});

		it('should handle ingredients with no vendor prices', () => {
			const ingredientNoVendors: IngredientInputRow = {
				...ingredientInputRows[1],
				buyOtto: undefined,
				buyJango: undefined
			};

			const ingredients = prepareIngredients(
				[ingredientNoVendors],
				[],
				[],
				partyInputRows,
				dishInputRows
			);

			const ingredient = ingredients[0];
			expect(Object.keys(ingredient.vendors)).toHaveLength(0);
		});
	});

	describe('buildIngredientsBundle', () => {
		let ingredients: Ingredient[];
		let mockChaptersBundle: EntityBundle<Chapter>;

		beforeEach(() => {
			const baseIngredient = {
				id: 1,
				name: 'Test Ingredient',
				image: 'ing.png',
				type: 'Vegetable',
				cost: 10,
				source: 'Farm',
				rank: 1,
				chapter: 1,
				day: true,
				buyOtto: 8,
				usedIn: [],
				usedForParties: [],
				vendors: { Otto: 8 },
				search: 'test ingredient vegetable farm',
				sort: {
					name: 'test ingredient',
					buy: 8,
					sell: 15,
					kg: 2,
					sellPerKg: 22.5
				}
			} as Ingredient;

			ingredients = [
				baseIngredient,
				{
					...baseIngredient,
					id: 2,
					name: 'Another Ingredient',
					type: 'Fish',
					source: 'Ocean',
					chapter: 2,
					night: true,
					drone: true,
					search: 'another ingredient fish ocean',
					sort: {
						name: 'another ingredient',
						buy: 10,
						sell: 20,
						kg: 1,
						sellPerKg: 20
					}
				} as Ingredient
			];

			mockChaptersBundle = {
				sorted: { order: { asc: [1, 2, 3] } },
				byId: {
					1: { id: 1, number: 1, name: 'Chapter 1', subtitle: '', search: '' },
					2: { id: 2, number: 2, name: 'Chapter 2', subtitle: '', search: '' },
					3: { id: 3, number: 3, name: 'Chapter 3', subtitle: '', search: '' }
				},
				facets: {}
			};
		});

		it('should create a complete bundle with sorted, byId, and facets', () => {
			const bundle = buildIngredientsBundle(ingredients, mockChaptersBundle);

			expect(bundle).toHaveProperty('sorted');
			expect(bundle).toHaveProperty('byId');
			expect(bundle).toHaveProperty('facets');
		});

		it('should create correct byId mapping', () => {
			const bundle = buildIngredientsBundle(ingredients, mockChaptersBundle);

			expect(Object.keys(bundle.byId)).toHaveLength(2);
			expect(bundle.byId[1]).toEqual(ingredients[0]);
			expect(bundle.byId[2]).toEqual(ingredients[1]);
		});

		it('should create sorted arrays with correct structure', () => {
			const bundle = buildIngredientsBundle(ingredients, mockChaptersBundle);

			// Verify all sort keys exist
			expect(bundle.sorted).toHaveProperty('name');
			expect(bundle.sorted).toHaveProperty('buy');
			expect(bundle.sorted).toHaveProperty('sell');
			expect(bundle.sorted).toHaveProperty('kg');
			expect(bundle.sorted).toHaveProperty('sellPerKg');

			// Verify structure with directions
			expect(bundle.sorted.name).toHaveProperty('asc');
			expect(bundle.sorted.buy).toHaveProperty('asc');
			expect(bundle.sorted.sell).toHaveProperty('desc');
			expect(bundle.sorted.kg).toHaveProperty('desc');
			expect(bundle.sorted.sellPerKg).toHaveProperty('desc');

			// Verify arrays
			expect(Array.isArray(bundle.sorted.name.asc)).toBe(true);
			expect(Array.isArray(bundle.sorted.buy.asc)).toBe(true);
			expect(bundle.sorted.name.asc).toHaveLength(2);
		});

		it('should sort ingredients by name in ascending order', () => {
			const bundle = buildIngredientsBundle(ingredients, mockChaptersBundle);

			const sortedIngredients = bundle.sorted.name.asc!.map((id) => bundle.byId[id]);
			const names = sortedIngredients.map((i) => i.name.toLowerCase());

			// Verify ascending order
			for (let i = 1; i < names.length; i++) {
				expect(names[i].localeCompare(names[i - 1])).toBeGreaterThanOrEqual(0);
			}
		});

		it('should sort ingredients by buy price in ascending order', () => {
			const bundle = buildIngredientsBundle(ingredients, mockChaptersBundle);

			const sortedIngredients = bundle.sorted.buy.asc!.map((id) => bundle.byId[id]);
			const buyPrices = sortedIngredients.map((i) => {
				const vendors = Object.values(i.vendors).filter((v) => v != undefined);
				return vendors.length > 0 ? Math.min(...vendors) : null;
			});

			// Verify ascending order (nulls first)
			for (let i = 1; i < buyPrices.length; i++) {
				if (buyPrices[i - 1] !== null && buyPrices[i] !== null) {
					expect(buyPrices[i]).toBeGreaterThanOrEqual(buyPrices[i - 1]);
				}
			}
		});

		it('should sort ingredients by sell price in descending order', () => {
			const bundle = buildIngredientsBundle(ingredients, mockChaptersBundle);

			const sortedIngredients = bundle.sorted.sell.desc!.map((id) => bundle.byId[id]);
			const sellPrices = sortedIngredients.map((i) => i.sell ?? null);

			// Verify descending order (highest first, nulls last)
			for (let i = 1; i < sellPrices.length; i++) {
				if (sellPrices[i - 1] !== null && sellPrices[i] !== null) {
					expect(sellPrices[i]).toBeLessThanOrEqual(sellPrices[i - 1]);
				}
			}
		});

		it('should sort ingredients by kg in descending order', () => {
			const bundle = buildIngredientsBundle(ingredients, mockChaptersBundle);

			const sortedIngredients = bundle.sorted.kg.desc!.map((id) => bundle.byId[id]);
			const weights = sortedIngredients.map((i) => i.kg ?? null);

			// Verify descending order (highest first, nulls last)
			for (let i = 1; i < weights.length; i++) {
				if (weights[i - 1] !== null && weights[i] !== null) {
					expect(weights[i]).toBeLessThanOrEqual(weights[i - 1]);
				}
			}
		});

		it('should sort ingredients by sellPerKg in descending order', () => {
			const bundle = buildIngredientsBundle(ingredients, mockChaptersBundle);

			const sortedIngredients = bundle.sorted.sellPerKg.desc!.map((id) => bundle.byId[id]);
			const sellPerKgValues = sortedIngredients.map((i) => i.sellPerKg ?? null);

			// Verify descending order (highest first, nulls last)
			for (let i = 1; i < sellPerKgValues.length; i++) {
				if (sellPerKgValues[i - 1] !== null && sellPerKgValues[i] !== null) {
					expect(sellPerKgValues[i]).toBeLessThanOrEqual(sellPerKgValues[i - 1]);
				}
			}
		});

		it('should create correct facets structure', () => {
			const bundle = buildIngredientsBundle(ingredients, mockChaptersBundle);

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
			const bundle = buildIngredientsBundle(ingredients, mockChaptersBundle);

			expect(bundle.facets.Type['Vegetable']).toContain(1);
			expect(bundle.facets.Type['Fish']).toContain(2);
		});

		it('should correctly categorize ingredients by source', () => {
			const bundle = buildIngredientsBundle(ingredients, mockChaptersBundle);

			expect(bundle.facets.Source['Farm']).toContain(1);
			expect(bundle.facets.Source['Ocean']).toContain(2);
		});

		it('should correctly categorize ingredients by time of day', () => {
			const bundle = buildIngredientsBundle(ingredients, mockChaptersBundle);

			expect(bundle.facets.Time['Day']).toContain(1);
			expect(bundle.facets.Time['Night']).toContain(2);
		});

		it('should correctly categorize ingredients by vendor', () => {
			const bundle = buildIngredientsBundle(ingredients, mockChaptersBundle);

			expect(bundle.facets.Vendor['Otto']).toContain(1);
		});

		it('should correctly categorize ingredients by catch method', () => {
			const bundle = buildIngredientsBundle(ingredients, mockChaptersBundle);

			expect(bundle.facets.Catch['Drone']).toContain(2);
		});

		it('should create cumulative chapter facets', () => {
			const bundle = buildIngredientsBundle(ingredients, mockChaptersBundle);

			// Ingredient 1 is chapter 1, so it should appear in chapters 1, 2, and 3
			expect(bundle.facets.Chapter['1']).toContain(1);
			expect(bundle.facets.Chapter['2']).toContain(1);
			expect(bundle.facets.Chapter['3']).toContain(1);

			// Ingredient 2 is chapter 2, so it should appear in chapters 2 and 3 only
			expect(bundle.facets.Chapter['1']).not.toContain(2);
			expect(bundle.facets.Chapter['2']).toContain(2);
			expect(bundle.facets.Chapter['3']).toContain(2);
		});

		it('should handle aberration ingredients correctly', () => {
			const aberrationIngredient: Ingredient = {
				...ingredients[0],
				id: 3,
				aberration: true,
				type: 'Aberration'
			};

			const bundle = buildIngredientsBundle(
				[...ingredients, aberrationIngredient],
				mockChaptersBundle
			);

			expect(bundle.facets.Type['Aberration']).toContain(3);
		});

		it('should handle farm ingredients correctly', () => {
			const farmIngredient: Ingredient = {
				...ingredients[0],
				id: 3,
				farm: 'Dredge Farm'
			};

			const bundle = buildIngredientsBundle([...ingredients, farmIngredient], mockChaptersBundle);

			expect(bundle.facets.Farm['Dredge Farm']).toContain(3);
		});

		it('should handle ingredients with multiple catch methods', () => {
			const multiCatchIngredient: Ingredient = {
				...ingredients[0],
				id: 3,
				drone: true,
				bugnet: true,
				crabtrap: true
			};

			const bundle = buildIngredientsBundle(
				[...ingredients, multiCatchIngredient],
				mockChaptersBundle
			);

			expect(bundle.facets.Catch['Drone']).toContain(3);
			expect(bundle.facets.Catch['Bug Net']).toContain(3);
			expect(bundle.facets.Catch['Crab Trap']).toContain(3);
		});
	});
});
