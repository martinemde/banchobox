import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { loadNormalizedData } from './build/load.js';
import { enrichData } from './build/enrich.js';
import { exportData } from './build/export.js';

const __filename = fileURLToPath(import.meta.url);
dirname(__filename); // ensure path derivation works if needed in submodules

// Run the build process
try {
	const { dishes, ingredients, parties, dishIngredients, dishParties, cooksta, dlcs, chapters } =
		loadNormalizedData();
	const {
		dishesBundle,
		ingredientsBundle,
		partiesBundle,
		partyDishesBundle,
		cookstaBundle,
		dlcBundle,
		chaptersBundle
	} = enrichData(
		dishes,
		ingredients,
		parties,
		dishIngredients,
		dishParties,
		cooksta,
		dlcs,
		chapters
	);
	exportData({
		dishesBundle,
		ingredientsBundle,
		partiesBundle,
		partyDishesBundle,
		cookstaBundle,
		dlcBundle,
		chaptersBundle
	});
	console.log('Build completed successfully!');
} catch (error) {
	console.error('Build failed:', error);
	process.exit(1);
}
