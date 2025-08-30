<script lang="ts">
	import PixelIcon from '$lib/ui/PixelIcon.svelte';
	import type { Ingredient } from '$lib/types.js';
	import IngredientTypeCount from '$lib/components/IngredientTypeCount.svelte';
	import coinImage from '$lib/images/ui/coin.png';
	import servingsImage from '$lib/images/ui/servings.png';
	import { bundle as dishesBundle } from '$lib/stores/dishes.js';
	import { bundle as partiesBundle } from '$lib/stores/parties.js';

	let {
		ingredient,
		formatNumber
	}: { ingredient: Ingredient; formatNumber: (n: number | null | undefined) => string } = $props();

	let usedIn = $derived(
		ingredient.usedIn.map((u) => {
			const dish = $dishesBundle?.byId[u.dishId] ?? null;
			return {
				...u,
				dishName: dish?.name ?? '',
				dishImage: dish?.image ?? '',
				parties: u.partyIds.map((partyId) => $partiesBundle?.byId[partyId] ?? null)
			};
		})
	);
</script>

<div class="-mx-4">
	{#each usedIn as row (row.dishId)}
		<div class="flex w-full gap-x-3 border-t border-surface-200-800 px-4 py-2">
			<!-- Image - fixed width on left -->
			<div class="flex w-16 flex-shrink-0 items-center">
				<div class="relative" style="width: 64px; height: 64px">
					<PixelIcon image={row.dishImage} alt={row.dishName} uiScale={1} />
				</div>
			</div>

			<!-- Right side grid -->
			<div class="grid min-w-0 flex-1 gap-x-2" style="grid-template-columns: 1fr auto auto;">
				<!-- Dish Name row -->
				<div class="col-span-3 flex min-w-0 items-center">
					<span class="truncate">{row.dishName}</span>
				</div>
				<div class="flex flex-shrink-0 items-start justify-start">
					<IngredientTypeCount type={ingredient.type} count={row.count} size={16} />
				</div>

				<!-- Servings row (spans first two columns) -->
				<div class="col-span-1 flex items-center justify-end gap-1">
					<span class="whitespace-nowrap opacity-70">{row.servings}</span>
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
				<div class="flex w-16 flex-shrink-0 items-center justify-end gap-1">
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
				{#each row.parties as party (party?.id)}
					<div class="flex items-center">
						<span class="truncate opacity-80">{party?.name} Party</span>
					</div>
					<div class="flex items-center justify-end">
						<span class="badge rounded-full preset-filled-primary-500 px-2 py-0.5">
							{party?.bonus ?? ''}× party bonus
						</span>
					</div>
					<div class="flex w-16 flex-shrink-0 items-center justify-end gap-1">
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
						<span class="tabular-nums"
							>{formatNumber((row.price * (party?.bonus ?? 1)) as number)}</span
						>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
