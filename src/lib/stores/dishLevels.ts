import { persistedLocalState } from '$lib/utils/persisted.svelte';

type DishId = number;
type LevelsMap = Record<DishId, number>;

function clampLevel(level: number, maxLevel: number): number {
	const max = Math.max(1, Math.floor(maxLevel || 1));
	return Math.min(Math.max(Math.floor(level || 1), 1), max);
}

// Custom deserializer to ensure proper number validation
function deserializeLevels(raw: string): LevelsMap {
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (parsed && typeof parsed === 'object') {
			const out: LevelsMap = {};
			for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
				const id = Number(k);
				const level = Number(v);
				if (Number.isFinite(id) && Number.isFinite(level)) {
					out[id] = Math.max(1, Math.floor(level));
				}
			}
			return out;
		}
		return {};
	} catch {
		return {};
	}
}

// Simplified dish levels store using the improved persistence utility
const dishLevelsStore = persistedLocalState<LevelsMap>(
	'dishLevels',
	{},
	{
		version: 'v1',
		deserialize: deserializeLevels
	}
);

export type DishLevelsStore = {
	get: () => LevelsMap;
	set: (value: LevelsMap) => void;
	getLevel: (dishId: DishId, maxLevel: number) => number;
	setLevel: (dishId: DishId, level: number) => void;
};

// Enhanced methods for the dish levels store
export const dishLevels: DishLevelsStore = {
	...dishLevelsStore,

	getLevel(dishId: DishId, maxLevel: number): number {
		const max = Math.max(1, Math.floor(maxLevel || 1));
		const current = dishLevelsStore.get()[dishId];
		const fallback = Math.min(10, max);
		return clampLevel(current ?? fallback, max);
	},

	setLevel(dishId: DishId, level: number) {
		const current = dishLevelsStore.get();
		const next: LevelsMap = { ...current };
		next[dishId] = Math.max(1, Math.floor(level || 1));
		dishLevelsStore.set(next); // This will trigger persistence
	}
};
