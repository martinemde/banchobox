<script lang="ts">
	import Dish from '$lib/components/DishCard.svelte';
	import { dishesStores } from '$lib/stores/dishes';
	import { syncToUrl } from '$lib/stores/urlSync';
	import FiltersPanel from '$lib/ui/FiltersPanel.svelte';
	import ResponsiveLayout from '$lib/ui/ResponsiveLayout.svelte';
	import ResultsHeader from '$lib/ui/ResultsHeader.svelte';
	import TrackingSidebar from '$lib/ui/TrackingSidebar.svelte';
	import { trackedDishIds } from '$lib/stores/tracking.js';

	const { query, sortKey, sortDir, visible, filters, baselineFilters } = dishesStores;
	syncToUrl('dishes', dishesStores);

	const tracked = $derived(
		$visible
			.filter((d) => $trackedDishIds.has(d.id))
			.map((d) => ({ id: d.id, name: d.name, profit: d.finalProfit }))
	);
</script>

<svelte:head>
	<title>Dishes - Bancho Box</title>
	<meta
		name="description"
		content="Complete dish collection from Dave the Diver with comprehensive profit analysis"
	/>
</svelte:head>

<ResponsiveLayout leftTitle="Filters & sort" containerClass="dishes">
	{#snippet left()}
		<FiltersPanel
			bundle={dishesStores.bundle}
			{filters}
			{baselineFilters}
			bind:query={$query}
			bind:sortKey={$sortKey as string}
			bind:sortDir={$sortDir}
			searchPlaceholder="Search dishes by name, ingredient, DLC, unlock…"
		/>
	{/snippet}

	{#snippet content()}
		<div class="flex flex-col gap-4">
			<ResultsHeader
				{visible}
				entityLabel="Dishes"
				bind:sortKey={$sortKey as string}
				bind:sortDir={$sortDir}
				sortOptions={[
					{ value: 'name', label: 'Recipe' },
					{ value: 'finalPrice', label: 'Final Price' },
					{ value: 'finalServings', label: 'Final Servings' },
					{ value: 'finalProfitPerServing', label: 'Profit / Serving' },
					{ value: 'maxProfitPerServing', label: 'Max Profit / Serving' },
					{ value: 'upgradeCost', label: 'Upgrade Cost' },
					{ value: 'ingredientCount', label: 'Ingredients' }
				]}
			/>
			{#each $visible as dish (dish.id)}
				<Dish {dish} />
			{/each}
		</div>
	{/snippet}

	{#snippet right()}
		<TrackingSidebar
			{tracked}
			on:toggleTrack={(e) => trackedDishIds.toggle(e.detail as unknown as number)}
		/>
	{/snippet}
</ResponsiveLayout>
