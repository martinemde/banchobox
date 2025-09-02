import type { Id } from '../../src/lib/types.js';

export interface DishInputRow {
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
	staffLevel?: number;
}

export interface IngredientInputRow {
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
}

export interface PartyInputRow {
	id: Id;
	name: string;
	order: number;
	bonus: number;
}

export interface DishIngredientInputRow {
	dish: string;
	ingredient: string;
	count: number;
	levels: number;
	upgradeCount: number;
}

export interface DishIngredientJoinRow {
	dishId: Id;
	ingredientId: Id;
	count: number;
	levels: number;
	upgradeCount: number;
}

export interface PartyDishJoinRow {
	dishId: Id;
	partyId: Id;
}

export interface StaffInputRow {
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
	branchPopularityMaxAtLevel?: number;
}
