<script lang="ts">
  import type { EnrichedIngredient, EnrichedDish } from '../types.js';
  import { Data } from '../data/runtime.js';
  import { imageUrlForName } from '../images/index.js';
  import TrackButton from './TrackButton.svelte';
  import { trackedIngredientIds, trackedDishIds } from '$lib/stores/tracking.js';
  import { browser } from '$app/environment';

  export let ingredient: EnrichedIngredient;

  $: imageSrc = imageUrlForName(ingredient.name);
  const thumbPx = 96;

  function formatNumber(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '—';
    return new Intl.NumberFormat().format(Math.round(value));
  }

  type TrackedUsage = {
    dish: EnrichedDish;
    qty: number;
    upgrade: number;
  };

  $: usages = getTrackedUsagesForIngredient(ingredient.id);

  function getTrackedUsagesForIngredient(ingredientId: number): TrackedUsage[] {
    const list: TrackedUsage[] = [];
    for (const dishId of $trackedDishIds) {
      const dish = Data.getDishById(dishId);
      if (!dish) continue;
      const line = dish.ingredients.find((ing) => ing.ingredientId === ingredientId);
      if (!line) continue;
      list.push({ dish, qty: line.count, upgrade: line.upgradeCount ?? 0 });
    }
    return list.sort((a, b) => (b.dish.final_price ?? 0) - (a.dish.final_price ?? 0));
  }

  $: totalQty = usages.reduce((sum, u) => sum + u.qty, 0);
  $: totalUpgrade = usages.reduce((sum, u) => sum + u.upgrade, 0);
</script>

<article class="card preset-filled-surface-100-900 border border-surface-200-800 divide-y divide-surface-200-800">
  <!-- Section 1: Overview (styled after Ingredient) -->
  <section class="p-4">
    <div class="flex items-start gap-4">
      <div class="inline-block" style="width: {thumbPx}px">
        <div class="relative" style="width: {thumbPx}px; height: {thumbPx}px">
          {#if imageSrc}
            <img class="overflow-hidden rounded-md object-contain bg-surface-300-700 w-full h-full" src={imageSrc} alt="" loading="lazy" />
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

      <div class="flex-1 min-w-0 space-y-2">
        <div class="flex items-center gap-2">
          <h3 class="h5 m-0 truncate !leading-none">{ingredient.name}</h3>
        </div>

        <div class="mt-1 *:text-xs opacity-80 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{ingredient.source}</span>
        </div>

        <div class="mt-1 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>Sell: {ingredient.cost != null ? `${formatNumber(ingredient.cost)}g` : '—'}</span>
          <span>Buy: —</span>
          {#if ingredient.kg != null}
            <span>Weight: {ingredient.kg}kg</span>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <!-- Section 2: Tracked dishes usage -->
  <section class="p-4 pt-0">
    {#if usages.length === 0}
      <div class="text-sm opacity-70">Not used by any tracked dishes.</div>
    {:else}
      <div class="overflow-x-auto mt-2">
        <table class="w-full table-auto text-sm">
          <thead class="bg-surface-200-800">
            <tr>
              <th class="p-2 text-left">Dish</th>
              <th class="p-2 text-center">Qty</th>
              <th class="p-2 text-center">Upgrade</th>
            </tr>
          </thead>
          <tbody>
            {#each usages as row}
              <tr class="border-b border-surface-200-800">
                <td class="p-2">{row.dish.name}</td>
                <td class="p-2 text-center tabular-nums">{row.qty}</td>
                <td class="p-2 text-center tabular-nums">{row.upgrade}</td>
              </tr>
            {/each}
          </tbody>
          <tfoot>
            <tr class="bg-surface-200-800 font-semibold">
              <td class="p-2 uppercase text-xs">Totals</td>
              <td class="p-2 text-center tabular-nums">{totalQty}</td>
              <td class="p-2 text-center tabular-nums">{totalUpgrade}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    {/if}
  </section>
</article>


