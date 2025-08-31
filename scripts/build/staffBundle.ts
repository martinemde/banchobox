import type { EntityBundle, Id, Staff, Dish } from '../../src/lib/types.js';
import type { StaffInputRow } from './types.js';

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
