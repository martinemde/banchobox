import type { Dish, Id, EntityBundle } from '../../src/lib/types.js';

export function buildDishesBundle(dishes: Dish[]): EntityBundle<Dish> {
  // byId index for O(1) lookups
  const byId = Object.fromEntries(dishes.map((d) => [d.id, d])) as Record<Id, Dish>;

  // Facets - minimal set to start; structure is easy to extend
  const facets: EntityBundle<Dish>['facets'] = {
    dlc: {},
    unlock: {},
    hasIngredient: {}, // ingredientId -> [dishIds]
  };

  for (const d of dishes) {
    const dlcVal = (d.dlc ?? 'base').toString();
    (facets.dlc[dlcVal] ??= []).push(d.id);

    const unlockVal = (d.unlock ?? '').toString();
    if (unlockVal) {
      (facets.unlock[unlockVal] ??= []).push(d.id);
    }

    for (const line of d.ingredients) {
      const key = String(line.ingredientId);
      (facets.hasIngredient[key] ??= []).push(d.id);
    }
  }

  return {
    rows: dishes,
    byId,
    facets,
  };
}
