import { get } from 'svelte/store';

import type { Writable } from 'svelte/store';

type Stores = {
	query: Writable<string>;
	sortKey: Writable<string>;
	sortDir: Writable<'asc' | 'desc'>;
	filters: Writable<Record<string, Set<string>>>;
};

export function syncToUrl(namespace: string, stores: Stores) {
	if (typeof window === 'undefined') {
		return () => {};
	}

	const buildSearch = () => {
		const params = new URLSearchParams(window.location.search);
		const q = get(stores.query) ?? '';
		const sortKey = get(stores.sortKey) ?? '';
		const sortDir = get(stores.sortDir) ?? '';
		const filters = get(stores.filters) as Record<string, Set<string>>;

		const setOrDelete = (key: string, value: string) => {
			if (value) params.set(key, value);
			else params.delete(key);
		};

		setOrDelete(`${namespace}.q`, String(q));
		setOrDelete(`${namespace}.sortKey`, String(sortKey));
		setOrDelete(`${namespace}.sortDir`, String(sortDir));

		// Flatten filters: facet values as comma list
		for (const [facet, values] of Object.entries(filters ?? {})) {
			const key = `${namespace}.f.${facet}`;
			const list = Array.from(values ?? []).join(',');
			setOrDelete(key, list);
		}

		return params;
	};

	const update = () => {
		const params = buildSearch();
		const search = params.toString();
		const nextUrl = search ? `${window.location.pathname}?${search}` : window.location.pathname;
		const currentUrl = window.location.pathname + window.location.search;
		if (nextUrl !== currentUrl) {
			// Update the URL without triggering SvelteKit navigation to preserve focus
			window.history.replaceState(window.history.state, '', nextUrl);
		}
	};

	// Subscribe to stores
	const unsubs = [stores.query, stores.sortKey, stores.sortDir, stores.filters].map((s) =>
		s.subscribe(update)
	);
	return () => unsubs.forEach((u) => u());
}
