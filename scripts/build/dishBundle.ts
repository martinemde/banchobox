import { z } from 'zod';
import type {
	Dish,
	Id,
	EntityBundle,
	Chapter,
	Ingredient,
	Party,
	PartyDish,
	CookstaTier
} from '../../src/lib/types.js';
import type {
	DishInputRow,
	IngredientInputRow,
	PartyInputRow,
	DishIngredientJoinRow,
	PartyDishJoinRow,
	StaffInputRow
} from './types.js';
import { loadCsvFile, optionalNonNegativeInt, optionalString, parseTable } from './load.js';

const normalize = (v: unknown) => (v ?? '').toString().toLowerCase();

// dishes-data.csv schema -> normalized row
const dishRowSchema = z.object({
	id: z.coerce.number().int().positive(),
	name: z.string().transform((s) => s.trim()),
	image: z.string().transform((s) => s.trim()),
	chapter: optionalNonNegativeInt,
	maxLevel: z.coerce.number().int().nonnegative(),
	basePrice: z.coerce.number().int().nonnegative(),
	baseTaste: z.coerce.number().int().nonnegative(),
	baseServings: z.coerce.number().int().nonnegative(),
	finalPrice: z.coerce.number().int().nonnegative(),
	finalTaste: z.coerce.number().int().nonnegative(),
	finalServings: z.coerce.number().int().nonnegative(),
	unlock: optionalString,
	cooksta: optionalString,
	dlc: optionalString,
	artisansFlames: optionalNonNegativeInt,
	staff: optionalString,
	staffLevel: optionalNonNegativeInt
}) satisfies z.ZodType<DishInputRow>;

export function loadDishes() {
	const dishesCSV = loadCsvFile('dishes-data.csv');
	const normalized = parseTable(dishesCSV, dishRowSchema, 'dishes-data.csv');

	const dishes: DishInputRow[] = [];
	const dishNameToId = new Map<string, Id>();

	normalized.forEach((row) => {
		dishes.push(row as DishInputRow);
		dishNameToId.set(row.name, row.id);
	});

	return { dishes, dishNameToId };
}

