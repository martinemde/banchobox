import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize database
const sqlite = new Database(':memory:'); // In-memory for build process
const db = drizzle(sqlite, { schema });

// Create tables
sqlite.exec(`
  CREATE TABLE dishes (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    unlock_condition TEXT,
    dlc TEXT,
    final_level INTEGER NOT NULL,
    final_taste INTEGER NOT NULL,
    initial_price INTEGER NOT NULL,
    final_price INTEGER NOT NULL,
    servings INTEGER NOT NULL
  );

  CREATE TABLE ingredients (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    source TEXT,
    type TEXT,
    drone INTEGER NOT NULL,
    kg REAL,
    max_meats INTEGER,
    cost INTEGER
  );

  CREATE TABLE parties (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    bonus REAL NOT NULL
  );

  CREATE TABLE dish_parties (
    id INTEGER PRIMARY KEY,
    dish_id INTEGER NOT NULL REFERENCES dishes(id),
    party_id INTEGER NOT NULL REFERENCES parties(id)
  );

  CREATE TABLE dish_ingredients (
    id INTEGER PRIMARY KEY,
    dish_id INTEGER NOT NULL REFERENCES dishes(id),
    ingredient_id INTEGER NOT NULL REFERENCES ingredients(id),
    count INTEGER NOT NULL,
    levels INTEGER,
    upgrade_count INTEGER
  );
`);

function parseCSV(csvContent: string, filename?: string): Array<Record<string, string>> {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    console.warn(`${filename || 'CSV file'} has no data rows`);
    return [];
  }
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  
  console.log(`${filename || 'CSV file'} headers: ${headers.join(', ')}`);
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: Record<string, string> = {};
    
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j]?.trim() || '';
    }
    
    rows.push(row);
  }
  
  return rows;
}

function validateRequiredColumns(rows: Array<Record<string, string>>, requiredColumns: string[], filename: string) {
  if (rows.length === 0) return;
  
  const availableColumns = Object.keys(rows[0]);
  const missingColumns = requiredColumns.filter(col => !availableColumns.includes(col));
  
  if (missingColumns.length > 0) {
    throw new Error(`${filename} is missing required columns: ${missingColumns.join(', ')}. Available columns: ${availableColumns.join(', ')}`);
  }
}

async function loadData() {
  console.log('Loading data into database...');
  
  // Load dishes
  const dishesCSV = readFileSync(join(__dirname, '..', 'data', 'dishes.csv'), 'utf-8');
  const dishRows = parseCSV(dishesCSV, 'dishes.csv');
  validateRequiredColumns(dishRows, ['Dish Name', 'Final Level', 'Final Taste', 'Initial Price', 'Final Price', 'Servings'], 'dishes.csv');
  
  for (const row of dishRows) {
    if (row['Dish Name']) {
      await db.insert(schema.dishes).values({
        name: row['Dish Name'] || '',
        unlockCondition: row['Unlock Condition'] || null,
        dlc: row['DLC'] || null,
        finalLevel: parseInt(row['Final Level']) || 0,
        finalTaste: parseInt(row['Final Taste']) || 0,
        initialPrice: parseInt(row['Initial Price']) || 0,
        finalPrice: parseInt(row['Final Price']) || 0,
        servings: parseInt(row['Servings']) || 0,
      });
    }
  }

  // Load ingredients  
  const ingredientsCSV = readFileSync(join(__dirname, '..', 'data', 'ingredients.csv'), 'utf-8');
  const ingredientRows = parseCSV(ingredientsCSV, 'ingredients.csv');
  validateRequiredColumns(ingredientRows, ['Ingredient'], 'ingredients.csv');

  for (const row of ingredientRows) {
    if (row['Ingredient']) {
      await db.insert(schema.ingredients).values({
        name: row['Ingredient'] || '',
        source: row['Source'] || null,
        type: row['Type'] || null,
        drone: row['Drone'] === 'checked',
        kg: parseFloat(row['kg']) || null,
        maxMeats: parseInt(row['Max Meats']) || null,
        cost: parseInt(row['Cost']) || null,
      });
    }
  }

  // Load parties
  const partiesCSV = readFileSync(join(__dirname, '..', 'data', 'parties.csv'), 'utf-8');
  const partyRows = parseCSV(partiesCSV, 'parties.csv');
  validateRequiredColumns(partyRows, ['Party', 'Bonus'], 'parties.csv');

  for (const row of partyRows) {
    if (row['Party']) {
      await db.insert(schema.parties).values({
        name: row['Party'] || '',
        bonus: parseFloat(row['Bonus']) || 0,
      });
    }
  }

  // Load party-dish relationships
  const partyDishesCSV = readFileSync(join(__dirname, '..', 'data', 'party-dishes.csv'), 'utf-8');
  const partyDishRows = parseCSV(partyDishesCSV, 'party-dishes.csv');
  validateRequiredColumns(partyDishRows, ['Party', 'Dish'], 'party-dishes.csv');

  for (const row of partyDishRows) {
    if (row['Party'] && row['Dish'] && row['Dish'].trim()) {
      const partyName = row['Party'].trim();
      const dishName = row['Dish'].trim();

      // Find party and dish IDs
      const party = await db.select().from(schema.parties).where(eq(schema.parties.name, partyName)).limit(1);
      const dish = await db.select().from(schema.dishes).where(eq(schema.dishes.name, dishName)).limit(1);

      if (party.length > 0 && dish.length > 0) {
        await db.insert(schema.dishParties).values({
          dishId: dish[0].id,
          partyId: party[0].id,
        });
      } else {
        console.warn(`Could not find party "${partyName}" or dish "${dishName}"`);
      }
    }
  }

  // Load dish-ingredient relationships
  const dishIngredientsCSV = readFileSync(join(__dirname, '..', 'data', 'dish-ingredients.csv'), 'utf-8');
  const dishIngredientRows = parseCSV(dishIngredientsCSV, 'dish-ingredients.csv');
  validateRequiredColumns(dishIngredientRows, ['Dish', 'Count', 'Ingredient'], 'dish-ingredients.csv');

  for (const row of dishIngredientRows) {
    if (row['Dish'] && row['Count'] && row['Ingredient'] && row['Ingredient'].trim()) {
      const dishName = row['Dish'].trim();
      const count = parseInt(row['Count']) || 0;
      const ingredientName = row['Ingredient'].trim();
      const levels = parseInt(row['Levels']) || null;
      const upgradeCount = parseInt(row['Upgrade Count']) || null;

      const dish = await db.select().from(schema.dishes).where(eq(schema.dishes.name, dishName)).limit(1);
      const ingredient = await db.select().from(schema.ingredients).where(eq(schema.ingredients.name, ingredientName)).limit(1);

      if (dish.length > 0 && ingredient.length > 0) {
        await db.insert(schema.dishIngredients).values({
          dishId: dish[0].id,
          ingredientId: ingredient[0].id,
          count: count,
          levels: levels,
          upgradeCount: upgradeCount,
        });
      } else {
        console.warn(`Could not find dish "${dishName}" or ingredient "${ingredientName}"`);
      }
    }
  }
}

