import type { Id } from '../../src/lib/types.js';

/**
 * Sort items and return array of IDs in the specified order.
 *
 * @param items - Array of items with `id` property
 * @param direction - Sort direction ('asc' or 'desc')
 * @param getValue - Function to extract the comparable value from each item
 * @returns Array of IDs in sorted order
 *
 * @example
 * const sorted = computeSortedIds(dishes, 'desc', d => d.profit);
 * // Returns [5, 3, 1, 2, 4] (IDs sorted by profit descending)
 */
export function computeSortedIds<T extends { id: Id }>(
	items: T[],
	direction: 'asc' | 'desc',
	getValue: (item: T) => string | number | null | undefined
): Id[] {
	// Create array of [id, value] pairs
	const pairs = items.map((item) => ({
		id: item.id,
		value: getValue(item)
	}));

	// Sort pairs by value
	pairs.sort((a, b) => {
		const aVal = a.value;
		const bVal = b.value;

		// Handle null/undefined (sort to end)
		if (aVal == null && bVal == null) return 0;
		if (aVal == null) return 1;
		if (bVal == null) return -1;

		// Compare values
		if (typeof aVal === 'string' && typeof bVal === 'string') {
			const comparison = aVal.localeCompare(bVal);
			return direction === 'asc' ? comparison : -comparison;
		}

		// Numeric comparison
		const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
		return direction === 'asc' ? comparison : -comparison;
	});

	// Return just the IDs
	return pairs.map((p) => p.id);
}
