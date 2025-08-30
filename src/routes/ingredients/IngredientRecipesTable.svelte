<script lang="ts">
	import PixelIcon from '$lib/ui/PixelIcon.svelte';
	import type { Ingredient } from '$lib/types.js';

	let {
		ingredient,
		formatNumber
	}: { ingredient: Ingredient; formatNumber: (n: number | null | undefined) => string } = $props();
</script>

<div class="-mx-4 mt-2 overflow-x-auto">
	<table class="w-full table-auto text-sm">
		<thead class="bg-surface-200-800">
			<tr>
				<th class="p-2 pl-4 text-left" colspan="2">Recipe</th>
				<th class="p-2 text-center">Qty</th>
				<th class="p-2 text-right">Price</th>
				<th class="p-2 text-right">Serv</th>
				<th class="p-2 text-right">Revenue</th>
				<th class="p-2 pr-4 text-right">Party</th>
			</tr>
		</thead>
		<tbody>
			{#each ingredient.usedIn as row (row.dishId)}
				<tr class="border-b border-surface-200-800">
					<td class="w-8 pl-4">
						<div class="relative" style="width: 32px; height: 32px">
							<PixelIcon image={row.dishImage} alt={row.dishName} uiScale={0.5} />
						</div>
					</td>
					<td class="p-2">{row.dishName}</td>
					<td class="p-2 text-center tabular-nums">{row.count}</td>
					<td class="p-2 text-right tabular-nums">{formatNumber(row.price as number)}</td>
					<td class="p-2 text-right tabular-nums">{row.servings ?? '—'}</td>
					<td class="p-2 text-right tabular-nums">{formatNumber(row.revenue)}</td>
					<td class="p-2 pr-4 text-right">{row.partyNames.join(', ') ?? '—'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
