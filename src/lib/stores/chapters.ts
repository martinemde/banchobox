import { createEntityStores } from './entityBundle.js';
import type { Chapter, EntityBundle, Id } from '$lib/types.js';
import { derived, type Readable, type Writable, get } from 'svelte/store';
import { persistedLocalState } from '$lib/utils/persisted.svelte';
import { browser } from '$app/environment';

export const chaptersStores = createEntityStores<Chapter>({
	sortKey: 'order',
	sortDir: 'asc'
} as unknown as { sortKey: string; sortDir: 'asc' | 'desc' });

export const bundle = chaptersStores.bundle as Writable<EntityBundle<Chapter> | null>;
export const visible = chaptersStores.visible as Readable<Chapter[]>;

// Use the improved persistence utility - it now implements the store contract directly
export const selectedChapterId = persistedLocalState<Id | null>('storyChapterId', null, {
	version: 'v1'
});

export const selectedChapter = derived([bundle, selectedChapterId], ([$bundle, $selectedId]) => {
	if (!$bundle) return null as Chapter | null;

	let chapter = null as Chapter | null;

	if ($selectedId != null) {
		chapter = $bundle.byId[$selectedId] ?? null;
	}

	if (chapter == null) {
		chapter = ($bundle.rows ?? [])[0] ?? null;
	}

	return chapter;
});

// Initialize default selection to first chapter if none selected
if (browser) {
	$effect(() => {
		const $bundle = get(bundle);
		if (!$bundle) return;

		const currentSelection = selectedChapterId.get();
		if (currentSelection != null) return;

		const firstChapter = ($bundle.rows ?? [])[0] ?? null;
		if (firstChapter) {
			selectedChapterId.set(firstChapter.id);
		}
	});
}
