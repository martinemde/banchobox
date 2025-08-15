import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseCsv } from 'csv-parse/sync';
import { z } from 'zod';
import type {
  BasicDish,
  BasicIngredient,
  Party,
  DishIngredient,
  DishParty,
  Id,
} from '../../src/lib/types.js';

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
const optionalBoolean = optionalString.transform((s) => (s ? boolFlag(s) : false));

// Dishes CSV schema -> normalized row (camelCase)
const dishesRowSchema = z
  .object({
    id: intFromString('id'),
    name: z.string().transform((s) => s.trim()),
    image: z.string().transform((s) => s.trim()),
    max_level: intFromString('max_level'),
    base_price: intFromString('base_price'),
    base_taste: intFromString('base_taste'),
    base_servings: intFromString('base_servings'),
    final_price: intFromString('final_price'),
    final_taste: intFromString('final_taste'),
    final_servings: intFromString('final_servings'),
    unlock: optionalString,
    dlc: optionalString,
    artisans_flames: optionalNumber,
  })
  .transform((row) => ({
    id: row['id'],
    name: row['name'],
    image: row['image'],
    maxLevel: row['max_level'],
    basePrice: row['base_price'],
    baseTaste: row['base_taste'],
    baseServings: row['base_servings'],
    finalPrice: row['final_price'],
    finalTaste: row['final_taste'],
    finalServings: row['final_servings'],
    unlock: row['unlock'] ?? null,
    dlc: row['dlc'] ?? null,
    artisansFlames: row['artisans_flames'] as number | null,
  }));

// Ingredients CSV schema -> normalized row (camelCase)
const ingredientsRowSchema = z
  .object({
    id: intFromString('id'),
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
    type: z.string().transform((s) => s.trim()),
  })
  .transform((row) => ({
    id: row['id'],
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
    type: row['type'],
  }));

// Parties CSV schema -> normalized row (camelCase)
const partiesRowSchema = z
  .object({
    id: intFromString('id'),
    order: intFromString('order'),
    name: z.string().transform((s) => s.trim()),
    bonus: floatFromString('bonus'),
  })
  .transform((row) => ({
    id: row['id'],
    order: row['order'],
    name: row['name'],
    bonus: row['bonus'],
  }));

// Dish-Ingredients CSV schema -> normalized row (camelCase)
const dishIngredientsRowSchema = z
  .object({
    dish: z.string().transform((s) => s.trim()),
    count: intFromString('count'),
    ingredient: z.string().transform((s) => s.trim()),
    levels: intFromString('levels'),
    upgrade_count: intFromString('upgrade_count'),
  })
  .transform((row) => ({
    dish: row['dish'],
    ingredient: row['ingredient'],
    count: row['count'],
    levels: row['levels'],
    upgradeCount: row['upgrade_count'],
  }));

// Party-Dishes CSV schema -> normalized row
const partyDishesRowSchema = z
  .object({
    party: z.string().transform((s) => s.trim()),
    dish: z.string().transform((s) => s.trim()),
  })
  .transform((row) => ({
    party: row['party'],
    dish: row['dish'],
  }));

