import { writable, derived } from 'svelte/store';
import type { Chapter, Id } from '$lib/types.js';
import { persistedLocalState } from '$lib/utils/persisted.svelte';

export const chapters = writable<Chapter[]>([]);

// Use the improved persistence utility - it now implements the store contract directly
export const selectedChapterId = persistedLocalState<Id | null>('storyChapterId', null, {
	version: 'v1'
});

export const selectedChapter = derived([chapters, selectedChapterId], ([$chapters, $selectedId]) => {
	if (!$chapters || $chapters.length === 0) return null as Chapter | null;

	let chapter = null as Chapter | null;

	if ($selectedId != null) {
		chapter = $chapters.find((c) => c.id === $selectedId) ?? null;
	}

	if (chapter == null) {
		chapter = $chapters[0] ?? null;
	}

	return chapter;
});
