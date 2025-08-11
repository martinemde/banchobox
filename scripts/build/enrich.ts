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
  EntityBundle,
} from '../../src/lib/types.js';
import { buildDishesBundle } from './dish_bundle.js';
import { buildIngredientsBundle } from './ingredient_bundle.js';
import { buildPartiesBundle } from './party_bundle.js';
import { buildPartyDishesBundle } from './party_dish_bundle.js';
import { buildGraph } from './graph.js';

// Compute a dish's total recipe cost from ingredients in the graph
const computeDishRecipeCost = (dishId: Id, graph: ReturnType<typeof buildGraph>): number => {
  const lines = graph.dishIngredients.filter((di) => di.dishId === dishId);
  return lines.reduce((sum, line) => {
    const ing = graph.ingById.get(line.ingredientId);
    const unitCost = ing ? ing.cost : 0;
    return sum + unitCost * line.count;
  }, 0);
};

const normalize = (v: unknown) => (v ?? '').toString().toLowerCase();

export function enrichData(
  basicDishes: BasicDish[],
  basicIngredients: BasicIngredient[],
  basicParties: Party[],
  dishIngredients: DishIngredient[],
  dishParties: DishParty[]
) {
  const graph = buildGraph(basicDishes, basicIngredients, basicParties, dishIngredients, dishParties);

  // Party Dishes
  const partyDishes: PartyDish[] = [];
  let partyDishIdCounter = 1;
  for (const dishParty of dishParties) {
    const dish = graph.dishById.get(dishParty.dishId)!;
    const party = graph.partyById.get(dishParty.partyId)!;

    if (!dish || !party) {
      console.error(`Invalid dish or party: ${dishParty.dishId} ${dishParty.partyId}`);
      continue;
    }

    const partyPrice = dish.finalPrice * party.bonus;
    const partyRevenue = partyPrice * dish.finalServings;

    const recipeCost = computeDishRecipeCost(dish.id, graph);
    const partyProfit = Math.round(partyRevenue - recipeCost);
    const partyProfitPerServing = Math.round(partyProfit / dish.finalServings);

    const dishName = dish.name;
    const dlc = dish.dlc ?? null;
    const unlock = dish.unlock ?? null;

    const search = [dishName, dlc, unlock].map(normalize).filter(Boolean).join(' ');
    const sort = {
      dishName: normalize(dishName),
      partyPrice,
      partyRevenue,
      profit: partyProfit,
      profitPerServing: partyProfitPerServing,
      recipeCost,
    } as const;

    const partyDish: PartyDish = {
      id: partyDishIdCounter++,
      partyId: party.id,
      dishId: dish.id,
      partyPrice: partyPrice,
      partyRevenue: partyRevenue,
      profit: partyProfit,
      profitPerServing: partyProfitPerServing,
      dishName,
      dlc,
      unlock,
      recipeCost,
      search,
      sort,
    };

    partyDishes.push(partyDish);
  }
  const partyDishesBundle = buildPartyDishesBundle(partyDishes);

  // Create lookup maps for PartyDish entities
  const partyDishesByDishId = new Map<Id, PartyDish[]>();
  const partyDishesByPartyId = new Map<Id, PartyDish[]>();

  for (const partyDish of partyDishes) {
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
    const recipeCost = ingredientLines.reduce((sum, line) => sum + line.lineCost, 0);

    const finalRevenue = dish.finalPrice * dish.finalServings;
    const finalProfit = finalRevenue - recipeCost;
    const finalProfitPerServing = Math.round(finalProfit / dish.finalServings);

    const dishPartyDishes = partyDishesByDishId.get(dish.id) ?? [];
    const partyDishIds = dishPartyDishes.map((pd) => pd.id);

    let maxProfitPerServing = finalProfitPerServing
    for (const partyDish of dishPartyDishes) {
      const profitPerServing = Math.round(partyDish.profit / dish.finalServings);
      if (profitPerServing > maxProfitPerServing) {
        maxProfitPerServing = profitPerServing;
      }
    }

    const upgradeCost = ingredientLines.reduce((sum, line) => sum + line.unitCost * line.upgradeCount, 0);

    // Build search tokens and sort keys for client-side stores
    const ingredientNames = ingredientLines
      .map((l) => graph.ingById.get(l.ingredientId)?.name || '')
      .filter(Boolean);
    const search = [dish.name, dish.dlc, dish.unlock, ...ingredientNames]
      .map(normalize)
      .join(' ');

    const sort = {
      name: normalize(dish.name),
      finalPrice: dish.finalPrice,
      finalServings: dish.finalServings,
      finalProfitPerServing,
      maxProfitPerServing,
      upgradeCost,
      ingredientCount,
    } as const;

    const enrichedDish: Dish = {
      ...dish,
      ingredients: ingredientLines,
      recipeCost,
      partyDishIds,
      finalRevenue,
      finalProfit,
      finalProfitPerServing,
      maxProfitPerServing,
      upgradeCost,
      ingredientCount,
      search,
      sort,
    };

    return enrichedDish;
  });
  const dishesBundle = buildDishesBundle(dishes);

  // Enrich ingredients
  const ingredients: Ingredient[] = basicIngredients.map((ingredient) => {
    const allPartyIds = new Set<Id>();

    const enrichedIngredient = {
      ...ingredient,
      usedForParties: Array.from(allPartyIds),
    } as Ingredient;

    const usedForPartiesCount = enrichedIngredient.usedForParties?.length ?? 0;
    const sell = enrichedIngredient.sell ?? null;
    const kg = enrichedIngredient.kg ?? null;
    const sellPerKg = sell != null && kg != null && kg !== 0 ? sell / kg : null;

    const search = [
      enrichedIngredient.name,
      enrichedIngredient.source,
      enrichedIngredient.type,
      enrichedIngredient.day ? 'day' : '',
      enrichedIngredient.night ? 'night' : '',
      enrichedIngredient.fog ? 'fog' : '',
      enrichedIngredient.drone ? 'drone' : '',
    ]
      .map(normalize)
      .filter(Boolean)
      .join(' ');

    const sort = {
      name: normalize(enrichedIngredient.name),
      sell,
      kg,
      sellPerKg,
      buyJango: enrichedIngredient.buyJango ?? null,
      buyOtto: enrichedIngredient.buyOtto ?? null,
      usedForPartiesCount,
    } as const;

    const finalIngredient: Ingredient = {
      ...enrichedIngredient,
      search,
      sort: sort as unknown as Ingredient['sort'],
    };

    return finalIngredient;
  });

  const ingredientsBundle = buildIngredientsBundle(ingredients);

  const parties: EnrichedParty[] = basicParties.map((party) => {
    const partyDishIds = partyDishesByPartyId.get(party.id)!
      .sort((a, b) => b.profit - a.profit)
      .map((pd) => pd.id);

    const enrichedParty: EnrichedParty = {
      ...party,
      partyDishIds,
      search: [party.name.toLowerCase(), `${party.bonus}x`].join(' '),
      sort: {
        name: party.name.toLowerCase(),
        bonus: party.bonus,
        dishCount: partyDishIds.length,
        order: party.order,
      },
    } as EnrichedParty;

    return enrichedParty;
  });

  parties.sort((a, b) => a.order - b.order);
  const partiesBundle = buildPartiesBundle(parties);

  return { dishesBundle, ingredientsBundle, partiesBundle, partyDishesBundle } as {
    dishesBundle: EntityBundle<Dish>;
    ingredientsBundle: EntityBundle<Ingredient>;
    partiesBundle: EntityBundle<EnrichedParty>;
    partyDishesBundle: EntityBundle<PartyDish>;
  };
}
