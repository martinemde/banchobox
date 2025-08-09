/**
 * Runtime data service - loads precomputed data and provides efficient access
 */

import type { EnrichedDish, EnrichedIngredient, EnrichedParty, PartyDish, Id } from '../types.js';

// Data containers initialized via init()
let dishes: EnrichedDish[] = [];
let ingredients: EnrichedIngredient[] = [];
let parties: EnrichedParty[] = [];
let partyDishes: PartyDish[] = [];

// Indices populated in init()
let dishById: Record<Id, EnrichedDish> = {} as Record<Id, EnrichedDish>;
let ingredientById: Record<Id, EnrichedIngredient> = {} as Record<Id, EnrichedIngredient>;
let partyById: Record<Id, EnrichedParty> = {} as Record<Id, EnrichedParty>;
let partyDishById: Record<Id, PartyDish> = {} as Record<Id, PartyDish>;

// Runtime data service with efficient lookups
export const Data = {
  init(data: {
    dishes: EnrichedDish[];
    ingredients: EnrichedIngredient[];
    parties: EnrichedParty[];
    partyDishes: PartyDish[];
  }) {
    dishes = data.dishes;
    ingredients = data.ingredients;
    parties = data.parties;
    partyDishes = data.partyDishes;

    dishById = Object.fromEntries(dishes.map((d) => [d.id, d])) as Record<Id, EnrichedDish>;
    ingredientById = Object.fromEntries(ingredients.map((i) => [i.id, i])) as Record<Id, EnrichedIngredient>;
    partyById = Object.fromEntries(parties.map((p) => [p.id, p])) as Record<Id, EnrichedParty>;
    partyDishById = Object.fromEntries(partyDishes.map((pd) => [pd.id, pd])) as Record<Id, PartyDish>;
  },
  get dishes() { return dishes; },
  get ingredients() { return ingredients; },
  get parties() { return parties; },
  get partyDishes() { return partyDishes; },

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
