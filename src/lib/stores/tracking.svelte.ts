import { LocalStore } from '$lib/utils/LocalStore.svelte';
import type { Id } from '$lib/types';

// Internal persisted state
const trackedDishIdsStore = new LocalStore<Id[]>('trackedDishIds.v1', []);
export const trackedDishIds = trackedDishIdsStore.value;

// Toggle tracked dish
export function toggleTrackedDish(dishId: Id, tracked: boolean | undefined) {
	const currentIds = trackedDishIdsStore.value;
	if (tracked === undefined) {
		tracked = !currentIds.includes(dishId);
	}
	if (tracked) {
		trackDish(dishId);
	} else {
		untrackDish(dishId);
	}
}

// Track dish
export function trackDish(dishId: Id) {
	const currentIds = trackedDishIdsStore.value;
	if (!currentIds.includes(dishId)) {
		currentIds.push(dishId);
	}
}

// Untrack dish
export function untrackDish(dishId: Id) {
	const currentIds = trackedDishIdsStore.value;
	if (currentIds.includes(dishId)) {
		currentIds.splice(currentIds.indexOf(dishId), 1);
	}
}
