<script lang="ts">
	import SortControl from '$lib/ui/SortControl.svelte';
	import MyBanchoPanel from '$lib/ui/MyBanchoPanel.svelte';
	import type { Readable, Writable } from 'svelte/store';
	import type { EntityBundle, Id } from '$lib/types.js';
	import { SvelteSet } from 'svelte/reactivity';
	import { Search, Filter } from '@lucide/svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { selectedChapter } from '$lib/stores/chapters';
	import { visible as dlcVisible } from '$lib/stores/dlc';

	type SortDirection = 'asc' | 'desc';
	type RowLike = { id: number };

	let {
		visible,
		visibleWithoutBaseline,
		entityLabel = 'Results',
		sortKey = $bindable<string>(''),
		sortDir = $bindable<SortDirection>('asc'),
		sortOptions = [] as Array<{ value: string; label: string }>,
		// Filter-related props
		bundle,
		filters,
		baselineFilters,
		query = $bindable(''),
		searchPlaceholder,
		myBanchoExpanded = $bindable(true)
	}: {
		visible: Readable<RowLike[]>;
		visibleWithoutBaseline?: Readable<RowLike[]>;
		entityLabel?: string;
		sortKey?: string;
		sortDir?: SortDirection;
		sortOptions?: Array<{ value: string; label: string }>;
		// Filter-related props
		bundle?: Readable<EntityBundle<{
			id: Id;
			sort: Record<string, string | number | null>;
		}> | null>;
		filters?: Writable<Record<string, Set<string>>>;
		baselineFilters?: Writable<Record<string, Set<string>>>;
		query?: string;
		searchPlaceholder?: string;
		myBanchoExpanded?: boolean;
	} = $props();

	const count = $derived(($visible ?? []).length);

	// Hidden items indicator logic
	const hiddenCount = $derived(
		visibleWithoutBaseline
			? Math.max(0, ($visibleWithoutBaseline ?? []).length - ($visible ?? []).length)
			: 0
	);
	const showHiddenIndicator = $derived(hiddenCount > 0);

	// Filters panel state
	let filtersOpen = $state(false);

	// FiltersPanel logic (only if bundle is provided)
	const dlcRows = $derived($dlcVisible ?? []);
	let enabledDlcIds = new SvelteSet<number>();

	// DLC handling aligned with My Bancho:
	const hasDlcFacet = $derived(Boolean(($bundle?.facets ?? {})['DLC']));
	$effect(() => {
		if (!hasDlcFacet || !bundle || !baselineFilters) return;
		const availableIndex = (($bundle?.facets ?? {})['DLC'] ?? {}) as Record<string, Id[]>;
		const available = new SvelteSet<string>(Object.keys(availableIndex));
		const allowed = new SvelteSet<string>(['Base']);
		for (const d of dlcRows) if (enabledDlcIds.has(d.id)) allowed.add(d.name);
		const allowedAvailable = new SvelteSet<string>();
		for (const v of allowed) if (available.has(v)) allowedAvailable.add(v);

		// Write DLC baseline; do not include in user filters
		baselineFilters.update((current) => ({ ...(current ?? {}), DLC: allowedAvailable }));

		if (!filters) return;
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

	// Automatically apply Chapter filter based on My Bancho selection
	const hasChapterFacet = $derived(Boolean(($bundle?.facets ?? {})['Chapter']));
	$effect(() => {
		if (!hasChapterFacet || !baselineFilters) return;
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

	// One-way URL -> My Bancho sync on first load only
	$effect(() => {
		if (!hasDlcFacet || !filters) return;
		if ((enabledDlcIds?.size ?? 0) > 0) return;
		const names = $filters?.['DLC'];
		if (!names || names.size === 0) return;
		const next = new SvelteSet<number>();
		for (const d of dlcRows) if (names.has(d.name)) next.add(d.id);
		if (!setsEqual(enabledDlcIds, next)) {
			enabledDlcIds.clear();
			for (const id of next) enabledDlcIds.add(id);
		}
	});

	function isChecked(facet: string, value: string): boolean {
		return Boolean($filters?.[facet]?.has(value));
	}

	function toggleFacet(facet: string, value: string, checked: boolean) {
		if (!filters) return;
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

	// Debounce the search query updates
	$effect(() => {
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

	function handleHiddenItemsClick() {
		filtersOpen = true;
		myBanchoExpanded = true;
	}
</script>

<div class="space-y-3">
	{#if bundle}
		<!-- Filters & sort button for mobile, always visible -->
		<div class="md:hidden">
			<Modal
				open={filtersOpen}
				onOpenChange={(e) => (filtersOpen = e.open)}
				triggerBase="btn w-full preset-filled"
				contentBase="bg-surface-100-900 p-4 space-y-4 shadow-xl w-[min(88vw,360px)] h-screen"
				positionerJustify="justify-start"
				positionerAlign=""
				positionerPadding=""
				transitionsPositionerIn={{ x: -360, duration: 200 }}
				transitionsPositionerOut={{ x: -360, duration: 200 }}
			>
				{#snippet trigger()}
					<div class="flex items-center justify-center gap-2">
						<Filter size={16} />
						Filters & sort
					</div>
				{/snippet}
				{#snippet content()}
					<header class="mt-4 flex items-center justify-between">
						<h3 class="text-lg font-semibold">Filters & sort</h3>
						<button
							type="button"
							class="btn preset-tonal btn-sm"
							onclick={() => (filtersOpen = false)}>Close</button
						>
					</header>
					<div class="h-full space-y-4 overflow-auto">
						<MyBanchoPanel {enabledDlcIds} bind:expanded={myBanchoExpanded} />
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
															toggleFacet(
																facetName,
																key,
																(e.currentTarget as HTMLInputElement).checked
															)}
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
															toggleFacet(
																facetName,
																key,
																(e.currentTarget as HTMLInputElement).checked
															)}
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
				{/snippet}
			</Modal>
		</div>

		<!-- Desktop filters modal -->
		<div class="hidden md:block">
			<Modal
				open={filtersOpen}
				onOpenChange={(e) => (filtersOpen = e.open)}
				triggerBase="btn w-full preset-filled"
				contentBase="bg-surface-100-900 p-6 space-y-4 shadow-xl w-[min(90vw,500px)] max-h-[90vh] overflow-auto"
				positionerJustify="justify-center"
				positionerAlign="items-center"
				positionerPadding="p-4"
			>
				{#snippet trigger()}
					<div class="flex items-center justify-center gap-2">
						<Filter size={16} />
						Filters & sort
					</div>
				{/snippet}
				{#snippet content()}
					<header class="flex items-center justify-between">
						<h3 class="text-lg font-semibold">Filters & sort</h3>
						<button
							type="button"
							class="btn preset-tonal btn-sm"
							onclick={() => (filtersOpen = false)}>Close</button
						>
					</header>
					<div class="space-y-4">
						<MyBanchoPanel {enabledDlcIds} bind:expanded={myBanchoExpanded} />
						<div class="space-y-2">
							<label class="text-sm font-semibold" for="filters-search-desktop">Search</label>
							<div class="relative">
								<div
									class="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-surface-500"
								>
									<Search size={16} />
								</div>
								<input
									type="search"
									id="filters-search-desktop"
									class="input w-full pl-10"
									placeholder={effectivePlaceholder}
									bind:value={searchInput}
									autocomplete="off"
									spellcheck="false"
								/>
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
									<div id="{facetPanelId(facetName)}-desktop" class="space-y-1">
										{#if facetName === 'DLC'}
											{#each sortedDlcKeysForDisplay as key (key)}
												<label class="flex items-center gap-2 text-sm">
													<input
														type="checkbox"
														checked={isChecked(facetName, key)}
														onchange={(e) =>
															toggleFacet(
																facetName,
																key,
																(e.currentTarget as HTMLInputElement).checked
															)}
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
															toggleFacet(
																facetName,
																key,
																(e.currentTarget as HTMLInputElement).checked
															)}
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
				{/snippet}
			</Modal>
		</div>
	{/if}

	<!-- Hidden items indicator -->
	{#if showHiddenIndicator}
		<div
			class="cursor-pointer rounded-lg border border-white/10 bg-primary-500/10 px-3 py-2 hover:bg-primary-500/15 focus:ring-2 focus:ring-primary-500/60 focus:outline-none"
			role="button"
			tabindex="0"
			onclick={handleHiddenItemsClick}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleHiddenItemsClick();
				}
			}}
		>
			<div class="text-center text-sm opacity-90">
				{hiddenCount}
				{entityLabel.toLowerCase()} hidden by My Bancho settings
			</div>
		</div>
	{/if}

	<!-- Results count and sort -->
	<div class="flex items-center justify-between gap-3 py-2">
		<div class="text-sm font-semibold select-none md:text-base">{count} {entityLabel}</div>
		<div class="flex items-center gap-2">
			<SortControl options={sortOptions} bind:column={sortKey} bind:direction={sortDir} />
		</div>
	</div>
</div>
