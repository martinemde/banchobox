<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	let { tracked = $bindable<Array<{ id: number; name: string; profit: number }>>([]) } = $props();
	const dispatch = createEventDispatcher<{ toggleTrack: number }>();
	function emit(id: number) {
		dispatch('toggleTrack', id);
	}
</script>

<div class="mb-2 flex items-center justify-between">
	<h2 class="text-sm font-semibold">Tracking</h2>
	{#if tracked.length > 0}
		<a href="/tracking" class="text-sm text-primary-600 hover:underline">View all</a>
	{/if}
</div>

{#if tracked.length === 0}
	<p class="text-sm opacity-70">
		When you click the 'Track' button under a dish, the dish will be shown here and a summary of its
		ingredients will be provided. Use it to track the dishes you're currently upgrading or need for
		a party.
	</p>
{:else}
	<ul class="space-y-2">
		{#each tracked as t}
			<li class="rounded-lg border border-surface-500 p-2">
				<div class="truncate text-sm font-medium">{t.name}</div>
				<div class="mt-1 flex items-center justify-between text-xs opacity-70">
					<span>Profit {t.profit.toLocaleString()}</span>
					<button class="underline" onclick={() => emit(t.id)}>Remove</button>
				</div>
			</li>
		{/each}
	</ul>
{/if}