function parseTable<T>(csvContent: string, schema: z.ZodType<T>, filename: string): T[] {
  const records = parseCsv(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
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
  const dishesCSV = readFileSync(join(__dirname, '..', '..', 'data', 'dishes.csv'), 'utf-8');
  const rawRecords = parseCsv(dishesCSV, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, string>>;
  validateRequiredColumns(
    rawRecords,
    [
      'id',
      'name',
      'max_level',
      'base_price',
      'base_taste',
      'base_servings',
      'final_price',
      'final_taste',
      'final_servings',
      'unlock',
      'dlc',
      'artisans_flames',
      'image',
    ],
    'dishes.csv'
  );
  const normalized = parseTable(dishesCSV, dishesRowSchema, 'dishes.csv');

  const dishes: BasicDish[] = [];
  const dishNameToId = new Map<string, Id>();

  normalized.forEach((row) => {
    dishes.push(row as BasicDish);
    dishNameToId.set(row.name, row.id);
  });

  return { dishes, dishNameToId };
}

function loadIngredients() {
  const ingredientsCSV = readFileSync(join(__dirname, '..', '..', 'data', 'ingredients.csv'), 'utf-8');
  const rawRecords = parseCsv(ingredientsCSV, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, string>>;
  validateRequiredColumns(
    rawRecords,
    ['id', 'name', 'source', 'type', 'kg', 'max_meats', 'sell', 'day', 'night', 'fog'],
    'ingredients.csv'
  );
  const normalized = parseTable(ingredientsCSV, ingredientsRowSchema, 'ingredients.csv');

  const ingredients: BasicIngredient[] = [];
  const ingredientNameToId = new Map<string, Id>();

  normalized.forEach((row) => {
    ingredients.push(row as BasicIngredient);
    ingredientNameToId.set(row.name, row.id);
  });

  return { ingredients, ingredientNameToId };
}

function loadParties() {
  const partiesCSV = readFileSync(join(__dirname, '..', '..', 'data', 'parties.csv'), 'utf-8');
  const rawRecords = parseCsv(partiesCSV, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, string>>;
  validateRequiredColumns(rawRecords, ['id', 'order', 'name', 'bonus'], 'parties.csv');
  const normalized = parseTable(partiesCSV, partiesRowSchema, 'parties.csv');

  const parties: Party[] = [];
  const partyNameToId = new Map<string, Id>();

  normalized.forEach((row) => {
    const party: Party = row as unknown as Party;
    parties.push(party);
    partyNameToId.set(row.name, row.id);
  });

  // Sort parties by order to ensure static ordering
  parties.sort((a, b) => a.order - b.order);

  return { parties, partyNameToId };
}

function loadRelationships(
  dishNameToId: Map<string, Id>,
  ingredientNameToId: Map<string, Id>,
  partyNameToId: Map<string, Id>
) {
  // Load party-dish relationships
  const partyDishesCSV = readFileSync(join(__dirname, '..', '..', 'data', 'party-dishes.csv'), 'utf-8');
  const rawPartyDishRecords = parseCsv(partyDishesCSV, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, string>>;
  validateRequiredColumns(rawPartyDishRecords, ['party', 'dish'], 'party-dishes.csv');
  const partyDishRows = parseTable(partyDishesCSV, partyDishesRowSchema, 'party-dishes.csv');

  const dishParties: DishParty[] = [];
  for (const row of partyDishRows) {
    const partyId = partyNameToId.get(row.party);
    const dishId = dishNameToId.get(row.dish);
    if (partyId && dishId) {
      dishParties.push({
        dishId: dishId,
        partyId: partyId,
      });
    } else {
      console.warn(`\x1b[31mCould not find party "${row.party}" or dish "${row.dish}"\x1b[0m`);
    }
  }

  // Load dish-ingredient relationships
  const dishIngredientsCSV = readFileSync(join(__dirname, '..', '..', 'data', 'dish-ingredients.csv'), 'utf-8');
  const rawDishIngRecords = parseCsv(dishIngredientsCSV, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, string>>;
  validateRequiredColumns(
    rawDishIngRecords,
    ['dish', 'count', 'ingredient', 'levels', 'upgrade_count'],
    'dish-ingredients.csv'
  );
  const dishIngredientRows = parseTable(dishIngredientsCSV, dishIngredientsRowSchema, 'dish-ingredients.csv');

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
        upgradeCount: row.upgradeCount,
      });
    } else {
      console.warn(`\x1b[31mCould not find dish "${row.dish}" or ingredient "${row.ingredient}"\x1b[0m`);
    }
  }

  return { dishIngredients, dishParties };
}

export function loadNormalizedData() {
  const { dishes, dishNameToId } = loadDishes();
  const { ingredients, ingredientNameToId } = loadIngredients();
  const { parties, partyNameToId } = loadParties();
  const { dishIngredients, dishParties } = loadRelationships(
    dishNameToId,
    ingredientNameToId,
    partyNameToId
  );

  return { dishes, ingredients, parties, dishIngredients, dishParties };
}
