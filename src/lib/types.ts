// Core data interfaces matching Data-Modeling.md structure with ID-based system
export type Id = number;

export type Facets = Record<string, Record<string, Id[]>>;

/**
 * Base interface for entities that can be used with the Bundle system.
 * All entities used in EntityBundlePage must extend this interface.
 */
export interface BundleEntity {
	id: Id;
	sort: Record<string, string | number | null>;
	search?: string;
}

export interface EntityBundle<Row> {
	rows: Row[];
	byId: Record<Id, Row>;
	facets: Facets;
}

// --------------------
// Cooksta data types
// --------------------

export interface CookstaInputRow {
	id: Id;
	name: string;
	rank: number;
	customers: number;
	customerNight: number;
	partyCustomers: number;
	followers: number;
	recipes: number;
	bestTaste: number;
	operatingCost: number;
	kitchenStaff: number;
	servingStaff: number;
}

export interface CookstaTier {
	id: Id;
	name: string;
	rank: number;
	customers: number;
	customerNight: number;
	partyCustomers: number;
	followers: number;
	recipes: number;
	bestTaste: number;
	operatingCost: number;
	kitchenStaff: number;
	servingStaff: number;
	// Client-side helpers
	sort: Record<'order', string | number>; // We only have one field, but we need to stay consistent.
}

// --------------------
// DLC data types
// --------------------

export interface DLCInputRow {
	id: Id;
	order: number;
	name: string;
}

export interface DLC {
	id: Id;
	name: string;
	search: string;
	sort: {
		order: number;
		name: string;
	};
}

// --------------------
// Chapter data types
// --------------------

export interface ChapterInputRow {
	id: Id;
	number: number;
	name: string;
	subtitle: string;
}

export interface Chapter {
	id: Id;
	number: number;
	name: string;
	subtitle: string;
	search: string;
	sort: {
		order: number;
	};
}

// Build-only Basic* and input-row types moved to scripts/build/types.ts

export interface Party {
	id: Id;
	name: string;
	bonus: number;
	partyDishIds: Id[]; // References to PartyDish entities, sorted by profit descending
	search: string;
	sort: PartySort;
}

// Relationship entities
// Build-only relationship and graph types moved to scripts/build/types.ts

// Precomputed data structures for JSON export
export interface Dish {
	id: Id;
	name: string;
	image: string;
	chapter?: number;
	maxLevel: number;
	basePrice: number;
	baseTaste: number;
	baseServings: number;
	finalPrice: number;
	finalTaste: number;
	finalServings: number;
	unlock?: string;
	dlc?: string;
	cooksta?: string;
	artisansFlames?: number;
	staff?: string;
	staffId?: Id;
	staffLevel?: number;
	ingredients: Array<{
		ingredientId: Id;
		count: number;
		// Denormalized fields to render recipe without loading ingredient bundle
		name: string;
		image: string; // image filename
		type: string; // semantic type; used to select icon
		unitCost: number | null;
		lineCost: number;
		upgradeCount: number | null;
	}>;
	recipeCost: number;
	partyDishIds: Id[]; // References to PartyDish entities
	partyIds: Id[]; // References to Party entities

	// Pre-calculated values to avoid view-level calculations
	finalRevenue: number; // finalPrice * finalServings
	finalProfit: number; // finalRevenue - recipeCost
	finalProfitPerServing: number; // finalProfit / finalServings
	maxProfitPerServing: number; // best profit per serving across parties
	upgradeCost: number; // sum of (unitCost * upgradeCount) for all ingredients
	ingredientCount: number; // total count of all ingredients

	// Client-side search & sort helpers (precomputed at build time)
	search: string; // normalized tokens (name, dlc, unlock, ingredient names)
	sort: Record<DishSortKey, string | number>;
}

// PartyDish entity - first-class representation of party-dish relationships
export interface PartyDish extends Dish {
	partyId: Id;
	dishId: Id;
	partyName: string;
	partyBonus: number; // party.bonus
}

