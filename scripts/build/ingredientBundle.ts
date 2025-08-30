import type { Ingredient, Id, EntityBundle, Chapter } from '../../src/lib/types.js';
import type {
	DishInputRow,
	IngredientInputRow,
	PartyInputRow,
	DishIngredientInputRow,
	PartyDishInputRow
} from './types.js';

const normalize = (v: unknown) => (v ?? '').toString().toLowerCase();

export function prepareIngredients(
	IngredientInputRows: IngredientInputRow[],
	DishIngredientInputRows: DishIngredientInputRow[],
	dishParties: PartyDishInputRow[],
	partyInputRows: PartyInputRow[],
	DishInputRowes: DishInputRow[]
): Ingredient[] {
	const ingredients: Ingredient[] = IngredientInputRows.map((ingredient) => {
		const usageLines = DishIngredientInputRows.filter((di) => di.ingredientId === ingredient.id);

		const partyIdSet = new Set<Id>();
		const partyNames = new Set<string>();
		for (const u of usageLines) {
			for (const dp of dishParties) {
				if (dp.dishId === u.dishId) {
					partyIdSet.add(dp.partyId);
					partyNames.add(partyInputRows.find((p) => p.id === dp.partyId)?.name ?? '');
				}
			}
		}
		const usedIn = usageLines
			.map((u) => {
				const dish = DishInputRowes.find((d) => d.id === u.dishId)!;
				const partyIds = dishParties.filter((dp) => dp.dishId === u.dishId).map((dp) => dp.partyId);
				const partyNames = partyIds.map(
					(id) => partyInputRows.find((p) => p.id === id)?.name ?? ''
				);
				return {
					dishId: u.dishId,
					dishName: dish.name,
					dishImage: dish.image,
					count: u.count,
					upgradeCount: u.upgradeCount,
					price: dish.finalPrice,
					servings: dish.finalServings,
					partyIds,
					partyNames
				};
			})
			.sort((a, b) => b.price - a.price);

		const sell = ingredient.sell ?? null;
		const meats = ingredient.maxMeats ?? null;
		const kg = ingredient.kg ?? null;
		let sellPerKg: number | undefined = undefined;
		if (sell != null && meats != null && kg != null && kg !== 0) {
			sellPerKg = (sell * meats) / kg;
		}

		const vendors = {} as Record<string, number>;
		if (ingredient.buyOtto != null) vendors['Otto'] = ingredient.buyOtto;
		if (ingredient.buyJango != null) vendors['Jango'] = ingredient.buyJango;

		const buy = Object.values(vendors).reduce(
			(min, v) => (v != null && v < min ? v : min),
			Infinity
		);

		const search = [
			ingredient.name,
			ingredient.source,
			ingredient.type,
			...partyNames,
			...(partyNames.size > 0 ? ['party'] : [])
		]
			.map(normalize)
			.filter(Boolean)
			.join(' ');

		const sort = {
			name: normalize(ingredient.name),
			buy,
			sell,
			kg,
			sellPerKg
		} as const;

		const finalIngredient: Ingredient = {
			...ingredient,
			usedIn,
			usedForParties: Array.from(partyIdSet),
			sellPerKg,
			vendors,
			search,
			sort: sort as unknown as Ingredient['sort']
		};

		return finalIngredient;
	});

	return ingredients;
}

export function buildIngredientsBundle(
	ingredients: Ingredient[],
	chaptersBundle: EntityBundle<Chapter>
): EntityBundle<Ingredient> {
	const byId = Object.fromEntries(ingredients.map((i) => [i.id, i])) as Record<Id, Ingredient>;

	// Minimal, useful facets (no hasIngredient)
	const facets: EntityBundle<Ingredient>['facets'] = {
		Type: {}, // e.g. 'fish', 'vegetable', etc.
		Source: {}, // e.g. 'Glacial Passage', 'Vegetable Farm', ...
		Time: {}, // 'day','night','fog' flags mapped to ids
		Vendor: {}, // 'jango', 'otto' based on presence of buy price
		Catch: {}, // 'crabtrap', 'bugnet', 'gloves' based on presence of capture flags
		Aberration: {}, // 'yes' when ingredient.aberration === true
		Farm: {}, // 'gumo', 'otto'
		Chapter: {}
	};

	const maxChapter = Math.max(...chaptersBundle.rows.map((c) => c.number));

	for (const i of ingredients) {
		if (i.source) (facets['Source'][i.source] ??= []).push(i.id);
		if (i.farm) (facets['Farm'][i.farm] ??= []).push(i.id);

		// Type facets
		if (i.type) (facets['Type'][i.type] ??= []).push(i.id);
		if (i.aberration) (facets['Type']['Aberration'] ??= []).push(i.id);

		// Time facets
		if (i.day) (facets['Time']['Day'] ??= []).push(i.id);
		if (i.night) (facets['Time']['Night'] ??= []).push(i.id);
		if (i.fog) (facets['Time']['Fog'] ??= []).push(i.id);

		// Vendor facets
		if (i.buyJango != null) (facets['Vendor']['Jango'] ??= []).push(i.id);
		if (i.buyOtto != null) (facets['Vendor']['Otto'] ??= []).push(i.id);

		// Catch facets
		if (i.drone) (facets['Catch']['Drone'] ??= []).push(i.id);
		if (i.crabtrap) (facets['Catch']['Crab Trap'] ??= []).push(i.id);
		if (i.bugnet) (facets['Catch']['Bug Net'] ??= []).push(i.id);
		if (i.gloves) (facets['Catch']['Gloves'] ??= []).push(i.id);
		if (i.steelnet) (facets['Catch']['Steel Net'] ??= []).push(i.id);
		if (i.harpoon) (facets['Catch']['Harpoon'] ??= []).push(i.id);

		// Chapter facets - cumulative
		const ch = i.chapter ?? null;
		// Add the ingredient to every chapter up to the max chapter.
		// Once the ingredient is available, it remains available in all later chapters.
		if (ch != null && Number.isFinite(ch)) {
			for (let n = ch; n <= maxChapter; n++) {
				(facets['Chapter'][n.toString()] ??= []).push(i.id);
			}
		}
	}

	return { rows: ingredients, byId, facets };
}
