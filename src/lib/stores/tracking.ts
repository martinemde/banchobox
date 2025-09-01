import { writable, type Writable } from 'svelte/store';
import { persistedLocalState } from '$lib/utils/persisted.svelte';
import { browser } from '$app/environment';

// Internal persisted state
const persistedState = persistedLocalState('trackedDishIds', new Set<number>(), {
	version: 'v1',
	serialize: (set) => JSON.stringify(Array.from(set)),
	deserialize: (raw) => new Set<number>(JSON.parse(raw) as number[])
});

// Create a Svelte store that wraps the persisted state for backward compatibility
function createTrackedIdsStore(): Writable<Set<number>> & {
	track: (id: number) => void;
	untrack: (id: number) => void;
	toggle: (id: number) => void;
} {
	const store = writable<Set<number>>(persistedState.get());

	// Sync persisted state to store when persisted state changes
	if (browser) {
		$effect(() => {
			store.set(persistedState.get());
		});
	}

	// Sync store to persisted state when store changes
	store.subscribe((value) => {
		persistedState.set(value);
	});

	function withClone(updateFn: (next: Set<number>) => void) {
		store.update((current) => {
			const next = new Set(current);
			updateFn(next);
			return next;
		});
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

	return Object.assign(store, { track, untrack, toggle });
}

export const trackedDishIds = createTrackedIdsStore();

// Backward compatible binding function
export function bindTracked(dishId: number) {
	let checked = $state(false);

	// initialize from store
	$effect(() => {
		const unsub = trackedDishIds.subscribe((set) => {
			checked = set.has(dishId);
		});
		return () => unsub();
	});

	// write-through on change
	$effect(() => {
		if (checked) trackedDishIds.track(dishId);
		else trackedDishIds.untrack(dishId);
	});

	return { get: () => checked, set: (v: boolean) => (checked = v) };
}
