<script lang="ts">
	import Dish from './DishCard.svelte';
	import { dishesStores } from '$lib/stores/dishes';
	import EntityBundlePage from '$lib/ui/EntityBundlePage.svelte';
	import { trackedDishIds } from '$lib/stores/tracking.js';

	const { visible } = dishesStores;

	const tracked = $derived(
		$visible
			.filter((d) => $trackedDishIds.has(d.id))
			.map((d) => ({ id: d.id, name: d.name, profit: d.finalProfit }))
	);

	const sortOptions = [
		{ value: 'name', label: 'Recipe' },
		{ value: 'finalPrice', label: 'Final Price' },
		{ value: 'finalServings', label: 'Final Servings' },
		{ value: 'finalProfitPerServing', label: 'Profit / Serving' },
		{ value: 'maxProfitPerServing', label: 'Max Profit / Serving' },
		{ value: 'upgradeCost', label: 'Upgrade Cost' },
		{ value: 'ingredientCount', label: 'Ingredients' }
	];
</script>

<svelte:head>
	<title>Dishes - Bancho Box</title>
	<meta
		name="description"
		content="Complete dish collection from Dave the Diver with comprehensive profit analysis"
	/>
</svelte:head>

<EntityBundlePage
	stores={dishesStores}
	urlKey="dishes"
	entityLabel="Dishes"
	entityLabelPlural="dishes"
	searchPlaceholder="Search dishes by name, ingredient, DLC, unlock…"
	{sortOptions}
	containerClass="dishes"
	trackedItems={tracked}
	onToggleTrack={(id) => trackedDishIds.toggle(id as unknown as number)}
>
	{#snippet content()}
		{#each $visible as dish (dish.id)}
			<Dish {dish} />
		{/each}
	{/snippet}
</EntityBundlePage>
