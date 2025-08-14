<script lang="ts">
  import Dish from '$lib/components/DishCard.svelte';
  import SortControl from '$lib/components/SortControl.svelte';
  import { dishesStores } from '$lib/stores/dishes';
  import { syncToUrl } from '$lib/stores/urlSync';
  import FiltersPanel from '$lib/ui/FiltersPanel.svelte';
  import DrawerLeft from '$lib/ui/DrawerLeft.svelte';
  import TrackingSidebar from '$lib/ui/TrackingSidebar.svelte';
  import { trackedDishIds } from '$lib/stores/tracking.js';

  const { query, sortKey, sortDir, visible } = dishesStores;
  syncToUrl('dishes', dishesStores);

  let filtersOpen = $state(false);

  let tracked = $state<{ id: number; name: string; profit: number }[]>([]);
  $effect(() => {
    tracked = $visible
      .filter((d) => $trackedDishIds.has(d.id))
      .map((d) => ({ id: d.id, name: d.name, profit: d.finalProfit }));
  });
</script>

<svelte:head>
  <title>Dishes - Bancho Box</title>
  <meta name="description" content="Complete dish collection from Dave the Diver with comprehensive profit analysis" />
</svelte:head>

<div class="mx-auto max-w-screen-xl px-4 py-6">
  <div class="grid grid-cols-1
              md:[grid-template-columns:20rem_minmax(0,1fr)]
              lg:[grid-template-columns:20rem_minmax(0,1fr)_18rem]
              gap-6">
    <!-- Mobile trigger -->
    <div class="md:hidden mb-4">
      <button class="btn btn-lg preset-filled w-full" onclick={() => (filtersOpen = true)}>
        Filters & sort
      </button>
    </div>

    <!-- Left sidebar (≥md) -->
    <aside class="hidden md:block border border-white/10 rounded-lg sticky top-14 self-start bg-surface-50/70 backdrop-blur p-4">
      <FiltersPanel bind:query={$query} bind:sortKey={$sortKey} bind:sortDir={$sortDir} />
    </aside>

    <!-- Center content -->
    <section class="min-w-0">
      <!-- Mobile subheader -->
      <div class="sticky top-14 z-30 bg-surface-50/90 backdrop-blur border-b border-white/10 md:hidden">
        <div class="px-1 py-3">
          <FiltersPanel bind:query={$query} bind:sortKey={$sortKey} bind:sortDir={$sortDir} />
        </div>
      </div>

      <div class="mx-auto md:mx-0 max-w-[400px] w-full">
        <div class="flex flex-col gap-4">
          {#each $visible as dish (dish.id)}
            <Dish {dish} />
          {/each}
        </div>
      </div>
    </section>

    <!-- Right tracking preview (≥lg) -->
    <aside class="hidden lg:block border border-white/10 rounded-lg sticky top-14 self-start bg-surface-50/70 backdrop-blur p-3">
      <TrackingSidebar {tracked} on:toggleTrack={(e) => trackedDishIds.toggle(e.detail as unknown as number)} />
    </aside>
  </div>

  <!-- Mobile drawer -->
  <DrawerLeft bind:open={filtersOpen}>
    {#snippet title()}
      <h3 class="text-lg font-semibold">Filters &amp; sort</h3>
    {/snippet}
    <FiltersPanel bind:query={$query} bind:sortKey={$sortKey} bind:sortDir={$sortDir} />
  </DrawerLeft>
</div>
