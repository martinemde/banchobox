/**
 * Staff Sort Utilities
 * Pure functions for sorting staff using pre-computed indexes
 */

import type { Staff, EntityBundle } from '$lib/types';

/**
 * Apply sort order using pre-computed bundle indexes
 * Falls back to original order if sort key doesn't exist
 */
export function applySortOrder(
	items: Staff[],
	bundle: EntityBundle<Staff>,
	field: string,
	direction: 'asc' | 'desc'
): Staff[] {
	const sorted = bundle.sorted[field];
	if (!sorted) return items;

	let order = sorted[direction];

	// If exact direction doesn't exist, try opposite and reverse
	if (!order) {
		const oppositeDir = direction === 'asc' ? 'desc' : 'asc';
		if (sorted[oppositeDir]) {
			order = [...sorted[oppositeDir]].reverse();
		} else {
			return items;
		}
	}

	// Create a map of items by ID for fast lookup
	const itemsById = new Map(items.map((item) => [item.id, item]));

	// Map sort order IDs to actual items, filtering out items not in the current set
	return order.map((id) => itemsById.get(id)).filter((item): item is Staff => item !== undefined);
}
