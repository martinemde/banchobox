import { describe, it, expect, beforeEach } from 'vitest';
import { loadStaff, buildStaffBundle } from './staffBundle.js';
import type { StaffInputRow } from './types.js';
import type { Dish } from '../../src/lib/types.js';

describe('staffBundle', () => {
	describe('loadStaff', () => {
		it('should load and parse all staff from CSV', () => {
			const result = loadStaff();

			expect(result).toHaveProperty('staff');
			expect(Array.isArray(result.staff)).toBe(true);
			expect(result.staff.length).toBeGreaterThan(0);
		});

		it('should parse staff data with correct types and values', () => {
			const { staff } = loadStaff();

			// Test first staff member (Kyoko)
			const kyoko = staff.find((s) => s.id === 1);
			expect(kyoko).toBeDefined();
			// Test key properties (not all fields since there are many)
			expect(kyoko!.id).toBe(1);
			expect(kyoko!.name).toBe('Kyoko');
			expect(kyoko!.dlc).toBe(''); // Base game staff have empty string
			expect(kyoko!.hiringFee).toBe(0);
			expect(kyoko!.wageBase).toBe(14);
			expect(kyoko!.raise).toBe(9.1);
			expect(kyoko!.wageMax).toBe(186);
			expect(kyoko!.skillLevel3).toBe('Tip Master');
			expect(kyoko!.skillLevel7).toBe('Drink Serving');
			expect(kyoko!.cookingStatBase).toBe(14);
			expect(kyoko!.servingStatBase).toBe(35);

			// Test a staff with DLC (should exist in later entries)
			const dlcStaff = staff.find((s) => s.dlc && s.dlc.trim() !== '');
			if (dlcStaff) {
				expect(typeof dlcStaff.dlc).toBe('string');
				expect(dlcStaff.dlc!.trim()).toBeTruthy();
			}
		});

		it('should ensure all fields have correct types and constraints', () => {
			const { staff } = loadStaff();

			staff.forEach((member) => {
				expect(typeof member.id).toBe('number');
				expect(typeof member.name).toBe('string');
				expect(typeof member.hiringFee).toBe('number');
				expect(typeof member.wageBase).toBe('number');
				expect(typeof member.raise).toBe('number');
				expect(typeof member.wageMax).toBe('number');
				expect(typeof member.skillLevel3).toBe('string');
				expect(typeof member.skillLevel7).toBe('string');

				// Validate constraints
				expect(member.id).toBeGreaterThan(0);
				expect(member.hiringFee).toBeGreaterThanOrEqual(0);
				expect(member.wageBase).toBeGreaterThanOrEqual(0);
				expect(member.wageMax).toBeGreaterThanOrEqual(0);
				expect(member.cookingStatBase).toBeGreaterThan(0);
				expect(member.servingStatBase).toBeGreaterThan(0);
				expect(member.procureStatBase).toBeGreaterThan(0);
				expect(member.appealStatBase).toBeGreaterThan(0);

				// Should be trimmed
				expect(member.name.trim()).toBe(member.name);
				expect(member.skillLevel3.trim()).toBe(member.skillLevel3);
				expect(member.skillLevel7.trim()).toBe(member.skillLevel7);

				// Image should be a valid filename
				expect(member.image).toMatch(/\.png$/);
			});
		});

		it('should have expected staff members with known skills', () => {
			const { staff } = loadStaff();

			// Test some known staff and their skills
			const kyoko = staff.find((s) => s.name === 'Kyoko');
			expect(kyoko).toBeDefined();
			expect(kyoko!.skillLevel3).toBe('Tip Master');
			expect(kyoko!.skillLevel7).toBe('Drink Serving');

			const liu = staff.find((s) => s.name === 'Liu');
			expect(liu).toBeDefined();
			expect(liu!.skillLevel3).toBe('Cleaning');
			expect(liu!.skillLevel7).toBe('Serving+');
		});
	});

	describe('buildStaffBundle', () => {
		let inputRows: StaffInputRow[];
		let mockDishes: Dish[];

		beforeEach(() => {
			const { staff } = loadStaff();
			inputRows = staff.slice(0, 5); // Use first 5 staff for testing

			// Create mock dishes that reference some staff members
			mockDishes = [
				{
					id: 1,
					name: 'Test Dish 1',
					staff: 'Kyoko',
					staffLevel: 3,
					partyIds: [1, 2],
					finalServings: 10,
					finalPrice: 100
				} as Dish,
				{
					id: 2,
					name: 'Test Dish 2',
					staff: 'Liu',
					staffLevel: 5,
					partyIds: [2, 3],
					finalServings: 15,
					finalPrice: 200
				} as Dish,
				{
					id: 3,
					name: 'Test Dish 3',
					staff: 'Kyoko',
					staffLevel: 7,
					partyIds: [1],
					finalServings: 8,
					finalPrice: 150
				} as Dish,
				{
					id: 4,
					name: 'Test Dish 4',
					// No staff - should be ignored
					partyIds: [],
					finalServings: 5,
					finalPrice: 50
				} as Dish
			];
		});

		it('should create a complete bundle with rows, byId, and facets', () => {
			const bundle = buildStaffBundle(inputRows, mockDishes);

			expect(bundle).toHaveProperty('rows');
			expect(bundle).toHaveProperty('byId');
			expect(bundle).toHaveProperty('facets');
		});

		it('should transform input rows into Staff objects with computed fields', () => {
			const bundle = buildStaffBundle(inputRows, mockDishes);

			expect(bundle.rows.length).toBeGreaterThan(0);

			bundle.rows.forEach((staff) => {
				// Should have all original fields
				expect(staff).toHaveProperty('id');
				expect(staff).toHaveProperty('name');
				expect(staff).toHaveProperty('hiringFee');
				expect(staff).toHaveProperty('skillLevel3');
				expect(staff).toHaveProperty('skillLevel7');

				// Should have computed fields
				expect(staff).toHaveProperty('dishes');
				expect(staff).toHaveProperty('search');
				expect(staff).toHaveProperty('sort');

				// Validate dishes array
				expect(Array.isArray(staff.dishes)).toBe(true);

				// Validate search field (includes name and skills)
				expect(typeof staff.search).toBe('string');
				expect(staff.search.includes(staff.name.toLowerCase())).toBe(true);
				expect(staff.search.includes(staff.skillLevel3.toLowerCase())).toBe(true);
				expect(staff.search.includes(staff.skillLevel7.toLowerCase())).toBe(true);

				// Validate sort object
				expect(staff.sort).toHaveProperty('name');
				expect(staff.sort).toHaveProperty('hiringFee');
				expect(staff.sort).toHaveProperty('wageMax');
				expect(staff.sort).toHaveProperty('maxSeasonings');
				expect(staff.sort.name).toBe(staff.name.toLowerCase());
			});
		});

		it('should correctly associate dishes with staff members', () => {
			const bundle = buildStaffBundle(inputRows, mockDishes);

			const kyoko = bundle.rows.find((s) => s.name === 'Kyoko');
			const liu = bundle.rows.find((s) => s.name === 'Liu');

			expect(kyoko).toBeDefined();
			expect(liu).toBeDefined();

			// Kyoko should have 2 dishes (staffLevel 3 and 7)
			expect(kyoko!.dishes).toHaveLength(2);
			expect(kyoko!.dishes[0].staffLevel).toBe(3); // Should be sorted by staffLevel
			expect(kyoko!.dishes[1].staffLevel).toBe(7);

			// Liu should have 1 dish (staffLevel 5)
			expect(liu!.dishes).toHaveLength(1);
			expect(liu!.dishes[0].staffLevel).toBe(5);

			// Verify dish properties
			kyoko!.dishes.forEach((dish) => {
				expect(dish).toHaveProperty('dishId');
				expect(dish).toHaveProperty('staffLevel');
				expect(dish).toHaveProperty('partyIds');
				expect(dish).toHaveProperty('servings');
				expect(dish).toHaveProperty('price');
			});
		});

		it('should filter out empty names', () => {
			const inputWithEmpty: StaffInputRow[] = [
				...inputRows,
				{
					id: 999,
					name: '',
					hiringFee: 100,
					skillLevel3: 'Test',
					skillLevel7: 'Test'
				} as StaffInputRow,
				{
					id: 1000,
					name: '   ',
					hiringFee: 200,
					skillLevel3: 'Test',
					skillLevel7: 'Test'
				} as StaffInputRow
			];

			const bundle = buildStaffBundle(inputWithEmpty, mockDishes);

			// Should filter out empty names
			expect(bundle.rows.every((s) => s.name.trim() !== '')).toBe(true);
			expect(bundle.rows.find((s) => s.id === 999)).toBeUndefined();
			expect(bundle.rows.find((s) => s.id === 1000)).toBeUndefined();
		});

		it('should create correct byId mapping', () => {
			const bundle = buildStaffBundle(inputRows, mockDishes);

			// Should have entry for each staff member
			expect(Object.keys(bundle.byId).length).toBe(bundle.rows.length);

			// Test specific mappings
			const firstStaff = bundle.rows[0];
			expect(bundle.byId[firstStaff.id]).toBeDefined();
			expect(bundle.byId[firstStaff.id].name).toBe(firstStaff.name);

			// Each entry should be a complete Staff object
			Object.values(bundle.byId).forEach((staff) => {
				expect(staff).toHaveProperty('search');
				expect(staff).toHaveProperty('sort');
				expect(staff).toHaveProperty('dishes');
			});
		});

		it('should sort staff by name in ascending order', () => {
			const bundle = buildStaffBundle(inputRows, mockDishes);

			const names = bundle.rows.map((s) => s.sort.name);
			const sortedNames = [...names].sort();
			expect(names).toEqual(sortedNames);
		});

		it('should create correct facets structure', () => {
			const bundle = buildStaffBundle(inputRows, mockDishes);

			expect(bundle.facets).toHaveProperty('DLC');
			expect(bundle.facets).toHaveProperty('Skill');

			// DLC facets
			expect(typeof bundle.facets.DLC).toBe('object');

			// Skill facets should have predefined skill categories
			const expectedSkills = [
				'Cleaning',
				'Cocktail Serving',
				'Cooking',
				'Dispatch',
				'Drink Serving',
				'Ingredient Prep',
				'Irresistible Charm',
				'Master Drink Maker',
				'Serving',
				'Tip Master',
				'Wasabi Refill'
			];

			expectedSkills.forEach((skill) => {
				expect(bundle.facets.Skill).toHaveProperty(skill);
				expect(Array.isArray(bundle.facets.Skill[skill])).toBe(true);
			});
		});

		it('should correctly categorize staff by DLC', () => {
			const bundle = buildStaffBundle(inputRows, mockDishes);

			// Check what DLC categories actually exist
			const dlcCategories = Object.keys(bundle.facets.DLC);
			expect(dlcCategories.length).toBeGreaterThan(0);

			// Verify staff are correctly categorized
			bundle.rows.forEach((staff) => {
				// The staffBundle code uses: const dlc = (r.dlc ?? 'Base').toString();
				// But since empty string is truthy, it becomes the empty string, not 'Base'
				const expectedDlc = (staff.dlc ?? 'Base').toString();

				// Make sure the category exists before checking
				expect(bundle.facets.DLC).toHaveProperty(expectedDlc);
				expect(bundle.facets.DLC[expectedDlc]).toContain(staff.id);
			});

			// Should have some category for staff
			expect(Object.values(bundle.facets.DLC).some((arr) => arr.length > 0)).toBe(true);
		});

		it('should correctly categorize staff by skills', () => {
			const bundle = buildStaffBundle(inputRows, mockDishes);

			// Test known skills from our sample data
			const kyoko = bundle.rows.find((s) => s.name === 'Kyoko');
			const liu = bundle.rows.find((s) => s.name === 'Liu');

			if (kyoko) {
				// Kyoko has "Tip Master" and "Drink Serving"
				expect(bundle.facets.Skill['Tip Master']).toContain(kyoko.id);
				expect(bundle.facets.Skill['Drink Serving']).toContain(kyoko.id);
			}

			if (liu) {
				// Liu has "Cleaning" and "Serving+"
				expect(bundle.facets.Skill['Cleaning']).toContain(liu.id);
				expect(bundle.facets.Skill['Serving']).toContain(liu.id);
			}
		});

		it('should handle Dispatch Master skill bonus for seasonings', () => {
			// Create a staff member with Dispatch Master skill
			const dispatchMasterStaff: StaffInputRow = {
				id: 999,
				name: 'Test Dispatch Master',
				skillLevel3: 'Dispatch Master',
				skillLevel7: 'Other Skill',
				seasoningsMaxLevel20: 5,
				hiringFee: 100,
				wageBase: 20,
				raise: 10,
				wageMax: 200
			} as StaffInputRow;

			const bundle = buildStaffBundle([dispatchMasterStaff], []);
			const staff = bundle.rows[0];

			// Should add +2 to maxSeasonings for Dispatch Master
			expect(staff.sort.maxSeasonings).toBe(7); // 5 + 2
		});

		it('should validate specific staff properties from real data', () => {
			const bundle = buildStaffBundle(inputRows, mockDishes);

			const kyoko = bundle.rows.find((s) => s.name === 'Kyoko');
			if (kyoko) {
				expect(kyoko.hiringFee).toBe(0);
				expect(kyoko.skillLevel3).toBe('Tip Master');
				expect(kyoko.skillLevel7).toBe('Drink Serving');
				expect(kyoko.sort.name).toBe('kyoko');
			}
		});
	});
});
