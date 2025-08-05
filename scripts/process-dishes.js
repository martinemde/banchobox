import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function processPartyDishes() {
  const csvPath = join(__dirname, '..', 'data', 'party-dishes.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');

  const lines = csvContent.trim().split('\n');
  const partyDishes = new Map();

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');

    if (values.length >= 2 && values[0] && values[1]) {
      const party = values[0].trim();
      const dish = values[1].trim();

      if (!partyDishes.has(party)) {
        partyDishes.set(party, []);
      }
      partyDishes.get(party).push(dish);
    }
  }

  return partyDishes;
}

function processDishes(partyDishMap) {
  const csvPath = join(__dirname, '..', 'data', 'dishes.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');

  const lines = csvContent.trim().split('\n');
  const dishes = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');

    if (values.length >= 8 && values[0]) {
      const dishName = values[0];
      const parties = [];

      // Find which parties this dish belongs to
      for (const [party, dishList] of partyDishMap.entries()) {
        if (dishList.includes(dishName)) {
          parties.push(party);
        }
      }

      const dish = {
        name: dishName || '',
        unlockCondition: values[1] || '',
        dlc: values[2] || '',
        finalLevel: parseInt(values[3]) || 0,
        finalTaste: parseInt(values[4]) || 0,
        initialPrice: parseInt(values[5]) || 0,
        finalPrice: parseInt(values[6]) || 0,
        servings: parseInt(values[7]) || 0,
        parties: parties
      };

      dishes.push(dish);
    }
  }

  const outputPath = join(__dirname, '..', 'src', 'lib', 'dishes.json');
  writeFileSync(outputPath, JSON.stringify(dishes, null, 2));

  console.log(`Processed ${dishes.length} dishes to ${outputPath}`);
  return dishes;
}

function processIngredients() {
  const csvPath = join(__dirname, '..', 'data', 'ingredients.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');

  const lines = csvContent.trim().split('\n');
  const ingredients = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');

    if (values.length >= 7 && values[0]) {
      const ingredient = {
        name: values[0] || '',
        source: values[1] || '',
        type: values[2] || '',
        drone: values[3] === 'checked',
        kg: parseFloat(values[4]) || 0,
        maxMeats: parseInt(values[5]) || 0,
        cost: parseInt(values[6]) || 0
      };

      ingredients.push(ingredient);
    }
  }

  const outputPath = join(__dirname, '..', 'src', 'lib', 'ingredients.json');
  writeFileSync(outputPath, JSON.stringify(ingredients, null, 2));

  console.log(`Processed ${ingredients.length} ingredients to ${outputPath}`);
  return ingredients;
}

function processParties(partyDishMap) {
  const csvPath = join(__dirname, '..', 'data', 'parties.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');

  const lines = csvContent.trim().split('\n');
  const parties = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');

    if (values.length >= 2 && values[0]) {
      const partyName = values[0];
      const dishes = partyDishMap.get(partyName) || [];

      const party = {
        name: partyName || '',
        bonus: parseFloat(values[1]) || 0,
        dishes: dishes
      };

      parties.push(party);
    }
  }

  const outputPath = join(__dirname, '..', 'src', 'lib', 'parties.json');
  writeFileSync(outputPath, JSON.stringify(parties, null, 2));

  console.log(`Processed ${parties.length} parties to ${outputPath}`);
  return parties;
}

// Process party-dish relationships first, then use them in other processing
const partyDishMap = processPartyDishes();
processDishes(partyDishMap);
processIngredients();
processParties(partyDishMap);
