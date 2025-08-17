<script lang="ts">
  import IngredientCard from '$lib/components/IngredientCard.svelte';
  import FiltersPanel from '$lib/ui/FiltersPanel.svelte';
  import ResponsiveLayout from '$lib/ui/ResponsiveLayout.svelte';
  import ResultsHeader from '$lib/ui/ResultsHeader.svelte';
  import { ingredientsStores } from '$lib/stores/ingredients';
  import { syncToUrl } from '$lib/stores/urlSync';
  import { onMount } from 'svelte';

  const { query, sortKey, sortDir, visible, filters, bundle } = ingredientsStores;
  syncToUrl('ingredients', ingredientsStores);

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'kg', label: 'Weight (kg)' },
    { value: 'sell', label: 'Sell' },
    { value: 'sellPerKg', label: 'Sell / kg' },
    { value: 'buy', label: 'Purchase' }
  ];

  // Virtualization state
  let viewport: HTMLDivElement | null = null;
  let viewportHeight = $state(0);
  const estimatedItemHeight = 240; // px, estimated collapsed Ingredient card
  const overscan = 8;

  let startIndex = $state(0);
  let endIndex = $state(0);

  function recalcFromScrollTop(scrollTop: number) {
    const first = Math.floor(scrollTop / estimatedItemHeight) - overscan;
    startIndex = Math.max(0, first);
    const visibleCount = Math.ceil((viewportHeight || 0) / estimatedItemHeight) + overscan * 2;
    endIndex = Math.min($visible.length, startIndex + visibleCount);
  }

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

  // Reset window when dataset changes
  $effect(() => {
    const total = $visible.length;
    if (!viewport) return;
    const maxScroll = Math.max(0, total * estimatedItemHeight - (viewport?.clientHeight ?? 0));
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
  <title>Ingredients - Bancho Box</title>
  <meta
    name="description"
    content="Complete ingredient analysis from Dave the Diver with profitability metrics"
  />
</svelte:head>

<ResponsiveLayout leftTitle="Filters & sort" containerClass="ingredients" scrollMode="page">
  {#snippet left()}
    <FiltersPanel
      {bundle}
      {filters}
      bind:query={$query}
      bind:sortKey={$sortKey as string}
      bind:sortDir={$sortDir}
      {sortOptions}
      searchPlaceholder="Search ingredients by name, source, type, time, drone…"
    />
  {/snippet}

  {#snippet content()}
    <div class="flex flex-col gap-4">
      <ResultsHeader
        {visible}
        entityLabel="Ingredients"
        bind:sortKey={$sortKey as string}
        bind:sortDir={$sortDir}
        {sortOptions}
      />
      <div class="h-[70dvh] md:h-full">
        <div bind:this={viewport} class="h-full overflow-y-auto" onscroll={onScroll}>
          {#key `${startIndex}-${endIndex}-${$visible.length}`}
            <div
              class="flex flex-col gap-4"
              style={`padding-top: ${startIndex * estimatedItemHeight}px; padding-bottom: ${Math.max(0, ($visible.length - endIndex) * estimatedItemHeight)}px;`}
            >
              {#each $visible.slice(startIndex, endIndex) as ingredient (ingredient.id)}
                <IngredientCard {ingredient} />
              {/each}
            </div>
          {/key}
        </div>
      </div>
    </div>
  {/snippet}
</ResponsiveLayout>

<style>
  /* controls moved into FiltersPanel */
</style>
