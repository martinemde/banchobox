import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

function readFromStorage(storageKey: string): number[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(storageKey);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) return parsed.filter((n) => Number.isFinite(n));
		return [];
	} catch {
		return [];
	}
}

function writeToStorage(storageKey: string, ids: Set<number>): void {
	if (!browser) return;
	try {
		localStorage.setItem(storageKey, JSON.stringify([...ids]));
	} catch {
		// ignore
	}
}

function createHiredStaffIdsStore(storageKey: string): Writable<Set<number>> & {
	hire: (id: number) => void;
	unhire: (id: number) => void;
	toggle: (id: number) => void;
} {
	const initial = new Set<number>(readFromStorage(storageKey));
	const store = writable<Set<number>>(initial);

	// Persist on changes
	store.subscribe((ids) => writeToStorage(storageKey, ids));

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

export const hiredStaffIds = createHiredStaffIdsStore('hiredStaff.v1');

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
