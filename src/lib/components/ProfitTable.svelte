<script lang="ts">
  import { rawImageUrlForFile } from '$lib/images/index.js';
  import type { Dish } from '$lib/types';

  let { dish } = $props<{dish: Dish}>();

  function formatNumber(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '—';
    return new Intl.NumberFormat().format(Math.round(value));
  }

  // numeric calculations
  let price = $derived(dish.finalPrice);
  let servings = $derived(dish.finalServings);
  let revenue = $derived(dish.finalRevenue);
  let totalCost = $derived(dish.recipeCost);
  let costPerServing = $derived(totalCost / servings);
  let profitPerServing = $derived(dish.finalProfitPerServing);
  let profitTotal = $derived(dish.finalProfit);

  let servingsImage = rawImageUrlForFile('ui/servings.png');
  let coinImage = rawImageUrlForFile('ui/coin.png');
</script>

<table class="w-full max-w-64 table-auto text-sm">
  <tbody>
    <tr class="align-baseline">
      <td class="opacity-70 align-bottom">
        Price
      </td>
      <td class="tabular-nums text-right">
        <img class="inline-block align-text-bottom w-4 h-4" src={coinImage} alt="Price" loading="lazy" decoding="async" width={20} height={20} />
        {formatNumber(price)}
      </td>
      <td class="tabular-nums text-right">
        <span class="opacity-70 whitespace-nowrap">×{servings}</span>
        <img class="inline-block align-text-bottom w-4 h-4" src={servingsImage} alt="Servings" loading="lazy" decoding="async" width={20} height={20} />
        <span class="whitespace-nowrap">
          =&nbsp;{formatNumber(revenue)}
        </span>
      </td>
    </tr>
    <tr class="text-red-800 dark:text-red-200">
      <td class="text-xs opacity-70">
        Cost
      </td>
      <td class="tabular-nums text-right text-xs">
        -{formatNumber(costPerServing)}
      </td>
      <td class="opacity-70 text-xs tabular-nums text-right">
        -{formatNumber(totalCost)}
      </td>
    </tr>
    <tr class="font-semibold">
      <td class="opacity-70 flex flex-row flex-wrap">
        Profit
      </td>
      <td class="tabular-nums text-right">
        {formatNumber(profitPerServing)}
      </td>
      <td class="tabular-nums text-right">
        =&nbsp;{formatNumber(profitTotal)}
      </td>
    </tr>
  </tbody>
  </table>
