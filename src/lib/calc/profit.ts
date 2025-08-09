/**
 * Profit calculation functions
 *
 * Formulas:
 * - profit = revenue - recipeCost
 */

import type { Dish, Party, IngredientLine } from '../types.js';
import { partyRevenuePerDish } from './price.js';
import { recipeCost } from './costs.js';

export const partyProfitPerDish = (dish: Dish, party: Party, ingLines: IngredientLine[]): number =>
	partyRevenuePerDish(dish, party) - recipeCost(ingLines);
