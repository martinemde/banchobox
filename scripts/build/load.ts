import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseCsv } from 'csv-parse/sync';
import { z } from 'zod';
import type {
	Id,
	CookstaInputRow,
	DLCInputRow,
	ChapterInputRow,
	StaffInputRow
} from '../../src/lib/types.js';
import type {
	DishInputRow,
	IngredientInputRow,
	PartyInputRow,
	DishIngredient,
	DishParty
} from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --------------------------
// CSV parsing + validation
// --------------------------

function boolFlag(value: unknown): boolean {
	if (typeof value !== 'string') return false;
	const v = value.trim().toLowerCase();
	return v === 'checked' || v === 'true' || v === 'yes';
}

const intFromString = (label: string) =>
	z
		.string()
		.transform((s) => s.trim())
		.refine((s) => s !== '', { message: `${label} is required` })
		.transform((s) => {
			const n = Number(s);
			if (!Number.isFinite(n) || !Number.isInteger(n)) {
				throw new Error(`${label} must be an integer`);
			}
			return n;
		});

const floatFromString = (label: string) =>
	z
		.string()
		.transform((s) => s.trim())
		.refine((s) => s !== '', { message: `${label} is required` })
		.transform((s) => {
			const n = Number(s);
			if (!Number.isFinite(n)) {
				throw new Error(`${label} must be a number`);
			}
			return n;
		});

const optionalString = z
	.string()
	.optional()
	.transform((s) => (s && s.trim() !== '' ? s.trim() : undefined));

const optionalNumber = optionalString.transform((s) => (s ? Number(s) : null));
const optionalIntSafe = z
	.string()
	.optional()
	.transform((s) => {
		if (!s || s.trim() === '') return null as number | null;
		const n = Number(s.trim());
		return Number.isFinite(n) && Number.isInteger(n) ? (n as number) : (null as number | null);
	});
const optionalBoolean = optionalString.transform((s) => (s ? boolFlag(s) : false));

// dishes-data.csv schema -> normalized row
const dishesRowSchema = z
	.object({
		id: intFromString('id'),
		name: z.string().transform((s) => s.trim()),
		image: z.string().transform((s) => s.trim()),
		chapter: optionalIntSafe,
		max_level: intFromString('max_level'),
		base_price: intFromString('base_price'),
		base_taste: intFromString('base_taste'),
		base_servings: intFromString('base_servings'),
		final_price: intFromString('final_price'),
		final_taste: intFromString('final_taste'),
		final_servings: intFromString('final_servings'),
		unlock: optionalString,
		cooksta: optionalString,
		dlc: optionalString,
		artisans_flames: optionalNumber,
		staff: optionalString,
		staff_level: optionalNumber
	})
	.transform((row) => ({
		id: row['id'],
		name: row['name'],
		image: row['image'],
		chapter: (row['chapter'] as number | null) ?? null,
		maxLevel: row['max_level'],
		basePrice: row['base_price'],
		baseTaste: row['base_taste'],
		baseServings: row['base_servings'],
		finalPrice: row['final_price'],
		finalTaste: row['final_taste'],
		finalServings: row['final_servings'],
		unlock: row['unlock'] ?? null,
		cooksta: row['cooksta'] ?? null,
		dlc: row['dlc'] ?? null,
		artisansFlames: row['artisans_flames'] as number | null,
		staff: row['staff'] ?? null,
		staffLevel: row['staff_level'] as number | null
	}));

// ingredients-data.csv schema -> normalized row
const ingredientsRowSchema = z
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

// parties-data.csv schema -> normalized row
const partiesRowSchema = z
	.object({
		id: intFromString('id'),
		order: intFromString('order'),
		name: z.string().transform((s) => s.trim()),
		bonus: floatFromString('bonus')
	})
	.transform((row) => ({
		id: row['id'],
		order: row['order'],
		name: row['name'],
		bonus: row['bonus']
	}));

// dish-ingredients-data.csv schema -> normalized row
const dishIngredientsRowSchema = z
	.object({
		dish: z.string().transform((s) => s.trim()),
		count: intFromString('count'),
		ingredient: z.string().transform((s) => s.trim()),
		levels: intFromString('levels'),
		upgrade_count: intFromString('upgrade_count')
	})
	.transform((row) => ({
		dish: row['dish'],
		ingredient: row['ingredient'],
		count: row['count'],
		levels: row['levels'],
		upgradeCount: row['upgrade_count']
	}));

