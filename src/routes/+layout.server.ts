import type { LayoutServerLoad } from './$types';
import { base } from '$app/paths';
import type {
  EnrichedDish,
  EnrichedIngredient,
  EnrichedParty,
  PartyDish
} from '$lib/types.js';

export const prerender = true;

export const load: LayoutServerLoad = async ({ fetch }) => {
  const url = (file: string) => `${base}/data/${file}`;

  const [dishes, ingredients, parties, partyDishes] = await Promise.all([
    fetch(url('dishes.v1.json')).then((r) => r.json() as Promise<EnrichedDish[]>),
    fetch(url('ingredients.v1.json')).then((r) => r.json() as Promise<EnrichedIngredient[]>),
    fetch(url('parties.v1.json')).then((r) => r.json() as Promise<EnrichedParty[]>),
    fetch(url('party-dishes.v1.json')).then((r) => r.json() as Promise<PartyDish[]>)
  ]);

  return { dishes, ingredients, parties, partyDishes };
};
