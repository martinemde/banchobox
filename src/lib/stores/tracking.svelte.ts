import { LocalStore } from '$lib/utils/LocalStore.svelte';
import type { Id } from '$lib/types';

// Internal persisted state
const trackedDishIdsStore = new LocalStore<Id[]>('trackedDishIds.v1', []);
export const trackedDishIds = trackedDishIdsStore.value;

// Toggle tracked dish
export function toggleTrackedDish(dishId: Id, tracked?: boolean) {
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
		trackedDishIdsStore.value = [...currentIds, dishId];
	}
}

// Untrack dish
export function untrackDish(dishId: Id) {
	const currentIds = trackedDishIdsStore.value;
	if (currentIds.includes(dishId)) {
		trackedDishIdsStore.value = currentIds.filter((id) => id !== dishId);
	}
}