// party-dishes-data.csv schema -> normalized row
const partyDishesRowSchema = z
	.object({
		party: z.string().transform((s) => s.trim()),
		dish: z.string().transform((s) => s.trim())
	})
	.transform((row) => ({
		party: row['party'],
		dish: row['dish']
	}));

function parseTable<T>(csvContent: string, schema: z.ZodType<T>, filename: string): T[] {
	const records = parseCsv(csvContent, {
		columns: true,
		skip_empty_lines: true,
		trim: true
	}) as Array<Record<string, string>>;
	if (records.length === 0) {
		console.warn(`${filename} has no data rows`);
		return [];
	}
	const out: T[] = [];
	for (let i = 0; i < records.length; i++) {
		const rec = records[i];
		const result = schema.safeParse(rec);
		if (!result.success) {
			const issues = result.error.issues
				.map((iss) => `${iss.path.join('.') || 'value'}: ${iss.message}`)
				.join('; ');
			const rowNum = i + 2; // account for header row
			throw new Error(`${filename} row ${rowNum}: ${issues}`);
		}
		out.push(result.data);
	}
	return out;
}

function validateRequiredColumns(
	rows: Array<Record<string, string>>,
	requiredColumns: string[],
	filename: string
) {
	if (rows.length === 0) return;

	const availableColumns = Object.keys(rows[0]);
	const missingColumns = requiredColumns.filter((col) => !availableColumns.includes(col));

	if (missingColumns.length > 0) {
		throw new Error(
			`${filename} is missing required columns: ${missingColumns.join(', ')}. Available columns: ${availableColumns.join(', ')}`
		);
	}
}

function loadDishes() {
	const dishesCSV = readFileSync(join(__dirname, '..', '..', 'data', 'dishes-data.csv'), 'utf-8');
	const rawRecords = parseCsv(dishesCSV, {
		columns: true,
		skip_empty_lines: true,
		trim: true
	}) as Array<Record<string, string>>;
	validateRequiredColumns(
		rawRecords,
		[
			'id',
			'name',
			'chapter',
			'max_level',
			'base_price',
			'base_taste',
			'base_servings',
			'final_price',
			'final_taste',
			'final_servings',
			'unlock',
			'cooksta',
			'dlc',
			'artisans_flames',
			'staff',
			'staff_level',
			'image'
		],
		'dishes-data.csv'
	);
	const normalized = parseTable(dishesCSV, dishesRowSchema, 'dishes-data.csv');

	const dishes: DishInputRow[] = [];
	const dishNameToId = new Map<string, Id>();

	normalized.forEach((row) => {
		dishes.push(row as DishInputRow);
		dishNameToId.set(row.name, row.id);
	});

	return { dishes, dishNameToId };
}

function loadIngredients() {
	const ingredientsCSV = readFileSync(
		join(__dirname, '..', '..', 'data', 'ingredients-data.csv'),
		'utf-8'
	);
	const rawRecords = parseCsv(ingredientsCSV, {
		columns: true,
		skip_empty_lines: true,
		trim: true
	}) as Array<Record<string, string>>;
	validateRequiredColumns(
		rawRecords,
		['id', 'name', 'chapter', 'source', 'type', 'kg', 'max_meats', 'sell', 'day', 'night', 'fog'],
		'ingredients-data.csv'
	);
	const normalized = parseTable(ingredientsCSV, ingredientsRowSchema, 'ingredients-data.csv');

	const ingredients: IngredientInputRow[] = [];
	const ingredientNameToId = new Map<string, Id>();

	normalized.forEach((row) => {
		ingredients.push(row as IngredientInputRow);
		ingredientNameToId.set(row.name, row.id);
	});

	return { ingredients, ingredientNameToId };
}

function loadParties() {
	const partiesCSV = readFileSync(join(__dirname, '..', '..', 'data', 'parties-data.csv'), 'utf-8');
	const rawRecords = parseCsv(partiesCSV, {
		columns: true,
		skip_empty_lines: true,
		trim: true
	}) as Array<Record<string, string>>;
	validateRequiredColumns(rawRecords, ['id', 'order', 'name', 'bonus'], 'parties-data.csv');
	const normalized = parseTable(partiesCSV, partiesRowSchema, 'parties-data.csv');

	const parties: PartyInputRow[] = [];
	const partyNameToId = new Map<string, Id>();

	normalized.forEach((row) => {
		const party: PartyInputRow = row as unknown as PartyInputRow;
		parties.push(party);
		partyNameToId.set(row.name, row.id);
	});

	// Sort parties by order to ensure static ordering
	parties.sort((a, b) => a.order - b.order);

	return { parties, partyNameToId };
}

