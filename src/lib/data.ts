// Legacy data loader - maintained for backward compatibility
// New code should use Data from './data/runtime.js' instead

import type { LegacyDish, LegacyIngredient, LegacyParty, EnrichedDish, EnrichedIngredient, EnrichedParty } from './types.js';
import dishesData from './dishes.json';
import ingredientsData from './ingredients.json';
import partiesData from './parties.json';

// Legacy functions using old interface names for backward compatibility
export function loadDishes(): LegacyDish[] {
  // Convert enriched data back to legacy format
  const enrichedDishes = dishesData as EnrichedDish[];
  return enrichedDishes.map(dish => ({
    name: dish.name,
    unlockCondition: dish.unlock_condition || undefined,
    dlc: dish.dlc || undefined,
    finalLevel: dish.final_level,
    finalTaste: dish.final_taste,
    initialPrice: dish.initial_price,
    finalPrice: dish.final_price,
    servings: dish.servings,
    parties: dish.partyStats.map(stat => {
      const party = enrichedDishes.find(d => d.partyStats.some(ps => ps.partyId === stat.partyId));
      return party?.name || 'Unknown Party';
    }),
    ingredients: dish.ingredients.map(ing => ({
      name: ing.unitCost !== null ? `Ingredient ${ing.ingredientId}` : 'Unknown Ingredient',
      count: ing.count,
      levels: undefined,
      upgradeCount: undefined,
    })),
  }));
}

export function loadIngredients(): LegacyIngredient[] {
  const enrichedIngredients = ingredientsData as EnrichedIngredient[];
  return enrichedIngredients.map(ingredient => ({
    name: ingredient.name,
    source: ingredient.source,
    type: ingredient.type,
    drone: ingredient.drone === 1,
    kg: ingredient.kg || undefined,
    maxMeats: ingredient.max_meats || undefined,
    cost: ingredient.cost || undefined,
  }));
}

export function loadParties(): LegacyParty[] {
  const enrichedParties = partiesData as EnrichedParty[];
  return enrichedParties.map(party => ({
    name: party.name,
    bonus: party.bonus,
    dishes: party.dishes.map(d => `Dish ${d.dishId}`), // This would need actual name lookup in practice
  }));
}
