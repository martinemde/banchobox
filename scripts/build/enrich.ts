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
	PartyDishSortKey
} from '../../src/lib/types.js';
import { buildDishesBundle } from './dish_bundle.js';
import { buildIngredientsBundle } from './ingredient_bundle.js';
import { buildPartiesBundle } from './party_bundle.js';
import { buildPartyDishesBundle } from './party_dish_bundle.js';

const normalize = (v: unknown) => (v ?? '').toString().toLowerCase();

export function enrichData(
	basicDishes: BasicDish[],
	basicIngredients: BasicIngredient[],
	basicParties: Party[],
	dishIngredients: DishIngredient[],
	dishParties: DishParty[]
) {
	const partyDishes: PartyDish[] = [];
	const partyDishesByPartyId = new Map<Id, PartyDish[]>();
	let nextPartyDishId = 1;

	// Enrich dishes with precomputed values
	const dishes: Dish[] = basicDishes.map((dish) => {
		const dishIngLines = dishIngredients.filter((di) => di.dishId === dish.id);

		const ingredientLines = dishIngLines.map((di) => {
			const ing = basicIngredients.find((i) => i.id === di.ingredientId)!;
			const type = ing.type;

			return {
				ingredientId: di.ingredientId,
				count: di.count,
				name: ing.name,
				image: ing.image, // persist raw filename from CSV (e.g., "agar.png")
				type,
				unitCost: ing.cost,
				lineCost: ing.cost * di.count,
				upgradeCount: di.upgradeCount
			};
		});
		const ingredientCount = ingredientLines.reduce((total, line) => total + line.count, 0);
		const recipeCost = ingredientLines.reduce((sum, line) => sum + line.lineCost, 0);

		const finalRevenue = dish.finalPrice * dish.finalServings;
		const finalProfit = finalRevenue - recipeCost;
		const finalProfitPerServing = Math.round(finalProfit / dish.finalServings);

		const partyIds = dishParties.filter((dp) => dp.dishId === dish.id).map((dp) => dp.partyId);
		const localPartyDishes: PartyDish[] = [];
		const localPartyDishIds: Id[] = [];

		let maxProfitPerServing = finalProfitPerServing;

		const upgradeCost = ingredientLines.reduce(
			(sum, line) =>
				sum +
				(line.unitCost != null ? line.unitCost : 0) *
					(line.upgradeCount != null ? line.upgradeCount : 0),
			0
		);

		// Build search tokens and sort keys for client-side stores
		const ingredientNames = ingredientLines
			.map((l) => basicIngredients.find((i) => i.id === l.ingredientId)?.name || '')
			.filter(Boolean);
		const search = [dish.name, dish.dlc, dish.unlock, ...ingredientNames].map(normalize).join(' ');

		for (const partyId of partyIds) {
			const party = basicParties.find((p) => p.id === partyId);
			if (!party) continue;

			const partyPrice = dish.finalPrice * party.bonus;
			const partyRevenue = partyPrice * dish.finalServings;
			const partyProfit = Math.round(partyRevenue - recipeCost);
			const partyProfitPerServing = Math.round(partyProfit / dish.finalServings);

			if (partyProfitPerServing > maxProfitPerServing) {
				maxProfitPerServing = partyProfitPerServing;
			}

			const pdSearch = [dish.name, party.name, dish.dlc ?? null, dish.unlock ?? null]
				.map(normalize)
				.filter(Boolean)
				.join(' ');

			const pdSort: Record<PartyDishSortKey, string | number> = {
				name: normalize(dish.name),
				finalPrice: partyPrice,
				finalServings: dish.finalServings,
				finalRevenue: partyRevenue,
				finalProfit: partyProfit,
				finalProfitPerServing: partyProfitPerServing,
				maxProfitPerServing: partyProfitPerServing,
				recipeCost,
				upgradeCost,
				ingredientCount,
				partyBonus: party.bonus,
				partyName: party.name
			} as const;

			const pd: PartyDish = {
				...dish,
				id: nextPartyDishId++,
				ingredients: ingredientLines,
				recipeCost,
				partyDishIds: [],
				partyIds,
				finalPrice: partyPrice,
				finalRevenue: partyRevenue,
				finalProfit: partyProfit,
				finalProfitPerServing: partyProfitPerServing,
				maxProfitPerServing: partyProfitPerServing,
				upgradeCost,
				ingredientCount,
				search: pdSearch,
				sort: pdSort,
				partyId,
				dishId: dish.id,
				partyName: party.name,
				partyBonus: party.bonus
			};

			localPartyDishes.push(pd);
			localPartyDishIds.push(pd.id);
		}

		for (const pd of localPartyDishes) {
			pd.partyDishIds = localPartyDishIds;
			if (!partyDishesByPartyId.has(pd.partyId)) partyDishesByPartyId.set(pd.partyId, []);
			partyDishesByPartyId.get(pd.partyId)!.push(pd);
		}
		partyDishes.push(...localPartyDishes);

		const sort = {
			name: normalize(dish.name),
			finalPrice: dish.finalPrice,
			finalServings: dish.finalServings,
			finalRevenue,
			finalProfit,
			finalProfitPerServing,
			maxProfitPerServing,
			recipeCost,
			upgradeCost,
			ingredientCount
		} as const;

		const enrichedDish: Dish = {
			...dish,
			ingredients: ingredientLines,
			recipeCost,
			partyDishIds: localPartyDishIds,
			partyIds,
			finalRevenue,
			finalProfit,
			finalProfitPerServing,
			maxProfitPerServing,
			upgradeCost,
			ingredientCount,
			// Persist raw filename from CSV for top-level dish image
			image: dish.image,
			search,
			sort
		};

		return enrichedDish;
	});
	const dishesBundle = buildDishesBundle(dishes);

	// Enrich ingredients
	const ingredients: Ingredient[] = basicIngredients.map((ingredient) => {
		// Usage: which dishes reference this ingredient
		const usageLines = dishIngredients.filter((di) => di.ingredientId === ingredient.id);
		const usedIn = usageLines.map((u) => ({ dishId: u.dishId, count: u.count }));

		// Parties that benefit from those dishes
		const partyIdSet = new Set<Id>();
		for (const u of usageLines) {
			for (const dp of dishParties) {
				if (dp.dishId === u.dishId) partyIdSet.add(dp.partyId);
			}
		}

		const sell = ingredient.sell ?? null;
		const kg = ingredient.kg ?? null;
		const sellPerKg = sell != null && kg != null && kg !== 0 ? sell / kg : null;

		const search = [
			ingredient.name,
			ingredient.source,
			ingredient.type,
			ingredient.day ? 'day' : '',
			ingredient.night ? 'night' : '',
			ingredient.fog ? 'fog' : '',
			ingredient.drone ? 'drone' : ''
		]
			.map(normalize)
			.filter(Boolean)
			.join(' ');

		const sort = {
			name: normalize(ingredient.name),
			sell,
			kg,
			sellPerKg
		} as const;

		const finalIngredient: Ingredient = {
			...ingredient,
			usedIn,
			usedForParties: Array.from(partyIdSet),
			search,
			sort: sort as unknown as Ingredient['sort']
		};

		return finalIngredient;
	});

	const ingredientsBundle = buildIngredientsBundle(ingredients);

	const partyDishesBundle = buildPartyDishesBundle(partyDishes);

	const parties: EnrichedParty[] = basicParties.map((party) => {
		const partyDishIds = (partyDishesByPartyId.get(party.id) ?? [])
			.sort((a, b) => b.finalProfit - a.finalProfit)
			.map((pd) => pd.id);

		const enrichedParty: EnrichedParty = {
			...party,
			partyDishIds,
			search: [party.name.toLowerCase(), `${party.bonus}x`].join(' '),
			sort: {
				name: party.name.toLowerCase(),
				bonus: party.bonus,
				dishCount: partyDishIds.length,
				order: party.order
			}
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
