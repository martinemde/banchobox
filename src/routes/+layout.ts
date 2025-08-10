import type { LayoutServerLoad } from './$types';
import { base } from '$app/paths';
import type { Dish, Ingredient, EnrichedParty, PartyDish } from '$lib/types.js';

export const prerender = true;

type LoaderResult = {
  dishes: Dish[];
  ingredients: Ingredient[];
  parties: EnrichedParty[];
  partyDishes: PartyDish[];
};

export const load: (event: Parameters<LayoutServerLoad>[0]) => Promise<LoaderResult> = async ({ fetch }) => {
  const url = (file: string) => `${base}/data/${file}`;

  const [dishes, ingredients, parties, partyDishes] = await Promise.all([
    fetch(url('dishes.v1.json')).then((r) => r.json() as Promise<Dish[]>),
    fetch(url('ingredients.v1.json')).then((r) => r.json() as Promise<Ingredient[]>),
    fetch(url('parties.v1.json')).then((r) => r.json() as Promise<EnrichedParty[]>),
    fetch(url('party-dishes.v1.json')).then((r) => r.json() as Promise<PartyDish[]>)
  ]);

  return { dishes, ingredients, parties, partyDishes };
};
