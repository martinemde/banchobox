/**
 * Cost calculation functions
 * 
 * Formulas:
 * - lineCost = count * unitCost (treating null/undefined as 0)
 * - recipeCost = Σ(count_i * ingredient_i.cost)
 */

import type { IngredientLine } from '../types.js';

export const lineCost = (count: number, unitCost: number | null | undefined): number =>
  count * (unitCost ?? 0);

export const recipeCost = (ingLines: IngredientLine[]): number =>
  ingLines.reduce((sum, line) => sum + lineCost(line.count, line.unitCost), 0);