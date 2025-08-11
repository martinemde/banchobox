import type { LayoutLoad } from './$types';
import type { EntityBundle } from '$lib/types.js';
import { base } from '$app/paths';
import type { Dish, Ingredient, EnrichedParty, PartyDish } from '$lib/types.js';

export const prerender = true;

type DishesBundle = EntityBundle<Dish>;
type IngredientsBundle = EntityBundle<Ingredient>;
type PartiesBundle = EntityBundle<EnrichedParty>;
type PartyDishesBundle = EntityBundle<PartyDish>;

type LoaderResult = {
  dishes?: DishesBundle
  ingredients?: IngredientsBundle
  parties?: PartiesBundle
  partyDishes?: PartyDishesBundle
};

export const load: (event: Parameters<LayoutLoad>[0]) => Promise<LoaderResult> = async ({ fetch }) => {
  // SSR guard: avoid embedding large payloads in HTML
  if (typeof window === 'undefined') return {};
  const fromData = (file: string) => `${base}/data/${file}`;

  const [dishes, ingredients, parties, partyDishes] = await Promise.all([
    fetch(fromData('dishes.v1.json')).then((r) => r.json() as Promise<DishesBundle>),
    fetch(fromData('ingredients.v1.json')).then((r) => r.json() as Promise<IngredientsBundle>),
    fetch(fromData('parties.v1.json')).then((r) => r.json() as Promise<PartiesBundle>),
    fetch(fromData('party-dishes.v1.json')).then((r) => r.json() as Promise<PartyDishesBundle>)
  ]);

  return { dishes, ingredients, parties, partyDishes } as LoaderResult;
};