// dlc-data.csv schema -> normalized row
const dlcRowSchema = z
	.object({
		id: intFromString('id'),
		order: intFromString('order'),
		name: z.string().transform((s) => s.trim())
	})
	.transform((row) => ({
		id: row['id'],
		order: row['order'],
		name: row['name']
	})) as z.ZodType<DLCInputRow>;

function loadDLCs() {
	const dlcCSV = readFileSync(join(__dirname, '..', '..', 'data', 'dlc-data.csv'), 'utf-8');
	const rawRecords = parseCsv(dlcCSV, {
		columns: true,
		skip_empty_lines: true,
		trim: true
	}) as Array<Record<string, string>>;
	validateRequiredColumns(rawRecords, ['id', 'order', 'name'], 'dlc-data.csv');
	const normalized = parseTable(dlcCSV, dlcRowSchema, 'dlc-data.csv');
	return { dlcs: normalized };
}

// chapters-data.csv schema -> normalized row
const chaptersRowSchema = z
	.object({
		id: intFromString('id'),
		number: intFromString('number'),
		name: z.string().transform((s) => s.trim()),
		subtitle: z.string().transform((s) => s.trim())
	})
	.transform((row) => ({
		id: row['id'],
		number: row['number'],
		name: row['name'],
		subtitle: row['subtitle']
	})) as z.ZodType<ChapterInputRow>;

function loadChapters() {
	const chaptersCSV = readFileSync(
		join(__dirname, '..', '..', 'data', 'chapters-data.csv'),
		'utf-8'
	);
	const rawRecords = parseCsv(chaptersCSV, {
		columns: true,
		skip_empty_lines: true,
		trim: true
	}) as Array<Record<string, string>>;
	validateRequiredColumns(rawRecords, ['id', 'number', 'name', 'subtitle'], 'chapters-data.csv');
	const normalized = parseTable(chaptersCSV, chaptersRowSchema, 'chapters-data.csv');
	return { chapters: normalized };
}

// cooksta-data.csv schema -> normalized row
const cookstaRowSchema = z
	.object({
		id: intFromString('id'),
		name: z.string().transform((s) => s.trim()),
		rank: intFromString('rank'),
		customers: intFromString('customers'),
		customer_night: intFromString('customer_night'),
		party_customers: intFromString('party_customers'),
		followers: intFromString('followers'),
		recipes: intFromString('recipes'),
		best_taste: intFromString('best_taste'),
		operating_cost: intFromString('operating_cost'),
		kitchen_staff: intFromString('kitchen_staff'),
		serving_staff: intFromString('serving_staff')
	})
	.transform((row) => ({
		id: row['id'],
		name: row['name'],
		rank: row['rank'],
		customers: row['customers'],
		customerNight: row['customer_night'],
		partyCustomers: row['party_customers'],
		followers: row['followers'],
		recipes: row['recipes'],
		bestTaste: row['best_taste'],
		operatingCost: row['operating_cost'],
		kitchenStaff: row['kitchen_staff'],
		servingStaff: row['serving_staff']
	})) as z.ZodType<CookstaInputRow>;

function loadCooksta() {
	const cookstaCSV = readFileSync(join(__dirname, '..', '..', 'data', 'cooksta-data.csv'), 'utf-8');
	const rows = parseCsv(cookstaCSV, {
		columns: false,
		skip_empty_lines: true,
		trim: true,
		relax_column_count: true
	}) as string[][];
	if (rows.length === 0) return { cooksta: [] as CookstaInputRow[] };
	const records = parseCsv(cookstaCSV, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
		relax_column_count: true
	}) as Array<Record<string, string>>;
	const out: CookstaInputRow[] = [];
	for (let i = 0; i < records.length; i++) {
		const rec = records[i];
		const parsed = cookstaRowSchema.safeParse(rec);
		if (!parsed.success) {
			const issues = parsed.error.issues
				.map((iss) => `${iss.path.join('.') || 'value'}: ${iss.message}`)
				.join('; ');
			const rowNum = i + 2;
			throw new Error(`cooksta-data.csv row ${rowNum}: ${issues}`);
		}
		out.push(parsed.data);
	}
	return { cooksta: out };
}

