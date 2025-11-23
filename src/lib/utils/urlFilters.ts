/**
 * URL Filter Utilities
 * Pure functions for parsing and building filter URLs
 */

/**
 * Parse a single search parameter from URL
 */
export function parseSearchParam(url: URL, key: string, defaultValue = ''): string {
	return url.searchParams.get(key) ?? defaultValue;
}

/**
 * Parse a comma-separated parameter into an array
 */
export function parseMultiParam(url: URL, key: string): string[] {
	const value = url.searchParams.get(key);
	return value ? value.split(',').filter(Boolean) : [];
}

/**
 * Parse all facet filters from URL (keys starting with 'f.')
 */
export function parseFacetFilters(url: URL): Record<string, string[]> {
	const facets: Record<string, string[]> = {};

	for (const [key, value] of url.searchParams) {
		if (key.startsWith('f.')) {
			const category = key.slice(2);
			facets[category] = value.split(',').filter(Boolean);
		}
	}

	return facets;
}

/**
 * Build a new URL with updated filter parameters
 * Pass null or empty string to delete a parameter
 */
export function buildFilterURL(
	base: URL,
	updates: Record<string, string | string[] | null>
): string {
	const params = new URLSearchParams(base.searchParams);

	for (const [key, value] of Object.entries(updates)) {
		if (value === null || value === '') {
			params.delete(key);
		} else if (Array.isArray(value)) {
			if (value.length > 0) {
				params.set(key, value.join(','));
			} else {
				params.delete(key);
			}
		} else {
			params.set(key, value);
		}
	}

	return `?${params}`;
}
