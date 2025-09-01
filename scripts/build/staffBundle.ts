import { z } from 'zod';
import type { EntityBundle, Id, Staff, Dish } from '../../src/lib/types.js';
import type { StaffInputRow } from './types.js';
import {
	intFromString,
	optionalString,
	optionalNumber,
	loadCsvFile,
	parseTable,
	floatFromString
} from './load.js';

// staff-data.csv schema -> normalized row
const staffRowSchema = z
	.object({
		id: intFromString('id'),
		name: z.string().transform((s) => s.trim()),
		dlc: optionalString,
		image: z.string().transform((s) => s.trim()),
		hiring_fee: intFromString('hiring_fee'),
		wage_base: intFromString('wage_base'),
		raise: floatFromString('raise'), // This is a float, how do we fix?
		wage_max: intFromString('wage_max'),
		skill_level3: z.string().transform((s) => s.trim()),
		cooking_bonus_level3: intFromString('cooking_bonus_level3'),
		serving_bonus_level3: intFromString('serving_bonus_level3'),
		appeal_bonus_level3: intFromString('appeal_bonus_level3'),
		skill_level7: z.string().transform((s) => s.trim()),
		cooking_bonus_level7: intFromString('cooking_bonus_level7'),
		serving_bonus_level7: intFromString('serving_bonus_level7'),
		cooking_stat_base: intFromString('cooking_stat_base'),
		serving_stat_base: intFromString('serving_stat_base'),
		procure_stat_base: intFromString('procure_stat_base'),
		appeal_stat_base: intFromString('appeal_stat_base'),
		cooking_stat_increment: intFromString('cooking_stat_increment'),
		serving_stat_increment: intFromString('serving_stat_increment'),
		procure_stat_increment: intFromString('procure_stat_increment'),
		appeal_stat_increment: intFromString('appeal_stat_increment'),
		cooking_stat_max: intFromString('cooking_stat_max'),
		serving_stat_max: intFromString('serving_stat_max'),
		procure_stat_max: intFromString('procure_stat_max'),
		appeal_stat_max: intFromString('appeal_stat_max'),
		branch_stat_calc: floatFromString('branch_stat_calc'),
		seasonings_min_level20: intFromString('seasonings_min_level20'),
		seasonings_max_level20: intFromString('seasonings_max_level20'),
		seasonings_bonus: intFromString('seasonings_bonus'),
		branch_rank_max: intFromString('branch_rank_max'),
		branch_popularity_max: intFromString('branch_popularity_max'),
		branch_popularity_max_at_level: optionalNumber // Not all staff can max the branch
	})
	.transform((row) => ({
		id: row['id'],
		name: row['name'],
		dlc: (row['dlc'] ?? null) as string | null,
		image: row['image'],
		hiringFee: row['hiring_fee'],
		wageBase: row['wage_base'],
		raise: row['raise'],
		wageMax: row['wage_max'],
		skillLevel3: row['skill_level3'],
		cookingBonusLevel3: row['cooking_bonus_level3'],
		servingBonusLevel3: row['serving_bonus_level3'],
		appealBonusLevel3: row['appeal_bonus_level3'],
		skillLevel7: row['skill_level7'],
		cookingBonusLevel7: row['cooking_bonus_level7'],
		servingBonusLevel7: row['serving_bonus_level7'],
		cookingStatBase: row['cooking_stat_base'],
		servingStatBase: row['serving_stat_base'],
		procureStatBase: row['procure_stat_base'],
		appealStatBase: row['appeal_stat_base'],
		cookingStatIncrement: row['cooking_stat_increment'],
		servingStatIncrement: row['serving_stat_increment'],
		procureStatIncrement: row['procure_stat_increment'],
		appealStatIncrement: row['appeal_stat_increment'],
		cookingStatMax: row['cooking_stat_max'],
		servingStatMax: row['serving_stat_max'],
		procureStatMax: row['procure_stat_max'],
		appealStatMax: row['appeal_stat_max'],
		branchStatCalc: row['branch_stat_calc'],
		seasoningsMinLevel20: row['seasonings_min_level20'],
		seasoningsMaxLevel20: row['seasonings_max_level20'],
		seasoningsBonus: row['seasonings_bonus'],
		branchRankMax: row['branch_rank_max'],
		branchPopularityMax: row['branch_popularity_max'],
		branchPopularityMaxAtLevel: row['branch_popularity_max_at_level'] as number | null
	})) as z.ZodType<StaffInputRow>;

export function loadStaff() {
	const staffCSV = loadCsvFile('staff-data.csv');
	const normalized = parseTable(staffCSV, staffRowSchema, 'staff-data.csv');
	return { staff: normalized };
}

interface StaffDish {
	dishId: Id;
	staffLevel: number;
	partyIds: Id[];
	servings: number;
	price: number;
}

function normalize(value: unknown): string {
	return (value ?? '').toString().toLowerCase();
}

