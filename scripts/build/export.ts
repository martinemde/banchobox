import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	Dish,
	PartyRecord,
	Ingredient,
	PartyDish,
	EntityBundle,
	CookstaTier
} from '../../src/lib/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function exportData(args: {
	dishesBundle: EntityBundle<Dish>;
	ingredientsBundle: EntityBundle<Ingredient>;
	partiesBundle: EntityBundle<PartyRecord>;
	partyDishesBundle: EntityBundle<PartyDish>;
	cookstaBundle: EntityBundle<CookstaTier>;
}) {
	const { dishesBundle, ingredientsBundle, partiesBundle, partyDishesBundle, cookstaBundle } = args;
	const outputDir = join(__dirname, '..', '..', 'src', 'lib', 'data');

	mkdirSync(outputDir, { recursive: true });

	const version = 'v1';

	// Overwrite v1 files with bundled forms where applicable
	writeFileSync(join(outputDir, `dishes.${version}.json`), JSON.stringify(dishesBundle, null, 2));
	writeFileSync(
		join(outputDir, `ingredients.${version}.json`),
		JSON.stringify(ingredientsBundle, null, 2)
	);
	writeFileSync(join(outputDir, `parties.${version}.json`), JSON.stringify(partiesBundle, null, 2));
	writeFileSync(
		join(outputDir, `party-dishes.${version}.json`),
		JSON.stringify(partyDishesBundle, null, 2)
	);
	writeFileSync(join(outputDir, `cooksta.${version}.json`), JSON.stringify(cookstaBundle, null, 2));

	console.log(`${partiesBundle.rows.length}\tParties`);
	console.log(`${partyDishesBundle.rows.length}\tParty-dishes`);
	console.log(`${dishesBundle.rows.length}\tDishes`);
	console.log(`${ingredientsBundle.rows.length}\tIngredients`);
	console.log(`${cookstaBundle.rows.length}\tCooksta tiers`);
	console.log(`Data exported to /src/lib/data with version ${version}\n`);
}
