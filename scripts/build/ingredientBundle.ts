import { z } from 'zod';
import type { Ingredient, Id, EntityBundle, Chapter } from '../../src/lib/types.js';
import type {
	DishInputRow,
	IngredientInputRow,
	PartyInputRow,
	DishIngredientInputRow,
	PartyDishInputRow
} from './types.js';
import {
	intFromString,
	optionalString,
	optionalNumber,
	optionalIntSafe,
	optionalBoolean,
	loadCsvFile,
	parseTable
} from './load.js';

const normalize = (v: unknown) => (v ?? '').toString().toLowerCase();

// ingredients-data.csv schema -> normalized row
const ingredientRowSchema = z
	.object({
		id: intFromString('id'),
		chapter: optionalIntSafe,
		aberration: optionalBoolean,
		bugnet: optionalBoolean,
		buy_jango: optionalNumber,
		buy_otto: optionalNumber,
		cost: intFromString('cost'), // The replacement cost for the ingredient
		crabtrap: optionalBoolean,
		day: optionalBoolean,
		drone: optionalBoolean,
		farm: optionalString,
		fog: optionalBoolean,
		gloves: optionalBoolean,
		harpoon: optionalBoolean,
		image: z.string().transform((s) => s.trim()),
		kg: optionalNumber,
		max_meats: optionalNumber,
		name: z.string().transform((s) => s.trim()),
		night: optionalBoolean,
		rank: intFromString('rank'),
		sell: optionalNumber,
		source: z.string().transform((s) => s.trim()),
		steelnet: optionalBoolean,
		type: z.string().transform((s) => s.trim())
	})
	.transform((row) => ({
		id: row['id'],
		chapter: (row['chapter'] as number | null) ?? null,
		aberration: row['aberration'],
		bugnet: row['bugnet'],
		buyJango: row['buy_jango'] as number | null,
		buyOtto: row['buy_otto'] as number | null,
		cost: row['cost'],
		crabtrap: row['crabtrap'],
		day: row['day'],
		drone: row['drone'],
		farm: row['farm'] ?? null,
		fog: row['fog'],
		gloves: row['gloves'],
		harpoon: row['harpoon'],
		image: row['image'],
		kg: row['kg'] as number | null,
		maxMeats: row['max_meats'] as number | null,
		name: row['name'],
		night: row['night'],
		rank: row['rank'],
		sell: row['sell'] as number | null,
		source: row['source'],
		steelnet: row['steelnet'],
		type: row['type']
	}));

export function loadIngredients() {
	const ingredientsCSV = loadCsvFile('ingredients-data.csv');
	const normalized = parseTable(ingredientsCSV, ingredientRowSchema, 'ingredients-data.csv');

	const ingredients: IngredientInputRow[] = [];
	const ingredientNameToId = new Map<string, Id>();

	normalized.forEach((row) => {
		ingredients.push(row as IngredientInputRow);
		ingredientNameToId.set(row.name, row.id);
	});

	return { ingredients, ingredientNameToId };
}

// Helpers: data lookups and transforms for prepareIngredients
function getUsageLinesForIngredient(
	ingredientId: Id,
	allDishIngredientRows: DishIngredientInputRow[]
) {
	return allDishIngredientRows.filter((di) => di.ingredientId === ingredientId);
}

function buildPartyIdToNameMap(partyInputRows: PartyInputRow[]): Map<Id, string> {
	return new Map(partyInputRows.map((p) => [p.id, p.name ?? '']));
}

function buildDishIdToDishMap(dishes: DishInputRow[]): Map<Id, DishInputRow> {
	return new Map(dishes.map((d) => [d.id, d]));
}

function buildDishIdToPartyIdsMap(dishParties: PartyDishInputRow[]): Map<Id, Id[]> {
	const map = new Map<Id, Id[]>();
	for (const dp of dishParties) {
		(map.get(dp.dishId) ?? map.set(dp.dishId, []).get(dp.dishId)!).push(dp.partyId);
	}
	return map;
}

function collectPartySets(
	usageLines: DishIngredientInputRow[],
	dishParties: PartyDishInputRow[],
	partyIdToName: Map<Id, string>
) {
	const partyIdSet = new Set<Id>();
	const partyNames = new Set<string>();
	for (const u of usageLines) {
		for (const dp of dishParties) {
			if (dp.dishId === u.dishId) {
				partyIdSet.add(dp.partyId);
				partyNames.add(partyIdToName.get(dp.partyId) ?? '');
			}
		}
	}
	return { partyIdSet, partyNames } as const;
}

function getPartyNamesForDish(partyIds: Id[], partyIdToName: Map<Id, string>): string[] {
	return partyIds.map((id) => partyIdToName.get(id) ?? '');
}

