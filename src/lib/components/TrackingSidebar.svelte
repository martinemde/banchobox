<script lang="ts">
	import { toggleTrackedDish, trackedDishIds } from '$lib/stores/tracking.svelte';
	import { bundle } from '$lib/stores/dishes';
	import { getSortedRows } from '$lib/stores/entityBundle';
	import { resolve } from '$app/paths';

	// Get all tracked dishes from the store, regardless of filtering
	const tracked = $derived(
		$bundle
			? getSortedRows($bundle)
					.filter((dish) => trackedDishIds.includes(dish.id))
					.map((dish) => ({ id: dish.id, name: dish.name, profit: dish.finalProfit }))
			: []
	);
</script>

<div class="flex items-center justify-between">
	<h2 class="text-sm font-semibold">Tracked Dishes</h2>
	{#if tracked.length > 0}
		<a href={resolve('/tracking')} class="text-sm text-primary-600 hover:underline">View all</a>
	{/if}
</div>

{#if tracked.length === 0}
	<p class="text-sm opacity-70">
		When you click the 'Star' button in the top left corner of a dish, the dish will be shown here
		and a summary of its ingredients is available in Tracking. Use it to track the dishes you're
		currently upgrading or need for a party.
	</p>
{:else}
	<ul class="space-y-2">
		{#each tracked as t (t.id)}
			<li class="rounded-lg border border-surface-500 p-2">
				<div class="truncate text-sm font-medium">{t.name}</div>
				<div class="mt-1 flex items-center justify-between text-xs opacity-70">
					<span>Profit {t.profit.toLocaleString()}</span>
					<button class="underline" onclick={() => toggleTrackedDish(t.id, false)}>Remove</button>
				</div>
			</li>
		{/each}
	</ul>
{/if}
