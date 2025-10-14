import type { Chapter, CookstaTier, DLC, EntityBundle, Id } from '$lib/types.js';
import chaptersData from '$lib/data/chapters.v1.json';
import cookstaData from '$lib/data/cooksta.v1.json';
import dlcData from '$lib/data/dlc.v1.json';
import { LocalStore } from '$lib/utils/LocalStore.svelte.js';
import { getSortedRows } from './entityBundle.js';

// Load static data bundles
const chaptersBundleData: EntityBundle<Chapter> = chaptersData as EntityBundle<Chapter>;
const cookstaBundleData: EntityBundle<CookstaTier> = cookstaData as EntityBundle<CookstaTier>;
const dlcBundleData: EntityBundle<DLC> = dlcData as EntityBundle<DLC>;

// All static data exports
export const allChapters = getSortedRows(chaptersBundleData);
export const allCookstaTiers = getSortedRows(cookstaBundleData);
export const allDLCs = getSortedRows(dlcBundleData);

// -----------------------------
// Persisted Reactive State Stores
// -----------------------------

// Export persisted state stores
export const selectedChapterIdStore = new LocalStore<Id | null>(
	'selectedChapterId.v1',
	allChapters[0].id
);
export const selectedCookstaTierIdStore = new LocalStore<Id | null>(
	'selectedCookstaTierId.v1',
	allCookstaTiers[0].id
);
export const enabledDLCIdsStore = new LocalStore<Id[]>('enabledDLCIds.v1', []);
export const hiredStaffIdsStore = new LocalStore<number[]>('hiredStaffIds.v1', []);

// -----------------------------
// Accessor Functions (return actual objects)
// -----------------------------

// Get current selected chapter object
export function getSelectedChapter(): Chapter {
	if (selectedChapterIdStore.value != null) {
		return chaptersBundleData.byId[selectedChapterIdStore.value];
	} else {
		return allChapters[0];
	}
}

// Get current selected cooksta tier object
export function getSelectedCookstaTier(): CookstaTier {
	if (selectedCookstaTierIdStore.value != null) {
		return cookstaBundleData.byId[selectedCookstaTierIdStore.value];
	} else {
		return allCookstaTiers[0];
	}
}

export const enabledDLCs = () => allDLCs.filter((d) => enabledDLCIdsStore.value.includes(d.id));

// Check if DLC is enabled
export const isDLCEnabled = (id: number) => {
	return enabledDLCIdsStore.value.includes(id);
};

// Helper functions for common operations
export function toggleHiredStaff(staffId: number, hired: boolean) {
	if (hired) {
		if (!hiredStaffIdsStore.value.includes(staffId)) {
			hiredStaffIdsStore.value = [...hiredStaffIdsStore.value, staffId];
		}
	} else {
		hiredStaffIdsStore.value = hiredStaffIdsStore.value.filter((id) => id !== staffId);
	}
}

export function toggleDLC(id: number, enabled: boolean) {
	if (enabled) {
		if (!enabledDLCIdsStore.value.includes(id)) {
			enabledDLCIdsStore.value = [...enabledDLCIdsStore.value, id];
		}
	} else {
		enabledDLCIdsStore.value = enabledDLCIdsStore.value.filter((existingId) => existingId !== id);
	}
}
