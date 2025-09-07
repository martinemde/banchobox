import type { Chapter, CookstaTier, DLC, EntityBundle, Id } from '$lib/types.js';
import chaptersData from '$lib/data/chapters.v1.json';
import cookstaData from '$lib/data/cooksta.v1.json';
import dlcData from '$lib/data/dlc.v1.json';
import { LocalStore } from '$lib/utils/LocalStore.svelte.js';

// Load static data bundles
const chaptersBundleData: EntityBundle<Chapter> = chaptersData as EntityBundle<Chapter>;
const cookstaBundleData: EntityBundle<CookstaTier> = cookstaData as EntityBundle<CookstaTier>;
const dlcBundleData: EntityBundle<DLC> = dlcData as EntityBundle<DLC>;

// All static data exports
export const allChapters = chaptersBundleData.rows;
export const allCookstaTiers = cookstaBundleData.rows;
export const allDLCs = dlcBundleData.rows;

// -----------------------------
// Persisted Reactive State Stores
// -----------------------------

// Internal persisted state stores
const selectedChapterIdStore = new LocalStore<Id | null>('selectedChapterId.v1', allChapters[0].id);
const selectedCookstaTierIdStore = new LocalStore<Id | null>(
	'selectedCookstaTierId.v1',
	allCookstaTiers[0].id
);
const enabledDLCIdsStore = new LocalStore<Id[]>('enabledDLCIds.v1', []);
const hiredStaffIdsStore = new LocalStore<number[]>('hiredStaffIds.v1', []);

// Export reactive values
export const selectedChapterId = selectedChapterIdStore.value;
export const selectedCookstaTierId = selectedCookstaTierIdStore.value;
export const enabledDLCIds = enabledDLCIdsStore.value;
export const hiredStaffIds = hiredStaffIdsStore.value;

// -----------------------------
// Accessor Functions (return actual objects)
// -----------------------------

// Get current selected chapter object
export function getSelectedChapter(): Chapter {
	if (selectedChapterId != null) {
		return chaptersBundleData.byId[selectedChapterId];
	} else {
		return allChapters[0];
	}
}

// Get current selected cooksta tier object
export function getSelectedCookstaTier(): CookstaTier {
	if (selectedCookstaTierId != null) {
		return cookstaBundleData.byId[selectedCookstaTierId];
	} else {
		return allCookstaTiers[0];
	}
}

export const enabledDLCs = () => allDLCs.filter((d) => enabledDLCIds.includes(d.id));

// Check if DLC is enabled
export const isDLCEnabled = (id: number) => {
	return enabledDLCIds.includes(id);
};

// Helper functions for common operations
export function toggleHiredStaff(staffId: number, hired: boolean) {
	if (hired) {
		if (!hiredStaffIds.includes(staffId)) {
			hiredStaffIdsStore.value = [...hiredStaffIds, staffId];
		}
	} else {
		hiredStaffIdsStore.value = hiredStaffIds.filter((id) => id !== staffId);
	}
}

export function toggleDLC(id: number, enabled: boolean) {
	if (enabled) {
		if (!enabledDLCIds.includes(id)) {
			enabledDLCIdsStore.value = [...enabledDLCIds, id];
		}
	} else {
		enabledDLCIdsStore.value = enabledDLCIds.filter((existingId) => existingId !== id);
	}
}

// Helper functions to update selected chapter and cooksta tier
export function setSelectedChapter(chapterId: Id | null) {
	selectedChapterIdStore.value = chapterId;
}

export function setSelectedCookstaTier(cookstaTierId: Id | null) {
	selectedCookstaTierIdStore.value = cookstaTierId;
}
