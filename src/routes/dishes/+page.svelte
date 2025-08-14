<script lang="ts">
  import Dish from '$lib/components/DishCard.svelte';
  import { dishesStores } from '$lib/stores/dishes';
  import { syncToUrl } from '$lib/stores/urlSync';
  import FiltersPanel from '$lib/ui/FiltersPanel.svelte';
  import ResponsiveLayout from '$lib/ui/ResponsiveLayout.svelte';
  import TrackingSidebar from '$lib/ui/TrackingSidebar.svelte';
  import { trackedDishIds } from '$lib/stores/tracking.js';

  const { query, sortKey, sortDir, visible, filters } = dishesStores;
  syncToUrl('dishes', dishesStores);

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
    <div class="flex flex-col gap-4">
      {#each $visible as dish (dish.id)}
        <Dish {dish} />
      {/each}
    </div>
  {/snippet}

  {#snippet right()}
    <TrackingSidebar {tracked} on:toggleTrack={(e) => trackedDishIds.toggle(e.detail as unknown as number)} />
  {/snippet}
</ResponsiveLayout>
