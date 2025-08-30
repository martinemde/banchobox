<script lang="ts">
	import IngredientCard from './IngredientCard.svelte';
	import FiltersPanel from '$lib/ui/FiltersPanel.svelte';
	import ResponsiveLayout from '$lib/ui/ResponsiveLayout.svelte';
	import ResultsHeader from '$lib/ui/ResultsHeader.svelte';
	import { ingredientsStores } from '$lib/stores/ingredients';
	import { syncToUrl } from '$lib/stores/urlSync';

	const { query, sortKey, sortDir, visible, filters, bundle, baselineFilters } = ingredientsStores;
	syncToUrl('ingredients', ingredientsStores);

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

<ResponsiveLayout leftTitle="Filters & sort" containerClass="ingredients">
	{#snippet left()}
		<FiltersPanel
			{bundle}
			{filters}
			{baselineFilters}
			bind:query={$query}
			searchPlaceholder="Search ingredients by name, source, type, time, drone…"
		/>
	{/snippet}

	{#snippet content()}
		<div class="flex flex-col gap-4">
			<ResultsHeader
				{visible}
				entityLabel="Ingredients"
				bind:sortKey={$sortKey as string}
				bind:sortDir={$sortDir}
				{sortOptions}
			/>
			{#each $visible as ingredient (ingredient.id)}
				<IngredientCard {ingredient} />
			{/each}
		</div>
	{/snippet}
</ResponsiveLayout>
