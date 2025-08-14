import type { Ingredient, Id, EntityBundle } from '../../src/lib/types.js';

export function buildIngredientsBundle(ingredients: Ingredient[]): EntityBundle<Ingredient> {
  const byId = Object.fromEntries(ingredients.map((i) => [i.id, i])) as Record<Id, Ingredient>;

  // Minimal, useful facets (no hasIngredient)
  const facets: EntityBundle<Ingredient>['facets'] = {
    "Type": {}, // e.g. 'fish', 'vegetable', etc.
    "Source": {}, // e.g. 'Glacial Passage', 'Vegetable Farm', ...
    "Time": {}, // 'day','night','fog' flags mapped to ids
    "Vendor": {}, // 'jango', 'otto' based on presence of buy price
    "Drone": {}, // 'yes' when ingredient.drone === true
  };

  for (const i of ingredients) {
    if (i.type) (facets['Type'][i.type] ??= []).push(i.id);
    if (i.source) (facets['Source'][i.source] ??= []).push(i.id);
    if (i.day) (facets['Time']['Day'] ??= []).push(i.id);
    if (i.night) (facets['Time']['Night'] ??= []).push(i.id);
    if (i.fog) (facets['Time']['Fog'] ??= []).push(i.id);
    if (i.buyJango != null) (facets['Vendor']['Jango'] ??= []).push(i.id);
    if (i.buyOtto != null) (facets['Vendor']['Otto'] ??= []).push(i.id);
    if (i.drone) (facets['Drone']['Yes'] ??= []).push(i.id);
  }

  return { rows: ingredients, byId, facets };
}
