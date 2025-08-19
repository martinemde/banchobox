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
	import { visible as dlcVisible } from '$lib/stores/dlc';
	const cookstaTiers = $derived($cookstaVisible ?? []);
	const dlcRows = $derived($dlcVisible ?? []);
	let editBancho = $state(false);
	let enabledDlcIds = $state(new Set<number>());
	function toggleDlc(id: number, checked: boolean) {
		const next = new SvelteSet(enabledDlcIds);
		if (checked) next.add(id);
		else next.delete(id);
		enabledDlcIds = next;
	}

	const hasDlcFacet = $derived(Boolean(($bundle?.facets ?? {})['DLC']));
	$effect(() => {
		if (!hasDlcFacet) return;
		const allowed = new SvelteSet<string>(['Base']);
		for (const d of dlcRows) if (enabledDlcIds.has(d.id)) allowed.add(d.name);
		filters.update((current) => ({ ...(current ?? {}), DLC: allowed }));
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

	function facetPanelId(name: string): string {
		return 'facet-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	}
</script>

<div class="space-y-4">
	<div class="rounded-lg border border-white/10 bg-primary-500/10 p-3">
		<div class="mb-2 flex items-center justify-between text-sm font-semibold">
			<div>My Bancho</div>
			<button
				class="text-xs font-normal opacity-80 hover:opacity-100"
				onclick={() => (editBancho = !editBancho)}
			>
				{editBancho ? 'Done' : 'Edit'}
			</button>
		</div>

		{#if editBancho}
			<label class="label">
				<div class="title">Cooksta</div>
				<select class="ig-select" bind:value={$selectedTierId}>
					{#each cookstaTiers as t (t.id)}
						<option value={t.id}>{t.rank}</option>
					{/each}
				</select>
			</label>
			<div class="title mt-3">DLCs</div>
			<fieldset class="mt-2 space-y-1 text-sm">
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
			<div class="grid grid-cols-3 items-start gap-2 text-sm">
				<div class="col-span-1 font-medium opacity-80">Cooksta</div>
				<div class="col-span-2">{$selectedTier?.rank ?? ''}</div>
				<div class="col-span-1 font-medium opacity-80">DLCs</div>
				<div class="col-span-2 space-y-1">
					{#if Array.from(enabledDlcIds).length === 0}
						<span>&mdash;</span>
					{:else}
						{#each dlcRows.filter((d) => enabledDlcIds.has(d.id)) as d (d.id)}
							<div>{d.name}</div>
						{/each}
					{/if}
				</div>
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
</style>