function buildUsedIn(
	usageLines: DishIngredientInputRow[],
	dishIdToDish: Map<Id, DishInputRow>,
	dishIdToPartyIds: Map<Id, Id[]>,
	partyIdToName: Map<Id, string>
) {
	return usageLines
		.map((u) => {
			const dish = dishIdToDish.get(u.dishId)!;
			const partyIds = dishIdToPartyIds.get(u.dishId) ?? [];
			const partyNames = getPartyNamesForDish(partyIds, partyIdToName);
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
}

function computeSellPerKg(ingredient: IngredientInputRow): number | undefined {
	const sell = ingredient.sell ?? null;
	const meats = ingredient.maxMeats ?? null;
	const kg = ingredient.kg ?? null;
	if (sell != null && meats != null && kg != null && kg !== 0) {
		return (sell * meats) / kg;
	}
	return undefined;
}

function buildVendors(ingredient: IngredientInputRow): Record<string, number> {
	const vendors = {} as Record<string, number>;
	if (ingredient.buyOtto != null) vendors['Otto'] = ingredient.buyOtto;
	if (ingredient.buyJango != null) vendors['Jango'] = ingredient.buyJango;
	return vendors;
}

function computeMinBuyFromVendors(vendors: Record<string, number>): number {
	return Object.values(vendors).reduce((min, v) => (v != null && v < min ? v : min), Infinity);
}

function buildIngredientSearchIndex(
	ingredient: IngredientInputRow,
	partyNames: Set<string>
): string {
	return [
		ingredient.name,
		ingredient.source,
		ingredient.type,
		...partyNames,
		...(partyNames.size > 0 ? ['party'] : [])
	]
		.map(normalize)
		.filter(Boolean)
		.join(' ');
}

function buildIngredientSort(
	ingredient: IngredientInputRow,
	buy: number,
	sellPerKg: number | undefined
): Ingredient['sort'] {
	const sort = {
		name: normalize(ingredient.name),
		buy,
		sell: ingredient.sell ?? null,
		kg: ingredient.kg ?? null,
		sellPerKg
	} as const;
	return sort as unknown as Ingredient['sort'];
}

export function prepareIngredients(
	IngredientInputRows: IngredientInputRow[],
	DishIngredientInputRows: DishIngredientInputRow[],
	dishParties: PartyDishInputRow[],
	partyInputRows: PartyInputRow[],
	DishInputRowes: DishInputRow[]
): Ingredient[] {
	const partyIdToName = buildPartyIdToNameMap(partyInputRows);
	const dishIdToDish = buildDishIdToDishMap(DishInputRowes);
	const dishIdToPartyIds = buildDishIdToPartyIdsMap(dishParties);

	const ingredients: Ingredient[] = IngredientInputRows.map((ingredient) => {
		const usageLines = getUsageLinesForIngredient(ingredient.id, DishIngredientInputRows);

		const { partyIdSet, partyNames } = collectPartySets(usageLines, dishParties, partyIdToName);

		const usedIn = buildUsedIn(usageLines, dishIdToDish, dishIdToPartyIds, partyIdToName);

		const sellPerKg = computeSellPerKg(ingredient);

		const vendors = buildVendors(ingredient);
		const buy = computeMinBuyFromVendors(vendors);

		const search = buildIngredientSearchIndex(ingredient, partyNames);

		const sort = buildIngredientSort(ingredient, buy, sellPerKg);

		const finalIngredient: Ingredient = {
			...ingredient,
			usedIn,
			usedForParties: Array.from(partyIdSet),
			sellPerKg,
			vendors,
			search,
			sort
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

	const facets = initializeIngredientFacets();
	const maxChapter = computeMaxChapter(chaptersBundle);

	for (const ingredient of ingredients) {
		addIngredientFacetEntries(facets, ingredient);
		addCumulativeChapterFacetEntries(facets, ingredient, maxChapter);
	}

	return { rows: ingredients, byId, facets };
}

// Helpers: facet building for buildIngredientsBundle
function initializeIngredientFacets(): EntityBundle<Ingredient>['facets'] {
	return {
		Type: {},
		Source: {},
		Time: {},
		Vendor: {},
		Catch: {},
		Aberration: {},
		Farm: {},
		Chapter: {}
	};
}

function computeMaxChapter(chaptersBundle: EntityBundle<Chapter>): number {
	return Math.max(...chaptersBundle.rows.map((c) => c.number));
}

function addIngredientFacetEntries(
	facets: EntityBundle<Ingredient>['facets'],
	ingredient: Ingredient
): void {
	if (ingredient.source) (facets['Source'][ingredient.source] ??= []).push(ingredient.id);
	if (ingredient.farm) (facets['Farm'][ingredient.farm] ??= []).push(ingredient.id);

	if (ingredient.type) (facets['Type'][ingredient.type] ??= []).push(ingredient.id);
	if (ingredient.aberration) (facets['Type']['Aberration'] ??= []).push(ingredient.id);

	if (ingredient.day) (facets['Time']['Day'] ??= []).push(ingredient.id);
	if (ingredient.night) (facets['Time']['Night'] ??= []).push(ingredient.id);
	if (ingredient.fog) (facets['Time']['Fog'] ??= []).push(ingredient.id);

	if (ingredient.buyJango != null) (facets['Vendor']['Jango'] ??= []).push(ingredient.id);
	if (ingredient.buyOtto != null) (facets['Vendor']['Otto'] ??= []).push(ingredient.id);

	if (ingredient.drone) (facets['Catch']['Drone'] ??= []).push(ingredient.id);
	if (ingredient.crabtrap) (facets['Catch']['Crab Trap'] ??= []).push(ingredient.id);
	if (ingredient.bugnet) (facets['Catch']['Bug Net'] ??= []).push(ingredient.id);
	if (ingredient.gloves) (facets['Catch']['Gloves'] ??= []).push(ingredient.id);
	if (ingredient.steelnet) (facets['Catch']['Steel Net'] ??= []).push(ingredient.id);
	if (ingredient.harpoon) (facets['Catch']['Harpoon'] ??= []).push(ingredient.id);
}

function addCumulativeChapterFacetEntries(
	facets: EntityBundle<Ingredient>['facets'],
	ingredient: Ingredient,
	maxChapter: number
): void {
	const ch = ingredient.chapter ?? null;
	if (ch != null && Number.isFinite(ch)) {
		for (let n = ch; n <= maxChapter; n++) {
			(facets['Chapter'][n.toString()] ??= []).push(ingredient.id);
		}
	}
}
