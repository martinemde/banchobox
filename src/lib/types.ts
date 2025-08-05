export interface Dish {
  name: string;
  unlockCondition: string;
  dlc: string;
  finalLevel: number;
  finalTaste: number;
  initialPrice: number;
  finalPrice: number;
  servings: number;
}

export interface Ingredient {
  name: string;
  source: string;
  type: string;
  drone: boolean;
  kg: number;
  maxMeats: number;
  cost: number;
}
