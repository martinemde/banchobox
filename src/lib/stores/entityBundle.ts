import { derived, writable, type Readable, type Writable } from 'svelte/store';
import type { Id, EntityBundle } from '$lib/types.js';

/**
 * Get rows from a bundle in the specified sort order.
 * Falls back to default sort if no key/direction specified.
 */
export function getRows<T extends { id: Id }>(
	bundle: EntityBundle<T>,
	sortKey?: string,
	direction?: 'asc' | 'desc'
): T[] {
	const key = sortKey ?? bundle.sorted.default;
	const sortDef = bundle.sorted[key];

	if (typeof sortDef === 'string') {
		throw new Error(`Invalid sort key: ${key}`);
	}

	const dir = direction ?? (sortDef.asc ? 'asc' : 'desc');
	const ids = sortDef[dir];

	if (!ids) {
		throw new Error(`No ${dir} sort order for key: ${key}`);
	}

	return ids.map(id => bundle.byId[id]);
}

export interface EntityStores<
	Row extends { id: Id; search?: string }
> {
	bundle: Writable<EntityBundle<Row> | null>;
	query: Writable<string>;
	sortKey: Writable<string>;
	sortDir: Writable<'asc' | 'desc'>;
	filters: Writable<Record<string, Set<string>>>; // user-added facet filters (excludes baseline)
	baselineFilters: Writable<Record<string, Set<string>>>; // baseline constraints (e.g., DLC Base + My Bancho, Chapter)
	visible: Readable<Row[]>;
	visibleWithoutBaseline: Readable<Row[]>; // visible items without baseline filters (for hidden count)
}

export function createEntityStores<
	Row extends { id: Id; search?: string }
>(
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

	function processFilters(
		$bundle: EntityBundle<Row> | null,
		$query: string,
		$sortKey: string,
		$sortDir: 'asc' | 'desc',
		$filters: Record<string, Set<string>>,
		$baseline?: Record<string, Set<string>>
	): Row[] {
		if (!$bundle) return [] as Row[];

		// 1) Get pre-sorted IDs from bundle
		const sortedIds = getRows($bundle, $sortKey, $sortDir).map(r => r.id);

		// 2) facet filtering - baseline first, then user filters
		let candidateIds: Set<Id> | null = null;
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
			if (candidateIds === null) {
				candidateIds = orSet;
			} else {
				// AND across facets -> intersection
				candidateIds = new Set([...candidateIds].filter((id) => orSet.has(id)));
			}
		}

		// 3) Filter sorted IDs by facets (preserve sort order)
		const filteredIds = candidateIds
			? sortedIds.filter((id) => candidateIds!.has(id))
			: sortedIds;

		// 4) Map to rows
		let rows: Row[] = filteredIds.map((id) => $bundle.byId[id]).filter(Boolean);

		// 5) Search filter
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
