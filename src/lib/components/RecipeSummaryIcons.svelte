<script lang="ts">
	import type { Dish } from '$lib/types.js';
	import IngredientTypeCount from './IngredientTypeCount.svelte';

	let { dish } = $props<{ dish: Dish }>();

	let items = $derived.by(() => {
		const byType = new Map<string, { type: string; count: number }>();
		for (const ing of dish.ingredients) {
			const key = ing.type as string;
			const existing = byType.get(key);
			if (existing) existing.count += ing.count;
			else byType.set(key, { type: key, count: ing.count });
		}
		return Array.from(byType.values());
	});
</script>

<div class="flex flex-wrap items-center gap-2 pr-10 text-xs opacity-80">
	{#each items as row (row.type)}
		<span class="inline-flex items-center gap-1">
			<IngredientTypeCount type={row.type} count={row.count} size={16} />
		</span>
	{/each}
</div>
