// Core data interfaces matching Data-Modeling.md structure with ID-based system
export type Id = number;

export type Facets = Record<string, Record<string, Id[]>>;

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

export interface BasicDish {
	id: Id;
	name: string;
	image: string;
	chapter?: number | null;
	maxLevel: number;
	basePrice: number;
	baseTaste: number;
	baseServings: number;
	finalPrice: number;
	finalTaste: number;
	finalServings: number;
	unlock?: string | null;
	dlc?: string | null;
	cooksta?: string | null;
	artisansFlames?: number | null;
}

export interface BasicIngredient {
	id: Id;
	name: string;
	image: string; // image filename
	chapter?: number | null;
	source: string;
	type: string;
	drone: boolean;
	harpoon: boolean;
	steelnet: boolean;
	crabtrap: boolean;
	bugnet: boolean;
	gloves: boolean;
	aberration: boolean;
	kg?: number | null;
	maxMeats?: number | null;
	day: boolean;
	night: boolean;
	fog: boolean;
	rank: number;
	farm?: string; // farm source like Gumo
	sell?: number | null;
	buyJango?: number | null; // Jango purchase price
	buyOtto?: number | null; // Otto purchase price
	cost: number; // The replacement cost for the ingredient
}

export interface PartyInputRow {
	id: Id;
	name: string;
	order: number;
	bonus: number;
}

export interface Party {
	id: Id;
	name: string;
	bonus: number;
	partyDishIds: Id[]; // References to PartyDish entities, sorted by profit descending
	search: string;
	sort: PartySort;
}

// Relationship entities
export interface DishIngredient {
	dishId: Id;
	ingredientId: Id;
	count: number;
	levels: number;
	upgradeCount: number;
}

export interface DishParty {
	dishId: Id;
	partyId: Id;
}

// Graph structure for efficient lookups
export interface Graph {
	dishes: BasicDish[];
	ingredients: BasicIngredient[];
	parties: PartyInputRow[];
	dishIngredients: DishIngredient[];
	dishParties: DishParty[];

	// Indexes for O(1) lookups
	dishById: Map<Id, BasicDish>;
	ingById: Map<Id, BasicIngredient>;
	partyById: Map<Id, PartyInputRow>;
	ingByDishId: Map<Id, { ingredientId: Id; count: number }[]>;
	dishesByIngredientId: Map<Id, { dishId: Id; count: number }[]>;
	partiesByDishId: Map<Id, Id[]>;
	dishesByPartyId: Map<Id, Id[]>;
}

// Precomputed data structures for JSON export
export interface Dish extends BasicDish {
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

export interface Ingredient extends BasicIngredient {
	usedIn: Array<{
		dishId: Id;
		dishName: string;
		dishImage: string;
		count: number;
		upgradeCount: number;
		level: number;
		price: number;
		revenue: number;
		servings: number;
		partyNames: string[];
	}>;
	usedForParties: Id[];
	sellPerKg?: number;
	vendors?: Record<string, number> | null;
	// Client-side search & sort helpers (precomputed at build time)
	search: string; // normalized tokens (name, source, type, day/night/fog, drone)
	sort: Record<IngredientSortKey, string | number | null>;
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

export interface StaffInputRow {
	id: Id;
	name: string;
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
	branchPopularityMaxAtLevel: number | null;
}

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
	branchPopularityMaxAtLevel: number | null; // Not all staff can max the branch
	// Client-side search & sort helpers
	search: string; // normalized tokens (name, skills)
	sort: Record<StaffSortKey, string | number>;
}