export function prepareDishesAndPartyDishes(
	DishInputRowes: DishInputRow[],
	IngredientInputRows: IngredientInputRow[],
	dishIngredients: DishIngredientJoinRow[],
	dishParties: PartyDishJoinRow[],
	partyInputRows: PartyInputRow[],
	staffInputRows: StaffInputRow[]
): {
	dishes: Dish[];
	partyDishes: PartyDish[];
	partyDishesByPartyId: Map<Id, PartyDish[]>;
} {
	const partyDishes: PartyDish[] = [];
	const partyDishesByPartyId = new Map<Id, PartyDish[]>();
	let nextPartyDishId = 1;

	// Create staff name to ID mapping for staff ID lookups
	const staffNameToId = new Map<string, Id>();
	for (const staff of staffInputRows) {
		if (staff.name && staff.name.trim() !== '') {
			staffNameToId.set(staff.name, staff.id);
		}
	}

	const dishes: Dish[] = DishInputRowes.map((dish) => {
		const dishIngLines = dishIngredients.filter((di) => di.dishId === dish.id);

		const ingredientLines = dishIngLines.map((di) => {
			const ing = IngredientInputRows.find((i) => i.id === di.ingredientId)!;
			const type = ing.type;

			return {
				ingredientId: di.ingredientId,
				count: di.count,
				name: ing.name,
				image: ing.image,
				type,
				unitCost: ing.cost,
				lineCost: ing.cost * di.count,
				upgradeCount: di.upgradeCount
			};
		});
		const ingredientCount = ingredientLines.reduce((total, line) => total + line.count, 0);
		const recipeCost = ingredientLines.reduce((sum, line) => sum + line.lineCost, 0);

		const finalRevenue = dish.finalPrice * dish.finalServings;
		const finalProfit = finalRevenue - recipeCost;
		const finalProfitPerServing = Math.round(finalProfit / dish.finalServings);

		const partyIds = dishParties.filter((dp) => dp.dishId === dish.id).map((dp) => dp.partyId);
		const localPartyDishes: PartyDish[] = [];
		const localPartyDishIds: Id[] = [];

		let maxProfitPerServing = finalProfitPerServing;

		const upgradeCost = ingredientLines.reduce(
			(sum, line) =>
				sum +
				(line.unitCost != null ? line.unitCost : 0) *
					(line.upgradeCount != null ? line.upgradeCount : 0),
			0
		);

		const ingredientNames = ingredientLines
			.map((l) => IngredientInputRows.find((i) => i.id === l.ingredientId)?.name || '')
			.filter(Boolean);
		const search = [dish.name, dish.dlc, dish.unlock, ...ingredientNames].map(normalize).join(' ');

		for (const partyId of partyIds) {
			const party = partyInputRows.find((p) => p.id === partyId);
			if (!party) continue;

			const partyPrice = dish.finalPrice * party.bonus;
			const partyRevenue = partyPrice * dish.finalServings;
			const partyProfit = Math.round(partyRevenue - recipeCost);
			const partyProfitPerServing = Math.round(partyProfit / dish.finalServings);

			if (partyProfitPerServing > maxProfitPerServing) {
				maxProfitPerServing = partyProfitPerServing;
			}

			const pdSearch = [dish.name, party.name, dish.dlc ?? null, dish.unlock ?? null]
				.map(normalize)
				.filter(Boolean)
				.join(' ');

			const pdSort = {
				name: normalize(dish.name),
				finalPrice: partyPrice,
				finalServings: dish.finalServings,
				finalRevenue: partyRevenue,
				finalProfit: partyProfit,
				finalProfitPerServing: partyProfitPerServing,
				maxProfitPerServing: partyProfitPerServing,
				recipeCost,
				upgradeCost,
				ingredientCount,
				partyBonus: party.bonus,
				partyName: party.name
			} as const;

			const pd: PartyDish = {
				...dish,
				id: nextPartyDishId++,
				ingredients: ingredientLines,
				recipeCost,
				partyDishIds: [],
				partyIds,
				finalPrice: partyPrice,
				finalRevenue: partyRevenue,
				finalProfit: partyProfit,
				finalProfitPerServing: partyProfitPerServing,
				maxProfitPerServing: partyProfitPerServing,
				upgradeCost,
				ingredientCount,
				search: pdSearch,
				sort: pdSort,
				partyId,
				dishId: dish.id,
				partyName: party.name,
				partyBonus: party.bonus
			};

			localPartyDishes.push(pd);
			localPartyDishIds.push(pd.id);
		}

		for (const pd of localPartyDishes) {
			pd.partyDishIds = localPartyDishIds;
			if (!partyDishesByPartyId.has(pd.partyId)) partyDishesByPartyId.set(pd.partyId, []);
			partyDishesByPartyId.get(pd.partyId)!.push(pd);
		}
		partyDishes.push(...localPartyDishes);

		const sort = {
			name: normalize(dish.name),
			finalPrice: dish.finalPrice,
			finalServings: dish.finalServings,
			finalRevenue,
			finalProfit,
			finalProfitPerServing,
			maxProfitPerServing,
			recipeCost,
			upgradeCost,
			ingredientCount
		} as const;

		const staffId =
			dish.staff && dish.staff !== 'Any staff' ? staffNameToId.get(dish.staff) : undefined;

		const enrichedDish: Dish = {
			...dish,
			staffId,
			ingredients: ingredientLines,
			recipeCost,
			partyDishIds: localPartyDishIds,
			partyIds,
			finalRevenue,
			finalProfit,
			finalProfitPerServing,
			maxProfitPerServing,
			upgradeCost,
			ingredientCount,
			image: dish.image,
			search,
			sort
		};

		return enrichedDish;
	});

	return { dishes, partyDishes, partyDishesByPartyId };
}

