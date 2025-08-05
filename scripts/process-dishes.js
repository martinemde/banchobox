import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function processDishes() {
  const csvPath = join(__dirname, '..', 'data', 'dishes.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');

  const lines = csvContent.trim().split('\n');
  const dishes = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');

    if (values.length >= 8 && values[0]) {
      const dish = {
        name: values[0] || '',
        unlockCondition: values[1] || '',
        dlc: values[2] || '',
        finalLevel: parseInt(values[3]) || 0,
        finalTaste: parseInt(values[4]) || 0,
        initialPrice: parseInt(values[5]) || 0,
        finalPrice: parseInt(values[6]) || 0,
        servings: parseInt(values[7]) || 0
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

processDishes();
processIngredients();
