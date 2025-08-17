<script lang="ts">
	import type { Ingredient, Dish, Id } from '$lib/types.js';
	import TrackedIngredient from '$lib/components/TrackedIngredient.svelte';
	import { trackedDishIds } from '$lib/stores/tracking.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const dishes = $derived((data.dishes as { rows: Dish[] } | undefined)?.rows ?? []);
	const ingredients = $derived(
		(data.ingredients as { rows: Ingredient[] } | undefined)?.rows ?? []
	);
	const dishById = $derived(new Map<Id, Dish>(dishes.map((d) => [d.id, d] as [Id, Dish])));

	// Ingredients from tracked dishes
	const ingredientIdsFromTrackedDishes = $derived(
		new Set<number>(
			[...$trackedDishIds].flatMap((dishId) => {
				const dish = dishById.get(dishId);
				return dish ? dish.ingredients.map((ing) => ing.ingredientId) : [];
			})
		)
	);

	const plannedIngredientIds = $derived(
		new Set<number>([...Array.from(ingredientIdsFromTrackedDishes)])
	);

	const plannedIngredients = $derived(
		Array.from(plannedIngredientIds)
			.map((id) => ingredients.find((i) => i.id === id))
			.filter((i): i is Ingredient => Boolean(i))
	);

	type TrackedUsage = {
		dish: Dish;
		qty: number;
		upgrade: number;
	};

	function getTrackedUsagesForIngredient(ingredientId: number): TrackedUsage[] {
		const usages: TrackedUsage[] = [];
		for (const dishId of $trackedDishIds) {
			const dish = dishById.get(dishId);
			if (!dish) continue;
			const line = dish.ingredients.find((ing) => ing.ingredientId === ingredientId);
			if (!line) continue;
			usages.push({ dish, qty: line.count, upgrade: line.upgradeCount ?? 0 });
		}
		// Sort by dish price desc for readability
		return usages.sort((a, b) => (b.dish.finalPrice ?? 0) - (a.dish.finalPrice ?? 0));
	}
</script>

<svelte:head>
	<title>Tracking - Bancho Box</title>
	<meta name="description" content="Ingredients required by your tracked dishes" />
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="container">
	<section class="plan">
		<header class="mb-3">
			<h1 class="text-xl font-semibold">Tracking</h1>
			<p class="text-sm opacity-80">Ingredients required by your tracked dishes.</p>
		</header>

		{#if plannedIngredients.length === 0}
			<div class="text-sm opacity-70">No tracked dishes yet. Track a dish to see items here.</div>
		{:else}
			<div class="card-list">
				{#each plannedIngredients as ingredient}
					<TrackedIngredient {ingredient} {dishById} />
				{/each}
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
