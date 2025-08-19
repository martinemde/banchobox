<script lang="ts">
	import type { Readable, Writable } from 'svelte/store';
	import { SvelteSet } from 'svelte/reactivity';
	import type { EntityBundle, Id } from '$lib/types.js';

	let {
		bundle,
		filters,
		query = $bindable(''),
		sortKey = $bindable<string>('finalProfitPerServing'),
		sortDir = $bindable<'asc' | 'desc'>('desc'),
		searchPlaceholder
	}: {
		bundle: Readable<EntityBundle<{ id: Id; sort: Record<string, string | number | null> }> | null>;
		filters: Writable<Record<string, Set<string>>>;
		query?: string;
		sortKey?: string;
		sortDir?: 'asc' | 'desc';
		searchPlaceholder?: string;
	} = $props();

	function isChecked(facet: string, value: string): boolean {
		return Boolean($filters?.[facet]?.has(value));
	}

	function toggleFacet(facet: string, value: string, checked: boolean) {
		filters.update((current: Record<string, Set<string>>) => {
			const next: Record<string, Set<string>> = { ...current };
			const set = new SvelteSet(next[facet] ?? []);
			if (checked) set.add(value);
			else set.delete(value);
			if (set.size > 0) next[facet] = set;
			else delete next[facet];
			return next;
		});
	}

	const effectivePlaceholder = searchPlaceholder ?? 'Search by name…';

	// Collapsible facets state: only first category expanded by default
	let expanded = $state<Record<string, boolean>>({});
	const facetEntries = $derived(Object.entries($bundle?.facets ?? {}));
	// Precompute sorted keys per facet to avoid sorting in template
	const sortedFacetKeys: Record<string, string[]> = $derived(
		Object.fromEntries(
			facetEntries.map(([facetName, facetIndex]) => [
				facetName,
				Object.keys(facetIndex as Record<string, Id[]>).sort((a, b) => a.localeCompare(b))
			])
		)
	);

	function toggleSection(facetName: string) {
		expanded[facetName] = !expanded[facetName];
	}

	function facetPanelId(name: string): string {
		return 'facet-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	}

	// Initialize/maintain expanded keys when facets change
	$effect(() => {
		const names = facetEntries.map(([n]) => n);
		if (names.length === 0) return;
		const hasAny = Object.keys(expanded).length > 0;
		if (!hasAny) {
			expanded = names.reduce(
				(acc, name, idx) => {
					acc[name] = idx === 0; // first open, others collapsed
					return acc;
				},
				{} as Record<string, boolean>
			);
		}
		for (const name of names) if (!(name in expanded)) expanded[name] = false;
		for (const key of Object.keys(expanded)) if (!names.includes(key)) delete expanded[key];

		// Ensure any facet with active selections is expanded
		const activeFacets = Object.entries($filters ?? {})
			.filter(([, set]) => set && (set as Set<string>).size > 0)
			.map(([facetName]) => facetName);
		for (const name of activeFacets) expanded[name] = true;
	});
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<label class="text-sm font-semibold" for="filters-search">Search</label>
		<div class="relative">
			<input
				type="search"
				id="filters-search"
				class="search-input w-full"
				placeholder={effectivePlaceholder}
				bind:value={query}
			/>
			{#if query}
				<button class="clear-btn" aria-label="Clear search" onclick={() => (query = '')}>×</button>
			{/if}
		</div>
	</div>

	{#each facetEntries as [facetName] (facetName)}
		<fieldset class="space-y-1">
			<legend class="text-sm font-semibold">
				<button
					type="button"
					class="flex w-full items-center justify-between gap-x-2"
					aria-expanded={Boolean(expanded[facetName])}
					aria-controls={facetPanelId(facetName)}
					onclick={() => toggleSection(facetName)}
				>
					<span aria-hidden="true">{expanded[facetName] ? '▾' : '▸'}</span>
					<span>{facetName}</span>
				</button>
			</legend>
			{#if expanded[facetName]}
				<div id={facetPanelId(facetName)} class="space-y-1">
					{#each sortedFacetKeys[facetName] ?? [] as key (key)}
						<label class="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={isChecked(facetName, key)}
								onchange={(e) =>
									toggleFacet(facetName, key, (e.currentTarget as HTMLInputElement).checked)}
							/>
							{key}
						</label>
					{/each}
				</div>
			{/if}
		</fieldset>
	{/each}
</div>

<style>
	.search-input {
		padding: 0.6rem 2rem 0.6rem 0.8rem;
		border: 1px solid rgb(var(--color-surface-300));
		border-radius: 0.5rem;
		background-color: rgb(var(--color-surface-50));
		color: rgb(var(--color-on-surface-token));
		caret-color: rgb(var(--color-primary-500));
		transition:
			background-color 150ms ease,
			border-color 150ms ease,
			box-shadow 150ms ease;
	}
	.search-input::placeholder {
		color: rgb(var(--color-on-surface-token) / 0.55);
	}
	.search-input:hover {
		background-color: rgb(var(--color-surface-100));
		border-color: rgb(var(--color-surface-400));
	}
	.search-input:focus,
	.search-input:focus-visible {
		outline: none;
		background-color: rgb(var(--color-surface-50));
		border-color: rgb(var(--color-primary-500));
		box-shadow: 0 0 0 3px rgb(var(--color-primary-500) / 0.25);
	}
	.clear-btn {
		position: absolute;
		right: 0.35rem;
		top: 50%;
		transform: translateY(-50%);
		line-height: 1;
		border: none;
		background: transparent;
		color: rgb(var(--color-on-surface-token));
		font-size: 1.25rem;
		padding: 0 0.25rem;
		cursor: pointer;
		opacity: 0.7;
		transition:
			color 150ms ease,
			opacity 150ms ease;
	}
	.clear-btn:hover {
		opacity: 1;
		color: rgb(var(--color-on-surface-token));
	}
</style>
