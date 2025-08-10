<script lang="ts">
  import SortControl from '$lib/components/SortControl.svelte';
  import PartyDish from '$lib/components/PartyDishCard.svelte';
  import { createPartyDishesStores } from '$lib/stores/parties';
  import type { EnrichedParty, Id, PartyDish as PartyDishRow } from '$lib/types.js';
  import { Data } from '$lib/data/runtime.js';
  import type { Readable, Writable } from 'svelte/store';

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

  function formatNumber(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '—';
    return new Intl.NumberFormat().format(Math.round(value));
  }
</script>

<section class="mt-6">
  <header class="flex items-center justify-between px-4 py-3 border-b border-surface-200-800">
    <h3 class="h4 m-0">{party.name} Party</h3>
    <div class="flex items-center gap-2">
      <span class="badge preset-filled-primary-500 text-xs">{party.bonus}× bonus</span>
      <span class="text-sm opacity-80">{party.partyDishIds.length} dishes</span>
    </div>
  </header>

  <div class="flex flex-col gap-4 p-4">
    {#if true}
      <div class="controls p-2">
        <div class="search-wrapper">
          <input
            type="search"
            class="search-input"
            placeholder="Search party dishes…"
            bind:value={$queryStore}
          />
        </div>
        <SortControl
          options={dishSortOptions}
          column={$sortKeyStore}
          direction={$sortDirStore}
          on:change={(e) => {
            sortKeyStore.set(e.detail.column);
            sortDirStore.set(e.detail.direction);
          }}
        />
      </div>

      {#each $visibleStore as pd (pd.id)}
        {@const dish = (Data.getDishById(pd.dishId))}
        {#if dish}
          <PartyDish dish={dish} partyDish={pd} party={party} />
        {/if}
      {/each}
    {/if}
  </div>
</section>

<style>
  .search-wrapper { position: relative; max-width: 540px; }
  .search-input {
    width: 100%;
    padding: 0.6rem 2rem 0.6rem 0.8rem;
    border: 1px solid rgb(var(--color-surface-400));
    border-radius: 0.5rem;
    background: rgb(var(--color-surface-200));
    color: rgb(var(--color-on-surface-token));
  }
</style>
