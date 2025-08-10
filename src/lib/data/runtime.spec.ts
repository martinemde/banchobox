import { describe, it, expect, beforeEach } from 'vitest';
import { Data } from './runtime.js';
import type { Dish, Ingredient, EnrichedParty, PartyDish, Id } from '../types.js';

function mkIngredient(id: Id, name = `Ing ${id}`): Ingredient {
  return {
    id,
    name,
    image: `${id}.png`,
    source: 'sea',
    type: 'fish',
    drone: false,
    cost: 1,
    day: true,
    night: true,
    fog: false,
    rank: 1,
    usedIn: [],
    bestPartyDishId: null,
    usedForParties: [],
    search: name.toLowerCase(),
    sort: {
      name: name.toLowerCase(),
      sell: null,
      kg: null,
      sellPerKg: null,
      buyJango: null,
      buyOtto: null,
      usedForPartiesCount: 0,
    }
  };
}

function mkParty(id: Id, name = `Party ${id}`): EnrichedParty {
  return {
    id,
    name,
    order: id,
    bonus: 2,
    partyDishIds: [],
    search: `${name.toLowerCase()} bonus 2x`,
    sort: { name: name.toLowerCase(), bonus: 2, dishCount: 0, order: id },
  };
}

function mkDish(id: Id, opts: { ingredientId: Id; partyDishIds?: Id[] } = { ingredientId: 1 }): Dish {
  const ingId = opts.ingredientId;
  return {
    id,
    name: `Dish ${id}`,
    image: `${id}.png`,
    maxLevel: 1,
    basePrice: 10,
    baseTaste: 1,
    baseServings: 1,
    finalPrice: 20,
    finalTaste: 1,
    finalServings: 2,
    unlock: null,
    dlc: null,
    artisansFlames: null,
    ingredients: [
      { ingredientId: ingId, count: 1, unitCost: 5, lineCost: 5, upgradeCount: 0 }
    ],
    recipeCost: 5,
    partyDishIds: opts.partyDishIds ?? [],
    bestPartyDishId: opts.partyDishIds?.[0] ?? null,
    maxProfitPerDish: 30,
    baseRevenue: 40,
    baseProfit: 35,
    baseProfitPerServing: 17.5,
    maxProfitPerServing: 15,
    upgradeCost: 0,
    upgradeBreakEven: 0,
    ingredientCount: 1,
    bestPartyName: null,
    bestPartyBonus: null,
    bestPartyPrice: null,
    bestPartyRevenue: null,
    search: `dish ${id}`,
    sort: {
      name: `dish ${id}`,
      finalPrice: 20,
      finalServings: 2,
      baseProfitPerServing: 17.5,
      maxProfitPerServing: 15,
      maxProfitPerDish: 30,
      upgradeCost: 0,
      ingredientCount: 1,
    }
  };
}

function mkPartyDish(id: Id, dishId: Id, partyId: Id, bonus = 2): PartyDish {
  const partyPrice = 20 * bonus;
  const partyRevenue = partyPrice * 2;
  const profit = partyRevenue - 5;
  return {
    id,
    dishId,
    partyId,
    partyPrice,
    partyRevenue,
    profit,
    profitPerServing: profit / 2,
    dishName: `Dish ${dishId}`,
    dlc: null,
    unlock: null,
    recipeCost: 5,
    search: `dish ${dishId}`,
    sort: {
      dishName: `dish ${dishId}`,
      partyPrice,
      partyRevenue,
      profit,
      profitPerServing: profit / 2,
      recipeCost: 5,
    }
  };
}

describe('Data.init and lookups', () => {
  beforeEach(() => {
    // Re-initialize with empty data before each test
    Data.init({ dishes: [], ingredients: [], parties: [], partyDishes: [] });
  });

  it('initializes and exposes arrays', () => {
    const ingredients: Ingredient[] = [mkIngredient(1)];
    const parties: EnrichedParty[] = [mkParty(1)];
    const partyDishes: PartyDish[] = [mkPartyDish(1, 1, 1)];
    const dishes: Dish[] = [mkDish(1, { ingredientId: 1, partyDishIds: [1] })];

    Data.init({ dishes, ingredients, parties, partyDishes });

    expect(Data.dishes.length).toBe(1);
    expect(Data.ingredients.length).toBe(1);
    expect(Data.parties.length).toBe(1);
    expect(Data.partyDishes.length).toBe(1);
  });

  it('supports lookups by id and sorting helpers', () => {
    const ingredients = [mkIngredient(1), mkIngredient(2)];
    const parties = [mkParty(1)];
    const pd1 = mkPartyDish(1, 1, 1, 2);
    const pd2 = mkPartyDish(2, 2, 1, 3);
    const partyDishes = [pd1, pd2];
    const dishes = [
      mkDish(1, { ingredientId: 1, partyDishIds: [1] }),
      mkDish(2, { ingredientId: 2, partyDishIds: [2] })
    ];

    Data.init({ dishes, ingredients, parties, partyDishes });

    expect(Data.getIngredientById(2)?.name).toBe('Ing 2');
    expect(Data.getDishById(1)?.name).toBe('Dish 1');
    expect(Data.getPartyById(1)?.name).toBe('Party 1');
    expect(Data.getPartyDishById(2)?.dishId).toBe(2);

    const sorted = Data.getDishesSortedByProfit();
    expect(sorted[0].id).toBe(1); // both equal in test data, but stable order
  });
});
