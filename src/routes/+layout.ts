import type { LayoutLoad } from './$types';
import { base } from '$app/paths';
import type { Dish, Ingredient, EnrichedParty, PartyDish, Id } from '$lib/types.js';

export const prerender = true;

type DishesBundle = {
  rows: Dish[];
  byId: Record<Id, Dish>;
  facets: Record<string, Record<string, Id[]>>;
};

type LoaderResult = {
  dishes?: never; // replaced by bundle
  ingredients?: Ingredient[];
  parties?: EnrichedParty[];
  partyDishes?: PartyDish[];
  dishesBundle?: DishesBundle;
};

export const load: (event: Parameters<LayoutLoad>[0]) => Promise<LoaderResult> = async ({ fetch }) => {
  // SSR guard: avoid embedding large payloads in HTML
  if (typeof window === 'undefined') return {};
  const fromData = (file: string) => `${base}/data/${file}`;

  const [dishesBundle, ingredients, parties, partyDishes] = await Promise.all([
    fetch(fromData('dishes.v1.json')).then((r) => r.json() as Promise<DishesBundle>),
    fetch(fromData('ingredients.v1.json')).then((r) => r.json() as Promise<Ingredient[]>),
    fetch(fromData('parties.v1.json')).then((r) => r.json() as Promise<EnrichedParty[]>),
    fetch(fromData('party-dishes.v1.json')).then((r) => r.json() as Promise<PartyDish[]>)
  ]);

  return { dishesBundle, ingredients, parties, partyDishes };
};

