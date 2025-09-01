import { writable, type Writable } from 'svelte/store';
import { persistedLocalState } from '$lib/utils/persisted.svelte';
import { browser } from '$app/environment';

// Internal persisted state
const persistedState = persistedLocalState('hiredStaff', new Set<number>(), {
	version: 'v1',
	serialize: (set) => JSON.stringify(Array.from(set)),
	deserialize: (raw) => new Set<number>(JSON.parse(raw) as number[])
});

// Create a Svelte store that wraps the persisted state for backward compatibility
function createHiredStaffIdsStore(): Writable<Set<number>> & {
	hire: (id: number) => void;
	unhire: (id: number) => void;
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

	function hire(id: number) {
		withClone((next) => next.add(id));
	}

	function unhire(id: number) {
		withClone((next) => next.delete(id));
	}

	function toggle(id: number) {
		withClone((next) => {
			if (next.has(id)) next.delete(id);
			else next.add(id);
		});
	}

	return Object.assign(store, { hire, unhire, toggle });
}

export const hiredStaffIds = createHiredStaffIdsStore();

// Backward compatible binding function
export function bindHired(staffId: number) {
	let checked = $state(false);

	// initialize from store
	$effect(() => {
		const unsub = hiredStaffIds.subscribe((set) => {
			checked = set.has(staffId);
		});
		return () => unsub();
	});

	// write-through on change
	$effect(() => {
		if (checked) hiredStaffIds.hire(staffId);
		else hiredStaffIds.unhire(staffId);
	});

	return { get: () => checked, set: (v: boolean) => (checked = v) };
}
