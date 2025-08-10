import type { LayoutLoad } from './$types';
import { base } from '$app/paths';
import type { Dish, Ingredient, EnrichedParty, PartyDish, Id } from '$lib/types.js';

export const prerender = true;

type DishesBundle = {
  rows: Dish[];
  byId: Record<Id, Dish>;
  facets: Record<string, Record<string, Id[]>>;
};

type IngredientsBundle = {
  rows: Ingredient[];
  byId: Record<Id, Ingredient>;
  facets: Record<string, Record<string, Id[]>>;
};

type PartiesDishSubBundle = { rows: PartyDish[]; byId: Record<Id, PartyDish>; facets: Record<string, Record<string, Id[]>> };
type PartiesBundle = {
  rows: EnrichedParty[];
  byId: Record<Id, EnrichedParty>;
  facets: Record<string, Record<string, Id[]>>;
  dishesByParty: Record<Id, PartiesDishSubBundle>;
};

type LoaderResult = {
  dishes?: never; // replaced by bundle
  ingredients?: Ingredient[];
  parties?: EnrichedParty[];
  partyDishes?: PartyDish[];
  dishesBundle?: DishesBundle;
  ingredientsBundle?: IngredientsBundle;
  partiesBundle?: PartiesBundle;
};

export const load: (event: Parameters<LayoutLoad>[0]) => Promise<LoaderResult> = async ({ fetch }) => {
  // SSR guard: avoid embedding large payloads in HTML
  if (typeof window === 'undefined') return {};
  const fromData = (file: string) => `${base}/data/${file}`;

  const [dishesBundle, ingredientsBundle, partiesBundle, partyDishes] = await Promise.all([
    fetch(fromData('dishes.v1.json')).then((r) => r.json() as Promise<DishesBundle>),
    fetch(fromData('ingredients.v1.json')).then((r) => r.json() as Promise<IngredientsBundle>),
    fetch(fromData('parties.v1.json')).then((r) => r.json() as Promise<PartiesBundle>),
    fetch(fromData('party-dishes.v1.json')).then((r) => r.json() as Promise<PartyDish[]>)
  ]);

  return { dishesBundle, ingredientsBundle, partiesBundle, partyDishes } as any;
};
