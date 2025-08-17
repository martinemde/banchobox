<script lang="ts">
  import type { Dish } from '$lib/types.js';
  import { getIngredientTypeIcon } from '$lib/icons/ingredientType.js';
  import PixelIcon from '../ui/PixelIcon.svelte';

  let { dish } = $props<{ dish: Dish }>();

  let ingredientRows = $derived(
    dish.ingredients.map((ing: Dish['ingredients'][number]) => {
      const icon = getIngredientTypeIcon(ing.type);
      return {
        name: ing.name ?? `Ingredient #${ing.ingredientId}`,
        count: ing.count,
        upgradeCount: ing.upgradeCount,
        unitCost: ing.unitCost,
        lineCost: ing.lineCost,
        image: ing.image,
        icon
      };
    })
  );

  function formatNumber(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '—';
    return new Intl.NumberFormat().format(Math.round(value));
  }
</script>

<div class="-mx-4 mt-2 overflow-x-auto">
  <table class="w-full table-auto text-sm">
    <thead class="bg-surface-200-800">
      <tr>
        <th class="p-2 pl-4 text-left" colspan="2">Ingredient</th>
        <th class="p-2 text-left">Qty</th>
        <th class="p-2 text-right">Cost</th>
        <th class="p-2 text-right">Upgrade</th>
      </tr>
    </thead>
    <tbody>
      {#each ingredientRows as row}
        <tr class="border-b border-surface-200-800">
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
          <td class="p-2 text-right tabular-nums">{formatNumber(row.lineCost)}</td>
          <td class="p-2 pr-4 text-right tabular-nums">
            {(row.upgradeCount ?? 0) > 0 ? row.upgradeCount : '—'}
          </td>
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr class="bg-surface-200-800 font-semibold">
        <td class="p-2 pl-4 text-xs uppercase" colspan="2">Recipe Cost</td>
        <td class="p-2 text-left tabular-nums">{dish.ingredientCount}</td>
        <td class="p-2 text-right tabular-nums">{formatNumber(dish.recipeCost)}</td>
        <td class="p-2 pr-4 text-right tabular-nums">{formatNumber(dish.upgradeCost)}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
</div>