async function exportData() {
  console.log('Exporting data to JSON...');

  // Export dishes with party relationships
  const dishesWithParties = await db
    .select({
      id: schema.dishes.id,
      name: schema.dishes.name,
      unlockCondition: schema.dishes.unlockCondition,
      dlc: schema.dishes.dlc,
      finalLevel: schema.dishes.finalLevel,
      finalTaste: schema.dishes.finalTaste,
      initialPrice: schema.dishes.initialPrice,
      finalPrice: schema.dishes.finalPrice,
      servings: schema.dishes.servings,
      partyName: schema.parties.name,
    })
    .from(schema.dishes)
    .leftJoin(schema.dishParties, eq(schema.dishes.id, schema.dishParties.dishId))
    .leftJoin(schema.parties, eq(schema.dishParties.partyId, schema.parties.id));

  // Group by dish and collect parties
  const dishesMap = new Map();
  for (const row of dishesWithParties) {
    if (!dishesMap.has(row.id)) {
      dishesMap.set(row.id, {
        name: row.name,
        unlockCondition: row.unlockCondition,
        dlc: row.dlc,
        finalLevel: row.finalLevel,
        finalTaste: row.finalTaste,
        initialPrice: row.initialPrice,
        finalPrice: row.finalPrice,
        servings: row.servings,
        parties: [],
        ingredients: [],
      });
    }
    if (row.partyName) {
      dishesMap.get(row.id).parties.push(row.partyName);
    }
  }

  // Add ingredient relationships to dishes
  const dishesWithIngredients = await db
    .select({
      dishId: schema.dishIngredients.dishId,
      ingredientName: schema.ingredients.name,
      count: schema.dishIngredients.count,
      levels: schema.dishIngredients.levels,
      upgradeCount: schema.dishIngredients.upgradeCount,
    })
    .from(schema.dishIngredients)
    .leftJoin(schema.ingredients, eq(schema.dishIngredients.ingredientId, schema.ingredients.id));

  for (const row of dishesWithIngredients) {
    if (dishesMap.has(row.dishId) && row.ingredientName) {
      dishesMap.get(row.dishId).ingredients.push({
        name: row.ingredientName,
        count: row.count,
        levels: row.levels,
        upgradeCount: row.upgradeCount,
      });
    }
  }

  // Export parties with dish relationships
  const partiesWithDishes = await db
    .select({
      id: schema.parties.id,
      name: schema.parties.name,
      bonus: schema.parties.bonus,
      dishName: schema.dishes.name,
    })
    .from(schema.parties)
    .leftJoin(schema.dishParties, eq(schema.parties.id, schema.dishParties.partyId))
    .leftJoin(schema.dishes, eq(schema.dishParties.dishId, schema.dishes.id));

  // Group by party and collect dishes
  const partiesMap = new Map();
  for (const row of partiesWithDishes) {
    if (!partiesMap.has(row.id)) {
      partiesMap.set(row.id, {
        name: row.name,
        bonus: row.bonus,
        dishes: [],
      });
    }
    if (row.dishName) {
      partiesMap.get(row.id).dishes.push(row.dishName);
    }
  }

  // Export ingredients (no relationships yet)
  const ingredientsList = await db.select().from(schema.ingredients);

  // Write files
  const outputDir = join(__dirname, '..', 'src', 'lib');

  writeFileSync(
    join(outputDir, 'dishes.json'),
    JSON.stringify(Array.from(dishesMap.values()), null, 2)
  );

  writeFileSync(
    join(outputDir, 'parties.json'),
    JSON.stringify(Array.from(partiesMap.values()), null, 2)
  );

  writeFileSync(
    join(outputDir, 'ingredients.json'),
    JSON.stringify(ingredientsList.map(({ id, ...rest }) => rest), null, 2)
  );

  // Count total ingredient relationships
  const totalIngredientRelationships = Array.from(dishesMap.values())
    .reduce((sum, dish) => sum + dish.ingredients.length, 0);

  console.log(`Exported ${dishesMap.size} dishes, ${partiesMap.size} parties, ${ingredientsList.length} ingredients`);
  console.log(`Total dish-ingredient relationships: ${totalIngredientRelationships}`);
}

// Run the build process
try {
  await loadData();
  await exportData();
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
