<script lang="ts">
	import IngredientCard from './IngredientCard.svelte';
	import EntityBundlePage from '$lib/ui/EntityBundlePage.svelte';
	import { ingredientsStores } from '$lib/stores/ingredients';

	const { visible } = ingredientsStores;

	const sortOptions = [
		{ value: 'name', label: 'Name' },
		{ value: 'kg', label: 'Weight (kg)' },
		{ value: 'sell', label: 'Sell' },
		{ value: 'sellPerKg', label: 'Sell / kg' },
		{ value: 'buy', label: 'Purchase' }
	];
</script>

<svelte:head>
	<title>Ingredients - Bancho Box</title>
	<meta
		name="description"
		content="Complete ingredient analysis from Dave the Diver with profitability metrics"
	/>
</svelte:head>

<EntityBundlePage
	stores={ingredientsStores}
	urlKey="ingredients"
	entityLabel="Ingredients"
	entityLabelPlural="ingredients"
	searchPlaceholder="Search ingredients by name, source, type, time, drone…"
	{sortOptions}
	containerClass="ingredients"
>
	{#snippet content()}
		{#each $visible as ingredient (ingredient.id)}
			<IngredientCard {ingredient} />
		{/each}
	{/snippet}
</EntityBundlePage>
