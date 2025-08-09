<script lang="ts">
	import type { EnrichedDish } from '../types.js';
	import { Data } from '../data/runtime.js';
	import { imageUrlForName } from '../images/index.js';
	import { Accordion } from '@skeletonlabs/skeleton-svelte';
	import ProfitTable from './ProfitTable.svelte';
	import TrackButton from './TrackButton.svelte';
	import { trackedDishIds } from '$lib/stores/tracking.js';
	import { browser } from '$app/environment';

	export let dish: EnrichedDish;

	$: imageSrc = imageUrlForName(dish.name);
	// Fixed width for thumbnail to match default card format
	const thumbPx = 96;

	$: ingredientRows = dish.ingredients.map((ing) => {
		const meta = Data.getIngredientById(ing.ingredientId);
		return {
			name: meta?.name ?? 'Unknown',
			count: ing.count,
			upgradeCount: ing.upgradeCount ?? null,
			unitCost: ing.unitCost ?? null,
			lineCost: ing.lineCost,
			type: meta?.type ?? meta?.source ?? '—'
		};
	});

	// Summary string for collapsible control in recipe section
	$: ingredientSummary = ingredientRows.map((row) => `${row.name} ×${row.count}`).join(', ');

	function formatNumber(value: number | null | undefined): string {
		if (value == null || Number.isNaN(value)) return '—';
		return new Intl.NumberFormat().format(Math.round(value));
	}

	// Build rows for all parties associated to this dish, sorted by profit desc
	$: partyRows = (dish.partyDishIds || [])
		.map((id) => Data.getPartyDishById(id))
		.filter(Boolean)
		.map((pd) => ({ partyDish: pd!, party: Data.getPartyById(pd!.partyId) }))
		.sort((a, b) => b.partyDish.profit - a.partyDish.profit);
</script>

<article
	class="divide-y divide-surface-200-800 card border border-surface-200-800 preset-filled-surface-100-900"
>
	<!-- Section 1: Overview -->
	<section class="p-4">
		<div class="flex items-start gap-4">
			<div class="inline-block" style="width: {thumbPx}px">
				<div class="relative" style="width: {thumbPx}px; height: {thumbPx}px">
					<img
						class="h-full w-full overflow-hidden rounded-md bg-surface-300-700 object-contain"
						src={imageSrc}
						alt=""
						loading="lazy"
					/>
				</div>

				<div class="mt-2" style="width: {thumbPx}px">
					{#if browser && dish?.id != null}
						{@const isTracked = $trackedDishIds.has(dish.id)}
						<TrackButton
							checked={isTracked}
							on:change={(e) => {
								const nowChecked = e.detail.checked as boolean;
								if (nowChecked) trackedDishIds.track(dish.id);
								else trackedDishIds.untrack(dish.id);
							}}
						/>
					{/if}
				</div>

				<div class="text-center">
					<span class="text-xs opacity-70">Max Level</span>
					<span class="font-semibold">{dish.final_level}</span>
				</div>

				<div class="text-center">
					<span class="text-xs opacity-70">Taste</span>
					<span class="font-semibold">{dish.final_taste}</span>
				</div>
			</div>

			<div class="min-w-0 flex-1 space-y-4">
				<header>
					<div class="truncate text-base font-semibold">{dish.name}</div>
					<div class="mt-0.5 truncate text-xs opacity-70">{dish.unlock_condition || '—'}</div>
				</header>

				<ProfitTable
					price={dish.final_price}
					servings={dish.servings}
					totalCost={dish.recipeCost}
				/>
			</div>
		</div>
	</section>

	<!-- Section 2 & 3: Collapsible Recipe and Parties -->
	<section>
		<Accordion collapsible defaultValue={[]}>
			<Accordion.Item value="recipe">
				{#snippet control()}
					<div class="w-full min-w-0">
						<span class="block min-w-0 truncate pr-10 text-xs opacity-80">{ingredientSummary}</span>
					</div>
				{/snippet}

				{#snippet panel()}
					<div class="mt-2 overflow-x-auto">
						<table class="w-full table-auto text-sm">
							<thead class="bg-surface-200-800">
								<tr>
									<th class="p-2 text-left">Ingredient</th>
									<th class="p-2 text-center">Qty / Dish</th>
									<th class="p-2 text-center">Upgrade</th>
									<th class="p-2 text-right">Cost</th>
									<th class="p-2 text-left">Type</th>
								</tr>
							</thead>
							<tbody>
								{#each ingredientRows as row}
									<tr class="border-b border-surface-200-800">
										<td class="p-2">{row.name}</td>
										<td class="p-2 text-center tabular-nums">{row.count}</td>
										<td class="p-2 text-center tabular-nums">{row.upgradeCount ?? '—'}</td>
										<td class="p-2 text-right tabular-nums">{formatNumber(row.unitCost)}</td>
										<td class="p-2">{row.type}</td>
									</tr>
								{/each}
							</tbody>
							<tfoot>
								<tr class="bg-surface-200-800 font-semibold">
									<td class="p-2 text-xs uppercase">Recipe Cost</td>
									<td class="p-2 text-center tabular-nums">{dish.ingredientCount}</td>
									<td class="p-2 text-center tabular-nums">{formatNumber(dish.upgradeCost)}</td>
									<td class="p-2 text-right tabular-nums">{formatNumber(dish.recipeCost)}</td>
									<td></td>
								</tr>
							</tfoot>
						</table>
					</div>
				{/snippet}
			</Accordion.Item>

			{#if dish.partyDishIds && dish.partyDishIds.length > 0}
				<Accordion.Item value="parties">
					{#snippet control()}
						<div class="w-full min-w-0">
							<span class="block min-w-0 truncate pr-10 text-xs opacity-80"
								>Parties ({partyRows.length})</span
							>
						</div>
					{/snippet}

					{#snippet panel()}
						<div class="mt-2 overflow-x-auto">
							<table class="w-full table-auto text-sm">
								<thead class="bg-surface-200-800">
									<tr>
										<th class="p-2 text-left">Party</th>
										<th class="p-2 text-center">Bonus</th>
										<th class="p-2 text-right">Final Price</th>
										<th class="p-2 text-right">Revenue (×Servings)</th>
									</tr>
								</thead>
								<tbody>
									{#each partyRows as row}
										<tr class="border-b border-surface-200-800">
											<td class="p-2">{row.party?.name ?? '—'}</td>
											<td class="p-2 text-center">{row.party ? `${row.party.bonus}×` : '—'}</td>
											<td class="p-2 text-right tabular-nums"
												>{formatNumber(row.partyDish.partyPrice)}</td
											>
											<td class="p-2 text-right tabular-nums"
												>{formatNumber(row.partyDish.partyRevenue)}</td
											>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/snippet}
				</Accordion.Item>
			{/if}
		</Accordion>
	</section>
</article>