export function buildDishesBundle({
	dishes,
	chaptersBundle,
	ingredientsBundle,
	partiesBundle,
	cookstaBundle
}: {
	dishes: Dish[];
	chaptersBundle: EntityBundle<Chapter>;
	ingredientsBundle: EntityBundle<Ingredient>;
	partiesBundle: EntityBundle<Party>;
	cookstaBundle: EntityBundle<CookstaTier>;
}): EntityBundle<Dish> {
	// byId index for O(1) lookups
	const byId = Object.fromEntries(dishes.map((d) => [d.id, d])) as Record<Id, Dish>;

	// Facets - minimal set to start; structure is easy to extend
	const facets: EntityBundle<Dish>['facets'] = {
		'Chapter': {},
		'Cooksta': {},
		'DLC': {},
		'Party': {},
		'Unlock Condition': {}
	};

	// Helper function to get rows from either new or old bundle format
	const getRows = <T>(bundle: EntityBundle<T>): T[] => {
		if ('sortedIds' in bundle && bundle.sortedIds) {
			const firstSortedIds = Object.values(bundle.sortedIds)[0];
			if (firstSortedIds && firstSortedIds.length > 0) {
				return firstSortedIds.map((id) => bundle.byId[id]).filter(Boolean);
			}
		}
		// Fallback to rows if available (backward compatibility)
		return (bundle as any).rows || Object.values(bundle.byId);
	};

	const maxChapter = Math.max(...getRows(chaptersBundle).map((c) => c.number));
	const maxCooksta = Math.max(...getRows(cookstaBundle).map((c) => c.rank));
	const minCooksta = Math.min(...getRows(cookstaBundle).map((c) => c.rank));
	const cookstaNameByRank = Object.fromEntries(getRows(cookstaBundle).map((c) => [c.rank, c.name]));

	for (const d of dishes) {
		const dlc = (d.dlc ?? 'Base').toString();
		(facets.DLC[dlc] ??= []).push(d.id);

		const unlock = (d.unlock ?? '').toString();
		if (unlock) {
			if (unlock.startsWith('Staff ')) {
				(facets['Unlock Condition']['Staff'] ??= []).push(d.id);
			} else {
				(facets['Unlock Condition'][unlock] ??= []).push(d.id);
			}
		}

		// Chapter facets - cumulative
		let ch = d.chapter ?? 0;
		// The dish chapter is the max of the chapter and the highest level of any ingredient
		for (const line of d.ingredients) {
			const ingredient = ingredientsBundle.byId[line.ingredientId];
			if (
				ingredient.chapter !== null &&
				ingredient.chapter !== undefined &&
				ingredient.chapter > ch
			) {
				ch = ingredient.chapter;
			}
		}

		// Party facet (if present)
		for (const partyId of d.partyIds) {
			const party = partiesBundle.byId[partyId];
			(facets.Party[party.name] ??= []).push(d.id);
		}

		// Add the dish to its cooksta unlock level and up
		// If it doesn't have a cooksta, it's available in all tiers
		if (d.cooksta !== null && d.cooksta !== undefined && d.cooksta.trim() !== '') {
			const cookstaTier = cookstaBundle.rows.find((c) => c.name === d.cooksta)!;
			for (let n = cookstaTier.rank; n <= maxCooksta; n++) {
				(facets.Cooksta[cookstaNameByRank[n]] ??= []).push(d.id);
			}
		} else {
			for (let n = minCooksta; n <= maxCooksta; n++) {
				(facets.Cooksta[cookstaNameByRank[n]] ??= []).push(d.id);
			}
		}

		// Add the ingredient to every chapter including and after the dish's chapter
		// Once the ingredient is available, it remains available in all later chapters.
		// This stores as a number because we never show it in the UI.
		if (ch != null && Number.isFinite(ch)) {
			for (let n = ch; n <= maxChapter; n++) {
				(facets.Chapter[n.toString()] ??= []).push(d.id);
			}
		}
	}

	// Generate precomputed sort orders for common sort keys
	const sortedIds: Record<string, Id[]> = {};

	const sortKeys: Array<{ key: string; direction: 'asc' | 'desc' }> = [
		{ key: 'name', direction: 'asc' },
		{ key: 'finalPrice', direction: 'desc' },
		{ key: 'finalServings', direction: 'desc' },
		{ key: 'finalProfitPerServing', direction: 'desc' },
		{ key: 'maxProfitPerServing', direction: 'desc' },
		{ key: 'upgradeCost', direction: 'asc' },
		{ key: 'ingredientCount', direction: 'asc' }
	];

	for (const { key, direction } of sortKeys) {
		const sorted = [...dishes].sort((a, b) => {
			const aVal = a.sort[key] as string | number | null;
			const bVal = b.sort[key] as string | number | null;

			if (aVal == null && bVal == null) return 0;
			if (aVal == null) return direction === 'asc' ? -1 : 1;
			if (bVal == null) return direction === 'asc' ? 1 : -1;

			if (typeof aVal === 'string' && typeof bVal === 'string') {
				const cmp = direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
				if (cmp !== 0) return cmp;
			} else {
				const cmp =
					direction === 'asc'
						? aVal < bVal
							? -1
							: aVal > bVal
								? 1
								: 0
						: bVal < aVal
							? -1
							: bVal > aVal
								? 1
								: 0;
				if (cmp !== 0) return cmp;
			}

			// Stable tie-breaker by id
			return a.id - b.id;
		});

		sortedIds[`${key}_${direction}`] = sorted.map((d) => d.id);
	}

	return {
		sortedIds,
		byId,
		facets
	};
}
