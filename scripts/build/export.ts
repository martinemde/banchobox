import { mkdirSync, writeFileSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Dish, EnrichedParty, Ingredient, PartyDish, EntityBundle } from '../../src/lib/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function exportData(args: {
  dishesBundle: EntityBundle<Dish>;
  ingredientsBundle: EntityBundle<Ingredient>;
  partiesBundle: EntityBundle<EnrichedParty>;
  partyDishesBundle: EntityBundle<PartyDish>;
}) {
  const { dishesBundle, ingredientsBundle, partiesBundle, partyDishesBundle } = args;
  const outputDir = join(__dirname, '..', '..', 'src', 'lib', 'data');
  const thumbnailsSrcDir = join(__dirname, '..', '..', 'src', 'lib', 'images', 'thumbnails');
  const thumbnailsOutDir = join(__dirname, '..', '..', 'static', 'images', 'thumbnails');

  mkdirSync(outputDir, { recursive: true });
  mkdirSync(thumbnailsOutDir, { recursive: true });

  const version = 'v1';

  // Ensure pixel art thumbnails are available at stable public URLs
  cpSync(thumbnailsSrcDir, thumbnailsOutDir, { recursive: true });

  // Overwrite v1 files with bundled forms where applicable
  writeFileSync(join(outputDir, `dishes.${version}.json`), JSON.stringify(dishesBundle, null, 2));
  writeFileSync(join(outputDir, `ingredients.${version}.json`), JSON.stringify(ingredientsBundle, null, 2));
  writeFileSync(join(outputDir, `parties.${version}.json`), JSON.stringify(partiesBundle, null, 2));
  writeFileSync(join(outputDir, `party-dishes.${version}.json`), JSON.stringify(partyDishesBundle, null, 2));

  console.log(`${partiesBundle.rows.length}\tParties`);
  console.log(`${partyDishesBundle.rows.length}\tParty-dishes`);
  console.log(`${dishesBundle.rows.length}\tDishes`);
  console.log(`${ingredientsBundle.rows.length}\tIngredients`);
  console.log(`Data exported to /src/lib/data with version ${version}\n`);
}
