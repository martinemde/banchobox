<script lang="ts">
	import type { Dish } from '$lib/types.js';
	import DishCard from '../dishes/DishCard.svelte';
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

<div class="mx-auto max-w-[1800px] p-4 lg:p-8">
	<section class="plan">
		<header class="mb-3">
			<h1 class="text-xl font-semibold">Tracking</h1>
			<p class="text-sm opacity-80">Dishes that you are tracking.</p>
		</header>

		{#if trackedDishes.length === 0}
			<div class="text-sm opacity-70">No tracked dishes yet. Track a dish to see items here.</div>
		{:else}
			<div class="mt-4 flex flex-col gap-4">
				{#each trackedDishes as dish (dish.id)}
					<DishCard {dish} />
				{/each}
			</div>
		{/if}
	</section>
</div>
