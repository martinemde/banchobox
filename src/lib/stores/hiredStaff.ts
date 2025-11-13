import type { Writable } from 'svelte/store';
import { persistedLocalState } from '$lib/utils/persisted.svelte';

// Create a persisted store that directly implements the store contract
const baseStore = persistedLocalState('hiredStaff', new Set<number>(), {
	version: 'v1',
	serialize: (set) => JSON.stringify(Array.from(set)),
	deserialize: (raw) => new Set<number>(JSON.parse(raw) as number[])
});

// Extend with helper methods
function createHiredStaffIdsStore(): Writable<Set<number>> & {
	hire: (id: number) => void;
	unhire: (id: number) => void;
	toggle: (id: number) => void;
} {
	function withClone(updateFn: (next: Set<number>) => void) {
		const current = baseStore.get();
		const next = new Set(current);
		updateFn(next);
		baseStore.set(next);
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

	return Object.assign(baseStore, { hire, unhire, toggle });
}

export const hiredStaffIds = createHiredStaffIdsStore();

// Backward compatible binding function
// Creates a two-way binding between a local state and the store
export function bindHired(staffId: number) {
	let checked = $state(false);
	let initialized = false;

	// Initialize from store and track changes
	$effect(() => {
		const unsub = hiredStaffIds.subscribe((set) => {
			checked = set.has(staffId);
			initialized = true;
		});
		return () => unsub();
	});

	// Write changes back to store (skip first run to avoid loops)
	$effect(() => {
		if (!initialized) return;
		if (checked) hiredStaffIds.hire(staffId);
		else hiredStaffIds.unhire(staffId);
	});

	return { get: () => checked, set: (v: boolean) => (checked = v) };
}
