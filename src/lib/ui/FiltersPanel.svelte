<script lang="ts">
	import type { Readable, Writable } from 'svelte/store';
	import { SvelteSet } from 'svelte/reactivity';
	import type { EntityBundle, Id } from '$lib/types.js';
	import { Search } from '@lucide/svelte';
	import { getSelectedChapter, allDLCs, isDLCEnabled } from '$lib/stores/myBancho.svelte';
	import MyBanchoPanel from '$lib/components/MyBanchoPanel.svelte';

	let {
		bundle,
		filters,
		baselineFilters,
		query = $bindable(''),
		searchPlaceholder,
		myBanchoExpanded = $bindable(true)
	}: {
		bundle: Readable<EntityBundle<{ id: Id }> | null>;
		filters: Writable<Record<string, Set<string>>>;
		baselineFilters: Writable<Record<string, Set<string>>>;
		query?: string;
		searchPlaceholder?: string;
		myBanchoExpanded?: boolean;
	} = $props();

	// DLC handling aligned with My Bancho:
	// - Default view shows Base + selected DLCs (if the bundle exposes a DLC facet)
	// - If user/URL adds DLC filters, keep them if they are within allowed; otherwise clamp
	// - Render DLC facet options only for allowed DLCs
	const hasDLCFacet = $derived(Boolean(($bundle?.facets ?? {})['DLC']));
	$effect(() => {
		if (!hasDLCFacet) return;
		const availableIndex = (($bundle?.facets ?? {})['DLC'] ?? {}) as Record<string, Id[]>;
		const available = new SvelteSet<string>(Object.keys(availableIndex));
		const allowed = new SvelteSet<string>(['Base']);
		for (const d of allDLCs) if (isDLCEnabled(d.id)) allowed.add(d.name);
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
		const number = getSelectedChapter().number;
		baselineFilters.update((current) => {
			const next = { ...(current ?? {}) } as Record<string, Set<string>>;
			if (number !== null && number !== undefined)
				next['Chapter'] = new SvelteSet<string>([number.toString()]);
			else delete next['Chapter'];
			return next;
		});
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

	// Debounced search implementation
	let searchInput = $state(query);
	let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

	// Debounce the search query updates - only react to searchInput changes
	$effect(() => {
		// Access searchInput to make this effect reactive to it
		const currentInput = searchInput;

		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
		}

		debounceTimeout = setTimeout(() => {
			query = currentInput;
		}, 300);

		return () => {
			if (debounceTimeout) {
				clearTimeout(debounceTimeout);
			}
		};
	});

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
	const sortedDLCKeysForDisplay: string[] = $derived(
		Object.keys((($bundle?.facets ?? {})['DLC'] ?? {}) as Record<string, Id[]>)
			.filter((key) => {
				const allowed = new SvelteSet<string>(['Base']);
				for (const d of allDLCs) if (isDLCEnabled(d.id)) allowed.add(d.name);
				return allowed.has(key);
			})
			.sort((a, b) => a.localeCompare(b))
	);
	const showDLCFacet = $derived(sortedDLCKeysForDisplay.some((k) => k !== 'Base'));

	function facetPanelId(name: string): string {
		return 'facet-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	}
</script>

<div class="space-y-4">
	<MyBanchoPanel bind:expanded={myBanchoExpanded} />
	<div class="space-y-2">
		<label class="text-sm font-semibold" for="filters-search">Search</label>
		<div class="relative">
			<div
				class="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-surface-500"
			>
				<Search size={16} />
			</div>
			<input
				type="search"
				id="filters-search"
				class="input w-full pl-10"
				placeholder={effectivePlaceholder}
				bind:value={searchInput}
				aria-describedby="search-help"
				autocomplete="off"
				spellcheck="false"
			/>
		</div>
		<div
			id="search-help"
			class="absolute -m-px h-px w-px overflow-hidden border-0 p-0 whitespace-nowrap"
		>
			Search through items by name. Results update as you type.
		</div>
	</div>

	{#each facetEntries as [facetName] (facetName)}
		{#if facetName === 'DLC' && !showDLCFacet}
			<!-- hide DLC facet when only Base is available -->
		{:else}
			<fieldset class="space-y-1">
				<legend class="text-sm font-semibold">
					<span>{facetName}</span>
				</legend>
				<div id={facetPanelId(facetName)} class="space-y-1">
					{#if facetName === 'DLC'}
						{#each sortedDLCKeysForDisplay as key (key)}
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
