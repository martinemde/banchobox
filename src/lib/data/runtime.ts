/**
 * Runtime data service - loads precomputed data and provides efficient access
 */

import type { EnrichedDish, EnrichedIngredient, EnrichedParty, PartyDish, Id } from '../types.js';

// Static imports for tree-shaking (SvelteKit will bundle these efficiently)
// Using the legacy location for now since SvelteKit can't import from /static during build
import dishesV1 from '../dishes.json';
import ingredientsV1 from '../ingredients.json';
import partiesV1 from '../parties.json';
import partyDishesV1 from '../party-dishes.json';

// Type the imported data
const dishes = dishesV1 as EnrichedDish[];
const ingredients = ingredientsV1 as EnrichedIngredient[];
const parties = partiesV1 as EnrichedParty[];
const partyDishes = partyDishesV1 as PartyDish[];

// Build runtime indices from the loaded data
const dishById = Object.fromEntries(dishes.map(d => [d.id, d])) as Record<Id, EnrichedDish>;
const ingredientById = Object.fromEntries(ingredients.map(i => [i.id, i])) as Record<Id, EnrichedIngredient>;
const partyById = Object.fromEntries(parties.map(p => [p.id, p])) as Record<Id, EnrichedParty>;
const partyDishById = Object.fromEntries(partyDishes.map(pd => [pd.id, pd])) as Record<Id, PartyDish>;

// Runtime data service with efficient lookups
export const Data = {
  dishes,
  ingredients,
  parties,
  partyDishes,

  // Efficient lookup methods
  getDishById: (id: Id): EnrichedDish | undefined => dishById[id],
  getIngredientById: (id: Id): EnrichedIngredient | undefined => ingredientById[id],
  getPartyById: (id: Id): EnrichedParty | undefined => partyById[id],
  getPartyDishById: (id: Id): PartyDish | undefined => partyDishById[id],

  // Filtered views
  getDishesByPartyId: (partyId: Id): EnrichedDish[] => {
    const partyDishIds = partyDishes
      .filter(pd => pd.partyId === partyId)
      .map(pd => pd.dishId);
    return dishes.filter(dish => partyDishIds.includes(dish.id));
  },

  getDishesByIngredientId: (ingredientId: Id): EnrichedDish[] =>
    dishes.filter(dish => dish.ingredients.some(ing => ing.ingredientId === ingredientId)),

  getPartyDishesByPartyId: (partyId: Id): PartyDish[] => {
    const party = partyById[partyId];
    if (!party || !party.partyDishIds) {
      return partyDishes.filter(pd => pd.partyId === partyId);
    }
    // Return PartyDish entities in the order specified by partyDishIds (pre-sorted by profit)
    return party.partyDishIds.map(pdId => partyDishById[pdId]).filter(Boolean);
  },

  getPartyDishesByDishId: (dishId: Id): PartyDish[] =>
    partyDishes.filter(pd => pd.dishId === dishId),

  // Sorted views
  getDishesSortedByProfit: (limit?: number): EnrichedDish[] => {
    const sorted = [...dishes].sort((a, b) => b.maxProfitPerDish - a.maxProfitPerDish);
    return limit ? sorted.slice(0, limit) : sorted;
  },

  // Analytics
  getTotalDishes: (): number => dishes.length,
  getTotalIngredients: (): number => ingredients.length,
  getTotalParties: (): number => parties.length,

  // Search functionality
  searchDishesByName: (query: string): EnrichedDish[] =>
    dishes.filter(dish =>
      dish.name.toLowerCase().includes(query.toLowerCase())
    ),

  searchIngredientsByName: (query: string): EnrichedIngredient[] =>
    ingredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(query.toLowerCase())
    ),
};
