import { describe, it, expect, beforeEach } from 'vitest';
import { loadCooksta, buildCookstaTiers } from './cookstaBundle.js';
import type { CookstaInputRow } from '../../src/lib/types.js';

describe('cookstaBundle', () => {
	describe('loadCooksta', () => {
		it('should load and parse all cooksta tiers from CSV', () => {
			const result = loadCooksta();

			expect(result).toHaveProperty('cooksta');
			expect(Array.isArray(result.cooksta)).toBe(true);
			expect(result.cooksta).toHaveLength(6);
		});

		it('should parse cooksta data with correct types and values', () => {
			const { cooksta } = loadCooksta();

			// Test first tier (Coal)
			const coal = cooksta.find((c) => c.id === 1);
			expect(coal).toBeDefined();
			expect(coal).toEqual({
				id: 1,
				name: 'Coal',
				rank: 0,
				customers: 12,
				customerNight: 8,
				partyCustomers: 6,
				followers: 0,
				recipes: 0,
				bestTaste: 0,
				operatingCost: 0,
				kitchenStaff: 0,
				servingStaff: 1
			});

			// Test middle tier (Silver)
			const silver = cooksta.find((c) => c.id === 3);
			expect(silver).toBeDefined();
			expect(silver).toEqual({
				id: 3,
				name: 'Silver',
				rank: 2,
				customers: 23,
				customerNight: 15,
				partyCustomers: 12,
				followers: 20,
				recipes: 2,
				bestTaste: 0,
				operatingCost: 40,
				kitchenStaff: 1,
				servingStaff: 2
			});

			// Test highest tier (Diamond)
			const diamond = cooksta.find((c) => c.id === 6);
			expect(diamond).toBeDefined();
			expect(diamond).toEqual({
				id: 6,
				name: 'Diamond',
				rank: 5,
				customers: 45,
				customerNight: 30,
				partyCustomers: 25,
				followers: 720,
				recipes: 32,
				bestTaste: 375,
				operatingCost: 1250,
				kitchenStaff: 2,
				servingStaff: 2
			});
		});

		it('should ensure all fields have correct types and constraints', () => {
			const { cooksta } = loadCooksta();

			cooksta.forEach((tier) => {
				expect(typeof tier.id).toBe('number');
				expect(typeof tier.name).toBe('string');
				expect(typeof tier.rank).toBe('number');
				expect(typeof tier.customers).toBe('number');
				expect(typeof tier.customerNight).toBe('number');
				expect(typeof tier.partyCustomers).toBe('number');
				expect(typeof tier.followers).toBe('number');
				expect(typeof tier.recipes).toBe('number');
				expect(typeof tier.bestTaste).toBe('number');
				expect(typeof tier.operatingCost).toBe('number');
				expect(typeof tier.kitchenStaff).toBe('number');
				expect(typeof tier.servingStaff).toBe('number');

				// Validate constraints
				expect(tier.id).toBeGreaterThan(0);
				expect(tier.rank).toBeGreaterThanOrEqual(0);
				expect(tier.rank).toBeLessThanOrEqual(5);
				expect(tier.customers).toBeGreaterThanOrEqual(0);
				expect(tier.customers).toBeLessThanOrEqual(45);
				expect(tier.customerNight).toBeGreaterThanOrEqual(0);
				expect(tier.partyCustomers).toBeGreaterThanOrEqual(0);
				expect(tier.followers).toBeGreaterThanOrEqual(0);
				expect(tier.recipes).toBeGreaterThanOrEqual(0);
				expect(tier.bestTaste).toBeGreaterThanOrEqual(0);
				expect(tier.operatingCost).toBeGreaterThanOrEqual(0);
				expect(tier.kitchenStaff).toBeGreaterThanOrEqual(0);
				expect(tier.kitchenStaff).toBeLessThanOrEqual(2);
				expect(tier.servingStaff).toBeGreaterThanOrEqual(0);
				expect(tier.servingStaff).toBeLessThanOrEqual(2);

				// Should be trimmed
				expect(tier.name.trim()).toBe(tier.name);
			});
		});

		it('should have tiers in expected rank order', () => {
			const { cooksta } = loadCooksta();

			const expectedRanks = [0, 1, 2, 3, 4, 5];
			const actualRanks = cooksta.map((tier) => tier.rank);
			expect(actualRanks).toEqual(expectedRanks);

			const expectedNames = ['Coal', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
			const actualNames = cooksta.map((tier) => tier.name);
			expect(actualNames).toEqual(expectedNames);
		});
	});

	describe('buildCookstaTiers', () => {
		let inputRows: CookstaInputRow[];

		beforeEach(() => {
			const { cooksta } = loadCooksta();
			inputRows = cooksta;
		});

		it('should create a sorted array of tiers', () => {
			const tiers = buildCookstaTiers(inputRows);

			expect(Array.isArray(tiers)).toBe(true);
			expect(tiers).toHaveLength(6);
		});

		it('should transform input rows into CookstaTier objects', () => {
			const tiers = buildCookstaTiers(inputRows);

			expect(tiers).toHaveLength(6);

			tiers.forEach((tier) => {
				// Should have all required fields
				expect(tier).toHaveProperty('id');
				expect(tier).toHaveProperty('name');
				expect(tier).toHaveProperty('rank');
				expect(tier).toHaveProperty('customers');
				expect(tier).toHaveProperty('customerNight');
				expect(tier).toHaveProperty('partyCustomers');
				expect(tier).toHaveProperty('followers');
				expect(tier).toHaveProperty('recipes');
				expect(tier).toHaveProperty('bestTaste');
				expect(tier).toHaveProperty('operatingCost');
				expect(tier).toHaveProperty('kitchenStaff');
				expect(tier).toHaveProperty('servingStaff');

				// Should NOT have computed sort or search fields
				expect(tier).not.toHaveProperty('sort');
				expect(tier).not.toHaveProperty('search');
			});
		});

		it('should allow looking up tiers by id', () => {
			const tiers = buildCookstaTiers(inputRows);

			// Test specific tier lookups
			const coal = tiers.find((t) => t.id === 1);
			expect(coal).toBeDefined();
			expect(coal?.name).toBe('Coal');
			expect(coal?.rank).toBe(0);

			const silver = tiers.find((t) => t.id === 3);
			expect(silver).toBeDefined();
			expect(silver?.name).toBe('Silver');
			expect(silver?.rank).toBe(2);

			const diamond = tiers.find((t) => t.id === 6);
			expect(diamond).toBeDefined();
			expect(diamond?.name).toBe('Diamond');
			expect(diamond?.rank).toBe(5);
		});

		it('should sort tiers by rank in ascending order', () => {
			const tiers = buildCookstaTiers(inputRows);

			const ranks = tiers.map((t) => t.rank);
			const sortedRanks = [...ranks].sort((a, b) => a - b);
			expect(ranks).toEqual(sortedRanks);

			// Verify specific order
			expect(tiers[0].name).toBe('Coal'); // rank: 0
			expect(tiers[1].name).toBe('Bronze'); // rank: 1
			expect(tiers[2].name).toBe('Silver'); // rank: 2
			expect(tiers[3].name).toBe('Gold'); // rank: 3
			expect(tiers[4].name).toBe('Platinum'); // rank: 4
			expect(tiers[5].name).toBe('Diamond'); // rank: 5
		});

		it('should validate specific tier progression values', () => {
			const tiers = buildCookstaTiers(inputRows);

			// Test that values generally increase with rank (with some exceptions)
			const coal = tiers.find((t) => t.id === 1)!;
			const diamond = tiers.find((t) => t.id === 6)!;

			expect(diamond.customers).toBeGreaterThan(coal.customers);
			expect(diamond.followers).toBeGreaterThan(coal.followers);
			expect(diamond.recipes).toBeGreaterThan(coal.recipes);
			expect(diamond.operatingCost).toBeGreaterThan(coal.operatingCost);

			// Test specific known values
			expect(coal.operatingCost).toBe(0);
			expect(diamond.customers).toBe(45);
			expect(diamond.followers).toBe(720);
		});
	});
});
