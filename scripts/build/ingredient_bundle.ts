import type { Ingredient, Id, EntityBundle, Chapter } from '../../src/lib/types.js';

export function buildIngredientsBundle(
	ingredients: Ingredient[],
	chaptersBundle: EntityBundle<Chapter>
): EntityBundle<Ingredient> {
	const byId = Object.fromEntries(ingredients.map((i) => [i.id, i])) as Record<Id, Ingredient>;

	// Minimal, useful facets (no hasIngredient)
	const facets: EntityBundle<Ingredient>['facets'] = {
		Type: {}, // e.g. 'fish', 'vegetable', etc.
		Source: {}, // e.g. 'Glacial Passage', 'Vegetable Farm', ...
		Time: {}, // 'day','night','fog' flags mapped to ids
		Vendor: {}, // 'jango', 'otto' based on presence of buy price
		Catch: {}, // 'crabtrap', 'bugnet', 'gloves' based on presence of capture flags
		Aberration: {}, // 'yes' when ingredient.aberration === true
		Farm: {}, // 'gumo', 'otto'
		Chapter: {}
	};

	const maxChapter = Math.max(...chaptersBundle.rows.map((c) => c.number));

	for (const i of ingredients) {
		if (i.source) (facets['Source'][i.source] ??= []).push(i.id);
		if (i.farm) (facets['Farm'][i.farm] ??= []).push(i.id);

		// Type facets
		if (i.type) (facets['Type'][i.type] ??= []).push(i.id);
		if (i.aberration) (facets['Type']['Aberration'] ??= []).push(i.id);

		// Time facets
		if (i.day) (facets['Time']['Day'] ??= []).push(i.id);
		if (i.night) (facets['Time']['Night'] ??= []).push(i.id);
		if (i.fog) (facets['Time']['Fog'] ??= []).push(i.id);

		// Vendor facets
		if (i.buyJango != null) (facets['Vendor']['Jango'] ??= []).push(i.id);
		if (i.buyOtto != null) (facets['Vendor']['Otto'] ??= []).push(i.id);

		// Catch facets
		if (i.drone) (facets['Catch']['Drone'] ??= []).push(i.id);
		if (i.crabtrap) (facets['Catch']['Crab Trap'] ??= []).push(i.id);
		if (i.bugnet) (facets['Catch']['Bug Net'] ??= []).push(i.id);
		if (i.gloves) (facets['Catch']['Gloves'] ??= []).push(i.id);
		if (i.steelnet) (facets['Catch']['Steel Net'] ??= []).push(i.id);
		if (i.harpoon) (facets['Catch']['Harpoon'] ??= []).push(i.id);

		// Chapter facets - cumulative
		const ch = i.chapter ?? null;
		// Add the ingredient to every chapter up to the max chapter.
		// Once the ingredient is available, it remains available in all later chapters.
		if (ch != null && Number.isFinite(ch)) {
			for (let n = ch; n <= maxChapter; n++) {
				(facets['Chapter'][n.toString()] ??= []).push(i.id);
			}
		}
	}

	return { rows: ingredients, byId, facets };
}
