<script lang="ts">
	import Dish from './DishCard.svelte';
	import { dishesStores } from '$lib/stores/dishes';
	import EntityBundlePage from '$lib/ui/EntityBundlePage.svelte';

	const { visible } = dishesStores;

	const sortOptions = [
		{ value: 'name', label: 'Name' },
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
	showTracking={true}
>
	{#snippet content()}
		{#each $visible as dish (dish.id)}
			<Dish {dish} />
		{/each}
	{/snippet}
</EntityBundlePage>
