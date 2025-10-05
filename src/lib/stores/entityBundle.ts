import { derived, writable, type Readable, type Writable } from 'svelte/store';
import type { Id, EntityBundle } from '$lib/types.js';

/**
 * Internal function to get base rows from sorted structure
 * Used within reactive contexts to avoid circular dependencies
 */
function getBaseRows<Row extends { id: Id }>(
	bundle: EntityBundle<Row> | null,
	sortKey: string,
	sortDir: 'asc' | 'desc'
): Row[] {
	if (!bundle) return [];

	// Get the sorted ids for this key and direction
	const sortedIds = bundle.sorted[sortKey]?.[sortDir];
	if (!sortedIds) {
		// Fallback to opposite direction if requested direction not available
		const fallbackDir = sortDir === 'asc' ? 'desc' : 'asc';
		const fallbackIds = bundle.sorted[sortKey]?.[fallbackDir];
		if (fallbackIds) {
			// Reverse the fallback to match requested direction
			return [...fallbackIds]
				.reverse()
				.map((id) => bundle.byId[id])
				.filter(Boolean);
		}
		// If no sorted data exists for this key, return empty array
		return [];
	}

	// Convert ids to rows
	return sortedIds.map((id) => bundle.byId[id]).filter(Boolean);
}

/**
 * Get sorted rows from a bundle using the sorted structure
 * Public API for external use
 */
export function getSortedRows<Row extends { id: Id }>(
	bundle: EntityBundle<Row> | null,
	sortKey?: string,
	sortDir?: 'asc' | 'desc'
): Row[] {
	if (!bundle) return [];

	// If no sortKey specified, use the first available sort key
	if (!sortKey) {
		const firstSortKey = Object.keys(bundle.sorted)[0];
		if (!firstSortKey) return []; // No sorted data available
		sortKey = firstSortKey;
	}

	// Default to 'asc' if no direction specified
	if (!sortDir) {
		sortDir = 'asc';
	}

	return getBaseRows(bundle, sortKey, sortDir);
}

export interface EntityStores<Row extends { id: Id; search?: string }> {
	bundle: Writable<EntityBundle<Row> | null>;
	query: Writable<string>;
	sortKey: Writable<string>;
	sortDir: Writable<'asc' | 'desc'>;
	filters: Writable<Record<string, Set<string>>>; // user-added facet filters (excludes baseline)
	baselineFilters: Writable<Record<string, Set<string>>>; // baseline constraints (e.g., DLC Base + My Bancho, Chapter)
	visible: Readable<Row[]>;
	visibleWithoutBaseline: Readable<Row[]>; // visible items without baseline filters (for hidden count)
}

export function createEntityStores<Row extends { id: Id; search?: string }>(
	initial?: Partial<{
		bundle: EntityBundle<Row> | null;
		query: string;
		sortKey: string;
		sortDir: 'asc' | 'desc';
		filters: Record<string, Set<string>>;
	}>
): EntityStores<Row> {
	const bundle = writable<EntityBundle<Row> | null>(initial?.bundle ?? null);
	const query = writable<string>(initial?.query ?? '');
	const sortKey = writable<string>(initial?.sortKey ?? 'name');
	const sortDir = writable<'asc' | 'desc'>(initial?.sortDir ?? 'asc');
	const filters = writable<Record<string, Set<string>>>(initial?.filters ?? {});
	const baselineFilters = writable<Record<string, Set<string>>>({});

	/**
	 * Sort filtered IDs according to the pre-sorted order in the bundle
	 */
	function sortByPrecomputedOrder(
		ids: Id[],
		bundle: EntityBundle<Row>,
		sortKey: string,
		sortDir: 'asc' | 'desc'
	): Id[] {
		// Get the pre-sorted ID array
		const sortedIds = bundle.sorted[sortKey]?.[sortDir];
		if (!sortedIds) {
			// Try opposite direction and reverse
			const fallbackDir = sortDir === 'asc' ? 'desc' : 'asc';
			const fallbackIds = bundle.sorted[sortKey]?.[fallbackDir];
			if (fallbackIds) {
				const idSet = new Set(ids);
				return [...fallbackIds].reverse().filter((id) => idSet.has(id));
			}
			// No sorted data available, return as-is
			return ids;
		}

		// Filter the pre-sorted array to only include our candidate IDs
		const idSet = new Set(ids);
		return sortedIds.filter((id) => idSet.has(id));
	}

	function processFilters(
		$bundle: EntityBundle<Row> | null,
		$query: string,
		$sortKey: string,
		$sortDir: 'asc' | 'desc',
		$filters: Record<string, Set<string>>,
		$baseline?: Record<string, Set<string>>
	): Row[] {
		if (!$bundle) return [] as Row[];

		// 1) facet filtering - baseline first, then user filters
		let candidateIds: Id[] | null = null;
		const allFilters: Record<string, Set<string>> = {
			...($baseline ?? {}),
			...($filters ?? {})
		};
		const facetEntries = Object.entries(allFilters);
		for (const [facetName, values] of facetEntries) {
			if (!values || values.size === 0) continue;
			const facetIndex = $bundle.facets[facetName] ?? {};
			// OR within facet
			const orSet = new Set<Id>();
			for (const val of values) {
				const ids = facetIndex[val] ?? [];
				for (const id of ids) orSet.add(id);
			}
			const orIds = Array.from(orSet);
			if (candidateIds === null) {
				candidateIds = orIds;
			} else {
				// AND across facets -> intersection
				const next = new Set(orIds);
				candidateIds = candidateIds.filter((id) => next.has(id));
			}
		}

		// 2) Get sorted IDs (either filtered or all)
		let sortedIds: Id[];
		if (candidateIds) {
			// Sort the filtered IDs according to pre-sorted order
			sortedIds = sortByPrecomputedOrder(candidateIds, $bundle, $sortKey, $sortDir);
		} else {
			// Use pre-sorted array directly
			const preSorted = $bundle.sorted[$sortKey]?.[$sortDir];
			if (preSorted) {
				sortedIds = preSorted;
			} else {
				// Try opposite direction and reverse
				const fallbackDir = $sortDir === 'asc' ? 'desc' : 'asc';
				const fallbackIds = $bundle.sorted[$sortKey]?.[fallbackDir];
				sortedIds = fallbackIds ? [...fallbackIds].reverse() : [];
			}
		}

		// 3) Map to rows
		let rows: Row[] = sortedIds.map((id) => $bundle.byId[id]).filter(Boolean);

		// 4) Search filter
		const q = ($query ?? '').trim().toLowerCase();
		if (q.length > 0) {
			rows = rows.filter((r) => (r.search ?? '').includes(q));
		}

		return rows;
	}

	const visible = derived(
		[bundle, query, sortKey, sortDir, filters, baselineFilters],
		([$bundle, $query, $sortKey, $sortDir, $filters, $baseline]) => {
			return processFilters($bundle, $query, $sortKey, $sortDir, $filters, $baseline);
		}
	);

	const visibleWithoutBaseline = derived(
		[bundle, query, sortKey, sortDir, filters],
		([$bundle, $query, $sortKey, $sortDir, $filters]) => {
			return processFilters($bundle, $query, $sortKey, $sortDir, $filters);
		}
	);

	return {
		bundle,
		query,
		sortKey,
		sortDir,
		filters,
		baselineFilters,
		visible,
		visibleWithoutBaseline
	};
}
