<script lang="ts">
	import type { Dish } from '$lib/types.js';
	import { getIngredientTypeIcon } from '$lib/icons/ingredientType.js';
	import { bundle as ingredientsBundle } from '$lib/stores/ingredients.js';
	import PixelIcon from '../ui/PixelIcon.svelte';

	let { dish } = $props<{ dish: Dish }>();

	let ingredientRows = $derived(
		dish.ingredients.map((ing: Dish['ingredients'][number]) => {
			const icon = getIngredientTypeIcon(ing.type);
			const ingredient = $ingredientsBundle?.byId[ing.ingredientId] ?? null;
			if (!ingredient) return null;
			return {
				name: ingredient.name,
				source: ingredient.source,
				day: ingredient.day,
				night: ingredient.night,
				fog: ingredient.fog,
				count: ing.count,
				image: ingredient.image,
				icon
			};
		})
	);
</script>

<div class="-mx-4 overflow-x-auto">
	<table class="w-full table-auto text-sm">
		<tbody>
			{#each ingredientRows as row (row.name)}
				<tr class="border-t border-surface-200-800">
					<td class="w-8 pl-4">
						<div class="relative" style="width: 32px; height: 32px">
							<PixelIcon image={row.image} alt={row.name} uiScale={0.5} />
						</div>
					</td>
					<td class="p-2">{row.name}</td>
					<td class="gap-x-2 p-2 text-left tabular-nums">
						{#if row.icon}
							{@const Icon = row.icon}
							<span class="inline-flex items-center gap-x-1">
								<strong>{row.count}</strong><Icon size={16} class="opacity-70" />
							</span>
						{:else}
							<strong>{row.count}</strong>
						{/if}
					</td>
					<td class="p-2 pr-4 text-right tabular-nums">{row.source}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
