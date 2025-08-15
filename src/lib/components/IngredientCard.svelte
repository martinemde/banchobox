<script lang="ts">
  import type { Ingredient } from '../types.js';
  import { Accordion } from '@skeletonlabs/skeleton-svelte';
  import TrackButton from './TrackButton.svelte';
  import { trackedDishIds } from '$lib/stores/tracking.js';
  import { getIngredientTypeIcon } from '$lib/icons/ingredientType.js';
  import PixelIcon from '../ui/PixelIcon.svelte';
  import { ChevronsUp, CloudFog, MapPin, Moon, Sun, Soup, Weight } from '@lucide/svelte';
  import coinImage from '$lib/images/ui/coin.png';

  let { ingredient }: { ingredient: Ingredient } = $props();

  const thumbPx = 96;

  function formatNumber(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '—';
    return new Intl.NumberFormat().format(Math.round(value));
  }

</script>

<article class="card preset-filled-surface-100-900 border-[1px] border-surface-200-800 card-hover divide-y divide-surface-200-800">
  <!-- Section 1: Overview (formatted like PartyDish) -->
  <section class="p-4">
    <div class="flex items-start gap-4">
      <div class="inline-block">
        <div class="relative grid place-items-center">
          <PixelIcon image={ingredient.image} alt={ingredient.name} uiScale={1.5} />
        </div>

        <div class="mt-2" style="width: {thumbPx}px">
          {#if ingredient?.id != null}
            {@const isTracked = (ingredient.usedIn ?? []).some((u) => $trackedDishIds.has(u.dishId))}
            <TrackButton checked={isTracked} disabled={true} />
          {/if}
        </div>
      </div>

      <div class="flex-1 min-w-0 space-y-2">
        <div class="flex items-center gap-2">
          <h3 class="h5 m-0 leading-none truncate">{ingredient.name}</h3>
        </div>

        <div class="mt-1 *:text-sm flex flex-wrap items-center gap-1">
          <MapPin size={16} class="opacity-70" />
          <span>{ingredient.source}</span>
          {#if ingredient.day}
            <span class="inline-flex items-center" title="during the day">
              <Sun size={16} />
              <span class="sr-only">during the day</span>
            </span>
          {/if}
          {#if ingredient.night}
            <span class="inline-flex items-center" title="at night">
              <Moon size={16} />
              <span class="sr-only">at night</span>
            </span>
          {/if}
          {#if ingredient.fog}
            <span class="inline-flex items-center" title="during foggy nights">
              <CloudFog size={16} />
              <span class="sr-only">during foggy nights</span>
            </span>
          {/if}
        </div>

        <div class="mt-1 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
          <span class="inline-flex items-center gap-1">
            <img class="inline-block align-text-bottom w-4 h-4" src={coinImage} alt="Sell Price" title="Sell Price" loading="lazy" decoding="async" width={20} height={20} />
            {ingredient.sell != null ? formatNumber(ingredient.sell) : '—'}
          </span>

          {#if ingredient.kg != null}
            <span class="inline-flex items-center gap-1">
              <Weight size={16} aria-label="weight" />
              {ingredient.kg}kg
            </span>
            <span class="opacity-80">({formatNumber(ingredient.sellPerKg)}/kg)</span>
          {/if}
        </div>

        {#if ingredient.vendors != null && Object.keys(ingredient.vendors).length > 0}
          <div class="mt-1 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Buy:</span>
            {#each Object.entries(ingredient.vendors) as [vendor, price]}
              <span>{formatNumber(price)} ({vendor})</span>
            {/each}
          </div>
        {/if}
      </div>

      <div class="ml-auto flex items-start gap-2 self-start">
        {#if ingredient.drone}
          <button type="button" class="group relative inline-flex" aria-label="Drone">
            <ChevronsUp size={24} class="opacity-80" />
            <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">Drone</span>
          </button>
        {/if}
        {#if ingredient.type}
          {@const TypeIcon = getIngredientTypeIcon(ingredient.type)}
          {#if TypeIcon}
            <button type="button" class="group relative inline-flex" aria-label={ingredient.type}>
              <TypeIcon size={24} class="opacity-80" />
              <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">{ingredient.type}</span>
            </button>
          {:else}
            <button type="button" class="group relative inline-flex text-xs opacity-80 whitespace-nowrap" aria-label={ingredient.type}>
              {ingredient.type}
              <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">{ingredient.type}</span>
            </button>
          {/if}
        {/if}
      </div>
    </div>
  </section>

  <!-- Section 2: Recipes using this ingredient -->
  {#if ingredient.usedIn.length > 0}
    <section class="border-t border-surface-200-800">
      <Accordion collapsible defaultValue={[]}>
        <Accordion.Item value="recipes">
          {#snippet lead()}
            <Soup size={16} />
          {/snippet}

          {#snippet control()}
            <span class="text-xs uppercase tracking-wide opacity-80">Recipes</span>
            <span class="text-xs opacity-80 tabular-nums">{ingredient.usedIn.length}</span>
          {/snippet}

          {#snippet panel()}
            <div class="overflow-x-auto mt-2 -mx-4">
              <table class="w-full table-auto text-sm">
                <thead class="bg-surface-200-800">
                  <tr>
                    <th class="p-2 pl-4 text-left" colspan="2">Recipe</th>
                    <th class="p-2 text-center">Qty</th>
                    <th class="p-2 text-center">Lvl</th>
                    <th class="p-2 text-center">Upgrade</th>
                    <th class="p-2 text-right">Price</th>
                    <th class="p-2 text-right">Serv</th>
                    <th class="p-2 text-right">Revenue</th>
                    <th class="p-2 pr-4 text-right">Party</th>
                  </tr>
                </thead>
                <tbody>
                  {#each ingredient.usedIn as row (row.dishId)}
                    <tr class="border-b border-surface-200-800">
                      <td class="pl-4 w-8">
                        <div class="relative" style="width: 32px; height: 32px">
                          <PixelIcon image={row.dishImage} alt={row.dishName} uiScale={0.5} />
                        </div>
                      </td>
                      <td class="p-2">{row.dishName}</td>
                      <td class="p-2 text-center tabular-nums">{row.count}</td>
                      <td class="p-2 text-center tabular-nums">{row.level ?? '—'}</td>
                      <td class="p-2 text-center tabular-nums">{row.upgradeCount ?? '—'}</td>
                      <td class="p-2 text-right tabular-nums">{formatNumber(row.price as number)}</td>
                      <td class="p-2 text-right tabular-nums">{row.servings ?? '—'}</td>
                      <td class="p-2 text-right tabular-nums">{formatNumber(row.revenue)}</td>
                      <td class="p-2 pr-4 text-right">{row.partyNames.join(', ') ?? '—'}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/snippet}
        </Accordion.Item>
      </Accordion>
    </section>
  {/if}
</article>
