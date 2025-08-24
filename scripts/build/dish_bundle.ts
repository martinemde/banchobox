import type {
	Dish,
	Id,
	EntityBundle,
	Chapter,
	Ingredient,
	Party,
	CookstaTier
} from '../../src/lib/types.js';

export function buildDishesBundle({
	dishes,
	chaptersBundle,
	ingredientsBundle,
	partiesBundle,
	cookstaBundle
}: {
	dishes: Dish[];
	chaptersBundle: EntityBundle<Chapter>;
	ingredientsBundle: EntityBundle<Ingredient>;
	partiesBundle: EntityBundle<Party>;
	cookstaBundle: EntityBundle<CookstaTier>;
}): EntityBundle<Dish> {
	// byId index for O(1) lookups
	const byId = Object.fromEntries(dishes.map((d) => [d.id, d])) as Record<Id, Dish>;

	// Facets - minimal set to start; structure is easy to extend
	const facets: EntityBundle<Dish>['facets'] = {
		Chapter: {},
		Cooksta: {},
		DLC: {},
		Ingredient: {},
		Party: {},
		'Unlock Condition': {}
	};

	const maxChapter = Math.max(...chaptersBundle.rows.map((c) => c.number));
	const maxCooksta = Math.max(...cookstaBundle.rows.map((c) => c.rank));
	const minCooksta = Math.min(...cookstaBundle.rows.map((c) => c.rank));
	const cookstaNameByRank = Object.fromEntries(cookstaBundle.rows.map((c) => [c.rank, c.name]));

	for (const d of dishes) {
		const dlc = (d.dlc ?? 'Base').toString();
		(facets.DLC[dlc] ??= []).push(d.id);

		const unlock = (d.unlock ?? '').toString();
		if (unlock) {
			if (unlock.startsWith('Staff ')) {
				(facets['Unlock Condition']['Staff Unlock'] ??= []).push(d.id);
			} else {
				(facets['Unlock Condition'][unlock] ??= []).push(d.id);
			}
		}

		for (const line of d.ingredients) {
			const key = String(line.name);
			(facets.Ingredient[key] ??= []).push(d.id);
		}

		// Chapter facets - cumulative
		let ch = d.chapter ?? 0;
		// The dish chapter is the max of the chapter and the highest level of any ingredient
		for (const line of d.ingredients) {
			const ingredient = ingredientsBundle.byId[line.ingredientId];
			if (
				ingredient.chapter !== null &&
				ingredient.chapter !== undefined &&
				ingredient.chapter > ch
			) {
				ch = ingredient.chapter;
			}
		}

		// Party facet (if present)
		for (const partyId of d.partyIds) {
			const party = partiesBundle.byId[partyId];
			(facets.Party[party.name] ??= []).push(d.id);
		}

		// Add the dish to its cooksta unlock level and up
		// If it doesn't have a cooksta, it's available in all tiers
		if (d.cooksta !== null && d.cooksta !== undefined) {
			const cookstaTier = cookstaBundle.rows.find((c) => c.name === d.cooksta)!;
			for (let n = cookstaTier.rank; n <= maxCooksta; n++) {
				(facets.Cooksta[cookstaNameByRank[n]] ??= []).push(d.id);
			}
		} else {
			for (let n = minCooksta; n <= maxCooksta; n++) {
				(facets.Cooksta[cookstaNameByRank[n]] ??= []).push(d.id);
			}
		}

		// Add the ingredient to every chapter including and after the dish's chapter
		// Once the ingredient is available, it remains available in all later chapters.
		// This stores as a number because we never show it in the UI.
		if (ch != null && Number.isFinite(ch)) {
			for (let n = ch; n <= maxChapter; n++) {
				(facets.Chapter[n.toString()] ??= []).push(d.id);
			}
		}
	}

	return {
		rows: dishes,
		byId,
		facets
	};
}
