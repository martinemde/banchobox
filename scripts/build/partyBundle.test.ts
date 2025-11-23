import { describe, it, expect, beforeEach } from 'vitest';
import { buildPartiesBundle } from './partyBundle.js';
import type { PartyInputRow } from './types.js';
import type { PartyDish } from '../../src/lib/types.js';

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
			},
			{
				id: 3,
				name: 'Test Party C',
				order: 3,
				bonus: 1.2
			}
		];

		// Create mock party dishes
		const createMockDish = (id: number, dishId: number, partyId: number, profit: number): PartyDish => ({
			id,
			dishId,
			partyId,
			name: `Dish ${dishId}`,
			partyName: `Test Party ${String.fromCharCode(64 + partyId)}`,
			partyBonus: partyInputRows[partyId - 1].bonus,
			finalProfit: profit,
			finalPrice: 100,
			finalServings: 2,
			image: 'dish.png',
			ingredients: [],
			recipeCost: 50,
			partyDishIds: [id],
			partyIds: [partyId],
			finalRevenue: 200,
			finalProfitPerServing: profit / 2,
			maxProfitPerServing: profit / 2,
			upgradeCost: 0,
			ingredientCount: 2,
			search: `dish ${dishId}`,
			chapter: 1,
			maxLevel: 1,
			basePrice: 100,
			baseTaste: 50,
			baseServings: 2,
			finalTaste: 50
		} as PartyDish);

		mockPartyDishesByPartyId = new Map([
			[1, [
				createMockDish(101, 1, 1, 500),
				createMockDish(102, 2, 1, 300)
			]],
			[2, [
				createMockDish(103, 3, 2, 700)
			]],
			[3, []] // Party C has no dishes
		]);
	});

	describe('sorted structure', () => {
		it('should create sorted structure with default and display metadata', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);

			// Verify structure
			expect(bundle).toHaveProperty('sorted');
			expect(bundle.sorted).toHaveProperty('default');
			expect(typeof bundle.sorted.default).toBe('string');

			// Verify default points to valid key
			const defaultKey = bundle.sorted.default;
			expect(bundle.sorted[defaultKey]).toBeDefined();
			expect(typeof bundle.sorted[defaultKey]).not.toBe('string'); // Should be SortedIds object
		});

		it('should use "order" as default sort key', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);
			expect(bundle.sorted.default).toBe('order');
		});

		it('should have correct sort direction and display name for order', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);

			expect(bundle.sorted.order).toHaveProperty('asc');
			expect(bundle.sorted.order.display).toBe('Order');
		});

		it('should NOT have a rows property', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);
			expect(bundle).not.toHaveProperty('rows');
		});
	});

	describe('sorted arrays', () => {
		it('should sort parties by ID in ascending order', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);

			const sortedIds = bundle.sorted.order.asc!;
			const sortedParties = sortedIds.map((id) => bundle.byId[id]);
			const ids = sortedParties.map((p) => p.id);

			// Verify ascending order
			for (let i = 1; i < ids.length; i++) {
				expect(ids[i]).toBeGreaterThan(ids[i - 1]);
			}

			// Verify specific order: Party A (1), Party B (2), Party C (3)
			expect(sortedParties[0].name).toBe('Test Party A');
			expect(sortedParties[1].name).toBe('Test Party B');
			expect(sortedParties[2].name).toBe('Test Party C');
		});

		it('should have all party IDs in sorted array', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);

			const expectedIds = partyInputRows.map((p) => p.id).sort((a, b) => a - b);
			const sortedIds = bundle.sorted.order.asc!;

			expect(sortedIds).toHaveLength(expectedIds.length);

			const actualIds = [...sortedIds].sort((a, b) => a - b);
			expect(actualIds).toEqual(expectedIds);
		});

		it('should map all sorted IDs to valid entities in byId', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);

			const sortedIds = bundle.sorted.order.asc!;
			sortedIds.forEach((id) => {
				expect(bundle.byId[id]).toBeDefined();
				expect(bundle.byId[id].id).toBe(id);
			});
		});
	});

	describe('byId and facets', () => {
		it('should create correct byId mapping', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);

			expect(Object.keys(bundle.byId)).toHaveLength(3);
			expect(bundle.byId[1].name).toBe('Test Party A');
			expect(bundle.byId[2].name).toBe('Test Party B');
			expect(bundle.byId[3].name).toBe('Test Party C');
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

			const party1 = bundle.byId[1];
			expect(party1.search).toContain('test party a');
			expect(party1.search).toContain('1.5x');

			const party2 = bundle.byId[2];
			expect(party2.search).toContain('test party b');
			expect(party2.search).toContain('2x');
		});

		it('should handle parties with no dishes', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);

			const party = bundle.byId[3];
			expect(party).toBeDefined();
			expect(party.partyDishIds).toEqual([]);
		});

		it('should have empty facets object', () => {
			const bundle = buildPartiesBundle(partyInputRows, mockPartyDishesByPartyId);

			expect(bundle.facets).toBeDefined();
			expect(typeof bundle.facets).toBe('object');
			expect(Object.keys(bundle.facets)).toHaveLength(0);
		});
	});
});
