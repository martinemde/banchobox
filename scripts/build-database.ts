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

async function loadData() {
  console.log('Loading data into database...');

  // Load dishes
  const dishesCSV = readFileSync(join(__dirname, '..', 'data', 'dishes.csv'), 'utf-8');
  const dishLines = dishesCSV.trim().split('\n').slice(1);

  for (const line of dishLines) {
    const values = line.split(',');
    if (values.length >= 8 && values[0]) {
      await db.insert(schema.dishes).values({
        name: values[0] || '',
        unlockCondition: values[1] || null,
        dlc: values[2] || null,
        finalLevel: parseInt(values[3]) || 0,
        finalTaste: parseInt(values[4]) || 0,
        initialPrice: parseInt(values[5]) || 0,
        finalPrice: parseInt(values[6]) || 0,
        servings: parseInt(values[7]) || 0,
      });
    }
  }

  // Load ingredients
  const ingredientsCSV = readFileSync(join(__dirname, '..', 'data', 'ingredients.csv'), 'utf-8');
  const ingredientLines = ingredientsCSV.trim().split('\n').slice(1);

  for (const line of ingredientLines) {
    const values = line.split(',');
    if (values.length >= 7 && values[0]) {
      await db.insert(schema.ingredients).values({
        name: values[0] || '',
        source: values[1] || null,
        type: values[2] || null,
        drone: values[3] === 'checked',
        kg: parseFloat(values[4]) || null,
        maxMeats: parseInt(values[5]) || null,
        cost: parseInt(values[6]) || null,
      });
    }
  }

  // Load parties
  const partiesCSV = readFileSync(join(__dirname, '..', 'data', 'parties.csv'), 'utf-8');
  const partyLines = partiesCSV.trim().split('\n').slice(1);

  for (const line of partyLines) {
    const values = line.split(',');
    if (values.length >= 2 && values[0]) {
      await db.insert(schema.parties).values({
        name: values[0] || '',
        bonus: parseFloat(values[1]) || 0,
      });
    }
  }

  // Load party-dish relationships
  const partyDishesCSV = readFileSync(join(__dirname, '..', 'data', 'party-dishes.csv'), 'utf-8');
  const partyDishLines = partyDishesCSV.trim().split('\n').slice(1);

  for (const line of partyDishLines) {
    const values = line.split(',');
    if (values.length >= 2 && values[0] && values[1] && values[1].trim()) {
      const partyName = values[0].trim();
      const dishName = values[1].trim();

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
  const dishIngredientLines = dishIngredientsCSV.trim().split('\n').slice(1);

  for (const line of dishIngredientLines) {
    const values = line.split(',');
    // Structure: Dish,Count,Ingredient,Levels,Upgrade Count
    if (values.length >= 5 && values[0] && values[1] && values[2] && values[2].trim()) {
      const dishName = values[0].trim();
      const count = parseInt(values[1]) || 0;
      const ingredientName = values[2].trim();
      const levels = parseInt(values[3]) || null;
      const upgradeCount = parseInt(values[4]) || null;

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
