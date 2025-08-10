import type {
  BasicDish,
  BasicIngredient,
  Party,
  DishIngredient,
  DishParty,
  Id,
  PartyDish,
  Dish,
  Ingredient,
  EnrichedParty,
} from '../../src/lib/types.js';
import { buildGraph } from './graph.js';

const partyPrice = (dish: BasicDish, party: Party): number => dish.finalPrice * party.bonus;

// Compute a dish's total recipe cost from ingredients in the graph
const computeDishRecipeCost = (dishId: Id, graph: ReturnType<typeof buildGraph>): number => {
  const lines = graph.dishIngredients.filter((di) => di.dishId === dishId);
  return lines.reduce((sum, line) => {
    const ing = graph.ingById.get(line.ingredientId);
    const unitCost = ing ? ing.cost : 0;
    return sum + unitCost * line.count;
  }, 0);
};

const partyProfitPerDish = (dish: BasicDish, party: Party, dishRecipeCost: number): number =>
  partyPrice(dish, party) * dish.finalServings - dishRecipeCost;

// Removed unused helper to satisfy linter

export function enrichData(
  basicDishes: BasicDish[],
  basicIngredients: BasicIngredient[],
  basicParties: Party[],
  dishIngredients: DishIngredient[],
  dishParties: DishParty[]
) {
  const graph = buildGraph(basicDishes, basicIngredients, basicParties, dishIngredients, dishParties);
  const partyDishes: PartyDish[] = [];
  let partyDishIdCounter = 1;

  for (const dishParty of dishParties) {
    const dish = graph.dishById.get(dishParty.dishId)!;
    const party = graph.partyById.get(dishParty.partyId)!;

    if (!dish || !party) continue;

    const dishPartyPrice = partyPrice(dish, party);
    const dishPartyRevenue = dishPartyPrice * dish.finalServings;
    const dishRecipeCost = computeDishRecipeCost(dish.id, graph);
    const dishProfit = partyProfitPerDish(dish, party, dishRecipeCost);
    const dishProfitPerServing = dishProfit / dish.finalServings;

    const partyDish: PartyDish = {
      id: partyDishIdCounter++,
      partyId: party.id,
      dishId: dish.id,
      partyPrice: dishPartyPrice,
      partyRevenue: dishPartyRevenue,
      profit: dishProfit,
      profitPerServing: dishProfitPerServing,
    };

    partyDishes.push(partyDish);
  }

  // Create lookup maps for PartyDish entities
  const partyDishById = new Map<Id, PartyDish>();
  const partyDishesByDishId = new Map<Id, PartyDish[]>();
  const partyDishesByPartyId = new Map<Id, PartyDish[]>();

  for (const partyDish of partyDishes) {
    partyDishById.set(partyDish.id, partyDish);

    if (!partyDishesByDishId.has(partyDish.dishId)) {
      partyDishesByDishId.set(partyDish.dishId, []);
    }
    partyDishesByDishId.get(partyDish.dishId)!.push(partyDish);

    if (!partyDishesByPartyId.has(partyDish.partyId)) {
      partyDishesByPartyId.set(partyDish.partyId, []);
    }
    partyDishesByPartyId.get(partyDish.partyId)!.push(partyDish);
  }

  // Enrich dishes with precomputed values
  const dishes: Dish[] = basicDishes.map((dish) => {
    const dishIngredients = graph.dishIngredients.filter((di) => di.dishId === dish.id);

    const ingredientLines = dishIngredients.map((di) => {
      const ing = graph.ingById.get(di.ingredientId)!;

      return {
        ingredientId: di.ingredientId,
        count: di.count,
        unitCost: ing.cost,
        lineCost: ing.cost * di.count,
        upgradeCount: di.upgradeCount,
      };
    });
    const ingredientCount = ingredientLines.reduce((total, line) => total + line.count, 0);

    const dishRecipeCost = ingredientLines.reduce((sum, line) => sum + line.lineCost, 0);
    const dishPartyDishes = partyDishesByDishId.get(dish.id) ?? [];
    const partyDishIds = dishPartyDishes.map((pd) => pd.id);
    const bestPartyDish = dishPartyDishes.reduce(
      (best, current) => (best === null || current.profit > best.profit ? current : best),
      null as PartyDish | null
    );

    const upgradeCost = ingredientLines.reduce((sum, line) => sum + line.unitCost * line.upgradeCount, 0);
    const upgradeBreakEven = upgradeCost > 0 && bestPartyDish ? bestPartyDish.profit / upgradeCost : 0;

    const baseRevenue = dish.finalPrice * dish.finalServings;
    const baseProfit = baseRevenue - dishRecipeCost;
    const baseProfitPerServing = baseProfit / dish.finalServings;

    const bestParty = bestPartyDish ? graph.partyById.get(bestPartyDish.partyId) : null;
    const bestPartyName = bestParty?.name ?? null;
    const bestPartyBonus = bestParty?.bonus ?? null;

    const bestPartyPrice = bestPartyDish?.partyPrice ?? null;
    const bestPartyRevenue = bestPartyDish?.partyRevenue ?? null;
    const maxProfitPerServing = bestPartyDish ? bestPartyDish.profit / dish.finalServings : baseProfitPerServing;

    // Build search tokens and sort keys for client-side stores
    const ingredientNames = ingredientLines
      .map((l) => graph.ingById.get(l.ingredientId)?.name || '')
      .filter(Boolean);
    const normalize = (s: unknown) => (s ?? '').toString().toLowerCase();
    const search = [dish.name, dish.dlc, dish.unlock, ...ingredientNames]
      .map(normalize)
      .join(' ');
    const sort = {
      name: normalize(dish.name),
      finalPrice: dish.finalPrice,
      finalServings: dish.finalServings,
      baseProfitPerServing,
      maxProfitPerServing,
      maxProfitPerDish: bestPartyDish?.profit ?? baseProfit,
      upgradeCost,
      ingredientCount,
    } as const;

    const enrichedDish: Dish = {
      ...dish,
      ingredients: ingredientLines,
      recipeCost: dishRecipeCost,
      partyDishIds,
      bestPartyDishId: bestPartyDish?.id ?? null,
      maxProfitPerDish: bestPartyDish?.profit ?? baseProfit,
      baseRevenue,
      baseProfit,
      baseProfitPerServing,
      maxProfitPerServing,
      upgradeCost,
      upgradeBreakEven,
      ingredientCount,
      bestPartyName,
      bestPartyBonus,
      bestPartyPrice,
      bestPartyRevenue,
      search,
      sort,
    };

    return enrichedDish;
  });

  // Enrich ingredients
  const ingredients: Ingredient[] = basicIngredients.map((ingredient) => {
    const dishIngredients = graph.dishIngredients.filter((di) => di.ingredientId === ingredient.id);

    const dishLines = dishIngredients.map((di) => ({
      dishId: di.dishId,
      count: di.count,
      upgradeCount: di.upgradeCount,
    }));

    let bestPartyDish: PartyDish | null = null;
    const allPartyIds = new Set<Id>();

    for (const dishLine of dishLines) {
      const dishPartyDishes = partyDishesByDishId.get(dishLine.dishId) ?? [];
      for (const partyDish of dishPartyDishes) {
        allPartyIds.add(partyDish.partyId);
        if (bestPartyDish === null || partyDish.profit > bestPartyDish.profit) {
          bestPartyDish = partyDish;
        }
      }
    }

    // Ingredient type already includes usedForParties and bestPartyDishId
    const enrichedIngredient: Ingredient = {
      ...ingredient,
      usedForParties: Array.from(allPartyIds),
      bestPartyDishId: bestPartyDish?.id ?? null,
    } as Ingredient;

    return enrichedIngredient;
  });

  const parties: EnrichedParty[] = basicParties.map((party) => {
    const partyPartyDishes = (partyDishesByPartyId.get(party.id) ?? []).sort((a, b) => b.profit - a.profit);
    const partyDishIds = partyPartyDishes.map((pd) => pd.id);

    const enrichedParty: EnrichedParty = {
      ...party,
      partyDishIds,
    };

    return enrichedParty;
  });

  parties.sort((a, b) => a.order - b.order);

  return { dishes, ingredients, parties, partyDishes };
}
