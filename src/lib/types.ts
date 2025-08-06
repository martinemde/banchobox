// Core data interfaces matching Data-Modeling.md structure with ID-based system
export type Id = number;

export interface Dish {
  id: Id;
  name: string;
  final_level: number;
  final_taste: number;
  initial_price: number;
  final_price: number;
  servings: number;
  unlock_condition?: string | null;
  dlc?: string | null;
}

export interface Ingredient {
  id: Id;
  name: string;
  source?: string;
  type?: string;
  drone: number;
  kg?: number | null;
  max_meats?: number | null;
  cost?: number | null;
}

export interface Party {
  id: Id;
  name: string;
  bonus: number;
  order: number;
}

// Relationship entities
export interface DishIngredient {
  dish_id: Id;
  ingredient_id: Id;
  count: number;
  levels?: number | null;
  upgrade_count?: number | null;
}

export interface DishParty {
  dish_id: Id;
  party_id: Id;
}

// Graph structure for efficient lookups
export interface Graph {
  dishes: Dish[];
  ingredients: Ingredient[];
  parties: Party[];
  dishIngredients: DishIngredient[];
  dishParties: DishParty[];

  // Indexes for O(1) lookups
  dishById: Map<Id, Dish>;
  ingById: Map<Id, Ingredient>;
  partyById: Map<Id, Party>;
  ingByDishId: Map<Id, { ingredient_id: Id; count: number }[]>;
  dishesByIngredientId: Map<Id, { dish_id: Id; count: number }[]>;
  partiesByDishId: Map<Id, Id[]>;
  dishesByPartyId: Map<Id, Id[]>;
}

// Calculator interfaces for extensibility
export interface Calculator<TInput = unknown, TOutput = number> {
  name: string;
  description: string;
  calculate(data: TInput): TOutput;
}

// Specific calculator types
export interface IngredientLine {
  count: number;
  unitCost: number | null | undefined;
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
  partyPrice: number; // dish.final_price * party.bonus
  partyRevenue: number; // partyPrice * dish.servings
  profit: number; // partyRevenue - dish.recipeCost
  profitPerServing: number; // profit / dish.servings
}

// Precomputed data structures for JSON export
export interface EnrichedDish extends Dish {
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
  baseRevenue: number; // final_price * servings
  baseProfit: number; // baseRevenue - recipeCost
  baseProfitPerServing: number; // baseProfit / servings
  maxProfitPerServing: number; // maxProfitPerDish / servings
  upgradeCost: number; // sum of (unitCost * upgradeCount) for all ingredients
  upgradeBreakEven: number; // maxProfitPerDish / upgradeCost (0 if upgradeCost is 0)
  ingredientCount: number; // total count of all ingredients

  // Best party information (flattened for easier access)
  bestPartyName: string | null;
  bestPartyBonus: number | null;
  bestPartyPrice: number | null;
  bestPartyRevenue: number | null;
}

export interface EnrichedIngredient extends Ingredient {
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
  dishes: EnrichedDish[];
  ingredients: EnrichedIngredient[];
  parties: EnrichedParty[];
  partyDishes: PartyDish[];
}

// Legacy interfaces for backward compatibility during transition
export interface LegacyDish {
  name: string;
  unlockCondition?: string;
  dlc?: string;
  finalLevel: number;
  finalTaste: number;
  initialPrice: number;
  finalPrice: number;
  servings: number;
  parties: string[];
  ingredients: LegacyDishIngredient[];
}

export interface LegacyDishIngredient {
  name: string;
  count: number;
  levels?: number;
  upgradeCount?: number;
}

export interface LegacyIngredient {
  name: string;
  source?: string;
  type?: string;
  drone: boolean;
  kg?: number;
  maxMeats?: number;
  cost?: number;
}

export interface LegacyParty {
  name: string;
  bonus: number;
  dishes: string[];
}
