<script lang="ts">
	import type { Dish } from '$lib/types.js';
	import IngredientTypeCount from '../../routes/dishes/IngredientTypeCount.svelte';

	let { dish } = $props<{ dish: Dish }>();

	// Keep each ingredient entry separate, even if types are the same
	let items = $derived(
		dish.ingredients.map((ing: Dish['ingredients'][number]) => ({
			type: ing.type,
			count: ing.count,
			key: ing.ingredientId
		}))
	);
</script>

<div class="flex flex-wrap items-center gap-2 pr-10 text-xs opacity-80">
	{#each items as row (row.key)}
		<span class="inline-flex items-center gap-1">
			<IngredientTypeCount type={row.type} count={row.count} size={16} />
		</span>
	{/each}
</div>
