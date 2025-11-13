import { createEntityStores } from './entityBundle.js';
import type { CookstaTier, EntityBundle, Id } from '$lib/types.js';
import { derived, type Readable, type Writable } from 'svelte/store';
import { persistedLocalState } from '$lib/utils/persisted.svelte';

export const cookstaStores = createEntityStores<CookstaTier>({
	sortKey: 'order',
	sortDir: 'asc'
} as unknown as { sortKey: string; sortDir: 'asc' | 'desc' });

export const bundle = cookstaStores.bundle as Writable<EntityBundle<CookstaTier> | null>;
export const visible = cookstaStores.visible as Readable<CookstaTier[]>;

// Use the improved persistence utility - it now implements the store contract directly
export const selectedTierId = persistedLocalState<Id | null>('cookstaTierId', null, {
	version: 'v1'
});

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
