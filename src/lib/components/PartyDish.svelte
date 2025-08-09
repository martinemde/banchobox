<script lang="ts">
  import type { EnrichedDish, PartyDish as PartyDishEntity } from '../types.js';
  import { Data } from '../data/runtime.js';
  import { Accordion } from '@skeletonlabs/skeleton-svelte';
  import { imageUrlForName } from '../images/index.js';
  import TrackButton from './TrackButton.svelte';
  import ProfitTable from './ProfitTable.svelte';
  import { trackedDishIds } from '$lib/stores/tracking.js';
  import { browser } from '$app/environment';

  export let dish: EnrichedDish;
  export let partyDish: PartyDishEntity; // Calculated values for this dish under the current party

  $: imageSrc = imageUrlForName(dish.name);
  $: party = Data.getPartyById(partyDish.partyId);

  // Fixed width for thumbnail and track button
  const thumbPx = 96; // 96px (~size-24)

  function formatNumber(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '—';
    return new Intl.NumberFormat().format(Math.round(value));
  }

  $: costPerServing = dish.servings > 0 ? dish.recipeCost / dish.servings : null;

  type IngredientRow = {
    name: string;
    count: number;
    upgradeCount: number | null;
    sell: number | null;
    buy: number | null;
    source: string;
  };
  let ingredientRows: IngredientRow[] = [];
  $: ingredientRows = dish.ingredients.map((ing) => {
    const meta = Data.getIngredientById(ing.ingredientId);
    return {
      name: meta?.name ?? 'Unknown',
      count: ing.count,
      upgradeCount: ing.upgradeCount ?? null,
      sell: meta?.cost ?? null,
      buy: ing.unitCost ?? null,
      source: meta?.source ?? meta?.type ?? '—'
    };
  });

  // Summary string for accordion control
  $: ingredientSummary = ingredientRows.map((row) => `${row.name} ×${row.count}`).join(', ');
</script>

<article class="card preset-filled-surface-100-900 border border-surface-200-800 divide-y divide-surface-200-800">
  <!-- Overview with party calculations -->
  <section class="p-4">
    <div class="flex items-start gap-4">
        <div class="inline-block" style="width: {thumbPx}px">
          {#if imageSrc}
            <div class="relative" style="width: {thumbPx}px; height: {thumbPx}px">
              <span class="badge rounded-full preset-filled-primary-500 absolute px-1.5 py-0.5 -right-3 -top-2 z-10">{party?.bonus ?? ''}×</span>
              <img class="overflow-hidden rounded-md object-contain bg-surface-300-700 w-full h-full" src={imageSrc} alt="" loading="lazy" />
            </div>
          {/if}
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
            <div class="text-xs opacity-70 truncate mt-0.5">{dish.unlock_condition || '—'}</div>
          </header>


          <ProfitTable
            price={partyDish.partyPrice}
            servings={dish.servings}
            totalCost={dish.recipeCost}
          />
        </div>
    </div>
  </section>

  <!-- Recipe breakdown (Accordion) -->
  <section>
    <Accordion collapsible defaultValue={[]}>
      <Accordion.Item value="recipe">
        {#snippet control()}
          <div class="flex items-center justify-between w-full">
            <span class="text-xs opacity-80 truncate">{ingredientSummary}</span>
          </div>
        {/snippet}

        {#snippet panel()}
          <div class="overflow-x-auto mt-2">
            <table class="w-full table-auto text-sm">
              <thead class="bg-surface-200-800">
                <tr>
                  <th class="p-2 text-left">Ingredient</th>
                  <th class="p-2 text-center">Qty</th>
                  <th class="p-2 text-center">Upgrade</th>
                  <th class="p-2 text-right">Buy</th>
                  <th class="p-2 text-right">Sell</th>
                  <th class="p-2 text-left">Source</th>
                </tr>
              </thead>
              <tbody>
                {#each ingredientRows as row}
                  <tr class="border-b border-surface-200-800">
                    <td class="p-2">{row.name}</td>
                    <td class="p-2 text-center tabular-nums">×{row.count}</td>
                    <td class="p-2 text-center tabular-nums">{row.upgradeCount ?? '—'}</td>
                    <td class="p-2 text-right tabular-nums">{row.buy == null ? '—' : formatNumber(row.buy)}</td>
                    <td class="p-2 text-right tabular-nums">{row.sell == null ? '—' : formatNumber(row.sell)}</td>
                    <td class="p-2">{row.source}</td>
                  </tr>
                {/each}
              </tbody>
              <tfoot>
                <tr class="bg-surface-200-800 font-semibold">
                  <td class="p-2 uppercase text-xs">Recipe Cost</td>
                  <td class="p-2 text-center tabular-nums">{dish.ingredientCount}</td>
                  <td class="p-2 text-center tabular-nums">{dish.upgradeCost ? formatNumber(dish.upgradeCost) : '—'}</td>
                  <td></td>
                  <td class="p-2 text-right tabular-nums">{formatNumber(dish.recipeCost)}</td>
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
