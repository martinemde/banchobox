import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { parse as parseCsv } from 'csv-parse/sync';
import { z } from 'zod';
import type {
  Dish,
  Ingredient,
  Party,
  DishIngredient,
  DishParty,
  Id,
  PartyDish,
  EnrichedDish,
  EnrichedIngredient,
  EnrichedParty,
  IngredientLine
} from '../src/lib/types.js';
import { buildGraph } from '../src/lib/graph/index.js';
import { recipeCost, lineCost } from '../src/lib/calc/costs.js';
import { partyPrice } from '../src/lib/calc/price.js';
import { partyProfitPerDish } from '../src/lib/calc/profit.js';

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

function emptyToNullNumber(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  if (v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
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

const optionalNumber = optionalString.transform((s) => s ? Number(s) : null);
const optionalBoolean = optionalString.transform((s) => s ? boolFlag(s) : false);

// Dishes CSV schema -> normalized row (camelCase)
const dishesRowSchema = z
  .object({
    'id': intFromString('id'),
    'name': z.string().transform((s) => s.trim()),
    'image': z.string().transform((s) => s.trim()),
    'max_level': intFromString('max_level'),
    'base_price': intFromString('base_price'),
    'base_taste': intFromString('base_taste'),
    'base_servings': intFromString('base_servings'),
    'final_price': intFromString('final_price'),
    'final_taste': intFromString('final_taste'),
    'final_servings': intFromString('final_servings'),
    'unlock': optionalString,
    'dlc': optionalString,
    'artisans_flames': optionalNumber,
  })
  .passthrough()
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
    artisansFlames: emptyToNullNumber(row['artisans_flames']) as number | null,
  }));

// Ingredients CSV schema -> normalized row (camelCase)
const ingredientsRowSchema = z
  .object({
    'id': intFromString('id'),
    'name': z.string().transform((s) => s.trim()),
    'source': z.string().transform((s) => s.trim()),
    'type': z.string().transform((s) => s.trim()),
    'image': z.string().transform((s) => s.trim()),
    'rank': intFromString('rank'),
    'drone': optionalBoolean,
    'kg': optionalNumber,
    'max_meats': optionalNumber,
    'sell': optionalNumber,
    'day': optionalBoolean,
    'night': optionalBoolean,
    'fog': optionalBoolean,
    'farm': optionalString,
    'jango_purchase': optionalNumber,
    'otto_purchase': optionalNumber,
  })
  .passthrough()
  .transform((row) => ({
    id: row['id'],
    name: row['name'],
    source: row['source'],
    type: row['type'],
    image: row['image'],
    rank: row['rank'],
    kg: emptyToNullNumber(row['kg']),
    maxMeats: emptyToNullNumber(row['max_meats']) as number | null,
    sell: emptyToNullNumber(row['sell']) as number | null,
    drone: row['drone'],
    day: row['day'],
    night: row['night'],
    fog: row['fog'],
    farm: row['farm'] ?? null,
    jangoPurchase: emptyToNullNumber(row['jango_purchase']) as number | null,
    ottoPurchase: emptyToNullNumber(row['otto_purchase']) as number | null,
  }));

// Parties CSV schema -> normalized row (camelCase)
const partiesRowSchema = z
  .object({
    'id': intFromString('id'),
    'order': intFromString('order'),
    'name': z.string().transform((s) => s.trim()),
    'bonus': floatFromString('bonus'),
  })
  .passthrough()
  .transform((row) => ({
    id: row['id'],
    order: row['order'],
    name: row['name'],
    bonus: row['bonus'],
  }));

// Dish-Ingredients CSV schema -> normalized row (camelCase)
const dishIngredientsRowSchema = z
  .object({
    'dish': z.string().transform((s) => s.trim()),
    'count': intFromString('count'),
    'ingredient': z.string().transform((s) => s.trim()),
    'levels': intFromString('levels'),
    'upgrade_count': intFromString('upgrade_count'),
  })
  .passthrough()
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
    'party': z.string().transform((s) => s.trim()),
    'dish': z.string().transform((s) => s.trim()),
  })
  .passthrough()
  .transform((row) => ({
    party: row['party'],
    dish: row['dish'],
  }));

