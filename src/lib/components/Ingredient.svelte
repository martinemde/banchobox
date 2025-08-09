<script lang="ts">
	import type { EnrichedIngredient, EnrichedDish } from '../types.js';
	import { Data } from '../data/runtime.js';
	import { imageUrlForName } from '../images/index.js';
	import { Accordion } from '@skeletonlabs/skeleton-svelte';
	import { browser } from '$app/environment';
	import TrackButton from './TrackButton.svelte';
	import { trackedIngredientIds } from '$lib/stores/tracking.js';
	import {
		ArchiveRestore,
		ArchiveX,
		ChevronsUp,
		CookingPot,
		Fish,
		FishOff,
		LeafyGreen,
		Loader,
		Shrimp,
		Snowflake,
		Wheat
	} from '@lucide/svelte';

	export let ingredient: EnrichedIngredient;

	$: imageSrc = imageUrlForName(ingredient.name);
	// Match thumbnail sizing used in PartyDish
	const thumbPx = 96;

	function formatNumber(value: number | null | undefined): string {
		if (value == null || Number.isNaN(value)) return '—';
		return new Intl.NumberFormat().format(Math.round(value));
	}

	$: costPerKg = (() => {
		if (ingredient.cost == null || ingredient.kg == null || ingredient.kg === 0) return null;
		return ingredient.cost / ingredient.kg;
	})();

	function getTypeIcon(type?: string) {
		if (!type) return null;
		const key = type.toLowerCase();
		switch (key) {
			case 'aberration crab':
				return FishOff;
			case 'aberration crab':
				return ArchiveX;
			case 'crab trap':
				return ArchiveRestore;
			case 'fish':
				return Fish;
			case 'jango':
				return Snowflake;
			case 'net':
				return Shrimp;
			case 'seasoning':
				return CookingPot;
			case 'sea plant':
				return LeafyGreen;
			case 'vegetable':
				return Wheat;
			case 'urchin':
				return Loader;
			default:
				return null;
		}
	}

	type RecipeRow = {
		dish: EnrichedDish;
		count: number;
		level: number | null;
		upgradeCount: number | null;
		price: number | null | undefined;
		servings: number | null | undefined;
		partyName: string | null;
	};

	$: recipeRows = (ingredient.usedIn || [])
		.map(({ dishId, count }) => {
			const dish = Data.getDishById(dishId);
			if (!dish) return null;
			const line = dish.ingredients.find((ing) => ing.ingredientId === ingredient.id);
			const parties = Data.getPartyDishesByDishId(dish.id) || [];
			const bestParty = [...parties].sort((a, b) => b.profit - a.profit)[0];
			const partyName = bestParty ? (Data.getPartyById(bestParty.partyId)?.name ?? null) : null;

			const row: RecipeRow = {
				dish,
				count,
				level: dish.final_level ?? null,
				upgradeCount: (line as any)?.upgradeCount ?? null,
				price: dish.final_price,
				servings: dish.servings,
				partyName
			};
			return row;
		})
		.filter(Boolean)
		.map((r) => r as RecipeRow)
		.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
</script>

<article
	class="divide-y divide-surface-200-800 card border-[1px] border-surface-200-800 preset-filled-surface-100-900 card-hover"
