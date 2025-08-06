import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface DishData {
  name: string;
  unlockCondition?: string;
  dlc?: string;
  finalLevel: number;
  finalTaste: number;
  initialPrice: number;
  finalPrice: number;
  servings: number;
  parties: string[];
  ingredients: DishIngredient[];
}

interface IngredientData {
  name: string;
  source?: string;
  type?: string;
  drone: boolean;
  kg?: number;
  maxMeats?: number;
  cost?: number;
}

interface PartyData {
  name: string;
  bonus: number;
  dishes: string[];
}

interface DishIngredient {
  name: string;
  count: number;
  levels?: number;
  upgradeCount?: number;
}

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

function loadData() {
  console.log('Loading data from CSV files...');

  // Load dishes
  const dishesCSV = readFileSync(join(__dirname, '..', 'data', 'dishes.csv'), 'utf-8');
  const dishRows = parseCSV(dishesCSV, 'dishes.csv');
  validateRequiredColumns(dishRows, ['Dish Name', 'Final Level', 'Final Taste', 'Initial Price', 'Final Price', 'Servings'], 'dishes.csv');

  const dishes = new Map<string, DishData>();
  for (const row of dishRows) {
    if (row['Dish Name']) {
      dishes.set(row['Dish Name'], {
        name: row['Dish Name'],
        unlockCondition: row['Unlock Condition'] || undefined,
        dlc: row['DLC'] || undefined,
        finalLevel: parseInt(row['Final Level']) || 0,
        finalTaste: parseInt(row['Final Taste']) || 0,
        initialPrice: parseInt(row['Initial Price']) || 0,
        finalPrice: parseInt(row['Final Price']) || 0,
        servings: parseInt(row['Servings']) || 0,
        parties: [],
        ingredients: [],
      });
    }
  }

  // Load ingredients
  const ingredientsCSV = readFileSync(join(__dirname, '..', 'data', 'ingredients.csv'), 'utf-8');
  const ingredientRows = parseCSV(ingredientsCSV, 'ingredients.csv');
  validateRequiredColumns(ingredientRows, ['Ingredient'], 'ingredients.csv');

  const ingredients = new Map<string, IngredientData>();
  for (const row of ingredientRows) {
    if (row['Ingredient']) {
      ingredients.set(row['Ingredient'], {
        name: row['Ingredient'],
        source: row['Source'] || undefined,
        type: row['Type'] || undefined,
        drone: row['Drone'] === 'checked',
        kg: parseFloat(row['kg']) || undefined,
        maxMeats: parseInt(row['Max Meats']) || undefined,
        cost: parseInt(row['Cost']) || undefined,
      });
    }
  }

  // Load parties
  const partiesCSV = readFileSync(join(__dirname, '..', 'data', 'parties.csv'), 'utf-8');
  const partyRows = parseCSV(partiesCSV, 'parties.csv');
  validateRequiredColumns(partyRows, ['Party', 'Bonus'], 'parties.csv');

  const parties = new Map<string, PartyData>();
  for (const row of partyRows) {
    if (row['Party']) {
      parties.set(row['Party'], {
        name: row['Party'],
        bonus: parseFloat(row['Bonus']) || 0,
        dishes: [],
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

      const party = parties.get(partyName);
      const dish = dishes.get(dishName);

      if (party && dish) {
        dish.parties.push(partyName);
        party.dishes.push(dishName);
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
      const levels = parseInt(row['Levels']) || undefined;
      const upgradeCount = parseInt(row['Upgrade Count']) || undefined;

      const dish = dishes.get(dishName);
      const ingredient = ingredients.get(ingredientName);

      if (dish && ingredient) {
        dish.ingredients.push({
          name: ingredientName,
          count: count,
          levels: levels,
          upgradeCount: upgradeCount,
        });
      } else {
        console.warn(`Could not find dish "${dishName}" or ingredient "${ingredientName}"`);
      }
    }
  }

  return { dishes, ingredients, parties };
}

function exportData(dishes: Map<string, DishData>, ingredients: Map<string, IngredientData>, parties: Map<string, PartyData>) {
  console.log('Exporting data to JSON...');

  const outputDir = join(__dirname, '..', 'src', 'lib');

  // Export dishes
  writeFileSync(
    join(outputDir, 'dishes.json'),
    JSON.stringify(Array.from(dishes.values()), null, 2)
  );

  // Export parties
  writeFileSync(
    join(outputDir, 'parties.json'),
    JSON.stringify(Array.from(parties.values()), null, 2)
  );

  // Export ingredients
  writeFileSync(
    join(outputDir, 'ingredients.json'),
    JSON.stringify(Array.from(ingredients.values()), null, 2)
  );

  // Count total ingredient relationships
  const totalIngredientRelationships = Array.from(dishes.values())
    .reduce((sum, dish) => sum + dish.ingredients.length, 0);

  console.log(`Exported ${dishes.size} dishes, ${parties.size} parties, ${ingredients.size} ingredients`);
  console.log(`Total dish-ingredient relationships: ${totalIngredientRelationships}`);
}

// Run the build process
try {
  const { dishes, ingredients, parties } = loadData();
  exportData(dishes, ingredients, parties);
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
