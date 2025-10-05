import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { goto } from '$app/navigation';

type SortDir = 'asc' | 'desc';
type Filters = Record<string, Set<string>>;

function param(ns: string, key: string) {
	return ns ? `${ns}.${key}` : key;
}

function facetKey(ns: string, facet: string) {
	return `${ns}.f.${facet}`;
}

export function parseFilters(url: URL, ns: string): Filters {
	const out: Filters = {};
	for (const [k, v] of url.searchParams.entries()) {
		if (k.startsWith(`${ns}.f.`)) {
			const facet = k.slice(`${ns}.f.`.length);
			const values = v ? v.split(',').filter(Boolean) : [];
			out[facet] = new Set(values);
		}
	}
	return out;
}

export function buildUrlWithPatch(
	url: URL,
	ns: string,
	patch: {
		q?: string | null;
		sortKey?: string | null;
		sortDir?: SortDir | null;
		filters?: Filters | null;
	}
) {
	const next = new URL(url.href);
	const setOrDelete = (k: string, val?: string | null) => {
		if (val && val.length) next.searchParams.set(k, val);
		else next.searchParams.delete(k);
	};

	if ('q' in patch) setOrDelete(param(ns, 'q'), patch.q ?? '');
	if ('sortKey' in patch) setOrDelete(param(ns, 'sortKey'), patch.sortKey ?? '');
	if ('sortDir' in patch) setOrDelete(param(ns, 'sortDir'), patch.sortDir ?? '');

	if ('filters' in patch) {
		// Remove existing facet params for ns
		for (const k of Array.from(next.searchParams.keys())) {
			if (k.startsWith(`${ns}.f.`)) next.searchParams.delete(k);
		}
		const filters = patch.filters ?? {};
		for (const [facet, values] of Object.entries(filters)) {
			const list = Array.from(values ?? []).filter(Boolean);
			if (list.length) next.searchParams.set(facetKey(ns, facet), list.join(','));
		}
	}

	return next;
}

export function urlParamStore<T extends string = string>(
	ns: string,
	key: string,
	opts: {
		decode?: (s: string | null) => T;
		encode?: (v: T) => string | null;
		default?: T;
	} = {}
) {
	const decode = opts.decode ?? ((s) => (s ?? (opts.default ?? '')) as T);
	const encode = opts.encode ?? ((v) => v || null);

	const readable = derived(page, ($page) => decode($page.url.searchParams.get(param(ns, key))));

	return {
		subscribe: readable.subscribe,
		set: (value: T) => {
			const $url = new URL(window.location.href);
			const patched = buildUrlWithPatch($url, ns, { [key]: encode(value) } as any);
			if (patched.href !== $url.href) {
				goto(patched, { replaceState: true, keepFocus: true, noScroll: true });
			}
		}
	};
}

export function urlFiltersStore(ns: string) {
	const readable = derived(page, ($page) => parseFilters($page.url, ns));

	return {
		subscribe: readable.subscribe,
		set: (filters: Filters) => {
			const $url = new URL(window.location.href);
			const patched = buildUrlWithPatch($url, ns, { filters });
			if (patched.href !== $url.href) {
				goto(patched, { replaceState: true, keepFocus: true, noScroll: true });
			}
		},
		update: (fn: (current: Filters) => Filters) => {
			const $url = new URL(window.location.href);
			const current = parseFilters($url, ns);
			const next = fn(current);
			const patched = buildUrlWithPatch($url, ns, { filters: next });
			if (patched.href !== $url.href) {
				goto(patched, { replaceState: true, keepFocus: true, noScroll: true });
			}
		},
		toggle: (facet: string, value: string) => {
			const $url = new URL(window.location.href);
			const current = parseFilters($url, ns);
			const set = new Set(current[facet] ?? []);
			if (set.has(value)) set.delete(value);
			else set.add(value);
			if (set.size > 0) current[facet] = set;
			else delete current[facet];
			const patched = buildUrlWithPatch($url, ns, { filters: current });
			if (patched.href !== $url.href) {
				goto(patched, { replaceState: true, keepFocus: true, noScroll: true });
			}
		}
	};
}
