import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	Dish,
	Party,
	Ingredient,
	PartyDish,
	EntityBundle,
	CookstaTier,
	DLC,
	Chapter,
	Staff
} from '../../src/lib/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function exportData(args: {
	dishesBundle: EntityBundle<Dish>;
	ingredientsBundle: EntityBundle<Ingredient>;
	partiesBundle: EntityBundle<Party>;
	partyDishesBundle: EntityBundle<PartyDish>;
	cookstaBundle: EntityBundle<CookstaTier>;
	dlcBundle: EntityBundle<DLC>;
	chaptersBundle: EntityBundle<Chapter>;
	staffBundle: EntityBundle<Staff>;
}) {
	const {
		dishesBundle,
		ingredientsBundle,
		partiesBundle,
		partyDishesBundle,
		cookstaBundle,
		dlcBundle,
		chaptersBundle,
		staffBundle
	} = args;
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
	writeFileSync(join(outputDir, `dlc.${version}.json`), JSON.stringify(dlcBundle, null, 2));
	writeFileSync(
		join(outputDir, `chapters.${version}.json`),
		JSON.stringify(chaptersBundle, null, 2)
	);
	writeFileSync(join(outputDir, `staff.${version}.json`), JSON.stringify(staffBundle, null, 2));

	// Helper function to count items in bundle (supports both old and new format)
	const getItemCount = (bundle: any): number => {
		if (bundle.sortedIds) {
			// New format: count from byId
			return Object.keys(bundle.byId).length;
		}
		// Old format: count from rows
		return bundle.rows?.length || 0;
	};

	console.log(`${getItemCount(partiesBundle)}\tParties`);
	console.log(`${getItemCount(partyDishesBundle)}\tParty-dishes`);
	console.log(`${getItemCount(dishesBundle)}\tDishes`);
	console.log(`${getItemCount(ingredientsBundle)}\tIngredients`);
	console.log(`${getItemCount(cookstaBundle)}\tCooksta tiers`);
	console.log(`${getItemCount(dlcBundle)}\tDLCs`);
	console.log(`${getItemCount(chaptersBundle)}\tChapters`);
	console.log(`${getItemCount(staffBundle)}\tStaff`);
	console.log(`Data exported to /src/lib/data with version ${version}\n`);
}
