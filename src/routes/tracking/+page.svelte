<script lang="ts">
	import type { Dish } from '$lib/types.js';
	import DishCard from '$lib/components/DishCard.svelte';
	import { trackedDishIds } from '$lib/stores/tracking.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const dishes = $derived((data.dishes as { rows: Dish[] } | undefined)?.rows ?? []);

	// Dishes that are currently tracked
	const trackedDishes = $derived(
		dishes
			.filter((d) => $trackedDishIds.has(d.id))
			// Stable, readable order: by name
			.toSorted((a, b) => a.name.localeCompare(b.name))
	);
</script>

<svelte:head>
	<title>Tracking - Bancho Box</title>
	<meta name="description" content="Dishes you are tracking" />
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="container">
	<section class="plan">
		<header class="mb-3">
			<h1 class="text-xl font-semibold">Tracking</h1>
			<p class="text-sm opacity-80">Your tracked dishes.</p>
		</header>

		{#if trackedDishes.length === 0}
			<div class="text-sm opacity-70">No tracked dishes yet. Track a dish to see items here.</div>
		{:else}
			<div class="card-list">
				{#each trackedDishes as dish (dish.id)}
					<DishCard {dish} />
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
