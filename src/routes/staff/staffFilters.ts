/**
 * Staff Filter Utilities
 * Pure functions for filtering staff data
 */

import type { Staff } from '$lib/types';

/**
 * Filter staff by search query
 * Searches in the pre-computed search field
 */
export function filterBySearch(items: Staff[], query: string): Staff[] {
	if (!query.trim()) return items;

	const lower = query.toLowerCase().trim();
	return items.filter((item) => item.search?.toLowerCase().includes(lower));
}

/**
 * Apply facet filters to staff list
 * Uses AND logic between categories, OR within category
 */
export function applyFacetFilters(
	items: Staff[],
	facetIndexes: Record<string, Record<string, number[]>>,
	activeFacets: Record<string, string[]>
): Staff[] {
	let filtered = items;

	for (const [category, values] of Object.entries(activeFacets)) {
		if (values.length === 0) continue;

		const categoryIndex = facetIndexes[category];
		if (!categoryIndex) continue;

		// OR within category: item must match at least one value
		filtered = filtered.filter((item) =>
			values.some((value) => categoryIndex[value]?.includes(item.id))
		);
	}

	return filtered;
}

/**
 * Apply MyBancho filters (DLC filtering using facet indexes)
 * Returns both visible items and count of hidden items
 */
export function applyMyBanchoFilters(
	items: Staff[],
	dlcFacetIndex: Record<string, number[]>,
	enabledDLCNames: string[]
): { visible: Staff[]; hiddenCount: number } {
	// Get all allowed staff IDs from enabled DLC facets
	const allowedIds = new Set<number>();

	// Always include Base game staff (if Base exists in the facet)
	if (dlcFacetIndex['Base']) {
		dlcFacetIndex['Base'].forEach((id) => allowedIds.add(id));
	}

	// Add staff from enabled DLCs
	for (const dlcName of enabledDLCNames) {
		if (dlcFacetIndex[dlcName]) {
			dlcFacetIndex[dlcName].forEach((id) => allowedIds.add(id));
		}
	}

	// Filter items based on allowed IDs
	const visible = items.filter((item) => allowedIds.has(item.id));

	return {
		visible,
		hiddenCount: items.length - visible.length
	};
}
