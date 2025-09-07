<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { EntityStores } from '$lib/stores/entityBundle';
	import { syncToUrl } from '$lib/stores/urlSync';
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
		query,
		sortKey,
		sortDir,
		visible,
		visibleWithoutBaseline,
		filters,
		baselineFilters,
		bundle
	} = stores;

	// Sync to URL
	syncToUrl(urlKey, stores);

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
		{filters}
		{baselineFilters}
		bind:query={$query}
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
			bind:sortKey={$sortKey}
			bind:sortDir={$sortDir}
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
