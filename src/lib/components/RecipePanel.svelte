<script lang="ts">
  import type { Dish } from '$lib/types.js';
  import { enhancedImageForFile } from '$lib/images/index.js';
  import { getIngredientTypeIcon } from '$lib/icons/ingredientType.js';

  let { dish } = $props<{ dish: Dish }>();

  function tryEnhancedImage(filename: string | null | undefined): string | null {
    try {
      if (!filename) return null;
      return enhancedImageForFile(filename);
    } catch {
      return null;
    }
  }

  let ingredientRows = $derived(
    dish.ingredients.map((ing: Dish['ingredients'][number]) => {
      const icon = getIngredientTypeIcon(ing.type);
      const image = tryEnhancedImage(ing.image);
      return {
        name: ing.name ?? `Ingredient #${ing.ingredientId}`,
        count: ing.count,
        upgradeCount: ing.upgradeCount,
        unitCost: ing.unitCost,
        lineCost: ing.lineCost,
        image,
        icon
      };
    })
  );

  function formatNumber(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '—';
    return new Intl.NumberFormat().format(Math.round(value));
  }
</script>

<div class="overflow-x-auto mt-2 -mx-4">
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
          <td class="pl-4 w-8">
            <div class="relative" style="width: 24px; height: 24px">
              <enhanced:img
                class="overflow-hidden rounded-md object-contain bg-surface-300-700"
                style="width: 24px; height: 24px"
                src={row.image}
                alt={row.name}
                sizes="24px"
                loading="lazy"
              />
            </div>
          </td>
          <td class="p-2">{row.name}</td>
          <td class="p-2 text-left tabular-nums gap-x-2">
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
        <td class="pl-4 p-2 uppercase text-xs" colspan="2">Recipe Cost</td>
        <td class="p-2 text-left tabular-nums">{dish.ingredientCount}</td>
        <td class="p-2 text-right tabular-nums">{formatNumber(dish.recipeCost)}</td>
        <td class="pr-4 p-2 text-right tabular-nums">{formatNumber(dish.upgradeCost)}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
</div>
