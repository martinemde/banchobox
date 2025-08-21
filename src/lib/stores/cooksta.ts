import { createEntityStores } from './entityBundle.js';
import type { CookstaTier, EntityBundle, Id } from '$lib/types.js';
import { derived, writable, type Readable, type Writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export const cookstaStores = createEntityStores<CookstaTier>({
	sortKey: 'order',
	sortDir: 'asc'
} as unknown as { sortKey: string; sortDir: 'asc' | 'desc' });

export const bundle = cookstaStores.bundle as Writable<EntityBundle<CookstaTier> | null>;
export const visible = cookstaStores.visible as Readable<CookstaTier[]>;

// Persisted selection of current Cooksta tier id
const STORAGE_KEY = 'cookstaTierId.v2';

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

export const selectedTierId = writable<Id | null>(readSelected());
selectedTierId.subscribe((v) => writeSelected(v));

export const selectedTier = derived([bundle, selectedTierId], ([$bundle, $id]) => {
	if (!$bundle) return null as CookstaTier | null;
	let tier = null;
	if ($id != null) tier = $bundle.byId[$id] ?? null;
	if (tier == null) {
		const rows = $bundle.rows ?? [];
		tier =
			rows.find((t) => t.rank === 1) ??
			rows.find((t) => t.name?.toLowerCase() === 'bronze') ??
			rows[0] ??
			null;
	}
	return tier;
});

// Initialize default selection to Silver (then Gold, then first) if none persisted
bundle.subscribe(($bundle) => {
	if (!$bundle) return;
	if (get(selectedTierId) != null) return;
	const rows = $bundle.rows ?? [];
	const bronze = rows.find((t) => t.rank === 1) ?? rows[0] ?? null;
	if (bronze) selectedTierId.set(bronze.id);
});
