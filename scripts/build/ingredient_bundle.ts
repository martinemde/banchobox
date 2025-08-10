import type { Ingredient, Id } from '../../src/lib/types.js';

export type Facets = Record<string, Record<string, Id[]>>;

export function buildIngredientsBundle(ingredients: Ingredient[]) {
  const byId = Object.fromEntries(ingredients.map((i) => [i.id, i])) as Record<Id, Ingredient>;

  // Minimal, useful facets (no hasIngredient)
  const facets: Facets = {
    type: {}, // e.g. 'fish', 'shellfish', etc.
    source: {}, // e.g. 'Blue Hole', 'Market', ...
    time: {}, // 'day','night','fog' flags mapped to ids
    vendor: {}, // 'jangovendor', 'ottovendor' based on presence of buy price
    drone: {}, // 'yes' when ingredient.drone === true
  };

  for (const i of ingredients) {
    if (i.type) (facets.type[i.type] ??= []).push(i.id);
    if (i.source) (facets.source[i.source] ??= []).push(i.id);
    if (i.day) (facets.time['day'] ??= []).push(i.id);
    if (i.night) (facets.time['night'] ??= []).push(i.id);
    if (i.fog) (facets.time['fog'] ??= []).push(i.id);
    if (i.buyJango != null) (facets.vendor['jangovendor'] ??= []).push(i.id);
    if (i.buyOtto != null) (facets.vendor['ottovendor'] ??= []).push(i.id);
    if (i.drone) (facets.drone['yes'] ??= []).push(i.id);
  }

  return { rows: ingredients, byId, facets };
}
