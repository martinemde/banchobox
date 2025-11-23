<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import StaffCard from './StaffCard.svelte';
	import SearchBox from './SearchBox.svelte';
	import FacetPanel from './FacetPanel.svelte';
	import SortControls from './SortControls.svelte';
	import type { PageData } from './$types';
	import { parseSearchParam, parseFacetFilters } from '$lib/utils/urlFilters';
	import { filterBySearch, applyFacetFilters, applyMyBanchoFilters } from './staffFilters';
	import { applySortOrder } from './staffSort';
	import { getSortedRows } from '$lib/stores/entityBundle';
	import { enabledDLCs } from '$lib/stores/myBancho.svelte';
	import MyBanchoPanel from '$lib/components/MyBanchoPanel.svelte';

	let { data }: { data: PageData } = $props();

	// Get all staff items from bundle
	const allStaff = $derived(getSortedRows(data.staffBundle));

	// Read URL parameters (all $derived from $page store)
	let searchQuery = $derived(parseSearchParam($page.url, 'q'));
	let sortField = $derived(parseSearchParam($page.url, 'sort', 'wageMax'));
	let sortDir = $derived(parseSearchParam($page.url, 'dir', 'desc') as 'asc' | 'desc');
	let activeFacets = $derived(parseFacetFilters($page.url));

	// Apply filters and sort in derivation chain
	let searchedStaff = $derived(filterBySearch(allStaff, searchQuery));
	let facetedStaff = $derived(
		applyFacetFilters(searchedStaff, data.staffBundle.facets, activeFacets)
	);
	let sortedStaff = $derived(applySortOrder(facetedStaff, data.staffBundle, sortField, sortDir));

	// Apply MyBancho filters (reads LocalStore.value directly, uses facet indexes)
	let enabledDLCNames = $derived(enabledDLCs().map((d) => d.name));
	let myBanchoResult = $derived(
		applyMyBanchoFilters(sortedStaff, data.staffBundle.facets.DLC, enabledDLCNames)
	);
	let visibleStaff = $derived(myBanchoResult.visible);
	let hiddenByMyBancho = $derived(myBanchoResult.hiddenCount);

	// Helper to create URL with updated params
	function updateURL(updates: Record<string, string | null>) {
		const params = new URLSearchParams($page.url.searchParams);

		for (const [key, value] of Object.entries(updates)) {
			if (value === null || value === '') {
				params.delete(key);
			} else {
				params.set(key, value);
			}
		}

		// Use pathname + search to maintain current route
		const url = `${$page.url.pathname}?${params}`;
		goto(url, { replaceState: true, noScroll: true, keepFocus: true });
	}

	// Event handlers (no $effect needed!)
	function updateSearch(query: string) {
		updateURL({ q: query || null });
	}

	function updateFacets(category: string, values: string[]) {
		const key = `f.${category}`;
		updateURL({ [key]: values.length > 0 ? values.join(',') : null });
	}

	function updateSort(field: string, direction: 'asc' | 'desc') {
		updateURL({ sort: field, dir: direction });
	}

	function clearAllFilters() {
		// Keep only sort params, remove search and facets
		const params = new URLSearchParams();
		params.set('sort', sortField);
		params.set('dir', sortDir);
		const url = `${$page.url.pathname}?${params}`;
		goto(url, { replaceState: true, noScroll: true });
	}

	const hasActiveFilters = $derived(
		searchQuery !== '' || Object.keys(activeFacets).some((key) => activeFacets[key].length > 0)
	);

	const sortFields = [
		{ value: 'name', label: 'Name' },
		{ value: 'wageMax', label: 'Max Wage' },
		{ value: 'hiringFee', label: 'Hiring Fee' },
		{ value: 'cookingMax', label: 'Cooking' },
		{ value: 'servingMax', label: 'Serving' },
		{ value: 'procureMax', label: 'Procure' },
		{ value: 'appealMax', label: 'Appeal' },
		{ value: 'maxSeasonings', label: 'Seasonings' }
	];

	let facetPanelExpanded = $state(false);
	let myBanchoPanelExpanded = $state(false);
</script>

<svelte:head>
	<title>Staff - Bancho Box</title>
	<meta name="description" content="Staff stats and skills for Dave the Diver" />
	<link rel="canonical" href="/staff" />
	<meta property="og:title" content="Staff - Bancho Box" />
	<meta property="og:description" content="Staff stats and skills for Dave the Diver" />
</svelte:head>

<div class="container mx-auto p-4">
	<div class="mb-6 space-y-4">
		<div class="flex items-center justify-between">
			<h1 class="text-2xl font-bold">
				{visibleStaff.length} Staff
				{#if searchQuery}
					<span class="text-base font-normal opacity-70">matching "{searchQuery}"</span>
				{/if}
			</h1>
		</div>

		<SearchBox value={searchQuery} onSearch={updateSearch} placeholder="Search staff by name..." />

		<MyBanchoPanel bind:expanded={myBanchoPanelExpanded} />

		{#if hiddenByMyBancho > 0}
			<div class="rounded border border-surface-200-800 bg-warning-500/10 px-4 py-2 text-sm">
				<span class="opacity-80">{hiddenByMyBancho} staff hidden by My Bancho settings</span>
			</div>
		{/if}

		<FacetPanel
			facets={data.staffBundle.facets}
			{activeFacets}
			onUpdate={updateFacets}
			bind:expanded={facetPanelExpanded}
		/>

		<div class="flex items-center gap-2">
			<div class="flex-1">
				<SortControls
					field={sortField}
					direction={sortDir}
					fields={sortFields}
					onUpdate={updateSort}
				/>
			</div>
			{#if hasActiveFilters}
				<button
					type="button"
					onclick={clearAllFilters}
					class="btn preset-tonal-error whitespace-nowrap"
				>
					Clear Filters
				</button>
			{/if}
		</div>
	</div>

	<div class="space-y-4">
		{#each visibleStaff as staff (staff.id)}
			<StaffCard {staff} />
		{/each}
	</div>

	{#if visibleStaff.length === 0}
		<div class="py-12 text-center opacity-70">
			<p class="text-lg">No staff found.</p>
			{#if searchQuery}
				<button
					type="button"
					onclick={() => updateSearch('')}
					class="mt-4 btn preset-filled-primary-500"
				>
					Clear search
				</button>
			{/if}
		</div>
	{/if}
</div>
