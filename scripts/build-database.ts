import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { loadNormalizedData } from './build/load.js';
import { exportData } from './build/export.js';
import { buildDishesBundle } from './build/dishBundle.js';
import { buildIngredientsBundle } from './build/ingredientBundle.js';
import { buildPartiesBundle } from './build/partyBundle.js';
import { buildPartyDishesBundle } from './build/partyDishBundle.js';
import { buildCookstaBundle } from './build/cookstaBundle.js';
import { buildDLCBundle } from './build/dlcBundle.js';
import { buildChapterBundle } from './build/chapterBundle.js';
import { buildStaffBundle } from './build/staffBundle.js';
import { prepareDishesAndPartyDishes } from './build/dishBundle.js';
import { prepareIngredients } from './build/ingredientBundle.js';

const __filename = fileURLToPath(import.meta.url);
dirname(__filename); // ensure path derivation works if needed in submodules

// Merge of scripts/build/enrich.ts logic
function enrichData(
	dishes,
	ingredients,
	parties,
	DishIngredientInputRows,
	dishParties,
	cooksta,
	dlcs,
	chapters,
	staff
) {
	const cookstaBundle = buildCookstaBundle(cooksta);
	const dlcBundle = buildDLCBundle(dlcs);
	const chaptersBundle = buildChapterBundle(chapters);

	const preparedIngredients = prepareIngredients(
		ingredients,
		DishIngredientInputRows,
		dishParties,
		parties,
		dishes
	);
	const {
		dishes: preparedDishes,
		partyDishes,
		partyDishesByPartyId
	} = prepareDishesAndPartyDishes(
		dishes,
		ingredients,
		DishIngredientInputRows,
		dishParties,
		parties,
		staff
	);

	const ingredientsBundle = buildIngredientsBundle(preparedIngredients, chaptersBundle);
	const partiesBundle = buildPartiesBundle(parties, partyDishesByPartyId);
	const partyDishesBundle = buildPartyDishesBundle(partyDishes);
	const staffBundle = buildStaffBundle(staff, preparedDishes);
	const dishesBundle = buildDishesBundle({
		dishes: preparedDishes,
		chaptersBundle,
		ingredientsBundle,
		partiesBundle,
		cookstaBundle
	});

	return {
		dishesBundle,
		ingredientsBundle,
		partiesBundle,
		partyDishesBundle,
		cookstaBundle,
		dlcBundle,
		chaptersBundle,
		staffBundle
	};
}

// Run the build process
try {
	const {
		dishes,
		ingredients,
		parties,
		DishIngredientInputRows,
		dishParties,
		cooksta,
		dlcs,
		chapters,
		staff
	} = loadNormalizedData();

	const {
		dishesBundle,
		ingredientsBundle,
		partiesBundle,
		partyDishesBundle,
		cookstaBundle,
		dlcBundle,
		chaptersBundle,
		staffBundle
	} = enrichData(
		dishes,
		ingredients,
		parties,
		DishIngredientInputRows,
		dishParties,
		cooksta,
		dlcs,
		chapters,
		staff
	);

	exportData({
		dishesBundle,
		ingredientsBundle,
		partiesBundle,
		partyDishesBundle,
		cookstaBundle,
		dlcBundle,
		chaptersBundle,
		staffBundle
	});

	console.log('Build completed successfully!');
} catch (error) {
	console.error('Build failed:', error);
	process.exit(1);
}
