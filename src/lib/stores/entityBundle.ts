import { derived, writable, type Readable, type Writable } from 'svelte/store';
import type { Id, EntityBundle } from '$lib/types.js';

export interface EntityStores<
	Row extends { id: Id; sort: Record<string, string | number | null>; search?: string }
> {
	bundle: Writable<EntityBundle<Row> | null>;
	query: Writable<string>;
	sortKey: Writable<string>;
	sortDir: Writable<'asc' | 'desc'>;
	filters: Writable<Record<string, Set<string>>>; // user-added facet filters (excludes baseline)
	baselineFilters: Writable<Record<string, Set<string>>>; // baseline constraints (e.g., DLC Base + My Bancho, Chapter)
	visible: Readable<Row[]>;
}

export function createEntityStores<
	Row extends { id: Id; sort: Record<string, string | number | null>; search?: string }
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

	function compareValues(
		a: string | number | null,
		b: string | number | null,
		dir: 'asc' | 'desc'
	): number {
		if (a == null && b == null) return 0;
		if (a == null) return dir === 'asc' ? -1 : 1;
		if (b == null) return dir === 'asc' ? 1 : -1;
		if (typeof a === 'string' && typeof b === 'string') {
			return dir === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
		}
		return dir === 'asc' ? (a < b ? -1 : a > b ? 1 : 0) : b < a ? -1 : b > a ? 1 : 0;
	}

	const visible = derived(
		[bundle, query, sortKey, sortDir, filters, baselineFilters],
		([$bundle, $query, $sortKey, $sortDir, $filters, $baseline]) => {
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

			// Map to rows
			let rows: Row[] = candidateIds
				? candidateIds.map((id) => $bundle.byId[id]).filter(Boolean)
				: ($bundle.rows as Row[]);

			// 2) Search filter
			const q = ($query ?? '').trim().toLowerCase();
			if (q.length > 0) {
				rows = rows.filter((r) => (r.search ?? '').includes(q));
			}

			// 3) Sort
			const key = $sortKey;
			rows = [...rows].sort((a, b) => {
				const aVal = a.sort[key] as string | number | null;
				const bVal = b.sort[key] as string | number | null;
				const cmp = compareValues(aVal, bVal, $sortDir);
				if (cmp !== 0) return cmp;
				// stable tie-breaker by id
				return compareValues(a.id as unknown as number, b.id as unknown as number, 'asc');
			});

			return rows;
		}
	);

	return {
		bundle,
		query,
		sortKey,
		sortDir,
		filters,
		baselineFilters,
		visible
	};
}
