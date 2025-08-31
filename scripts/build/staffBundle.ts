import type { EntityBundle, Id, Staff, Dish } from '../../src/lib/types.js';
import type { StaffInputRow } from './types.js';

function normalize(value: unknown): string {
	return (value ?? '').toString().toLowerCase();
}

function computeStaff(inputRows: StaffInputRow[], dishes: Dish[]): Staff[] {
	// Create a map of staff name to dishes they unlock
	const dishesUnlockedByStaff = new Map<
		string,
		Array<{
			dishId: Id;
			staffLevel: number;
			partyIds: Id[];
			servings: number;
			price: number;
		}>
	>();

	// Find all dishes unlocked by each staff member
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

	const rows: Staff[] = inputRows
		.filter((r) => r.name && r.name.trim() !== '')
		.map((row) => {
			const skills = [row.skillLevel3, row.skillLevel7].filter(Boolean) as string[];

			const search = [row.name, ...skills].map(normalize).join(' ');

			let maxSeasonings = row.seasoningsMaxLevel20;
			if (skills.includes('Dispatch Master')) maxSeasonings = maxSeasonings + 2;

			const sort: Staff['sort'] = {
				name: normalize(row.name),
				hiringFee: row.hiringFee,
				wageMax: row.wageMax,
				cookingStatMax: row.cookingStatMax,
				servingStatMax: row.servingStatMax,
				procureStatMax: row.procureStatMax,
				appealStatMax: row.appealStatMax,
				seasoningsMaxLevel20: maxSeasonings
			};

			// Get dishes unlocked by this staff member
			const staffDishes = dishesUnlockedByStaff.get(row.name) || [];

			const staff: Staff = {
				...row,
				dishes: staffDishes.sort((a, b) => a.staffLevel - b.staffLevel), // Sort by unlock level
				search,
				sort
			};

			return staff;
		})
		.sort((a, b) => (a.sort.name as string).localeCompare(b.sort.name as string));
	return rows;
}

export function buildStaffBundle(inputRows: StaffInputRow[], dishes: Dish[]): EntityBundle<Staff> {
	const rows = computeStaff(inputRows, dishes);
	const byId = Object.fromEntries(rows.map((s) => [s.id, s])) as Record<Id, Staff>;

	const facets: EntityBundle<Staff>['facets'] = {
		DLC: {},
		Skill: {
			Cleaning: [],
			'Cocktail Serving': [],
			Cooking: [],
			'Dispatch Master': [],
			'Drink Serving': [],
			'Ingredient Prep': [],
			'Irresistible Charm': [],
			'Master Drink Maker': [],
			Serving: [],
			Tips: [],
			'Wasabi Refill': []
		}
	};

	for (const r of rows) {
		const dlc = (r.dlc ?? 'Base').toString();
		(facets.DLC[dlc] ??= []).push(r.id);

		const skills = [r.skillLevel3, r.skillLevel7].filter(Boolean) as string[];
		for (const skill of skills) {
			if (skill.includes('Cocktail Serving')) facets.Skill['Cocktail Serving'].push(r.id);
			if (skill.includes('Cooking+')) facets.Skill.Cooking.push(r.id);
			if (skill.includes('Dispatch')) facets.Skill['Dispatch Master'].push(r.id);
			if (skill.includes('Drink Serving')) facets.Skill['Drink Serving'].push(r.id);
			if (skill.includes('Ingredient Prep')) facets.Skill['Ingredient Prep'].push(r.id);
			if (skill.includes('Irresistible Charm')) facets.Skill['Irresistible Charm'].push(r.id);
			if (skill.includes('Master Drink Maker')) facets.Skill['Master Drink Maker'].push(r.id);
			if (skill.includes('Serving+')) facets.Skill.Serving.push(r.id);
			if (skill.includes('Tip')) facets.Skill.Tips.push(r.id);
			if (skill.includes('Wasabi Refill')) facets.Skill['Wasabi Refill'].push(r.id);
			if (skill.includes('Cleaning')) facets.Skill.Cleaning.push(r.id);
		}
	}

	// Remove duplicates on known duplicate skills like Cooking+ and Cooking++
	facets.Skill['Cooking'] = [...new Set(facets.Skill['Cooking'])];
	facets.Skill['Serving'] = [...new Set(facets.Skill['Serving'])];

	return { rows, byId, facets };
}
