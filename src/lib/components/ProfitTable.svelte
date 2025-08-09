<script lang="ts">
	export let price: number | null | undefined;
	export let servings: number | null | undefined;
	export let totalCost: number | null | undefined;

	function isFiniteNumber(value: unknown): value is number {
		return typeof value === 'number' && Number.isFinite(value);
	}

	function formatNumber(value: number | null | undefined): string {
		if (value == null || Number.isNaN(value)) return '—';
		return new Intl.NumberFormat().format(Math.round(value));
	}

	// numeric calculations
	$: revenue = price != null && isFiniteNumber(servings) ? price * (servings ?? 0) : null;
	$: costPerServing =
		totalCost != null && isFiniteNumber(servings) && servings! > 0 ? totalCost / servings! : null;
	$: profitPerServing = price != null && costPerServing != null ? price - costPerServing : null;
	$: profitTotal = revenue != null && totalCost != null ? revenue - totalCost : null;

	// display strings
	$: formattedPricePerServing = formatNumber(price ?? null);
	$: formattedCostPerServing = costPerServing == null ? '—' : `-${formatNumber(costPerServing)}`;
	$: formattedCostTotal = totalCost == null ? '—' : `-${formatNumber(totalCost)}`;
</script>

<table class="w-full table-auto text-sm">
	<tbody>
		<tr>
			<td class="text-xs opacity-70">Price</td>
			<td class="text-right tabular-nums">{formattedPricePerServing}</td>
			<td class="text-right text-xs tabular-nums opacity-70">
				× {isFiniteNumber(servings) ? servings : '—'} Servings
			</td>
			<td class="text-right tabular-nums">
				= {formatNumber(revenue)}
			</td>
		</tr>
		{#if costPerServing != null}
			<tr class="text-red-800 dark:text-red-200">
				<td class="text-xs opacity-70">Cost</td>
				<td class="text-right text-xs tabular-nums">{formattedCostPerServing}</td>
				<td>&nbsp;</td>
				<td class="text-right text-xs tabular-nums opacity-70">{formattedCostTotal}</td>
			</tr>
			<tr class="font-semibold">
				<td class="text-xs opacity-70">Profit</td>
				<td class="text-right tabular-nums">{formatNumber(profitPerServing)}</td>
				<td>&nbsp;</td>
				<td class="text-right tabular-nums">
					= {formatNumber(profitTotal)}
				</td>
			</tr>
		{/if}
	</tbody>
</table>
