/**
 * Graph building and management utilities
 *
 * Creates efficient lookup structures from normalized data
 */

import type { Dish, Ingredient, Party, DishIngredient, DishParty, Graph, Id } from '../types.js';

export function buildGraph(
	dishes: Dish[],
	ingredients: Ingredient[],
	parties: Party[],
	dishIngredients: DishIngredient[],
	dishParties: DishParty[]
): Graph {
	// Create basic maps
	const dishById = new Map<Id, Dish>();
	const ingById = new Map<Id, Ingredient>();
	const partyById = new Map<Id, Party>();

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
	const ingByDishId = new Map<Id, { ingredient_id: Id; count: number }[]>();
	const dishesByIngredientId = new Map<Id, { dish_id: Id; count: number }[]>();
	const partiesByDishId = new Map<Id, Id[]>();
	const dishesByPartyId = new Map<Id, Id[]>();

	// Process dish-ingredient relationships
	for (const di of dishIngredients) {
		// Ingredients by dish
		if (!ingByDishId.has(di.dish_id)) {
			ingByDishId.set(di.dish_id, []);
		}
		ingByDishId.get(di.dish_id)!.push({
			ingredient_id: di.ingredient_id,
			count: di.count
		});

		// Dishes by ingredient
		if (!dishesByIngredientId.has(di.ingredient_id)) {
			dishesByIngredientId.set(di.ingredient_id, []);
		}
		dishesByIngredientId.get(di.ingredient_id)!.push({
			dish_id: di.dish_id,
			count: di.count
		});
	}

	// Process dish-party relationships
	for (const dp of dishParties) {
		// Parties by dish
		if (!partiesByDishId.has(dp.dish_id)) {
			partiesByDishId.set(dp.dish_id, []);
		}
		partiesByDishId.get(dp.dish_id)!.push(dp.party_id);

		// Dishes by party
		if (!dishesByPartyId.has(dp.party_id)) {
			dishesByPartyId.set(dp.party_id, []);
		}
		dishesByPartyId.get(dp.party_id)!.push(dp.dish_id);
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