// staff-data.csv schema -> normalized row
const staffRowSchema = z
	.object({
		id: intFromString('id'),
		name: z.string().transform((s) => s.trim()),
		dlc: optionalString,
		image: optionalString,
		hiring_fee: optionalNumber,
		wage_base: optionalNumber,
		raise: optionalNumber,
		wage_max: optionalNumber,
		skill_level3: optionalString,
		cooking_bonus_level3: optionalNumber,
		serving_bonus_level3: optionalNumber,
		appeal_bonus_level3: optionalNumber,
		skill_level7: optionalString,
		cooking_bonus_level7: optionalNumber,
		serving_bonus_level7: optionalNumber,
		cooking_stat_base: optionalNumber,
		serving_stat_base: optionalNumber,
		procure_stat_base: optionalNumber,
		appeal_stat_base: optionalNumber,
		cooking_stat_increment: optionalNumber,
		serving_stat_increment: optionalNumber,
		procure_stat_increment: optionalNumber,
		appeal_stat_increment: optionalNumber,
		cooking_stat_max: optionalNumber,
		serving_stat_max: optionalNumber,
		procure_stat_max: optionalNumber,
		appeal_stat_max: optionalNumber,
		branch_stat_calc: optionalNumber,
		seasonings_min_level20: optionalNumber,
		seasonings_max_level20: optionalNumber,
		seasonings_bonus: optionalNumber,
		branch_rank_max: optionalNumber,
		branch_popularity_max: optionalNumber,
		branch_popularity_max_at_level: optionalNumber
	})
	.transform((row) => ({
		id: row['id'],
		name: row['name'],
		dlc: (row['dlc'] ?? null) as string | null,
		image: (row['image'] ?? null) as string | null,
		hiringFee: row['hiring_fee'] as number | null,
		wageBase: row['wage_base'] as number | null,
		raise: row['raise'] as number | null,
		wageMax: row['wage_max'] as number | null,
		skillLevel3: (row['skill_level3'] ?? null) as string | null,
		cookingBonusLevel3: row['cooking_bonus_level3'] as number | null,
		servingBonusLevel3: row['serving_bonus_level3'] as number | null,
		appealBonusLevel3: row['appeal_bonus_level3'] as number | null,
		skillLevel7: (row['skill_level7'] ?? null) as string | null,
		cookingBonusLevel7: row['cooking_bonus_level7'] as number | null,
		servingBonusLevel7: row['serving_bonus_level7'] as number | null,
		cookingStatBase: row['cooking_stat_base'] as number | null,
		servingStatBase: row['serving_stat_base'] as number | null,
		procureStatBase: row['procure_stat_base'] as number | null,
		appealStatBase: row['appeal_stat_base'] as number | null,
		cookingStatIncrement: row['cooking_stat_increment'] as number | null,
		servingStatIncrement: row['serving_stat_increment'] as number | null,
		procureStatIncrement: row['procure_stat_increment'] as number | null,
		appealStatIncrement: row['appeal_stat_increment'] as number | null,
		cookingStatMax: row['cooking_stat_max'] as number | null,
		servingStatMax: row['serving_stat_max'] as number | null,
		procureStatMax: row['procure_stat_max'] as number | null,
		appealStatMax: row['appeal_stat_max'] as number | null,
		branchStatCalc: row['branch_stat_calc'] as number | null,
		seasoningsMinLevel20: row['seasonings_min_level20'] as number | null,
		seasoningsMaxLevel20: row['seasonings_max_level20'] as number | null,
		seasoningsBonus: row['seasonings_bonus'] as number | null,
		branchRankMax: row['branch_rank_max'] as number | null,
		branchPopularityMax: row['branch_popularity_max'] as number | null,
		branchPopularityMaxAtLevel: row['branch_popularity_max_at_level'] as number | null
	})) as z.ZodType<StaffInputRow>;

