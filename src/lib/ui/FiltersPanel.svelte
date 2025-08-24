<script lang="ts">
	import type { Readable, Writable } from 'svelte/store';
	import { SvelteSet } from 'svelte/reactivity';
	import type { EntityBundle, Id } from '$lib/types.js';

	let {
		bundle,
		filters,
		baselineFilters,
		query = $bindable(''),
		sortKey = $bindable<string>('finalProfitPerServing'),
		sortDir = $bindable<'asc' | 'desc'>('desc'),
		searchPlaceholder
	}: {
		bundle: Readable<EntityBundle<{ id: Id; sort: Record<string, string | number | null> }> | null>;
		filters: Writable<Record<string, Set<string>>>;
		baselineFilters: Writable<Record<string, Set<string>>>;
		query?: string;
		sortKey?: string;
		sortDir?: 'asc' | 'desc';
		searchPlaceholder?: string;
	} = $props();
	import { selectedChapter } from '$lib/stores/chapters';
	import { visible as dlcVisible } from '$lib/stores/dlc';
	import MyBanchoPanel from '$lib/ui/MyBanchoPanel.svelte';
	const dlcRows = $derived($dlcVisible ?? []);
	let enabledDlcIds = new SvelteSet<number>();

	// DLC handling aligned with My Bancho:
	// - Default view shows Base + selected DLCs (if the bundle exposes a DLC facet)
	// - If user/URL adds DLC filters, keep them if they are within allowed; otherwise clamp
	// - Render DLC facet options only for allowed DLCs
	const hasDlcFacet = $derived(Boolean(($bundle?.facets ?? {})['DLC']));
	$effect(() => {
		if (!hasDlcFacet) return;
		const availableIndex = (($bundle?.facets ?? {})['DLC'] ?? {}) as Record<string, Id[]>;
		const available = new SvelteSet<string>(Object.keys(availableIndex));
		const allowed = new SvelteSet<string>(['Base']);
		for (const d of dlcRows) if (enabledDlcIds.has(d.id)) allowed.add(d.name);
		const allowedAvailable = new SvelteSet<string>();
		for (const v of allowed) if (available.has(v)) allowedAvailable.add(v);

		// Write DLC baseline; do not include in user filters
		baselineFilters.update((current) => ({ ...(current ?? {}), DLC: allowedAvailable }));

		filters.update((current) => {
			const next = { ...(current ?? {}) } as Record<string, Set<string>>;
			const currentNames = next['DLC'];
			if (!currentNames || currentNames.size === 0) {
				// No explicit user DLC selections: rely on baseline only
				delete next['DLC'];
				return next;
			}
			let needsClamp = false;
			for (const v of currentNames)
				if (!allowedAvailable.has(v)) {
					needsClamp = true;
					break;
				}
			if (needsClamp) {
				const clamped = new SvelteSet<string>();
				for (const v of currentNames) if (allowedAvailable.has(v)) clamped.add(v);
				if (clamped.size > 0) next['DLC'] = clamped;
				else delete next['DLC'];
			}
			return next;
		});
	});

	// Automatically apply Chapter filter based on My Bancho selection; never render Chapter facet
	const hasChapterFacet = $derived(Boolean(($bundle?.facets ?? {})['Chapter']));
	$effect(() => {
		if (!hasChapterFacet) return;
		const number = $selectedChapter?.number;
		baselineFilters.update((current) => {
			const next = { ...(current ?? {}) } as Record<string, Set<string>>;
			if (number !== null && number !== undefined)
				next['Chapter'] = new SvelteSet<string>([number.toString()]);
			else delete next['Chapter'];
			return next;
		});
	});

	function setsEqual<A>(a: Set<A> | null | undefined, b: Set<A> | null | undefined): boolean {
		if (!a && !b) return true;
		if (!a || !b) return false;
		if (a.size !== b.size) return false;
		for (const v of a) if (!b.has(v)) return false;
		return true;
	}

	// One-way URL -> My Bancho sync on first load only; do not clobber persisted choices
	$effect(() => {
		if (!hasDlcFacet) return;
		if ((enabledDlcIds?.size ?? 0) > 0) return;
		const names = $filters?.['DLC'];
		if (!names || names.size === 0) return;
		const next = new SvelteSet<number>();
		for (const d of dlcRows) if (names.has(d.name)) next.add(d.id);
		if (!setsEqual(enabledDlcIds, next)) enabledDlcIds = next;
	});

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

	const facetEntries = $derived(
		Object.entries($bundle?.facets ?? {}).filter(([facetName]) => facetName !== 'Chapter')
	);
	// Precompute sorted keys per facet to avoid sorting in template
	const sortedFacetKeys: Record<string, string[]> = $derived(
		Object.fromEntries(
			facetEntries
				.filter(([facetName]) => facetName !== 'DLC')
				.map(([facetName, facetIndex]) => [
					facetName,
					Object.keys(facetIndex as Record<string, Id[]>).sort((a, b) => a.localeCompare(b))
				])
		)
	);
	const sortedDlcKeysForDisplay: string[] = $derived(
		Object.keys((($bundle?.facets ?? {})['DLC'] ?? {}) as Record<string, Id[]>)
			.filter((key) => {
				const allowed = new SvelteSet<string>(['Base']);
				for (const d of dlcRows) if (enabledDlcIds.has(d.id)) allowed.add(d.name);
				return allowed.has(key);
			})
			.sort((a, b) => a.localeCompare(b))
	);
	const showDlcFacet = $derived(sortedDlcKeysForDisplay.some((k) => k !== 'Base'));

	function facetPanelId(name: string): string {
		return 'facet-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	}
</script>

<div class="space-y-4">
	<MyBanchoPanel bind:enabledDlcIds />
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
		{#if facetName === 'DLC' && !showDlcFacet}
			<!-- hide DLC facet when only Base is available -->
		{:else}
			<fieldset class="space-y-1">
				<legend class="text-sm font-semibold">
					<span>{facetName}</span>
				</legend>
				<div id={facetPanelId(facetName)} class="space-y-1">
					{#if facetName === 'DLC'}
						{#each sortedDlcKeysForDisplay as key (key)}
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
					{:else}
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
					{/if}
				</div>
			</fieldset>
		{/if}
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