>
	<!-- Section 1: Overview (formatted like PartyDish) -->
	<section class="p-4">
		<div class="flex items-start gap-4">
			<div class="inline-block" style="width: {thumbPx}px">
				<div class="relative" style="width: {thumbPx}px; height: {thumbPx}px">
					{#if imageSrc}
						<img
							class="h-full w-full overflow-hidden rounded-md bg-surface-300-700 object-contain"
							src={imageSrc}
							alt=""
							loading="lazy"
						/>
					{/if}
				</div>

				<div class="mt-2" style="width: {thumbPx}px">
					{#if browser && ingredient?.id != null}
						{@const isTracked = $trackedIngredientIds.has(ingredient.id)}
						<TrackButton
							checked={isTracked}
							on:change={(e) => {
								const nowChecked = e.detail.checked as boolean;
								if (nowChecked) trackedIngredientIds.track(ingredient.id);
								else trackedIngredientIds.untrack(ingredient.id);
							}}
						/>
					{/if}
				</div>
			</div>

			<div class="min-w-0 flex-1 space-y-2">
				<div class="flex items-center gap-2">
					<h3 class="m-0 truncate h5 !leading-none">{ingredient.name}</h3>
				</div>

				<div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 opacity-80 *:text-xs">
					<span>{ingredient.source}</span>
				</div>

				<div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
					<span>
						Sell: {ingredient.cost != null ? `${formatNumber(ingredient.cost)}g` : '—'}
					</span>
					<span>Buy: —</span>
				</div>

				{#if ingredient.kg != null}
					<div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
						<span>Weight: {ingredient.kg != null ? `${ingredient.kg}kg` : '—'}</span>
						<span class="opacity-80"
							>{costPerKg != null ? `${formatNumber(costPerKg)}g/kg` : ''}</span
						>
					</div>
				{/if}
			</div>

			<div class="ml-auto flex items-start gap-2 self-start">
				{#if ingredient.drone === 1}
					<button type="button" class="group relative inline-flex" aria-label="Drone">
						<ChevronsUp size={24} class="opacity-80" />
						<span
							class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
							>Drone</span
						>
					</button>
				{/if}
				{#if ingredient.type}
					{@const TypeIcon = getTypeIcon(ingredient.type)}
					{#if TypeIcon}
						<button type="button" class="group relative inline-flex" aria-label={ingredient.type}>
							<TypeIcon size={24} class="opacity-80" />
							<span
								class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
								>{ingredient.type}</span
							>
						</button>
					{:else}
						<button
							type="button"
							class="group relative inline-flex text-xs whitespace-nowrap opacity-80"
							aria-label={ingredient.type}
						>
							{ingredient.type}
							<span
								class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
								>{ingredient.type}</span
							>
						</button>
					{/if}
				{/if}
			</div>
		</div>
	</section>

	<!-- Section 2: Recipes using this ingredient -->
	{#if recipeRows.length > 0}
		<section class="p-4">
			<Accordion collapsible defaultValue={[]}>
				<Accordion.Item value="recipes">
					{#snippet control()}
						<div class="flex w-full items-center justify-between">
							<span class="text-xs tracking-wide uppercase opacity-80">Recipes</span>
							<span class="text-xs tabular-nums opacity-80">({recipeRows.length})</span>
						</div>
					{/snippet}

					{#snippet panel()}
						<div class="mt-2 overflow-x-auto">
							<table class="w-full table-auto text-sm">
								<thead class="bg-surface-200-800">
									<tr>
										<th class="p-2 text-left">Recipe</th>
										<th class="p-2 text-center">Qty</th>
										<th class="p-2 text-center">Lvl</th>
										<th class="p-2 text-center">Upgrade</th>
										<th class="p-2 text-right">Price</th>
										<th class="p-2 text-right">Serv</th>
										<th class="p-2 text-left">Party</th>
									</tr>
								</thead>
								<tbody>
									{#each recipeRows as row}
										<tr class="border-b border-surface-200-800">
											<td class="p-2">{row.dish.name}</td>
											<td class="p-2 text-center tabular-nums">{row.count}</td>
											<td class="p-2 text-center tabular-nums">{row.level ?? '—'}</td>
											<td class="p-2 text-center tabular-nums">{row.upgradeCount ?? '—'}</td>
											<td class="p-2 text-right tabular-nums"
												>{formatNumber(row.price as number)}</td
											>
											<td class="p-2 text-right tabular-nums">{row.servings ?? '—'}</td>
											<td class="p-2">{row.partyName ?? '—'}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/snippet}
				</Accordion.Item>
			</Accordion>
		</section>
	{/if}
</article>