// Build a mapping of staff name to the dishes they unlock
function buildDishesUnlockedByStaffMap(dishes: Dish[]): Map<string, Array<StaffDish>> {
	const dishesUnlockedByStaff = new Map<string, Array<StaffDish>>();

	for (const dish of dishes) {
		if (dish.staff && dish.staffLevel) {
			const staffDishes = dishesUnlockedByStaff.get(dish.staff) || [];
			staffDishes.push({
				dishId: dish.id,
				staffLevel: dish.staffLevel,
				partyIds: dish.partyIds,
				servings: dish.finalServings,
				price: dish.finalPrice
			});
			dishesUnlockedByStaff.set(dish.staff, staffDishes);
		}
	}

	return dishesUnlockedByStaff;
}

// Extract skills from a staff input row
function extractSkillsFromInput(row: StaffInputRow): string[] {
	return [row.skillLevel3, row.skillLevel7] as string[];
}

// Build a search string from name and skills
function buildSearchIndex(name: string, skills: string[]): string {
	return [name, ...skills].map(normalize).join(' ');
}

// Build the sort object for a staff row
function buildSortFromRow(row: StaffInputRow, skills: string[]): Staff['sort'] {
	let maxSeasonings = row.seasoningsMaxLevel20;
	if (skills.includes('Dispatch Master')) maxSeasonings = maxSeasonings + 2;
	return {
		name: normalize(row.name),
		hiringFee: row.hiringFee,
		wageMax: row.wageMax,
		cookingStatMax: row.cookingStatMax,
		servingStatMax: row.servingStatMax,
		procureStatMax: row.procureStatMax,
		appealStatMax: row.appealStatMax,
		maxSeasonings
	};
}

// Retrieve and sort dishes unlocked by a given staff member
function getSortedDishesForStaff(map: Map<string, Array<StaffDish>>, staffName: string) {
	const staffDishes = map.get(staffName) || [];
	return staffDishes.sort((a, b) => a.staffLevel - b.staffLevel);
}

function computeStaff(inputRows: StaffInputRow[], dishes: Dish[]): Staff[] {
	const dishesUnlockedByStaff = buildDishesUnlockedByStaffMap(dishes);

	const rows: Staff[] = inputRows
		.filter((r) => r.name && r.name.trim() !== '')
		.map((row) => {
			const skills = extractSkillsFromInput(row);
			const search = buildSearchIndex(row.name, skills);
			const sort: Staff['sort'] = buildSortFromRow(row, skills);
			const staffDishes = getSortedDishesForStaff(dishesUnlockedByStaff, row.name);
			const staff: Staff = {
				...row,
				dishes: staffDishes,
				search,
				sort
			};

			return staff;
		})
		.sort((a, b) => (a.sort.name as string).localeCompare(b.sort.name as string));
	return rows;
}

function computeFacets(rows: Staff[]): EntityBundle<Staff>['facets'] {
	const facets = initEmptyFacets();

	for (const r of rows) {
		addStaffToFacets(facets, r);
	}

	return facets;
}

// Initialize an empty facets structure
function initEmptyFacets(): EntityBundle<Staff>['facets'] {
	return {
		DLC: {},
		Skill: {
			'Cleaning': [],
			'Cocktail Serving': [],
			'Cooking': [],
			'Dispatch': [],
			'Drink Serving': [],
			'Ingredient Prep': [],
			'Irresistible Charm': [],
			'Master Drink Maker': [],
			'Serving': [],
			'Tip Master': [],
			'Wasabi Refill': []
		}
	};
}

// Add a single staff member to the facets
function addStaffToFacets(facets: EntityBundle<Staff>['facets'], r: Staff): void {
	const dlc = (r.dlc ?? 'Base').toString();
	(facets.DLC[dlc] ??= []).push(r.id);

	const skills = [r.skillLevel3, r.skillLevel7].filter(Boolean) as string[];
	for (const skill of skills) {
		if (skill.includes('Cocktail Serving')) facets.Skill['Cocktail Serving'].push(r.id);
		if (skill.includes('Cooking+')) facets.Skill['Cooking'].push(r.id);
		if (skill.includes('Dispatch')) facets.Skill['Dispatch'].push(r.id);
		if (skill.includes('Drink Serving')) facets.Skill['Drink Serving'].push(r.id);
		if (skill.includes('Ingredient Prep')) facets.Skill['Ingredient Prep'].push(r.id);
		if (skill.includes('Irresistible Charm')) facets.Skill['Irresistible Charm'].push(r.id);
		if (skill.includes('Master Drink Maker')) facets.Skill['Master Drink Maker'].push(r.id);
		if (skill.includes('Serving+')) facets.Skill['Serving'].push(r.id);
		if (skill.includes('Tip Master')) facets.Skill['Tip Master'].push(r.id);
		if (skill.includes('Wasabi Refill')) facets.Skill['Wasabi Refill'].push(r.id);
		if (skill.includes('Cleaning')) facets.Skill['Cleaning'].push(r.id);
	}

	// Dedupe known duplicate skill groupings
	facets.Skill['Cooking'] = [...new Set(facets.Skill['Cooking'])];
	facets.Skill['Serving'] = [...new Set(facets.Skill['Serving'])];
}

export function buildStaffBundle(inputRows: StaffInputRow[], dishes: Dish[]): EntityBundle<Staff> {
	const rows = computeStaff(inputRows, dishes);
	const byId = Object.fromEntries(rows.map((s) => [s.id, s])) as Record<Id, Staff>;
	const facets = computeFacets(rows);

	return { rows, byId, facets };
}
