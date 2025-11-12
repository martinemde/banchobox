import type { Writable } from 'svelte/store';
import { persistedLocalState } from '$lib/utils/persisted.svelte';

// Create a persisted store that directly implements the store contract
const baseStore = persistedLocalState('trackedDishIds', new Set<number>(), {
	version: 'v1',
	serialize: (set) => JSON.stringify(Array.from(set)),
	deserialize: (raw) => new Set<number>(JSON.parse(raw) as number[])
});

// Extend with helper methods
function createTrackedIdsStore(): Writable<Set<number>> & {
	track: (id: number) => void;
	untrack: (id: number) => void;
	toggle: (id: number) => void;
} {
	function withClone(updateFn: (next: Set<number>) => void) {
		const current = baseStore.get();
		const next = new Set(current);
		updateFn(next);
		baseStore.set(next);
	}

	function track(id: number) {
		withClone((next) => next.add(id));
	}

	function untrack(id: number) {
		withClone((next) => next.delete(id));
	}

	function toggle(id: number) {
		withClone((next) => {
			if (next.has(id)) next.delete(id);
			else next.add(id);
		});
	}

	return Object.assign(baseStore, { track, untrack, toggle });
}

export const trackedDishIds = createTrackedIdsStore();

// Backward compatible binding function
// Creates a two-way binding between a local state and the store
export function bindTracked(dishId: number) {
	let checked = $state(false);
	let initialized = false;

	// Initialize from store and track changes
	$effect(() => {
		const unsub = trackedDishIds.subscribe((set) => {
			checked = set.has(dishId);
			initialized = true;
		});
		return () => unsub();
	});

	// Write changes back to store (skip first run to avoid loops)
	$effect(() => {
		if (!initialized) return;
		if (checked) trackedDishIds.track(dishId);
		else trackedDishIds.untrack(dishId);
	});

	return { get: () => checked, set: (v: boolean) => (checked = v) };
}
