<script lang="ts">
  import type { Dish, PartyDish as PartyDishEntity } from '../types.js';
  import { Data } from '../data/runtime.js';
  import { Accordion } from '@skeletonlabs/skeleton-svelte';
  import { enhancedImageForFile } from '../images/index.js';
  import TrackButton from './TrackButton.svelte';
  import ProfitTable from './ProfitTable.svelte';
  import { trackedDishIds } from '$lib/stores/tracking.js';
  import { browser } from '$app/environment';
  import { getIngredientTypeIcon } from '$lib/icons/ingredientType.js';
  import IngredientTypeCount from './IngredientTypeCount.svelte';

  export let dish: Dish;
  export let partyDish: PartyDishEntity; // Calculated values for this dish under the current party

  let enhancedImage: string;
  $: enhancedImage = enhancedImageForFile(dish.image);
  export let party: { name: string; bonus: number } | null = null;

  // Fixed width for thumbnail and track button
  const thumbPx = 96; // 96px (~size-24)

  function formatNumber(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '—';
    return new Intl.NumberFormat().format(Math.round(value));
  }

  $: ingredientRows = dish.ingredients.map((ing) => {
    const meta = Data.getIngredientById(ing.ingredientId);
    return {
      name: meta?.name ?? 'Unknown',
      count: ing.count,
      upgradeCount: ing.upgradeCount,
      unitCost: ing.unitCost,
      lineCost: ing.lineCost,
      image: enhancedImageForFile(meta?.image ?? undefined),
      icon: getIngredientTypeIcon(meta?.type ?? meta?.source ?? undefined)
    };
  });

  // Summary rows for accordion control
  $: ingredientSummaryRows = ingredientRows;
</script>

<article class="card preset-filled-surface-100-900 border border-surface-200-800 divide-y divide-surface-200-800">
  <!-- Overview with party calculations -->
  <section class="p-4">
    <div class="flex items-start gap-4">
        <div class="inline-block" style="width: {thumbPx}px">
          <div class="relative" style="width: {thumbPx}px; height: {thumbPx}px">
            <span class="badge rounded-full preset-filled-primary-500 absolute px-1.5 py-0.5 -right-3 -top-2 z-10">{party?.bonus ?? ''}×</span>
            <enhanced:img class="overflow-hidden rounded-md object-contain bg-surface-300-700 w-full h-full" src={enhancedImage} alt={dish.name} loading="lazy" />
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
        </div>


        <div class="flex-1 min-w-0 space-y-4">
          <header>
            <div class="font-semibold text-base truncate">{dish.name}</div>
            <div class="text-xs opacity-70 truncate mt-0.5">{dish.unlock || '—'}</div>
          </header>


          <ProfitTable
            price={partyDish.partyPrice}
            servings={dish.finalServings}
            totalCost={dish.recipeCost}
          />
        </div>
    </div>
  </section>

  <!-- Recipe breakdown (Accordion) -->
  <section>
    <Accordion collapsible defaultValue={[]}>
      <Accordion.Item value="recipe" controlHover="hover:preset-filled-primary-900-100 hover:text-primary-200-800">
        {#snippet control()}
          <div class="w-full min-w-0">
            <div class="flex flex-wrap gap-2 items-center pr-10 text-xs opacity-80">
              {#each ingredientRows as row}
                <span class="inline-flex items-center gap-1">
                  <IngredientTypeCount count={row.count} icon={row.icon} title={row.name} size={16} />
                </span>
              {/each}
            </div>
          </div>
        {/snippet}

        {#snippet panel()}
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
                        <enhanced:img class="overflow-hidden rounded-md object-contain bg-surface-300-700" style="width: 24px; height: 24px" src={row.image} alt={row.name} sizes="24px" loading="lazy" />
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
                    <td class="p-2 pr-4 text-right tabular-nums">{(row.upgradeCount ?? 0) > 0 ? row.upgradeCount : '—'}</td>
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
        {/snippet}
      </Accordion.Item>
    </Accordion>
  </section>
</article>
