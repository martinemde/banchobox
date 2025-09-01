import { createEntityStores } from './entityBundle.js';
import type { CookstaTier, EntityBundle, Id } from '$lib/types.js';
import { derived, writable, type Readable, type Writable, get } from 'svelte/store';
import { persistedLocalState } from '$lib/utils/persisted.svelte';
import { browser } from '$app/environment';

export const cookstaStores = createEntityStores<CookstaTier>({
	sortKey: 'order',
	sortDir: 'asc'
} as unknown as { sortKey: string; sortDir: 'asc' | 'desc' });

export const bundle = cookstaStores.bundle as Writable<EntityBundle<CookstaTier> | null>;
export const visible = cookstaStores.visible as Readable<CookstaTier[]>;

// Use the improved persistence utility instead of manual localStorage
const selectedTierIdStore = persistedLocalState<Id | null>('cookstaTierId', null, {
	version: 'v1'
});

// Create a proper Svelte store that wraps the persisted state
const selectedTierIdStoreCompat = writable<Id | null>(selectedTierIdStore.get());

// Sync the store with persisted state changes in browser
if (browser) {
	$effect(() => {
		selectedTierIdStoreCompat.set(selectedTierIdStore.get());
	});
}

// Sync persisted state with store changes
selectedTierIdStoreCompat.subscribe((value) => {
	selectedTierIdStore.set(value);
});

export const selectedTierId = selectedTierIdStoreCompat;

export const selectedTier = derived([bundle, selectedTierId], ([$bundle, $selectedId]) => {
	if (!$bundle) return null as CookstaTier | null;

	let tier = null as CookstaTier | null;

	if ($selectedId != null) {
		tier = $bundle.byId[$selectedId] ?? null;
	}

	if (tier == null) {
		tier = $bundle.rows[0] ?? null;
	}

	return tier;
});

// Initialize default selection to first tier if none selected
if (browser) {
	$effect(() => {
		const $bundle = get(bundle);
		if (!$bundle) return;

		const currentSelection = selectedTierIdStore.get();
		if (currentSelection != null) return;

		const firstTier = $bundle.rows[0] ?? null;
		if (firstTier) {
			selectedTierIdStore.set(firstTier.id);
		}
	});
}
