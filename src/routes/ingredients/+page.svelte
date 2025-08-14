<script lang="ts">
	import IngredientCard from '$lib/components/IngredientCard.svelte';
	import FiltersPanel from '$lib/ui/FiltersPanel.svelte';
	import ResponsiveLayout from '$lib/ui/ResponsiveLayout.svelte';
	import { ingredientsStores } from '$lib/stores/ingredients';
	import { syncToUrl } from '$lib/stores/urlSync';

	const { query, sortKey, sortDir, visible, filters, bundle } = ingredientsStores;
	syncToUrl('ingredients', ingredientsStores);

	const sortOptions = [
		{ value: 'name', label: 'Name' },
		{ value: 'sell', label: 'Sell' },
		{ value: 'kg', label: 'Weight (kg)' },
		{ value: 'sellPerKg', label: 'Sell / kg' }
	];
</script>

<svelte:head>
	<title>Ingredients - Bancho Box</title>
	<meta
		name="description"
		content="Complete ingredient analysis from Dave the Diver with profitability metrics"
	/>
</svelte:head>

<ResponsiveLayout leftTitle="Filters & sort" containerClass="ingredients">
	{#snippet left()}
		<FiltersPanel
			{bundle}
			{filters}
			bind:query={$query}
			bind:sortKey={$sortKey as string}
			bind:sortDir={$sortDir}
			{sortOptions}
			searchPlaceholder="Search ingredients by name, source, type, time, drone…"
		/>
	{/snippet}

	{#snippet content()}
		<div class="flex flex-col gap-4">
			{#each $visible as ingredient (ingredient.id)}
				<IngredientCard {ingredient} />
			{/each}
		</div>
	{/snippet}
</ResponsiveLayout>

<style>
	/* controls moved into FiltersPanel */
</style>
