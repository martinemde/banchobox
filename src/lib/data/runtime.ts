/**
 * Runtime data service - loads precomputed data and provides efficient access
 */

import type { Dish, Ingredient, EnrichedParty, PartyDish, Id } from '../types.js';

// Data containers initialized via init()
let dishes: Dish[] = [];
let ingredients: Ingredient[] = [];
let parties: EnrichedParty[] = [];
let partyDishes: PartyDish[] = [];

// Indices populated in init()
let dishById: Record<Id, Dish> = {} as Record<Id, Dish>;
let ingredientById: Record<Id, Ingredient> = {} as Record<Id, Ingredient>;
let partyById: Record<Id, EnrichedParty> = {} as Record<Id, EnrichedParty>;
let partyDishById: Record<Id, PartyDish> = {} as Record<Id, PartyDish>;

// Runtime data service with efficient lookups
export const Data = {
  init(data: {
    dishes: Dish[];
    ingredients: Ingredient[];
    parties: EnrichedParty[];
    partyDishes: PartyDish[];
  }) {
    dishes = data.dishes;
    ingredients = data.ingredients;
    parties = data.parties;
    partyDishes = data.partyDishes;

    dishById = Object.fromEntries(dishes.map((d) => [d.id, d])) as Record<Id, Dish>;
    ingredientById = Object.fromEntries(ingredients.map((i) => [i.id, i])) as Record<Id, Ingredient>;
    partyById = Object.fromEntries(parties.map((p) => [p.id, p])) as Record<Id, EnrichedParty>;
    partyDishById = Object.fromEntries(partyDishes.map((pd) => [pd.id, pd])) as Record<Id, PartyDish>;
  },
  get dishes() { return dishes; },
  get ingredients() { return ingredients; },
  get parties() { return parties; },
  get partyDishes() { return partyDishes; },

  // Efficient lookup methods
  getDishById: (id: Id): Dish | undefined => dishById[id],
  getIngredientById: (id: Id): Ingredient | undefined => ingredientById[id],
  getPartyById: (id: Id): EnrichedParty | undefined => partyById[id],
  getPartyDishById: (id: Id): PartyDish | undefined => partyDishById[id],

  // Filtered views
  getDishesByPartyId: (partyId: Id): Dish[] => {
    const partyDishIds = partyDishes
      .filter(pd => pd.partyId === partyId)
      .map(pd => pd.dishId);
    return dishes.filter(dish => partyDishIds.includes(dish.id));
  },

  getDishesByIngredientId: (ingredientId: Id): Dish[] =>
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
  getDishesSortedByProfit: (limit?: number): Dish[] => {
    const sorted = [...dishes].sort((a, b) => b.maxProfitPerServing - a.maxProfitPerServing);
    return limit ? sorted.slice(0, limit) : sorted;
  },

  // Analytics
  getTotalDishes: (): number => dishes.length,
  getTotalIngredients: (): number => ingredients.length,
  getTotalParties: (): number => parties.length,

  // Search functionality
  searchDishesByName: (query: string): Dish[] =>
    dishes.filter(dish =>
      dish.name.toLowerCase().includes(query.toLowerCase())
    ),

  searchIngredientsByName: (query: string): Ingredient[] =>
    ingredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(query.toLowerCase())
    ),
};
