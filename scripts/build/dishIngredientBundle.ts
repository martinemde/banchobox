import { z } from 'zod';
import type { Id } from '../../src/lib/types.js';
import type { DishIngredientInputRow, DishIngredientJoinRow } from './types.js';
import { loadCsvFile, parseTable } from './load.js';

// dish-ingredients-data.csv schema -> normalized row
const dishIngredientRowSchema = z.object({
	dish: z.string().trim(),
	ingredient: z.string().trim(),
	count: z.coerce.number().int().positive(),
	levels: z.coerce.number().int().nonnegative(),
	upgradeCount: z.coerce.number().int().nonnegative()
}) as z.ZodType<DishIngredientInputRow>;

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

	const dishIngredients: DishIngredientJoinRow[] = [];
	for (const row of dishIngredientRows) {
		const dishId = dishNameToId.get(row.dish);
		const ingredientId = ingredientNameToId.get(row.ingredient);
		if (dishId && ingredientId) {
			dishIngredients.push({
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

	return { dishIngredients };
}
