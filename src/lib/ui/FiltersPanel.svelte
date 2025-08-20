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
	import { visible as cookstaVisible, selectedTierId, selectedTier } from '$lib/stores/cooksta';
	import {
		visible as chaptersVisible,
		selectedChapterId,
		selectedChapter
	} from '$lib/stores/chapters';
	import { visible as dlcVisible } from '$lib/stores/dlc';
	const cookstaTiers = $derived($cookstaVisible ?? []);
	const chapterRows = $derived($chaptersVisible ?? []);
	const dlcRows = $derived($dlcVisible ?? []);
	let editBancho = $state(false);
	let myBanchoExpanded = $state(true);
	let enabledDlcIds = new SvelteSet<number>();
	import { persist } from '$lib/utils/persisted.svelte';
	persist(
		'filtersPanel.myBanchoExpanded.v1',
		() => myBanchoExpanded,
		(v) => (myBanchoExpanded = v),
		{ storage: 'local' }
	);
	persist(
		'filtersPanel.enabledDlcIds.v1',
		() => enabledDlcIds,
		(v) => (enabledDlcIds = v),
		{
			storage: 'local',
			serialize: (set) => JSON.stringify(Array.from(set.values())),
			deserialize: (raw) => new SvelteSet<number>(JSON.parse(raw) as number[])
		}
	);
	function toggleDlc(id: number, checked: boolean) {
		const next = new SvelteSet(enabledDlcIds);
		if (checked) next.add(id);
		else next.delete(id);
		enabledDlcIds = next;
	}

	const hasDlcFacet = $derived(Boolean(($bundle?.facets ?? {})['DLC']));
	const hasChapterFacet = $derived(Boolean(($bundle?.facets ?? {})['Chapter']));
	$effect(() => {
		if (!hasDlcFacet) return;
		const allowed = new SvelteSet<string>(['Base']);
		for (const d of dlcRows) if (enabledDlcIds.has(d.id)) allowed.add(d.name);
		filters.update((current) => ({ ...(current ?? {}), DLC: allowed }));
	});

	// Automatically apply Chapter filter based on My Bancho selection; never render Chapter facet
	$effect(() => {
		if (!hasChapterFacet) return;
		const number = $selectedChapter?.number;
		filters.update((current) => {
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

	// Keep local DLC selection in sync if filters already have DLC constraint (e.g. from URL)
	$effect(() => {
		if (!hasDlcFacet) return;
		const names = $filters?.['DLC'];
		if (!names) return;
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
			facetEntries.map(([facetName, facetIndex]) => [
				facetName,
				Object.keys(facetIndex as Record<string, Id[]>).sort((a, b) => a.localeCompare(b))
			])
		)
	);

	function facetPanelId(name: string): string {
		return 'facet-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	}
</script>

<div class="space-y-4">
	<div class="rounded-lg border border-white/10 bg-primary-500/10 p-3">
		<div class="mb-2 flex items-center justify-between text-sm font-semibold">
			<button
				class="flex items-center gap-2 opacity-90 hover:opacity-100"
				onclick={() => (myBanchoExpanded = !myBanchoExpanded)}
				aria-expanded={myBanchoExpanded}
				aria-controls="my-bancho-panel"
			>
				<span class="caret" data-expanded={myBanchoExpanded}></span>
				<span>
					{myBanchoExpanded
						? 'My Bancho'
						: `${$selectedTier?.rank ?? ''} - ${$selectedChapter?.name ?? ''}`}
				</span>
			</button>
			{#if myBanchoExpanded}
				<button
					class="text-xs font-normal opacity-80 hover:opacity-100"
					onclick={() => (editBancho = !editBancho)}
				>
					{editBancho ? 'Done' : 'Edit'}
				</button>
			{/if}
		</div>

		{#if myBanchoExpanded}
			<div id="my-bancho-panel">
				{#if editBancho}
					<label class="label" aria-label="Cooksta">
						<select class="ig-select" bind:value={$selectedTierId}>
							{#each cookstaTiers as t (t.id)}
								<option value={t.id}>Cooksta {t.rank}</option>
							{/each}
						</select>
					</label>
					<label class="label" aria-label="Chapter">
						<select class="ig-select" bind:value={$selectedChapterId}>
							{#each chapterRows as c (c.id)}
								<option value={c.id}>{c.name}</option>
							{/each}
						</select>
					</label>
					<fieldset class="mt-2 space-y-1 pl-3 text-sm">
						{#each dlcRows as d (d.id)}
							<label class="flex items-center gap-2">
								<input
									type="checkbox"
									checked={enabledDlcIds.has(d.id)}
									onchange={(e) => toggleDlc(d.id, (e.currentTarget as HTMLInputElement).checked)}
								/>
								{d.name}
							</label>
						{/each}
					</fieldset>
				{:else}
					<div class="items-start text-sm">
						<div class="p-1">Cooksta {$selectedTier?.rank ?? ''}</div>
						<div class="p-1">{$selectedChapter?.name ?? ''}</div>
						{#if Array.from(enabledDlcIds).length === 0}
							<span>&mdash;</span>
						{:else}
							<ul class="list-inside list-disc space-y-1 p-1">
								{#each dlcRows.filter((d) => enabledDlcIds.has(d.id)) as d (d.id)}
									<li>{d.name} DLC</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</div>
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
				<span>{facetName}</span>
			</legend>
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

	/* caret for collapsible header */
	.caret {
		width: 0;
		height: 0;
		border-top: 5px solid transparent;
		border-bottom: 5px solid transparent;
		border-left: 6px solid currentColor;
		transition: transform 150ms ease;
	}
	.caret[data-expanded='true'] {
		transform: rotate(90deg);
	}
</style>
