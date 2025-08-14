import type { Ingredient, Id, EntityBundle } from '../../src/lib/types.js';

export function buildIngredientsBundle(ingredients: Ingredient[]): EntityBundle<Ingredient> {
  const byId = Object.fromEntries(ingredients.map((i) => [i.id, i])) as Record<Id, Ingredient>;

  // Minimal, useful facets (no hasIngredient)
  const facets: EntityBundle<Ingredient>['facets'] = {
    type: {}, // e.g. 'fish', 'vegetable', etc.
    source: {}, // e.g. 'Glacial Passage', 'Vegetable Farm', ...
    time: {}, // 'day','night','fog' flags mapped to ids
    vendor: {}, // 'jango', 'otto' based on presence of buy price
    drone: {}, // 'yes' when ingredient.drone === true
  };

  for (const i of ingredients) {
    if (i.type) (facets.type[i.type] ??= []).push(i.id);
    if (i.source) (facets.source[i.source] ??= []).push(i.id);
    if (i.day) (facets.time['day'] ??= []).push(i.id);
    if (i.night) (facets.time['night'] ??= []).push(i.id);
    if (i.fog) (facets.time['fog'] ??= []).push(i.id);
    if (i.buyJango != null) (facets.vendor['jango'] ??= []).push(i.id);
    if (i.buyOtto != null) (facets.vendor['otto'] ??= []).push(i.id);
    if (i.drone) (facets.drone['yes'] ??= []).push(i.id);
  }

  return { rows: ingredients, byId, facets };
}
