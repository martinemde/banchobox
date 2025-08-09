<script lang="ts">
  import type { Ingredient, Dish } from '../types.js';
  import { enhancedImageForFile } from '../images/index.js';
  import { Accordion } from '@skeletonlabs/skeleton-svelte';
  import { browser } from '$app/environment';
  import TrackButton from './TrackButton.svelte';
  import { trackedIngredientIds } from '$lib/stores/tracking.js';
  import { ChevronsUp, CloudFog, Moon, Sun } from '@lucide/svelte';
  import { getIngredientTypeIcon } from '$lib/icons/ingredientType.js';

  export let ingredient: Ingredient;

  let enhancedImage: string;
  $: enhancedImage = enhancedImageForFile(ingredient.image);
  // Match thumbnail sizing used in PartyDish
  const thumbPx = 96;

  function formatNumber(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '—';
    return new Intl.NumberFormat().format(Math.round(value));
  }

  $: sellValuePerKg = (() => {
    if (ingredient.sell == null || ingredient.kg == null || ingredient.kg === 0) return null;
    return ingredient.sell / ingredient.kg;
  })();

  $: buyText = (() => {
    if (!ingredient) return null;
    const parts: string[] = [];
    if (ingredient.buyJango != null) parts.push(`${formatNumber(ingredient.buyJango)} from Jango`);
    if (ingredient.buyOtto != null) parts.push(`${formatNumber(ingredient.buyOtto)} from Otto`);
    if (parts.length === 0) return null;
    return parts.join(' · ');
  })();



  type RecipeRow = {
    dish: Dish;
    count: number;
    level: number | null;
    upgradeCount: number | null;
    price: number | null | undefined;
    servings: number | null | undefined;
    partyName: string | null;
  };

  $: recipeRows = (ingredient as any).recipeRows ?? []
    .filter(Boolean)
    .map((r) => r as RecipeRow)
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
</script>

<article class="card preset-filled-surface-100-900 border-[1px] border-surface-200-800 card-hover divide-y divide-surface-200-800">
  <!-- Section 1: Overview (formatted like PartyDish) -->
  <section class="p-4">
    <div class="flex items-start gap-4">
      <div class="inline-block" style="width: {thumbPx}px">
        <div class="relative" style="width: {thumbPx}px; height: {thumbPx}px">
          <enhanced:img class="overflow-hidden rounded-md object-contain bg-surface-300-700 w-full h-full" src={enhancedImage} alt={ingredient.name} sizes="{thumbPx}px" loading="lazy" />
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

        <div class="mt-1 *:text-xs opacity-80 flex flex-wrap items-center gap-1">
          <span>{ingredient.source}</span>
          {#if ingredient.day}
            <span class="inline-flex items-center" title="Day"><Sun size={16} /></span>
          {/if}
          {#if ingredient.night}
            <span class="inline-flex items-center" title="Night"><Moon size={16} /></span>
          {/if}
          {#if ingredient.fog}
            <span class="inline-flex items-center" title="Fog"><CloudFog size={16} /></span>
          {/if}
        </div>

        <div class="mt-1 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            Sell: {ingredient.sell != null ? formatNumber(ingredient.sell) : '—'}
          </span>

          {#if ingredient.kg != null}
            <span class="opacity-80">({sellValuePerKg != null ? `${formatNumber(sellValuePerKg)}/kg` : ''})</span>
            <span>Weight: {ingredient.kg != null ? `${ingredient.kg}kg` : '—'}</span>
          {/if}
        </div>

        {#if buyText}
          <div class="mt-1 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Buy: {buyText}</span>
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
  {#if recipeRows.length > 0}
    <section class="p-4">
      <Accordion collapsible defaultValue={[]}>
        <Accordion.Item value="recipes">
          {#snippet control()}
            <div class="flex items-center justify-between w-full">
              <span class="text-xs uppercase tracking-wide opacity-80">Recipes</span>
              <span class="text-xs opacity-80 tabular-nums">({recipeRows.length})</span>
            </div>
          {/snippet}

          {#snippet panel()}
            <div class="overflow-x-auto mt-2">
              <table class="w-full table-auto text-sm">
                <thead class="bg-surface-200-800">
                  <tr>
                    <th class="p-2 text-left">Recipe</th>
                    <th class="p-2 text-center">Qty</th>
                    <th class="p-2 text-center">Lvl</th>
                    <th class="p-2 text-center">Upgrade</th>
                    <th class="p-2 text-right">Price</th>
                    <th class="p-2 text-right">Serv</th>
                    <th class="p-2 text-left">Party</th>
                  </tr>
                </thead>
                <tbody>
                  {#each recipeRows as row}
                    <tr class="border-b border-surface-200-800">
                      <td class="p-2">{row.dish.name}</td>
                      <td class="p-2 text-center tabular-nums">{row.count}</td>
                      <td class="p-2 text-center tabular-nums">{row.level ?? '—'}</td>
                      <td class="p-2 text-center tabular-nums">{row.upgradeCount ?? '—'}</td>
                      <td class="p-2 text-right tabular-nums">{formatNumber(row.price as number)}</td>
                      <td class="p-2 text-right tabular-nums">{row.servings ?? '—'}</td>
                      <td class="p-2">{row.partyName ?? '—'}</td>
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
