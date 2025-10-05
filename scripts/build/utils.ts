import type { Id } from '../../src/lib/types.js';

/**
 * Creates a sorted array of IDs based on a sorting function
 * @param rows - The array of rows to sort
 * @param direction - Sort direction ('asc' or 'desc')
 * @param sorter - Function that extracts the sortable value from each row
 * @returns Object with direction as key and sorted ID array as value
 */
export function computeSortedIds<T extends { id: Id }>(
	rows: T[],
	direction: 'asc' | 'desc',
	sorter: (row: T) => string | number | null
): { [K in 'asc' | 'desc']?: Id[] } {
	const sorted = [...rows].sort((a, b) => {
		const aVal = sorter(a);
		const bVal = sorter(b);

		// Handle null values
		if (aVal == null && bVal == null) return 0;
		if (aVal == null) return direction === 'asc' ? -1 : 1;
		if (bVal == null) return direction === 'asc' ? 1 : -1;

		// Compare strings
		if (typeof aVal === 'string' && typeof bVal === 'string') {
			const cmp = direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
			if (cmp !== 0) return cmp;
		} else {
			// Compare numbers
			const cmp =
				direction === 'asc'
					? (aVal as number) - (bVal as number)
					: (bVal as number) - (aVal as number);
			if (cmp !== 0) return cmp;
		}

		// Stable tie-breaker by id
		return a.id - b.id;
	});

	return { [direction]: sorted.map((row) => row.id) };
}
