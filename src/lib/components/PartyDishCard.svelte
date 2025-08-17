<script lang="ts">
  import type { Dish, PartyDish as PartyDishEntity, EnrichedParty } from '../types.js';
  import { Accordion } from '@skeletonlabs/skeleton-svelte';
  import TrackButton from './TrackButton.svelte';
  import ProfitTable from './ProfitTable.svelte';
  import { trackedDishIds } from '$lib/stores/tracking.js';
  import RecipeSummaryIcons from './RecipeSummaryIcons.svelte';
  import PixelIcon from '../ui/PixelIcon.svelte';

  let { dish, partyDish, party } = $props<{
    dish: Dish;
    partyDish: PartyDishEntity; // Calculated values for this dish under the current party
    party: EnrichedParty;
  }>();

  // Fixed width for thumbnail and track button
  const thumbPx = 96; // 96px (~size-24)

  let ingredientSummaries = $derived(
    dish.ingredients.map((ing: Dish['ingredients'][number]) => {
      return {
        count: ing.count,
        type: ing.type
      };
    })
  );

  // Lazy-load recipe panel when user first expands the accordion
  let LazyRecipePanel: any = $state(null);
  function ensureRecipePanelLoaded() {
    if (!LazyRecipePanel) {
      import('./RecipePanel.svelte').then((m) => (LazyRecipePanel = m.default));
    }
  }
</script>

<article
  class="divide-y divide-surface-200-800 card border border-surface-200-800 preset-filled-surface-100-900"
>
  <!-- Overview with party calculations -->
  <section class="p-4">
    <div class="flex items-start gap-4">
      <div class="inline-block" style="width: {thumbPx}px">
        <div
          class="relative grid place-items-center"
          style="width: {thumbPx}px; height: {thumbPx}px"
        >
          <span
            class="absolute -top-2 -right-3 z-10 badge rounded-full preset-filled-primary-500 px-1.5 py-0.5"
            >{party?.bonus ?? ''}×</span
          >
          <PixelIcon image={dish.image} alt={dish.name} uiScale={1.5} />
        </div>
        <div class="mt-2" style="width: {thumbPx}px">
          {#if dish?.id != null}
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

      <div class="min-w-0 flex-1 space-y-4">
        <header>
          <div class="truncate text-base font-semibold">{dish.name}</div>
          {#if dish.unlock}
            <div class="mt-0.5 truncate text-xs opacity-70">{dish.unlock}</div>
          {/if}
        </header>

        <ProfitTable dish={partyDish} />
      </div>
    </div>
  </section>

  <!-- Recipe breakdown (Accordion) -->
  <section>
    <Accordion collapsible defaultValue={[]}>
      <Accordion.Item
        value="recipe"
        controlHover="hover:preset-filled-primary-900-100 hover:text-primary-200-800"
      >
        {#snippet control()}
          <button
            type="button"
            class="w-full min-w-0 text-left"
            onclick={ensureRecipePanelLoaded}
            aria-controls="party-recipe-panel"
          >
            <RecipeSummaryIcons {dish} />
          </button>
        {/snippet}

        {#snippet panel()}
          <div id="party-recipe-panel">
            {#if LazyRecipePanel}
              <LazyRecipePanel {dish} />
            {/if}
          </div>
        {/snippet}
      </Accordion.Item>
    </Accordion>
  </section>
</article>
