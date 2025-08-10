// Core data interfaces matching Data-Modeling.md structure with ID-based system
export type Id = number;

export interface BasicDish {
  id: Id;
  name: string;
  image: string;
  maxLevel: number;
  basePrice: number;
  baseTaste: number;
  baseServings: number;
  finalPrice: number;
  finalTaste: number;
  finalServings: number;
  unlock?: string | null;
  dlc?: string | null;
  artisansFlames?: number | null;
}

export interface BasicIngredient {
  id: Id;
  name: string;
  image: string; // image filename
  source: string;
  type: string;
  drone: boolean;
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

export interface Party {
  id: Id;
  name: string;
  order: number;
  bonus: number;
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
  parties: Party[];
  dishIngredients: DishIngredient[];
  dishParties: DishParty[];

  // Indexes for O(1) lookups
  dishById: Map<Id, BasicDish>;
  ingById: Map<Id, BasicIngredient>;
  partyById: Map<Id, Party>;
  ingByDishId: Map<Id, { ingredientId: Id; count: number }[]>;
  dishesByIngredientId: Map<Id, { dishId: Id; count: number }[]>;
  partiesByDishId: Map<Id, Id[]>;
  dishesByPartyId: Map<Id, Id[]>;
}

// Calculator interfaces for extensibility
export interface Calculator<TInput = unknown, TOutput = number> {
  name: string;
  description: string;
  calculate(data: TInput): TOutput;
}


export interface BestPartyResult {
  partyDishId: Id;
  profit: number;
}

export interface BestDishResult {
  partyDishId: Id | null;
  profit: number;
}

// PartyDish entity - first-class representation of party-dish relationships
export interface PartyDish {
  id: Id; // Unique identifier for this party-dish combination
  partyId: Id;
  dishId: Id;
  partyPrice: number; // dish.finalPrice * party.bonus
  partyRevenue: number; // partyPrice * dish.finalServings
  profit: number; // partyRevenue - dish.recipeCost
  profitPerServing: number; // profit / dish.finalServings
}

// Precomputed data structures for JSON export
export interface Dish extends BasicDish {
  ingredients: Array<{
    ingredientId: Id;
    count: number;
    unitCost: number | null;
    lineCost: number;
    upgradeCount: number | null;
  }>;
  recipeCost: number;
  partyDishIds: Id[]; // References to PartyDish entities
  bestPartyDishId: Id | null; // Reference to the PartyDish with highest profit
  maxProfitPerDish: number;

  // Pre-calculated values to avoid view-level calculations
  baseRevenue: number; // finalPrice * finalServings
  baseProfit: number; // baseRevenue - recipeCost
  baseProfitPerServing: number; // baseProfit / finalServings
  maxProfitPerServing: number; // maxProfitPerDish / finalServings
  upgradeCost: number; // sum of (unitCost * upgradeCount) for all ingredients
  upgradeBreakEven: number; // maxProfitPerDish / upgradeCost (0 if upgradeCost is 0)
  ingredientCount: number; // total count of all ingredients

  // Best party information (flattened for easier access)
  bestPartyName: string | null;
  bestPartyBonus: number | null;
  bestPartyPrice: number | null;
  bestPartyRevenue: number | null;

  // Client-side search & sort helpers (precomputed at build time)
  search: string; // normalized tokens (name, dlc, unlock, ingredient names)
  sort: Record<SortKey, string | number>;
}

export interface Ingredient extends BasicIngredient {
  usedIn: Array<{
    dishId: Id;
    count: number;
  }>;
  bestPartyDishId: Id | null; // Reference to PartyDish with highest profit for this ingredient
  usedForParties: Id[];
}

export interface EnrichedParty extends Party {
  partyDishIds: Id[]; // References to PartyDish entities, sorted by profit descending
}

// Data service interface
export interface DataService {
  dishes: Dish[];
  ingredients: Ingredient[];
  parties: EnrichedParty[];
  partyDishes: PartyDish[];
}

// Sort keys available for Dish.sort
export type SortKey =
  | 'name'
  | 'finalPrice'
  | 'finalServings'
  | 'baseProfitPerServing'
  | 'maxProfitPerServing'
  | 'maxProfitPerDish'
  | 'upgradeCost'
  | 'ingredientCount';
