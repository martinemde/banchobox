/**
 * Graph building and management utilities
 *
 * Creates efficient lookup structures from normalized data
 */

import type {
	BasicDish,
	BasicIngredient,
	PartyInputRow,
	DishIngredient,
	DishParty,
	Graph,
	Id
} from '../../src/lib/types.js';

export function buildGraph(
	dishes: BasicDish[],
	ingredients: BasicIngredient[],
	parties: PartyInputRow[],
	dishIngredients: DishIngredient[],
	dishParties: DishParty[]
): Graph {
	// Create basic maps
	const dishById = new Map<Id, BasicDish>();
	const ingById = new Map<Id, BasicIngredient>();
	const partyById = new Map<Id, PartyInputRow>();

	// Populate basic maps
	for (const dish of dishes) {
		dishById.set(dish.id, dish);
	}
	for (const ingredient of ingredients) {
		ingById.set(ingredient.id, ingredient);
	}
	for (const party of parties) {
		partyById.set(party.id, party);
	}

	// Build relationship maps
	const ingByDishId = new Map<Id, { ingredientId: Id; count: number }[]>();
	const dishesByIngredientId = new Map<Id, { dishId: Id; count: number }[]>();
	const partiesByDishId = new Map<Id, Id[]>();
	const dishesByPartyId = new Map<Id, Id[]>();

	// Process dish-ingredient relationships
	for (const di of dishIngredients) {
		// Ingredients by dish
		if (!ingByDishId.has(di.dishId)) {
			ingByDishId.set(di.dishId, []);
		}
		ingByDishId.get(di.dishId)!.push({
			ingredientId: di.ingredientId,
			count: di.count
		});

		// Dishes by ingredient
		if (!dishesByIngredientId.has(di.ingredientId)) {
			dishesByIngredientId.set(di.ingredientId, []);
		}
		dishesByIngredientId.get(di.ingredientId)!.push({
			dishId: di.dishId,
			count: di.count
		});
	}

	// Process dish-party relationships
	for (const dp of dishParties) {
		// Parties by dish
		if (!partiesByDishId.has(dp.dishId)) {
			partiesByDishId.set(dp.dishId, []);
		}
		partiesByDishId.get(dp.dishId)!.push(dp.partyId);

		// Dishes by party
		if (!dishesByPartyId.has(dp.partyId)) {
			dishesByPartyId.set(dp.partyId, []);
		}
		dishesByPartyId.get(dp.partyId)!.push(dp.dishId);
	}

	return {
		dishes,
		ingredients,
		parties,
		dishIngredients,
		dishParties,
		dishById,
		ingById,
		partyById,
		ingByDishId,
		dishesByIngredientId,
		partiesByDishId,
		dishesByPartyId
	};
}
