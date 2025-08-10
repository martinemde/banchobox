import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Dish, Ingredient, EnrichedParty, PartyDish } from '../../src/lib/types.js';
import { buildDishesBundle } from './dish_bundle.js';
import { buildIngredientsBundle } from './ingredient_bundle.js';
import { buildPartiesBundle } from './party_bundle.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function exportData(
  dishes: Dish[],
  ingredients: Ingredient[],
  parties: EnrichedParty[],
  partyDishes: PartyDish[]
) {
  const outputDir = join(__dirname, '..', '..', 'static', 'data');

  mkdirSync(outputDir, { recursive: true });

  const version = 'v1';

  const dishesBundle = buildDishesBundle(dishes);
  const ingredientsBundle = buildIngredientsBundle(ingredients);
  const partiesBundle = buildPartiesBundle(parties, partyDishes);

  // Overwrite v1 files with bundled forms where applicable
  writeFileSync(join(outputDir, `dishes.${version}.json`), JSON.stringify(dishesBundle, null, 2));
  writeFileSync(join(outputDir, `ingredients.${version}.json`), JSON.stringify(ingredientsBundle, null, 2));
  writeFileSync(join(outputDir, `parties.${version}.json`), JSON.stringify(partiesBundle, null, 2));
  writeFileSync(join(outputDir, `party-dishes.${version}.json`), JSON.stringify(partyDishes, null, 2));

  const totalIngredientRelationships = dishes.reduce((sum, dish) => sum + dish.ingredients.length, 0);

  console.log(`${parties.length}\tParties`);
  console.log(`${partyDishes.length}\tParty-dishes`);
  console.log(`${dishes.length}\tDishes`);
  console.log(`${totalIngredientRelationships}\tDish-ingredients`);
  console.log(`${ingredients.length}\tIngredients`);
  console.log(`Data exported to /static/data with version ${version}\n`);
}
