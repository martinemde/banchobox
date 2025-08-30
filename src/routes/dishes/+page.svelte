<script lang="ts">
	import Dish from './DishCard.svelte';
	import { dishesStores } from '$lib/stores/dishes';
	import { syncToUrl } from '$lib/stores/urlSync';
	import ResultsHeader from '$lib/ui/ResultsHeader.svelte';
	import TrackingSidebar from '$lib/ui/TrackingSidebar.svelte';
	import { trackedDishIds } from '$lib/stores/tracking.js';

	const { query, sortKey, sortDir, visible, visibleWithoutBaseline, filters, baselineFilters } =
		dishesStores;
	syncToUrl('dishes', dishesStores);

	const tracked = $derived(
		$visible
			.filter((d) => $trackedDishIds.has(d.id))
			.map((d) => ({ id: d.id, name: d.name, profit: d.finalProfit }))
	);

	let myBanchoExpanded = $state(true);
</script>

<svelte:head>
	<title>Dishes - Bancho Box</title>
	<meta
		name="description"
		content="Complete dish collection from Dave the Diver with comprehensive profit analysis"
	/>
</svelte:head>

<div class="dishes flex-1 px-4 py-6">
	<div class="md:flex md:gap-6">
		<section class="flex-1 md:min-w-0">
			<div class="flex flex-col gap-4">
				<ResultsHeader
					{visible}
					{visibleWithoutBaseline}
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
					bundle={dishesStores.bundle}
					{filters}
					{baselineFilters}
					bind:query={$query}
					bind:myBanchoExpanded
					searchPlaceholder="Search dishes by name, ingredient, DLC, unlock…"
				/>
				{#each $visible as dish (dish.id)}
					<Dish {dish} />
				{/each}
			</div>
		</section>

		<aside class="hidden md:shrink-0 lg:block lg:w-64">
			<TrackingSidebar
				{tracked}
				on:toggleTrack={(e) => trackedDishIds.toggle(e.detail as unknown as number)}
			/>
		</aside>
	</div>
</div>
