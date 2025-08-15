<script lang="ts">
  import Dish from '$lib/components/DishCard.svelte';
  import { dishesStores } from '$lib/stores/dishes';
  import { syncToUrl } from '$lib/stores/urlSync';
  import FiltersPanel from '$lib/ui/FiltersPanel.svelte';
  import ResponsiveLayout from '$lib/ui/ResponsiveLayout.svelte';
  import ResultsHeader from '$lib/ui/ResultsHeader.svelte';
  import TrackingSidebar from '$lib/ui/TrackingSidebar.svelte';
  import { trackedDishIds } from '$lib/stores/tracking.js';
  import { onMount } from 'svelte';

  const { query, sortKey, sortDir, visible, filters } = dishesStores;
  syncToUrl('dishes', dishesStores);

  let tracked = $state<{ id: number; name: string; profit: number }[]>([]);
  $effect(() => {
    tracked = $visible
      .filter((d) => $trackedDishIds.has(d.id))
      .map((d) => ({ id: d.id, name: d.name, profit: d.finalProfit }));
  });

  // Lightweight, dependency-free list virtualization for Dish cards
  let viewport: HTMLDivElement | null = null;
  let viewportHeight = $state(0);
  const estimatedItemHeight = 300; // px; collapsed Dish card height estimate for fast math
  const overscan = 8; // render extra rows above/below to avoid flicker

  let startIndex = $state(0);
  let endIndex = $state(0);

  function recalcFromScrollTop(scrollTop: number) {
    const first = Math.floor(scrollTop / estimatedItemHeight) - overscan;
    startIndex = Math.max(0, first);
    const visibleCount = Math.ceil((viewportHeight || 0) / estimatedItemHeight) + overscan * 2;
    endIndex = Math.min($visible.length, startIndex + visibleCount);
  }

  // Recompute range when container resizes
  onMount(() => {
    if (!viewport) return;
    const ro = new ResizeObserver(() => {
      viewportHeight = viewport?.clientHeight ?? 0;
      recalcFromScrollTop(viewport?.scrollTop ?? 0);
    });
    ro.observe(viewport);
    viewportHeight = viewport.clientHeight;
    recalcFromScrollTop(0);
    return () => ro.disconnect();
  });

  // Reset window on dataset changes (e.g., removing a filter)
  $effect(() => {
    // touch $visible to subscribe
    const total = $visible.length;
    if (!viewport) return;
    // keep scroll position if still valid; otherwise clamp to top
    const maxScroll = Math.max(0, total * estimatedItemHeight - viewport.clientHeight);
    if (viewport.scrollTop > maxScroll) viewport.scrollTop = 0;
    recalcFromScrollTop(viewport.scrollTop);
  });

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      recalcFromScrollTop(viewport?.scrollTop ?? 0);
    });
  }
</script>

<svelte:head>
  <title>Dishes - Bancho Box</title>
  <meta name="description" content="Complete dish collection from Dave the Diver with comprehensive profit analysis" />
</svelte:head>

<ResponsiveLayout leftTitle="Filters & sort" containerClass="dishes">
  {#snippet left()}
    <FiltersPanel
      bundle={dishesStores.bundle}
      {filters}
      bind:query={$query}
      bind:sortKey={$sortKey as string}
      bind:sortDir={$sortDir}
      searchPlaceholder="Search dishes by name, ingredient, DLC, unlock…"
    />
  {/snippet}

  {#snippet content()}
    {@const paddingTop = startIndex * estimatedItemHeight}
    {@const paddingBottom = Math.max(0, ($visible.length - endIndex) * estimatedItemHeight)}

    <div class="h-[70dvh] md:h-full">
      <div bind:this={viewport} class="h-full overflow-y-auto" onscroll={onScroll}>
        <div class="flex flex-col gap-4" style={`padding-top: ${paddingTop}px; padding-bottom: ${paddingBottom}px;`}>
          <ResultsHeader visible={visible} entityLabel="Dishes" bind:sortKey={$sortKey as string} bind:sortDir={$sortDir} sortOptions={[
            { value: 'name', label: 'Recipe' },
            { value: 'finalPrice', label: 'Final Price' },
            { value: 'finalServings', label: 'Final Servings' },
            { value: 'finalProfitPerServing', label: 'Profit / Serving' },
            { value: 'maxProfitPerServing', label: 'Max Profit / Serving' },
            { value: 'upgradeCost', label: 'Upgrade Cost' },
            { value: 'ingredientCount', label: 'Ingredients' },
          ]} />
          {#each $visible.slice(startIndex, endIndex) as dish (dish.id)}
            <Dish {dish} />
          {/each}
        </div>
      </div>
    </div>
  {/snippet}

  {#snippet right()}
    <TrackingSidebar {tracked} on:toggleTrack={(e) => trackedDishIds.toggle(e.detail as unknown as number)} />
  {/snippet}
</ResponsiveLayout>
