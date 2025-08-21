import type { Dish, Id, EntityBundle, Chapter, Ingredient, Party } from '../../src/lib/types.js';

export function buildDishesBundle({
	dishes,
	chaptersBundle,
	ingredientsBundle,
	partiesBundle
}: {
	dishes: Dish[];
	chaptersBundle: EntityBundle<Chapter>;
	ingredientsBundle: EntityBundle<Ingredient>;
	partiesBundle: EntityBundle<Party>;
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

	for (const d of dishes) {
		const dlcVal = (d.dlc ?? 'Base').toString();
		(facets['DLC'][dlcVal] ??= []).push(d.id);

		const unlockVal = (d.unlock ?? '').toString();
		if (unlockVal) {
			if (unlockVal.startsWith('Staff ')) {
				(facets['Unlock Condition']['Staff Unlock'] ??= []).push(d.id);
			} else {
				(facets['Unlock Condition'][unlockVal] ??= []).push(d.id);
			}
		}

		for (const line of d.ingredients) {
			const key = String(line.name);
			(facets['Ingredient'][key] ??= []).push(d.id);
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
			(facets['Party'][party.name] ??= []).push(d.id);
		}

		// Cooksta facet (if present)
		const cookstaVal = (d.cooksta ?? '').toString();
		if (cookstaVal) {
			(facets['Cooksta'][cookstaVal] ??= []).push(d.id);
		}

		// Add the ingredient to every chapter including and after the dish's chapter
		// Once the ingredient is available, it remains available in all later chapters.
		if (ch != null && Number.isFinite(ch)) {
			for (let n = ch; n <= maxChapter; n++) {
				(facets['Chapter'][n.toString()] ??= []).push(d.id);
			}
		}
	}

	return {
		rows: dishes,
		byId,
		facets
	};
}
