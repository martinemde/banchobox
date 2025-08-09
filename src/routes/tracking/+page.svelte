<script lang="ts">
	import { Data } from '$lib/data/runtime.js';
	import type { EnrichedIngredient } from '$lib/types.js';
	import PlannedIngredient from '$lib/components/PlannedIngredient.svelte';
	import LoadMoreSentinel from '$lib/components/LoadMoreSentinel.svelte';
	import { trackedDishIds, trackedIngredientIds } from '$lib/stores/tracking.js';

	// Compute the union of directly tracked ingredients and ingredients from tracked dishes
	$: ingredientIdsFromTrackedDishes = new Set<number>(
		[...$trackedDishIds].flatMap((dishId) => {
			const dish = Data.getDishById(dishId);
			return dish ? dish.ingredients.map((ing) => ing.ingredientId) : [];
		})
	);

	$: plannedIngredientIds = new Set<number>([
		...Array.from($trackedIngredientIds),
		...Array.from(ingredientIdsFromTrackedDishes)
	]);

	$: plannedIngredients = Array.from(plannedIngredientIds)
		.map((id) => Data.getIngredientById(id))
		.filter((i): i is EnrichedIngredient => Boolean(i));

	// pagination for tracking page
	let pageSize = 20;
	let renderedCount = pageSize;
	function loadMore() {
		renderedCount = Math.min(renderedCount + pageSize, plannedIngredients.length);
	}
	// Reset when tracking set changes
	let lastSignature = '';
	$: {
		const signature = `${$trackedIngredientIds.size}|${$trackedDishIds.size}|${plannedIngredients.length}`;
		if (signature !== lastSignature) {
			renderedCount = Math.min(pageSize, plannedIngredients.length);
			lastSignature = signature;
		}
	}
</script>

<svelte:head>
	<title>Tracking - Bancho Box</title>
	<meta
		name="description"
		content="A focused list of tracked ingredients, including those from tracked dishes"
	/>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="container">
	<section class="plan">
		<header class="mb-3">
			<h1 class="text-xl font-semibold">Tracking</h1>
			<p class="text-sm opacity-80">
				Ingredients you tracked directly, plus ingredients required by your tracked dishes.
			</p>
		</header>

		{#if plannedIngredients.length === 0}
			<div class="text-sm opacity-70">
				No tracked ingredients yet. Track an ingredient or a dish to see items here.
			</div>
		{:else}
			<div class="card-list">
				{#each plannedIngredients.slice(0, renderedCount) as ingredient (ingredient.id)}
					<PlannedIngredient {ingredient} />
				{/each}
				{#if renderedCount < plannedIngredients.length}
					<LoadMoreSentinel rootMargin="1200px" on:visible={loadMore} />
				{/if}
			</div>
		{/if}
	</section>
</div>

<style>
	.container {
		max-width: 1800px;
		margin: 0 auto;
		padding: 2rem;
	}

	.card-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1rem;
	}

	@media (max-width: 1200px) {
		.container {
			padding: 1rem;
		}
	}
</style>