function loadStaff() {
	const staffCSV = readFileSync(join(__dirname, '..', '..', 'data', 'staff-data.csv'), 'utf-8');
	const rawRecords = parseCsv(staffCSV, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
		relax_column_count: true
	}) as Array<Record<string, string>>;
	validateRequiredColumns(
		rawRecords,
		[
			'id',
			'name',
			'dlc',
			'image',
			'hiring_fee',
			'wage_base',
			'raise',
			'wage_max',
			'skill_level3',
			'cooking_bonus_level3',
			'serving_bonus_level3',
			'appeal_bonus_level3',
			'skill_level7',
			'cooking_bonus_level7',
			'serving_bonus_level7',
			'cooking_stat_base',
			'serving_stat_base',
			'procure_stat_base',
			'appeal_stat_base',
			'cooking_stat_increment',
			'serving_stat_increment',
			'procure_stat_increment',
			'appeal_stat_increment',
			'cooking_stat_max',
			'serving_stat_max',
			'procure_stat_max',
			'appeal_stat_max',
			'branch_stat_calc',
			'seasonings_min_level20',
			'seasonings_max_level20',
			'seasonings_bonus',
			'branch_rank_max',
			'branch_popularity_max',
			'branch_popularity_max_at_level'
		],
		'staff-data.csv'
	);
	const normalized = parseTable(staffCSV, staffRowSchema, 'staff-data.csv');
	return { staff: normalized };
}

function loadRelationships(
	dishNameToId: Map<string, Id>,
	ingredientNameToId: Map<string, Id>,
	partyNameToId: Map<string, Id>
) {
	// Load party-dish relationships
	const partyDishesCSV = readFileSync(
		join(__dirname, '..', '..', 'data', 'party-dishes-data.csv'),
		'utf-8'
	);
	const rawPartyDishRecords = parseCsv(partyDishesCSV, {
		columns: true,
		skip_empty_lines: true,
		trim: true
	}) as Array<Record<string, string>>;
	validateRequiredColumns(rawPartyDishRecords, ['party', 'dish'], 'party-dishes-data.csv');
	const partyDishRows = parseTable(partyDishesCSV, partyDishesRowSchema, 'party-dishes-data.csv');

	const dishParties: DishParty[] = [];
	for (const row of partyDishRows) {
		const partyId = partyNameToId.get(row.party);
		const dishId = dishNameToId.get(row.dish);
		if (partyId && dishId) {
			dishParties.push({
				dishId: dishId,
				partyId: partyId
			});
		} else {
			console.warn(`\x1b[31mCould not find party "${row.party}" or dish "${row.dish}"\x1b[0m`);
		}
	}

	// Load dish-ingredient relationships
	const dishIngredientsCSV = readFileSync(
		join(__dirname, '..', '..', 'data', 'dish-ingredients-data.csv'),
		'utf-8'
	);
	const rawDishIngRecords = parseCsv(dishIngredientsCSV, {
		columns: true,
		skip_empty_lines: true,
		trim: true
	}) as Array<Record<string, string>>;
	validateRequiredColumns(
		rawDishIngRecords,
		['dish', 'count', 'ingredient', 'levels', 'upgrade_count'],
		'dish-ingredients-data.csv'
	);
	const dishIngredientRows = parseTable(
		dishIngredientsCSV,
		dishIngredientsRowSchema,
		'dish-ingredients-data.csv'
	);

	const dishIngredients: DishIngredient[] = [];
	for (const row of dishIngredientRows) {
		const dishId = dishNameToId.get(row.dish);
		const ingredientId = ingredientNameToId.get(row.ingredient);
		if (dishId && ingredientId) {
			dishIngredients.push({
				dishId: dishId,
				ingredientId: ingredientId,
				count: row.count,
				levels: row.levels,
				upgradeCount: row.upgradeCount
			});
		} else {
			console.warn(
				`\x1b[31mCould not find dish "${row.dish}" or ingredient "${row.ingredient}"\x1b[0m`
			);
		}
	}

	return { dishIngredients, dishParties };
}

export function loadNormalizedData() {
	const { dishes, dishNameToId } = loadDishes();
	const { ingredients, ingredientNameToId } = loadIngredients();
	const { parties, partyNameToId } = loadParties();
	const { cooksta } = loadCooksta();
	const { dlcs } = loadDLCs();
	const { chapters } = loadChapters();
	const { dishIngredients, dishParties } = loadRelationships(
		dishNameToId,
		ingredientNameToId,
		partyNameToId
	);

	const { staff } = loadStaff();

	return {
		dishes,
		ingredients,
		parties,
		dishIngredients,
		dishParties,
		cooksta,
		dlcs,
		chapters,
		staff
	};
}
