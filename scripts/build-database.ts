import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

import { exportData } from './build/export.js';
import { buildDishesBundle, loadDishes, prepareDishesAndPartyDishes } from './build/dishBundle.js';
import {
	buildIngredientsBundle,
	loadIngredients,
	prepareIngredients
} from './build/ingredientBundle.js';
import { buildPartiesBundle, loadParties } from './build/partyBundle.js';
import { buildPartyDishesBundle, loadPartyDishes } from './build/partyDishBundle.js';
import { loadDishIngredients } from './build/dishIngredientBundle.js';
import { buildCookstaBundle, loadCooksta } from './build/cookstaBundle.js';
import { buildDLCBundle, loadDLCs } from './build/dlcBundle.js';
import { buildChapterBundle, loadChapters } from './build/chapterBundle.js';
import { buildStaffBundle, loadStaff } from './build/staffBundle.js';

const __filename = fileURLToPath(import.meta.url);
dirname(__filename); // ensure path derivation works if needed in submodules

// Merge of scripts/build/enrich.ts logic
function enrichData(
	dishes,
	ingredients,
	parties,
	dishIngredients,
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
		dishIngredients,
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
		dishIngredients,
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
	const { dishes, dishNameToId } = loadDishes();
	const { ingredients, ingredientNameToId } = loadIngredients();
	const { parties, partyNameToId } = loadParties();
	const { cooksta } = loadCooksta();
	const { dlcs } = loadDLCs();
	const { chapters } = loadChapters();
	const { staff } = loadStaff();
	const { dishIngredients } = loadDishIngredients(dishNameToId, ingredientNameToId);
	const { dishParties } = loadPartyDishes(dishNameToId, partyNameToId);

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
		dishIngredients,
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