function parseTable<T>(csvContent: string, schema: z.ZodSchema<T>, filename: string): T[] {
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

function validateRequiredColumns(rows: Array<Record<string, string>>, requiredColumns: string[], filename: string) {
  if (rows.length === 0) return;

  const availableColumns = Object.keys(rows[0]);
  const missingColumns = requiredColumns.filter(col => !availableColumns.includes(col));

  if (missingColumns.length > 0) {
    throw new Error(`${filename} is missing required columns: ${missingColumns.join(', ')}. Available columns: ${availableColumns.join(', ')}`);
  }
}

function loadDishes() {
  const dishesCSV = readFileSync(join(__dirname, '..', 'data', 'dishes.csv'), 'utf-8');
  const rawRecords = parseCsv(dishesCSV, { columns: true, skip_empty_lines: true, trim: true }) as Array<Record<string, string>>;
  validateRequiredColumns(rawRecords, [
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
  ], 'dishes.csv');
  const normalized = parseTable(dishesCSV, dishesRowSchema, 'dishes.csv');

  const dishes: Dish[] = [];
  const dishNameToId = new Map<string, Id>();

  normalized.forEach((row) => {
    dishes.push(row as Dish);
    dishNameToId.set(row.name, row.id);
  });

  return { dishes, dishNameToId };
}

function loadIngredients() {
  const ingredientsCSV = readFileSync(join(__dirname, '..', 'data', 'ingredients.csv'), 'utf-8');
  const rawRecords = parseCsv(ingredientsCSV, { columns: true, skip_empty_lines: true, trim: true }) as Array<Record<string, string>>;
  validateRequiredColumns(rawRecords, [
    'id',
    'name',
    'source',
    'type',
    'kg',
    'max_meats',
    'sell',
    'day',
    'night',
    'fog',
  ], 'ingredients.csv');
  const normalized = parseTable(ingredientsCSV, ingredientsRowSchema, 'ingredients.csv');

  const ingredients: Ingredient[] = [];
  const ingredientNameToId = new Map<string, Id>();

  normalized.forEach((row) => {
    ingredients.push(row as Ingredient);
    ingredientNameToId.set(row.name, row.id);
  });

  return { ingredients, ingredientNameToId };
}

function loadParties() {
  const partiesCSV = readFileSync(join(__dirname, '..', 'data', 'parties.csv'), 'utf-8');
  const rawRecords = parseCsv(partiesCSV, { columns: true, skip_empty_lines: true, trim: true }) as Array<Record<string, string>>;
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
  const partyDishesCSV = readFileSync(join(__dirname, '..', 'data', 'party-dishes.csv'), 'utf-8');
  const rawPartyDishRecords = parseCsv(partyDishesCSV, { columns: true, skip_empty_lines: true, trim: true }) as Array<Record<string, string>>;
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
  const dishIngredientsCSV = readFileSync(join(__dirname, '..', 'data', 'dish-ingredients.csv'), 'utf-8');
  const rawDishIngRecords = parseCsv(dishIngredientsCSV, { columns: true, skip_empty_lines: true, trim: true }) as Array<Record<string, string>>;
  validateRequiredColumns(rawDishIngRecords, ['dish', 'count', 'ingredient', 'levels', 'upgrade_count'], 'dish-ingredients.csv');
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

function loadNormalizedData() {
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

function enrichData(
  dishes: Dish[],
  ingredients: Ingredient[],
  parties: Party[],
  dishIngredients: DishIngredient[],
  dishParties: DishParty[]
) {
  const graph = buildGraph(dishes, ingredients, parties, dishIngredients, dishParties);
  const partyDishes: PartyDish[] = [];
  let partyDishIdCounter = 1;

  for (const dishParty of dishParties) {
    const dish = graph.dishById.get(dishParty.dishId);
    const party = graph.partyById.get(dishParty.partyId);

    if (!dish || !party) continue;

    // Get ingredient lines for this dish
    const ingLines: IngredientLine[] = (graph.ingByDishId.get(dish.id) ?? []).map(line => ({
      count: line.count,
      unitCost: graph.ingById.get(line.ingredientId)?.sell ?? null,
    }));

    // Recipe cost is calculated per dish, not per party-dish combination
    const dishPartyPrice = partyPrice(dish, party);
    const dishPartyRevenue = dishPartyPrice * dish.finalServings;
    const dishProfit = partyProfitPerDish(dish, party, ingLines);
    const dishProfitPerServing = dishProfit / dish.finalServings;

    const partyDish: PartyDish = {
      id: partyDishIdCounter++,
      partyId: party.id,
      dishId: dish.id,
      partyPrice: dishPartyPrice,
      partyRevenue: dishPartyRevenue,
      profit: dishProfit,
      profitPerServing: dishProfitPerServing,
    };

    partyDishes.push(partyDish);
  }

  // Create lookup maps for PartyDish entities
  const partyDishById = new Map<Id, PartyDish>();
  const partyDishesByDishId = new Map<Id, PartyDish[]>();
  const partyDishesByPartyId = new Map<Id, PartyDish[]>();

  for (const partyDish of partyDishes) {
    partyDishById.set(partyDish.id, partyDish);

    if (!partyDishesByDishId.has(partyDish.dishId)) {
      partyDishesByDishId.set(partyDish.dishId, []);
    }
    partyDishesByDishId.get(partyDish.dishId)!.push(partyDish);

    if (!partyDishesByPartyId.has(partyDish.partyId)) {
      partyDishesByPartyId.set(partyDish.partyId, []);
    }
    partyDishesByPartyId.get(partyDish.partyId)!.push(partyDish);
  }

  // Enrich dishes with precomputed values
  const enrichedDishes: EnrichedDish[] = dishes.map(dish => {
    // Get ingredient lines for this dish with upgrade counts
    const dishIngredientData = graph.dishIngredients.filter(di => di.dishId === dish.id);
    const ingredientLines = (graph.ingByDishId.get(dish.id) ?? []).map(line => {
      const dishIngredient = dishIngredientData.find(di => di.ingredientId === line.ingredientId);
      const unitCost = graph.ingById.get(line.ingredientId)?.sell ?? null;

      return {
        ingredientId: line.ingredientId,
        count: line.count,
        unitCost,
        lineCost: lineCost(line.count, unitCost),
        upgradeCount: dishIngredient?.upgradeCount ?? null,
      };
    });

    // Calculate recipe cost
    const ingLines: IngredientLine[] = ingredientLines.map(line => ({
      count: line.count,
      unitCost: line.unitCost,
    }));
    const dishRecipeCost = recipeCost(ingLines);

    // Get PartyDish entities for this dish
    const dishPartyDishes = partyDishesByDishId.get(dish.id) ?? [];
    const partyDishIds = dishPartyDishes.map(pd => pd.id);

    // Find best party dish (highest profit)
    const bestPartyDish = dishPartyDishes.reduce((best, current) =>
      (best === null || current.profit > best.profit) ? current : best,
      null as PartyDish | null
    );

    // Calculate pre-computed values to avoid view-level calculations
    const baseRevenue = dish.finalPrice * dish.finalServings;
    const baseProfit = baseRevenue - dishRecipeCost;
    const baseProfitPerServing = baseProfit / dish.finalServings;
    const maxProfitPerServing = bestPartyDish ? bestPartyDish.profit / dish.finalServings : 0;

    // Calculate upgrade cost
    const upgradeCost = ingredientLines.reduce((total, line) => {
      return total + ((line.unitCost || 0) * (line.upgradeCount || 0));
    }, 0);

    // Calculate upgrade break even
    const upgradeBreakEven = upgradeCost > 0 && bestPartyDish ? (bestPartyDish.profit / upgradeCost) : 0;

    // Calculate ingredient count
    const ingredientCount = ingredientLines.reduce((total, line) => total + line.count, 0);

    // Get best party information for flattened access
    const bestParty = bestPartyDish ? graph.partyById.get(bestPartyDish.partyId) : null;
    const bestPartyName = bestParty?.name ?? null;
    const bestPartyBonus = bestParty?.bonus ?? null;
    const bestPartyPrice = bestPartyDish?.partyPrice ?? null;
    const bestPartyRevenue = bestPartyDish?.partyRevenue ?? null;

    const enrichedDish: EnrichedDish = {
      ...dish,
      ingredients: ingredientLines,
      recipeCost: dishRecipeCost,
      partyDishIds,
      bestPartyDishId: bestPartyDish?.id ?? null,
      maxProfitPerDish: bestPartyDish?.profit ?? baseProfitPerServing,
      baseRevenue,
      baseProfit,
      baseProfitPerServing,
      maxProfitPerServing,
      upgradeCost,
      upgradeBreakEven,
      ingredientCount,
      bestPartyName,
      bestPartyBonus,
      bestPartyPrice,
      bestPartyRevenue,
    };

    return enrichedDish;
  });

  // Enrich ingredients
  const enrichedIngredients: EnrichedIngredient[] = ingredients.map(ingredient => {
    const usedInDishes = (graph.dishesByIngredientId.get(ingredient.id) ?? []).map(usage => ({
      dishId: usage.dishId,
      count: usage.count,
    }));

    // Find best PartyDish for this ingredient (highest profit among all dishes that use this ingredient)
    let bestPartyDish: PartyDish | null = null;
    for (const usage of usedInDishes) {
      const dishPartyDishes = partyDishesByDishId.get(usage.dishId) ?? [];
      for (const partyDish of dishPartyDishes) {
        if (bestPartyDish === null || partyDish.profit > bestPartyDish.profit) {
          bestPartyDish = partyDish;
        }
      }
    }

    // Find all parties this ingredient is used for
    const allPartyIds = new Set<Id>();
    for (const usage of usedInDishes) {
      const dishPartyDishes = partyDishesByDishId.get(usage.dishId) ?? [];
      for (const partyDish of dishPartyDishes) {
        allPartyIds.add(partyDish.partyId);
      }
    }

    const enrichedIngredient: EnrichedIngredient = {
      ...ingredient,
      usedIn: usedInDishes,
      bestPartyDishId: bestPartyDish?.id ?? null,
      usedForParties: Array.from(allPartyIds),
    };

    return enrichedIngredient;
  });

  // Enrich parties
  const enrichedParties: EnrichedParty[] = parties.map(party => {
    // Get PartyDish entities for this party, sorted by profit descending
    const partyPartyDishes = (partyDishesByPartyId.get(party.id) ?? [])
      .sort((a, b) => b.profit - a.profit);

    const partyDishIds = partyPartyDishes.map(pd => pd.id);

    const enrichedParty: EnrichedParty = {
      ...party,
      partyDishIds,
    };

    return enrichedParty;
  });

  // Ensure enriched parties maintain static ordering
  enrichedParties.sort((a, b) => a.order - b.order);

  return { enrichedDishes, enrichedIngredients, enrichedParties, partyDishes };
}

function exportData(
  enrichedDishes: EnrichedDish[],
  enrichedIngredients: EnrichedIngredient[],
  enrichedParties: EnrichedParty[],
  partyDishes: PartyDish[]
) {
  const outputDir = join(__dirname, '..', 'static', 'data');

  // Ensure output directory exists
  mkdirSync(outputDir, { recursive: true });

  // Export enriched data with versioning
  const version = 'v1';

  writeFileSync(
    join(outputDir, `dishes.${version}.json`),
    JSON.stringify(enrichedDishes, null, 2)
  );

  writeFileSync(
    join(outputDir, `ingredients.${version}.json`),
    JSON.stringify(enrichedIngredients, null, 2)
  );

  writeFileSync(
    join(outputDir, `parties.${version}.json`),
    JSON.stringify(enrichedParties, null, 2)
  );

  writeFileSync(
    join(outputDir, `party-dishes.${version}.json`),
    JSON.stringify(partyDishes, null, 2)
  );

  // Also maintain legacy format in src/lib for backward compatibility during transition

  // Create simple indices for client-side lookups
  const indices = {
    dishById: Object.fromEntries(enrichedDishes.map(d => [d.id, d])),
    ingredientById: Object.fromEntries(enrichedIngredients.map(i => [i.id, i])),
    partyById: Object.fromEntries(enrichedParties.map(p => [p.id, p])),
    partyDishById: Object.fromEntries(partyDishes.map(pd => [pd.id, pd])),
  };

  writeFileSync(
    join(outputDir, `indices.${version}.json`),
    JSON.stringify(indices, null, 2)
  );

  // Count relationships for logging
  const totalIngredientRelationships = enrichedDishes.reduce((sum, dish) => sum + dish.ingredients.length, 0);
  const totalPartyDishRelationships = partyDishes.length;

  console.log(`${enrichedParties.length}\tParties`);
  console.log(`${partyDishes.length}\tParty-dishes`);
  console.log(`${enrichedDishes.length}\tDishes`);
  console.log(`${totalIngredientRelationships}\tDish-ingredients`);
  console.log(`${enrichedIngredients.length}\tIngredients`);
  console.log(`Data exported to /static/data with version ${version}\n`);
}

// Run the build process
try {
  const { dishes, ingredients, parties, dishIngredients, dishParties } = loadNormalizedData();
  const { enrichedDishes, enrichedIngredients, enrichedParties, partyDishes } = enrichData(
    dishes,
    ingredients,
    parties,
    dishIngredients,
    dishParties
  );
  exportData(enrichedDishes, enrichedIngredients, enrichedParties, partyDishes);
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
