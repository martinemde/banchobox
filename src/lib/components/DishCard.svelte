<script lang="ts">
  import type { Dish, PartyDish } from '../types.js';
  import { enhancedImageForFile } from '../images/index.js';
  import { Accordion } from '@skeletonlabs/skeleton-svelte';
  import ProfitTable from './ProfitTable.svelte';
  import TrackButton from './TrackButton.svelte';
  import { trackedDishIds } from '$lib/stores/tracking.js';
  import { browser } from '$app/environment';
  import { getIngredientTypeIcon } from '$lib/icons/ingredientType.js';
  import IngredientTypeCount from './IngredientTypeCount.svelte';
	import { PartyPopper } from '@lucide/svelte';
	import { bundle as ingredientsBundle } from '$lib/stores/ingredients.js';
	import { bundle as partiesBundle } from '$lib/stores/parties.js';
	import { partyDishByIdStore } from '$lib/stores/partyDishes.js';

  export let dish: Dish;

  let enhancedImage: string;
  $: enhancedImage = enhancedImageForFile(dish.image);
  // Fixed width for thumbnail to match default card format
  const thumbPx = 96;

  $: ingredientRows = dish.ingredients.map((ing) => {
    const meta = $ingredientsBundle?.byId[ing.ingredientId];
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

  function formatNumber(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '—';
    return new Intl.NumberFormat().format(Math.round(value));
  }

  // Build rows for all parties associated to this dish, sorted by profit desc
  $: partyRows = (dish.partyDishIds || [])
    .map((id) => $partyDishByIdStore?.[id] as PartyDish)
    .filter(Boolean)
    .map((pd) => ({
      partyDish: pd!,
      party: $partiesBundle?.byId[pd!.partyId]!,
      dish
    }))
    .sort((a, b) => b.partyDish.profit - a.partyDish.profit);
</script>

<article class="card preset-filled-surface-100-900 border border-surface-200-800 divide-y divide-surface-200-800">
  <!-- Section 1: Overview -->
  <section class="p-4">
    <div class="flex items-start gap-4">
      <div class="inline-block" style="width: {thumbPx}px">
        <div class="relative" style="width: {thumbPx}px; height: {thumbPx}px">
          <enhanced:img class="overflow-hidden rounded-md object-contain bg-surface-300-700 w-full h-full" src={enhancedImage} alt={dish.name} sizes="{thumbPx}px" loading="lazy" />
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

        <div class="text-center">
            <span class="text-xs opacity-70">Max Level</span>
            <span class="font-semibold">{dish.maxLevel}</span>
        </div>

        <div class="text-center">
            <span class="text-xs opacity-70">Taste</span>
            <span class="font-semibold">{dish.finalTaste}</span>
        </div>
      </div>



      <div class="flex-1 min-w-0 space-y-4">
        <header>
          <div class="font-semibold text-base truncate">{dish.name}</div>
          <div class="text-xs opacity-70 truncate mt-0.5">{dish.unlock || '—'}</div>
        </header>

          <ProfitTable
          price={dish.finalPrice}
          servings={dish.finalServings}
          totalCost={dish.recipeCost}
        />
      </div>
    </div>
  </section>

  <!-- Section 2 & 3: Collapsible Recipe and Parties -->
  <section>
    <Accordion multiple collapsible defaultValue={[]}>
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

      {#if dish.partyDishIds && dish.partyDishIds.length > 0}
        <Accordion.Item value="parties" controlHover="hover:preset-filled-primary-900-100 hover:text-primary-300-700">
          {#snippet control()}
            <span class="flex min-w-0 truncate pr-10 text-sm gap-x-2 items-center">
              {#each partyRows as row}
                <PartyPopper size={16} />
                <span class="min-w-0 pr-3 text-sm">
                  {row.party.name} Party
                </span>
              {/each}
            </span>
          {/snippet}

          {#snippet panel()}
            <div class="overflow-x-auto -mx-4">
              {#each partyRows as row}
                <div class="flex items-start gap-x-4 border-t border-surface-200-800 p-4">
                  <div class="w-24 shrink-0">
                    <div class="text-md font-semibold truncate">{row.party.name}</div>
                    <div class="mt-1">
                      <span class="badge rounded-full preset-filled-primary-500 px-1.5 py-0.5">{row.party.bonus}× Party</span>
                    </div>
                  </div>
                  <ProfitTable
                    price={row.partyDish.partyPrice}
                    servings={row.dish.finalServings}
                    totalCost={row.dish.recipeCost}
                  />
                </div>
              {/each}
            </div>
          {/snippet}
        </Accordion.Item>
      {/if}
    </Accordion>
  </section>
</article>
