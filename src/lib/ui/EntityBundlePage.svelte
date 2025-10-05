<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { EntityStores } from '$lib/stores/entityBundle';
	import { urlParamStore, urlFiltersStore } from '$lib/url/state';
	import FiltersPanel from '$lib/ui/FiltersPanel.svelte';
	import HiddenItemsIndicator from '$lib/ui/HiddenItemsIndicator.svelte';
	import ResponsiveLayout from '$lib/ui/ResponsiveLayout.svelte';
	import ResultsHeader from '$lib/ui/ResultsHeader.svelte';
	import TrackingSidebar from '$lib/components/TrackingSidebar.svelte';
	import type { BundleEntity } from '$lib/types';

	type SortOption = {
		value: string;
		label: string;
	};

	let {
		stores,
		urlKey,
		entityLabel,
		entityLabelPlural,
		searchPlaceholder,
		sortOptions,
		containerClass = '',
		// Optional tracking support
		showTracking = false,
		// Optional right sidebar support
		rightSidebar = undefined,
		// Content to render
		content
	}: {
		stores: EntityStores<BundleEntity>;
		urlKey: string;
		entityLabel: string;
		entityLabelPlural: string;
		searchPlaceholder: string;
		sortOptions: SortOption[];
		containerClass?: string;
		// Optional tracking support
		showTracking?: boolean;
		// Optional right sidebar support
		rightSidebar?: Snippet;
		// Content to render
		content: Snippet;
	} = $props();

	const {
		query: domainQuery,
		sortKey: domainSortKey,
		sortDir: domainSortDir,
		filters: domainFilters,
		visible,
		visibleWithoutBaseline,
		baselineFilters,
		bundle
	} = stores;

	// URL-backed stores (single source of truth)
	const urlQuery = urlParamStore(urlKey, 'q', { default: '' });
	const urlSortKey = urlParamStore('', 'sortKey', { default: 'name' });
	const urlSortDir = urlParamStore<'asc' | 'desc'>('', 'sortDir', {
		default: 'asc',
		decode: (s) => (s === 'desc' ? 'desc' : 'asc'),
		encode: (v) => (v === 'desc' ? 'desc' : 'asc')
	});
	const urlFilters = urlFiltersStore(urlKey);

	// One-way sync: URL → domain stores (to drive derived visible)
	$effect(() => {
		domainQuery.set($urlQuery);
		domainSortKey.set($urlSortKey);
		domainSortDir.set($urlSortDir);
		domainFilters.set($urlFilters);
	});

	// State for responsive layout
	let leftOpen = $state(false);
	let myBanchoExpanded = $state(true);

	// Show sidebars
	const showTrackingSidebar = $derived(showTracking);
	const showRightSidebar = $derived(showTrackingSidebar || Boolean(rightSidebar));
</script>

{#snippet leftSnippet()}
	<FiltersPanel
		{bundle}
		filters={urlFilters}
		{baselineFilters}
		bind:query={$urlQuery}
		bind:myBanchoExpanded
		{searchPlaceholder}
	/>
{/snippet}

{#snippet contentSnippet()}
	<div class="flex flex-col gap-4">
		<HiddenItemsIndicator
			{visible}
			{visibleWithoutBaseline}
			entityLabel={entityLabelPlural}
			on:open-filters={() => {
				leftOpen = true;
				myBanchoExpanded = true;
			}}
		/>
		<ResultsHeader
			{visible}
			{entityLabel}
			bind:sortKey={$urlSortKey}
			bind:sortDir={$urlSortDir}
			{sortOptions}
		/>
		{@render content?.()}
	</div>
{/snippet}

{#snippet rightSnippet()}
	{#if showTrackingSidebar}
		<TrackingSidebar />
	{:else if rightSidebar}
		{@render rightSidebar()}
	{/if}
{/snippet}

<ResponsiveLayout
	leftTitle="Filters & sort"
	{containerClass}
	bind:leftOpen
	left={leftSnippet}
	content={contentSnippet}
	right={showRightSidebar ? rightSnippet : undefined}
></ResponsiveLayout>
