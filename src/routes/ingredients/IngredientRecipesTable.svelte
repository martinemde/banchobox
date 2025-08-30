<script lang="ts">
	import PixelIcon from '$lib/ui/PixelIcon.svelte';
	import type { Ingredient } from '$lib/types.js';
	import IngredientTypeCount from '$lib/components/IngredientTypeCount.svelte';
	import coinImage from '$lib/images/ui/coin.png';
	import servingsImage from '$lib/images/ui/servings.png';

	let {
		ingredient,
		formatNumber
	}: { ingredient: Ingredient; formatNumber: (n: number | null | undefined) => string } = $props();
</script>

<div class="overflow-x-auto">
	<div class="w-full text-sm">
		{#each ingredient.usedIn as row (row.dishId)}
			<div class="flex gap-x-3 border-b border-surface-200-800 py-2">
				<!-- Image - fixed width on left -->
				<div class="flex w-16 flex-shrink-0 items-center">
					<div class="relative" style="width: 64px; height: 64px">
						<PixelIcon image={row.dishImage} alt={row.dishName} uiScale={1} />
					</div>
				</div>

				<!-- Right side grid -->
				<div class="grid min-w-0 flex-1 gap-x-2" style="grid-template-columns: 1fr auto;">
					<!-- Dish Name row -->
					<div class="flex min-w-0 items-center">
						<span class="truncate">{row.dishName}</span>
					</div>
					<div class="flex flex-shrink-0 items-center justify-end">
						<IngredientTypeCount type={ingredient.type} count={row.count} size={16} />
					</div>

					<!-- Servings and Price row -->
					<div class="flex items-center justify-end">
						<span class="whitespace-nowrap opacity-70">×{row.servings}</span>
						<img
							class="inline-block h-4 w-4 align-text-bottom"
							src={servingsImage}
							alt="Servings"
							loading="lazy"
							decoding="async"
							width={20}
							height={20}
						/>
					</div>

					<!-- Price -->
					<div class="flex w-14 flex-shrink-0 items-center justify-end gap-1">
						<img
							class="inline-block h-4 w-4 align-text-bottom"
							src={coinImage}
							alt="Sell Price"
							title="Sell Price"
							loading="lazy"
							decoding="async"
							width={20}
							height={20}
						/>
						<span class="tabular-nums">{formatNumber(row.price as number)}</span>
					</div>

					<!-- Party rows -->
					{#each row.partyNames as partyName (partyName)}
						<div class="flex items-center">
							<span class="truncate opacity-80">{partyName} Party</span>
						</div>
						<div class="flex flex-shrink-0 items-center justify-end">
							<span class="tabular-nums opacity-80">—</span>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
