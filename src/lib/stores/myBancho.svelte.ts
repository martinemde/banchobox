import type { Chapter, CookstaTier, DLC, EntityBundle, Id } from '$lib/types.js';
import chaptersData from '$lib/data/chapters.v1.json';
import cookstaData from '$lib/data/cooksta.v1.json';
import dlcData from '$lib/data/dlc.v1.json';

// Load static data bundles
const chaptersBundleData: EntityBundle<Chapter> = chaptersData as EntityBundle<Chapter>;
const cookstaBundleData: EntityBundle<CookstaTier> = cookstaData as EntityBundle<CookstaTier>;
const dlcBundleData: EntityBundle<DLC> = dlcData as EntityBundle<DLC>;

// All static data exports
export const allChapters = chaptersBundleData.rows;
export const allCookstaTiers = cookstaBundleData.rows;
export const allDLCs = dlcBundleData.rows;

// -----------------------------
// Simple Reactive State Store
// -----------------------------

class MyBanchoStore {
	selectedChapterId = $state<Id | null>(allChapters[0].id);
	selectedCookstaTierId = $state<Id | null>(allCookstaTiers[0].id);
	enabledDLCIds = $state<Id[]>([]);
	hiredStaffIds = $state<number[]>([]);
}

// Export single store instance
export const myBanchoStore = new MyBanchoStore();

// -----------------------------
// Accessor Functions (return actual objects)
// -----------------------------

// Get current selected chapter object
export function getSelectedChapter(): Chapter {
	if (myBanchoStore.selectedChapterId != null) {
		return chaptersBundleData.byId[myBanchoStore.selectedChapterId];
	} else {
		return allChapters[0];
	}
}

// Get current selected cooksta tier object
export function getSelectedCookstaTier(): CookstaTier {
	if (myBanchoStore.selectedCookstaTierId != null) {
		return cookstaBundleData.byId[myBanchoStore.selectedCookstaTierId];
	} else {
		return allCookstaTiers[0];
	}
}

export const enabledDLCs = () => allDLCs.filter((d) => myBanchoStore.enabledDLCIds.includes(d.id));

// Check if DLC is enabled
export const isDLCEnabled = (id: number) => {
	return myBanchoStore.enabledDLCIds.includes(id);
};

// Helper functions for common operations
export function toggleHiredStaff(staffId: number, hired: boolean) {
	if (hired) {
		if (!myBanchoStore.hiredStaffIds.includes(staffId)) {
			myBanchoStore.hiredStaffIds = [...myBanchoStore.hiredStaffIds, staffId];
		}
	} else {
		myBanchoStore.hiredStaffIds = myBanchoStore.hiredStaffIds.filter((id) => id !== staffId);
	}
}

export function toggleDLC(id: number, enabled: boolean) {
	if (enabled) {
		if (!myBanchoStore.enabledDLCIds.includes(id)) {
			myBanchoStore.enabledDLCIds = [...myBanchoStore.enabledDLCIds, id];
		}
	} else {
		myBanchoStore.enabledDLCIds = myBanchoStore.enabledDLCIds.filter(
			(existingId) => existingId !== id
		);
	}
}
