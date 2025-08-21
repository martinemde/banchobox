import type {
	BasicDish,
	BasicIngredient,
	PartyInputRow,
	Party,
	DishIngredient,
	DishParty,
	PartyDish,
	Dish,
	Ingredient,
	EntityBundle,
	CookstaInputRow,
	CookstaTier,
	DLCInputRow,
	DLC,
	ChapterInputRow,
	Chapter,
	StaffInputRow,
	Staff
} from '../../src/lib/types.js';
import { buildDishesBundle } from './dish_bundle.js';
import { buildIngredientsBundle } from './ingredient_bundle.js';
import { buildPartiesBundle } from './party_bundle.js';
import { buildPartyDishesBundle } from './party_dish_bundle.js';
import { buildCookstaBundle } from './cooksta_bundle.js';
import { buildDLCBundle } from './dlc_bundle.js';
import { buildChapterBundle } from './chapter_bundle.js';
import { buildStaffBundle } from './staff_bundle.js';
import { prepareDishesAndPartyDishes, prepareIngredients } from './prepare.js';

export function enrichData(
	basicDishes: BasicDish[],
	basicIngredients: BasicIngredient[],
	partyInputRows: PartyInputRow[],
	dishIngredients: DishIngredient[],
	dishParties: DishParty[],
	cookstaInputRows: CookstaInputRow[],
	dlcInputRows: DLCInputRow[],
	chapterInputRows: ChapterInputRow[],
	staffInputRows: StaffInputRow[]
) {
	const cookstaBundle = buildCookstaBundle(cookstaInputRows);
	const dlcBundle = buildDLCBundle(dlcInputRows);
	const chaptersBundle = buildChapterBundle(chapterInputRows);

	const ingredients = prepareIngredients(
		basicIngredients,
		dishIngredients,
		dishParties,
		partyInputRows,
		basicDishes
	);
	const { dishes, partyDishes, partyDishesByPartyId } = prepareDishesAndPartyDishes(
		basicDishes,
		basicIngredients,
		dishIngredients,
		dishParties,
		partyInputRows
	);

	const ingredientsBundle = buildIngredientsBundle(ingredients, chaptersBundle);
	const partiesBundle = buildPartiesBundle(partyInputRows, partyDishesByPartyId);
	const partyDishesBundle = buildPartyDishesBundle(partyDishes);
	const staffBundle = buildStaffBundle(staffInputRows);
	const dishesBundle = buildDishesBundle({
		dishes,
		chaptersBundle,
		ingredientsBundle,
		partiesBundle,
		cookstaBundle
	});

	return {
		dishesBundle,
		ingredientsBundle,
		partiesBundle,
		partyDishesBundle,
		cookstaBundle,
		dlcBundle,
		chaptersBundle,
		staffBundle
	} as {
		dishesBundle: EntityBundle<Dish>;
		ingredientsBundle: EntityBundle<Ingredient>;
		partiesBundle: EntityBundle<Party>;
		partyDishesBundle: EntityBundle<PartyDish>;
		cookstaBundle: EntityBundle<CookstaTier>;
		dlcBundle: EntityBundle<DLC>;
		chaptersBundle: EntityBundle<Chapter>;
		staffBundle: EntityBundle<Staff>;
	};
}
