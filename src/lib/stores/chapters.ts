import { createEntityStores } from './entityBundle.js';
import type { Chapter, EntityBundle, Id } from '$lib/types.js';
import { derived, writable, type Readable, type Writable, get } from 'svelte/store';
import { persistedLocalState } from '$lib/utils/persisted.svelte';
import { browser } from '$app/environment';

export const chaptersStores = createEntityStores<Chapter>({
	sortKey: 'order',
	sortDir: 'asc'
} as unknown as { sortKey: string; sortDir: 'asc' | 'desc' });

export const bundle = chaptersStores.bundle as Writable<EntityBundle<Chapter> | null>;
export const visible = chaptersStores.visible as Readable<Chapter[]>;

// Use the improved persistence utility instead of manual localStorage
const selectedChapterIdStore = persistedLocalState<Id | null>('storyChapterId', null, {
	version: 'v1'
});

// Create a proper Svelte store that wraps the persisted state
const selectedChapterIdStoreCompat = writable<Id | null>(selectedChapterIdStore.get());

// Sync the store with persisted state changes in browser
if (browser) {
	$effect(() => {
		selectedChapterIdStoreCompat.set(selectedChapterIdStore.get());
	});
}

// Sync persisted state with store changes
selectedChapterIdStoreCompat.subscribe((value) => {
	selectedChapterIdStore.set(value);
});

export const selectedChapterId = selectedChapterIdStoreCompat;

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

		const currentSelection = selectedChapterIdStore.get();
		if (currentSelection != null) return;

		const firstChapter = ($bundle.rows ?? [])[0] ?? null;
		if (firstChapter) {
			selectedChapterIdStore.set(firstChapter.id);
		}
	});
}
