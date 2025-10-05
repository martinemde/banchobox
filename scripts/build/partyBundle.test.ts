import { describe, it, expect, beforeEach } from 'vitest';
import { loadParties, buildPartiesBundle } from './partyBundle.js';
import type { PartyInputRow } from './types.js';
import type { PartyDish } from '../../src/lib/types.js';

describe('partyBundle', () => {
	describe('loadParties', () => {
		it('should load and parse all parties from CSV', () => {
			const result = loadParties();

			expect(result).toHaveProperty('parties');
			expect(result).toHaveProperty('partyNameToId');
			expect(Array.isArray(result.parties)).toBe(true);
			expect(result.parties.length).toBeGreaterThan(0);
			expect(result.partyNameToId instanceof Map).toBe(true);
		});

		it('should parse party data with correct types and values', () => {
			const { parties } = loadParties();

			// Test first party
			const firstParty = parties[0];
			expect(firstParty).toBeDefined();
			expect(typeof firstParty.id).toBe('number');
			expect(typeof firstParty.name).toBe('string');
			expect(typeof firstParty.order).toBe('number');
			expect(typeof firstParty.bonus).toBe('number');
		});

		it('should create partyNameToId mapping correctly', () => {
			const { parties, partyNameToId } = loadParties();

			// Every party should have an entry in the map
			parties.forEach((party) => {
				expect(partyNameToId.has(party.name)).toBe(true);
				expect(partyNameToId.get(party.name)).toBe(party.id);
			});
		});

		it('should ensure all fields have correct types and constraints', () => {
			const { parties } = loadParties();

			parties.forEach((party) => {
				expect(typeof party.id).toBe('number');
				expect(typeof party.name).toBe('string');
				expect(typeof party.order).toBe('number');
				expect(typeof party.bonus).toBe('number');

				// Validate constraints
				expect(party.id).toBeGreaterThan(0);
				expect(party.order).toBeGreaterThanOrEqual(0);
				expect(party.bonus).toBeGreaterThan(0); // Bonus should be positive

				// Should be trimmed
				expect(party.name.trim()).toBe(party.name);
			});
		});

		it('should sort parties by order field', () => {
			const { parties } = loadParties();

			// Verify parties are sorted by order
			for (let i = 1; i < parties.length; i++) {
				expect(parties[i].order).toBeGreaterThanOrEqual(parties[i - 1].order);
			}
		});

		it('should have reasonable bonus multipliers', () => {
			const { parties } = loadParties();

			// Party bonuses should typically be between 1.0 and 3.0 (or similar reasonable range)
			parties.forEach((party) => {
				expect(party.bonus).toBeGreaterThan(0);
				expect(party.bonus).toBeLessThan(10); // Sanity check - shouldn't be absurdly high
			});
		});
	});

	describe('buildPartiesBundle', () => {
		let partyInputRows: PartyInputRow[];
		let mockPartyDishesByPartyId: Map<number, PartyDish[]>;

		beforeEach(() => {
			partyInputRows = [
				{
					id: 1,
					name: 'Test Party A',
					order: 1,
					bonus: 1.5
				},
				{
					id: 2,
					name: 'Test Party B',
					order: 2,
					bonus: 2.0
				}
			];

			// Create mock party dishes
			const partyDish1: PartyDish = {
				id: 101,
				dishId: 1,
				partyId: 1,
				name: 'Dish 1',
				partyName: 'Test Party A',
				partyBonus: 1.5,
				finalProfit: 500,
				finalPrice: 100,
				finalServings: 2,
				image: 'dish1.png',
				ingredients: [],
				recipeCost: 50,
				partyDishIds: [101],
				partyIds: [1],
				finalRevenue: 200,
				finalProfitPerServing: 250,
				maxProfitPerServing: 250,
				upgradeCost: 0,
				ingredientCount: 2,
				search: 'dish 1',
				chapter: 1,
				maxLevel: 1,
				basePrice: 100,
				baseTaste: 50,
				baseServings: 2,
				finalTaste: 50
			} as PartyDish;

			const partyDish2: PartyDish = {
				...partyDish1,
				id: 102,
				dishId: 2,
				name: 'Dish 2',
				finalProfit: 300
			} as PartyDish;

			const partyDish3: PartyDish = {
				...partyDish1,
				id: 103,
				dishId: 3,
				partyId: 2,
				partyName: 'Test Party B',
				partyBonus: 2.0,
				name: 'Dish 3',
				finalProfit: 700
			} as PartyDish;

			mockPartyDishesByPartyId = new Map([
				[1, [partyDish1, partyDish2]],
				[2, [partyDish3]]
			]);
		});

		it('should create a complete bundle with sorted, byId, and facets', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);

			expect(bundle).toHaveProperty('sorted');
			expect(bundle).toHaveProperty('byId');
			expect(bundle).toHaveProperty('facets');
		});

		it('should create correct byId mapping', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);

			expect(Object.keys(bundle.byId)).toHaveLength(2);
			expect(bundle.byId[1]).toBeDefined();
			expect(bundle.byId[2]).toBeDefined();
			expect(bundle.byId[1].name).toBe('Test Party A');
			expect(bundle.byId[2].name).toBe('Test Party B');
		});

		it('should enrich parties with computed fields', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);

			const party = bundle.byId[1];
			expect(party).toHaveProperty('id');
			expect(party).toHaveProperty('name');
			expect(party).toHaveProperty('bonus');
			expect(party).toHaveProperty('partyDishIds');
			expect(party).toHaveProperty('search');
		});

		it('should sort party dishes by profit descending', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);

			const party = bundle.byId[1];
			expect(party.partyDishIds).toHaveLength(2);
			// Dish 1 has profit 500, Dish 2 has profit 300
			// So order should be [101, 102] (highest profit first)
			expect(party.partyDishIds[0]).toBe(101);
			expect(party.partyDishIds[1]).toBe(102);
		});

		it('should build search string with name and bonus', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);

			const party = bundle.byId[1];
			expect(party.search).toContain('test party a');
			expect(party.search).toContain('1.5x');

			const party2 = bundle.byId[2];
			expect(party2.search).toContain('test party b');
			expect(party2.search).toContain('2x');
		});

		it('should handle parties with no dishes', () => {
			const partyWithNoDishes: PartyInputRow = {
				id: 3,
				name: 'Empty Party',
				order: 3,
				bonus: 1.2
			};

			const bundle = buildPartiesBundle(
				[...partyInputRows, partyWithNoDishes],
				mockPartyDishesByPartyId
			);

			const party = bundle.byId[3];
			expect(party).toBeDefined();
			expect(party.partyDishIds).toEqual([]);
		});

		it('should create sorted arrays with correct structure', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);

			expect(bundle.sorted).toHaveProperty('order');
			expect(bundle.sorted.order).toHaveProperty('asc');
			expect(Array.isArray(bundle.sorted.order.asc)).toBe(true);
			expect(bundle.sorted.order.asc).toHaveLength(2);
		});

		it('should sort parties by ID in ascending order', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);

			const sortedParties = bundle.sorted.order.asc!.map((id) => bundle.byId[id]);
			const ids = sortedParties.map((p) => p.id);

			// Verify ascending order by ID
			for (let i = 1; i < ids.length; i++) {
				expect(ids[i]).toBeGreaterThan(ids[i - 1]);
			}
		});

		it('should have empty facets object', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);

			expect(bundle.facets).toBeDefined();
			expect(typeof bundle.facets).toBe('object');
			// Facets is currently a placeholder, so it should be empty
			expect(Object.keys(bundle.facets)).toHaveLength(0);
		});

		it('should preserve all party properties', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);

			const party = bundle.byId[1];
			expect(party.id).toBe(1);
			expect(party.name).toBe('Test Party A');
			expect(party.bonus).toBe(1.5);
		});

		it('should handle multiple parties correctly', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);

			expect(Object.keys(bundle.byId).length).toBe(2);
			expect(bundle.sorted.order.asc).toHaveLength(2);

			// Verify both parties are present
			expect(bundle.byId[1]).toBeDefined();
			expect(bundle.byId[2]).toBeDefined();
		});
	});

	describe('integration with real data', () => {
		it('should load and build bundle from real CSV data', () => {
			const { parties } = loadParties();

			// Use empty party dishes map for this test
			const emptyPartyDishes = new Map();

			const bundle = buildPartiesBundle(parties, emptyPartyDishes);

			expect(bundle.byId).toBeDefined();
			expect(Object.keys(bundle.byId).length).toBe(parties.length);
			expect(bundle.sorted.order.asc).toHaveLength(parties.length);

			// Verify each party is in the bundle
			parties.forEach((party) => {
				expect(bundle.byId[party.id]).toBeDefined();
				expect(bundle.byId[party.id].name).toBe(party.name);
				expect(bundle.byId[party.id].bonus).toBe(party.bonus);
			});
		});

		it('should maintain order when building bundle', () => {
			const { parties } = loadParties();
			const emptyPartyDishes = new Map();

			const bundle = buildPartiesBundle(parties, emptyPartyDishes);

			// Get parties in sorted order
			const sortedParties = bundle.sorted.order.asc!.map((id) => bundle.byId[id]);

			// Verify they're sorted by ID
			for (let i = 1; i < sortedParties.length; i++) {
				expect(sortedParties[i].id).toBeGreaterThan(sortedParties[i - 1].id);
			}
		});

		it('should have valid search strings for all parties', () => {
			const { parties } = loadParties();
			const emptyPartyDishes = new Map();

			const bundle = buildPartiesBundle(parties, emptyPartyDishes);

			Object.values(bundle.byId).forEach((party) => {
				expect(party.search).toBeDefined();
				expect(typeof party.search).toBe('string');
				expect(party.search.length).toBeGreaterThan(0);
				expect(party.search).toContain(party.name.toLowerCase());
				expect(party.search).toContain(`${party.bonus}x`);
			});
		});
	});
});
