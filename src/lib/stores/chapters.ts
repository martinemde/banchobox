import { createEntityStores } from './entityBundle.js';
import type { Chapter, EntityBundle, Id } from '$lib/types.js';
import { derived, writable, type Readable, type Writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export const chaptersStores = createEntityStores<Chapter>({
	sortKey: 'order',
	sortDir: 'asc'
} as unknown as { sortKey: string; sortDir: 'asc' | 'desc' });

export const bundle = chaptersStores.bundle as Writable<EntityBundle<Chapter> | null>;
export const visible = chaptersStores.visible as Readable<Chapter[]>;

// Persisted selection of current story chapter id
const STORAGE_KEY = 'storyChapterId.v1';

function readSelected(): Id | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const n = Number(JSON.parse(raw));
		return Number.isFinite(n) ? (n as Id) : null;
	} catch {
		return null;
	}
}

function writeSelected(id: Id | null): void {
	if (!browser) return;
	try {
		if (id == null) localStorage.removeItem(STORAGE_KEY);
		else localStorage.setItem(STORAGE_KEY, JSON.stringify(id));
	} catch {
		// ignore
	}
}

export const selectedChapterId = writable<Id | null>(readSelected());
selectedChapterId.subscribe((v) => writeSelected(v));

export const selectedChapter = derived([bundle, selectedChapterId], ([$bundle, $id]) => {
	if (!$bundle) return null as Chapter | null;
	let chapter = null as Chapter | null;
	if ($id != null) chapter = $bundle.byId[$id] ?? null;
	if (chapter == null) chapter = ($bundle.rows ?? [])[0] ?? null;
	return chapter;
});

// Initialize default selection to Chapter 3 if present, then first
bundle.subscribe(($bundle) => {
	if (!$bundle) return;
	if (get(selectedChapterId) != null) return;
	const ch0 = ($bundle.rows ?? [])[0] ?? null;
	if (ch0) selectedChapterId.set(ch0.id);
});
