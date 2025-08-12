<script lang="ts">
  let { price, servings, totalCost } = $props<{ price: number; servings: number; totalCost: number }>();

  function formatNumber(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '—';
    return new Intl.NumberFormat().format(Math.round(value));
  }

  // numeric calculations
  let revenue = $derived(price * servings);
  let costPerServing = $derived(totalCost / servings);
  let profitPerServing = $derived(price - costPerServing);
  let profitTotal = $derived(price * servings - totalCost);
</script>

<table class="w-64 table-auto text-sm">
  <tbody>
    <tr class="align-bottom">
      <td class="text-xs opacity-70">Price</td>
      <td class="tabular-nums text-right">{formatNumber(price)}</td>
      <td class="tabular-nums text-right flex flex-row flex-wrap items-end justify-end gap-x-1 gap-y-0.5">
        <span class="opacity-70 whitespace-nowrap">×{servings} servings</span>
        <span class="whitespace-nowrap">=&nbsp;{formatNumber(revenue)}</span>
      </td>
    </tr>
    <tr class="text-red-800 dark:text-red-200">
      <td class="text-xs opacity-70">Cost</td>
      <td class="tabular-nums text-right text-xs">
        -{formatNumber(costPerServing)}
      </td>
      <td class="opacity-70 text-xs tabular-nums text-right">
        -{formatNumber(totalCost)}
      </td>
    </tr>
    <tr class="font-semibold">
      <td class="text-xs opacity-70">Profit</td>
      <td class="tabular-nums text-right">
        {formatNumber(profitPerServing)}
      </td>
      <td class="tabular-nums text-right">
        =&nbsp;{formatNumber(profitTotal)}
      </td>
    </tr>
  </tbody>
  </table>
