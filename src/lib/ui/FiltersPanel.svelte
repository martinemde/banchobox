<script lang="ts">
	import type { Readable, Writable } from 'svelte/store';
	import { SvelteSet } from 'svelte/reactivity';
	import type { EntityBundle, Id } from '$lib/types.js';
	import { Search } from '@lucide/svelte';
	import { getSelectedChapter, allDLCs, isDLCEnabled } from '$lib/stores/myBancho.svelte';
	import MyBanchoPanel from '$lib/components/MyBanchoPanel.svelte';

	type FiltersStore = {
		subscribe: (fn: (value: Record<string, Set<string>>) => void) => () => void;
		update: (fn: (value: Record<string, Set<string>>) => Record<string, Set<string>>) => void;
	};

	let {
		bundle,
		filters,
		baselineFilters,
		query = $bindable(''),
		searchPlaceholder,
		myBanchoExpanded = $bindable(true)
	}: {
		bundle: Readable<EntityBundle<{ id: Id }> | null>;
		filters: FiltersStore;
		baselineFilters: Writable<Record<string, Set<string>>>;
		query?: string;
		searchPlaceholder?: string;
		myBanchoExpanded?: boolean;
	} = $props();

	// DLC handling aligned with My Bancho:
	// - Default view shows Base + selected DLCs (baseline filters, not in URL)
	// - User can override via URL filters (facet checkboxes)
	// - Render DLC facet options only for allowed DLCs
	// NOTE: These effects depend on MyBancho state ONLY, not on $bundle, to avoid loops
	$effect(() => {
		const allowed = new SvelteSet<string>(['Base']);
		for (const d of allDLCs) if (isDLCEnabled(d.id)) allowed.add(d.name);

		baselineFilters.update((current) => {
			const currentDLC = current?.DLC;
			if (currentDLC && currentDLC.size === allowed.size) {
				let same = true;
				for (const v of allowed) {
					if (!currentDLC.has(v)) {
						same = false;
						break;
					}
				}
				if (same) return current;
			}
			return { ...(current ?? {}), DLC: allowed };
		});
	});

	// Automatically apply Chapter filter based on My Bancho selection; never render Chapter facet
	$effect(() => {
		const number = getSelectedChapter().number;
		const chapterStr = number !== null && number !== undefined ? number.toString() : null;

		baselineFilters.update((current) => {
			const currentChapter = current?.Chapter;
			const currentChapterStr = currentChapter ? Array.from(currentChapter)[0] : null;

			if (currentChapterStr === chapterStr) return current;

			const next = { ...(current ?? {}) } as Record<string, Set<string>>;
			if (chapterStr) next['Chapter'] = new SvelteSet<string>([chapterStr]);
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
