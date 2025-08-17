<script lang="ts">
  import servingsImage from '$lib/images/ui/servings.png';
  import coinImage from '$lib/images/ui/coin.png';
  import type { Dish } from '$lib/types';

  let { dish } = $props<{ dish: Dish }>();

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
</script>

<table class="w-full max-w-64 table-auto text-sm">
  <tbody>
    <tr class="align-baseline">
      <td class="align-bottom opacity-70"> Price </td>
      <td class="text-right tabular-nums">
        <img
          class="inline-block h-4 w-4 align-text-bottom"
          src={coinImage}
          alt="Price"
          loading="lazy"
          decoding="async"
          width={20}
          height={20}
        />
        {formatNumber(price)}
      </td>
      <td class="text-right tabular-nums">
        <span class="whitespace-nowrap opacity-70">×{servings}</span>
        <img
          class="inline-block h-4 w-4 align-text-bottom"
          src={servingsImage}
          alt="Servings"
          loading="lazy"
          decoding="async"
          width={20}
          height={20}
        />
        <span class="whitespace-nowrap">
          =&nbsp;{formatNumber(revenue)}
        </span>
      </td>
    </tr>
    <tr class="text-red-800 dark:text-red-200">
      <td class="text-xs opacity-70"> Cost </td>
      <td class="text-right text-xs tabular-nums">
        -{formatNumber(costPerServing)}
      </td>
      <td class="text-right text-xs tabular-nums opacity-70">
        -{formatNumber(totalCost)}
      </td>
    </tr>
    <tr class="font-semibold">
      <td class="flex flex-row flex-wrap opacity-70"> Profit </td>
      <td class="text-right tabular-nums">
        {formatNumber(profitPerServing)}
      </td>
      <td class="text-right tabular-nums">
        =&nbsp;{formatNumber(profitTotal)}
      </td>
    </tr>
  </tbody>
</table>
