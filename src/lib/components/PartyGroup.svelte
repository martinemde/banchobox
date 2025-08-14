<script lang="ts">
  import SortControl from '$lib/ui/SortControl.svelte';
  import PartyDish from '$lib/components/PartyDishCard.svelte';
  import { createPartyDishesStores } from '$lib/stores/partyDishes.js';
  import type { EnrichedParty, Id, PartyDish as PartyDishRow } from '$lib/types.js';
  import { bundle as dishesBundle } from '$lib/stores/dishes.js';

  export let party: EnrichedParty;
  export let subBundle: { rows: PartyDishRow[]; byId: Record<Id, PartyDishRow>; facets: Record<string, Record<string, Id[]>> };

  const stores = createPartyDishesStores(subBundle);
  const queryStore = stores.query;
  const sortKeyStore = stores.sortKey;
  const sortDirStore = stores.sortDir;
  const visibleStore = stores.visible;

  const dishSortOptions = [
    { value: 'dishName', label: 'Dish Name' },
    { value: 'partyPrice', label: 'Price' },
    { value: 'partyRevenue', label: 'Revenue' },
    { value: 'recipeCost', label: 'Recipe Cost' },
    { value: 'profit', label: 'Profit' },
    { value: 'profitPerServing', label: 'Profit / Serving' }
  ];
</script>

<section class="mt-6">
  <header class="flex items-center justify-between py-3 border-b border-surface-200-800">
    <h3 class="h4 m-0">{party.name} Party</h3>
    <div class="flex items-center gap-2">
      <span class="badge preset-filled-primary-500 text-xs">{party.bonus}× bonus</span>
      <span class="text-sm opacity-80">{party.partyDishIds.length} dishes</span>
    </div>
  </header>

  <div class="flex flex-col gap-y-4">
    {#each $visibleStore as pd (pd.id)}
      {@const dish = ($dishesBundle?.byId[pd.dishId])}
      {#if dish}
        <PartyDish dish={dish} partyDish={pd} party={party} />
      {/if}
    {/each}
  </div>
</section>

<style>
</style>
