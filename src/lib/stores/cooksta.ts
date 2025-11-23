import { writable, derived } from 'svelte/store';
import type { CookstaTier, Id } from '$lib/types.js';
import { persistedLocalState } from '$lib/utils/persisted.svelte';

export const cookstaTiers = writable<CookstaTier[]>([]);

// Use the improved persistence utility - it now implements the store contract directly
export const selectedTierId = persistedLocalState<Id | null>('cookstaTierId', null, {
	version: 'v1'
});

export const selectedTier = derived([cookstaTiers, selectedTierId], ([$tiers, $selectedId]) => {
	if (!$tiers || $tiers.length === 0) return null as CookstaTier | null;

	let tier = null as CookstaTier | null;

	if ($selectedId != null) {
		tier = $tiers.find((t) => t.id === $selectedId) ?? null;
	}

	if (tier == null) {
		tier = $tiers[0] ?? null;
	}

	return tier;
});