export interface Ingredient {
	id: Id;
	name: string;
	image: string;
	chapter?: number;
	source: string;
	type: string;
	drone: boolean;
	harpoon: boolean;
	steelnet: boolean;
	crabtrap: boolean;
	bugnet: boolean;
	gloves: boolean;
	aberration: boolean;
	kg?: number;
	maxMeats?: number;
	day: boolean;
	night: boolean;
	fog: boolean;
	rank: number;
	farm?: string;
	sell?: number;
	buyJango?: number;
	buyOtto?: number;
	cost: number;
	usedIn: Array<{
		dishId: Id;
		partyIds: Id[];
		dishName: string;
		dishImage: string;
		count: number;
		upgradeCount: number;
		price: number;
		servings: number;
		partyNames: string[];
	}>;
	usedForParties: Id[];
	sellPerKg?: number;
	vendors?: Record<string, number>;
	// Client-side search & sort helpers (precomputed at build time)
	search: string; // normalized tokens (name, source, type, day/night/fog, drone)
	sort: Record<IngredientSortKey, string | number>;
}

// Data service interface
export interface DataService {
	dishes: Dish[];
	ingredients: Ingredient[];
	parties: Party[];
	partyDishes: PartyDish[];
}

// Sort keys available for Dish.sort
export type DishSortKey =
	| 'name'
	| 'finalPrice'
	| 'finalServings'
	| 'finalRevenue'
	| 'finalProfit'
	| 'finalProfitPerServing'
	| 'maxProfitPerServing'
	| 'recipeCost'
	| 'upgradeCost'
	| 'ingredientCount';

// Sort keys for PartyDish.sort
export type PartyDishSortKey = DishSortKey | 'partyBonus' | 'partyName';

// Sort keys available for Ingredient.sort
export type IngredientSortKey =
	| 'name'
	| 'sell'
	| 'kg'
	| 'sellPerKg'
	| 'buyJango'
	| 'buyOtto'
	| 'usedForPartiesCount';

// Sort keys for Party.sort
export type PartySort = {
	order: number;
	name: string;
	bonus: number;
	dishCount: number;
};

// --------------------
// Staff data types
// --------------------

export type StaffSortKey =
	| 'name'
	| 'hiringFee'
	| 'wageMax'
	| 'cookingStatMax'
	| 'servingStatMax'
	| 'procureStatMax'
	| 'appealStatMax'
	| 'seasoningsMaxLevel20';

export interface Staff {
	id: Id;
	name: string;
	dlc?: string;
	image: string;
	hiringFee: number;
	wageBase: number;
	raise: number;
	wageMax: number;
	skillLevel3: string;
	cookingBonusLevel3: number;
	servingBonusLevel3: number;
	appealBonusLevel3: number;
	skillLevel7: string;
	cookingBonusLevel7: number;
	servingBonusLevel7: number;
	cookingStatBase: number;
	servingStatBase: number;
	procureStatBase: number;
	appealStatBase: number;
	cookingStatIncrement: number;
	servingStatIncrement: number;
	procureStatIncrement: number;
	appealStatIncrement: number;
	cookingStatMax: number;
	servingStatMax: number;
	procureStatMax: number;
	appealStatMax: number;
	branchStatCalc: number;
	seasoningsMinLevel20: number;
	seasoningsMaxLevel20: number;
	seasoningsBonus: number;
	branchRankMax: number;
	branchPopularityMax: number;
	branchPopularityMaxAtLevel?: number; // Not all staff can max the branch
	// Dish data
	dishes: Array<{
		dishId: Id;
		staffLevel: number;
		partyIds: Id[];
		// Denormalized fields to render recipes without loading dish bundle
		servings: number;
		price: number;
	}>;
	// Client-side search & sort helpers
	search: string; // normalized tokens (name, skills)
	sort: Record<StaffSortKey, string | number>;
}
