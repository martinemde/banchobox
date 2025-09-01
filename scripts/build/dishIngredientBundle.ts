import { z } from 'zod';
import type { Id } from '../../src/lib/types.js';
import type { DishIngredientInputRow } from './types.js';
import { intFromString, loadCsvFile, parseTable } from './load.js';

// dish-ingredients-data.csv schema -> normalized row
const dishIngredientRowSchema = z
	.object({
		dish: z.string().transform((s) => s.trim()),
		count: intFromString('count'),
		ingredient: z.string().transform((s) => s.trim()),
		levels: intFromString('levels'),
		upgrade_count: intFromString('upgrade_count')
	})
	.transform((row) => ({
		dish: row['dish'],
		ingredient: row['ingredient'],
		count: row['count'],
		levels: row['levels'],
		upgradeCount: row['upgrade_count']
	}));

export function loadDishIngredients(
	dishNameToId: Map<string, Id>,
	ingredientNameToId: Map<string, Id>
) {
	// Load dish-ingredient relationships
	const dishIngredientCSV = loadCsvFile('dish-ingredients-data.csv');
	const dishIngredientRows = parseTable(
		dishIngredientCSV,
		dishIngredientRowSchema,
		'dish-ingredients-data.csv'
	);

	const DishIngredientInputRows: DishIngredientInputRow[] = [];
	for (const row of dishIngredientRows) {
		const dishId = dishNameToId.get(row.dish);
		const ingredientId = ingredientNameToId.get(row.ingredient);
		if (dishId && ingredientId) {
			DishIngredientInputRows.push({
				dishId: dishId,
				ingredientId: ingredientId,
				count: row.count,
				levels: row.levels,
				upgradeCount: row.upgradeCount
			});
		} else {
			console.warn(
				`\x1b[31mCould not find dish "${row.dish}" or ingredient "${row.ingredient}"\x1b[0m`
			);
		}
	}

	return { DishIngredientInputRows };
}
