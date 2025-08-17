import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';

type DishId = number;

type LevelsMap = Record<DishId, number>;

const STORAGE_KEY = 'dishLevels.v1';

function readFromStorage(): LevelsMap {
	if (!browser) return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as unknown;
		if (parsed && typeof parsed === 'object') {
			const out: LevelsMap = {};
			for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
				const id = Number(k);
				const level = Number(v);
				if (Number.isFinite(id) && Number.isFinite(level)) out[id] = Math.max(1, Math.floor(level));
			}
			return out;
		}
		return {};
	} catch {
		return {};
	}
}

function writeToStorage(levels: LevelsMap): void {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
	} catch {
		// ignore
	}
}

function clampLevel(level: number, maxLevel: number): number {
	const max = Math.max(1, Math.floor(maxLevel || 1));
	return Math.min(Math.max(Math.floor(level || 1), 1), max);
}

export type DishLevelsStore = Writable<LevelsMap> & {
	getLevel: (dishId: DishId, maxLevel: number) => number;
	setLevel: (dishId: DishId, level: number) => void;
};

function createDishLevelsStore(): DishLevelsStore {
	const initial = readFromStorage();
	const store = writable<LevelsMap>(initial);

	store.subscribe((levels) => writeToStorage(levels));

	function getLevel(dishId: DishId, maxLevel: number): number {
		let current: number | undefined;
		let max = Math.max(1, Math.floor(maxLevel || 1));
		// Synchronously read without subscription
		let snapshot: LevelsMap | undefined;
		store.update((value) => (snapshot = value, value));
		current = snapshot?.[dishId];
		const fallback = Math.min(10, max);
		return clampLevel(current ?? fallback, max);
	}

	function setLevel(dishId: DishId, level: number) {
		store.update((current) => {
			const next: LevelsMap = { ...current };
			next[dishId] = Math.max(1, Math.floor(level || 1));
			return next;
		});
	}

	return Object.assign(store, { getLevel, setLevel });
}

export const dishLevels = createDishLevelsStore();
