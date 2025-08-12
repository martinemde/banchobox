<script lang="ts">
  import type { Dish, Id, Party, PartyDish } from '../types.js';
  import { enhancedImageForFile } from '../images/index.js';
  import { Accordion } from '@skeletonlabs/skeleton-svelte';
  import ProfitTable from './ProfitTable.svelte';
  import TrackButton from './TrackButton.svelte';
  import { trackedDishIds } from '$lib/stores/tracking.js';
  import { browser } from '$app/environment';
	import { PartyPopper } from '@lucide/svelte';
	import { bundle as partiesBundle } from '$lib/stores/parties.js';
  import PartyDishPanel from './PartyDishPanel.svelte';
  import { partyDishByIdStore } from '$lib/stores/partyDishes.js';
  import RecipeSummaryIcons from './RecipeSummaryIcons.svelte';

  let { dish } = $props<{ dish: Dish }>();

  let enhancedImage = $derived(enhancedImageForFile(dish.image));
  // Fixed width for thumbnail to match default card format
  const thumbPx = 96;

  // Lazy-load recipe panel when user first expands the accordion
  let LazyRecipePanel: any = $state(null);
  function ensureRecipePanelLoaded() {
    if (!LazyRecipePanel) {
      import('./RecipePanel.svelte').then((m) => (LazyRecipePanel = m.default));
    }
  }
  let partyDishes = $derived(
    (dish.partyDishIds ?? [])
      .map((id: Id) => $partyDishByIdStore?.[id] as PartyDish | undefined)
      .filter((pd: PartyDish | undefined): pd is PartyDish => Boolean(pd))
  );

  // Controlled accordion value, trigger lazy load via onValueChange (Skeleton docs)
  let value = $state<string[]>([]);
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
          <div class="text-sm opacity-70 truncate mt-0.5">{dish.unlock || '—'}</div>
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
    <Accordion {value} onValueChange={(e) => { value = e.value; if (e.value?.includes('recipe')) ensureRecipePanelLoaded(); }} multiple collapsible defaultValue={[]}>
      <Accordion.Item value="recipe" controlHover="hover:preset-filled-primary-900-100 hover:text-primary-200-800">
        {#snippet control()}
          <RecipeSummaryIcons dish={dish} />
        {/snippet}

        {#snippet panel()}
          <div id="recipe-panel">
            {#if LazyRecipePanel}
              <LazyRecipePanel {dish} />
            {/if}
          </div>
        {/snippet}
      </Accordion.Item>

      {#each partyDishes as partyDish}
        <Accordion.Item value={`party-${partyDish.partyName}`} controlHover="hover:preset-filled-primary-900-100 hover:text-primary-300-700" classes="border-t border-surface-200-800">
          {#snippet lead()}
            <PartyPopper size={16} />
          {/snippet}
          {#snippet control()}
            <span class="font-semibold">{partyDish.partyBonus}×</span>
            <span class="text-sm">{partyDish.partyName} Party</span>
          {/snippet}

          {#snippet panel()}
            <PartyDishPanel {partyDish} />
          {/snippet}
        </Accordion.Item>
      {/each}
    </Accordion>
  </section>
</article>
