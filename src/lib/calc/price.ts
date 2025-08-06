/**
 * Price calculation functions
 *
 * Formulas:
 * - partyPrice  = dish.final_price * party.bonus
 * - revenue     = partyPrice * dish.servings
 */

import type { Dish, Party } from '../types.js';

export const baseDishPrice = (dish: Dish): number => dish.final_price;

export const revenuePerDish = (dish: Dish): number =>
  baseDishPrice(dish) * dish.servings;

export const partyPrice = (dish: Dish, party: Party): number =>
  baseDishPrice(dish) * party.bonus;

export const partyRevenuePerDish = (dish: Dish, party: Party): number =>
  partyPrice(dish, party) * dish.servings;
