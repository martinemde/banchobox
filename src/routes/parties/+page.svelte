<script lang="ts">
  import PartyDish from '$lib/components/PartyDishCard.svelte';
  import SortControl from '$lib/components/SortControl.svelte';
  import { Data } from '$lib/data/runtime.js';
  import { partiesStores } from '$lib/stores/parties';
  import { dishesByPartyStore } from '$lib/stores/parties';
  import PartyGroup from '$lib/components/PartyGroup.svelte';

  const { query, sortKey, sortDir, visible } = partiesStores;
  let dishSearch = $state('');

  const dishSortOptions = [
    { value: 'dishName', label: 'Dish Name' },
    { value: 'partyPrice', label: 'Price' },
    { value: 'partyRevenue', label: 'Revenue' },
    { value: 'recipeCost', label: 'Recipe Cost' },
    { value: 'profit', label: 'Profit' },
    { value: 'profitPerServing', label: 'Profit / Serving' }
  ];
</script>

<svelte:head>
  <title>Parties - Bancho Box</title>
  <meta name="description" content="Complete party collection from Dave the Diver with calculated profit analysis" />
</svelte:head>

<div class="max-w-screen-2xl mx-auto md:p-4">
  <div class="controls p-4">
    <div class="search-wrapper">
      <input
        type="search"
        class="search-input"
        placeholder="Search parties…"
        bind:value={$query}
      />
      {#if $query}
        <button class="clear-btn" aria-label="Clear search" onclick={() => { query.set(''); }}>
          ×
        </button>
      {/if}
    </div>

    <SortControl
      options={[{ value: 'name', label: 'Name' }, { value: 'bonus', label: 'Bonus' }, { value: 'dishCount', label: 'Dish Count' }]}
      column={$sortKey}
      direction={$sortDir}
      on:change={(e) => {
        sortKey.set(e.detail.column);
        sortDir.set(e.detail.direction);
      }}
    />
  </div>

  <section class="parties">
    <div class="parties-container">
      {#each $visible as party (party.id)}
        {#if $dishesByPartyStore?.[party.id]}
          <PartyGroup party={party} subBundle={$dishesByPartyStore[party.id]} />
        {/if}
      {/each}
    </div>
  </section>
</div>

<style>
  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .search-wrapper { position: relative; max-width: 540px; }
  .search-input {
    width: 100%;
    padding: 0.6rem 2rem 0.6rem 0.8rem;
    border: 1px solid rgb(var(--color-surface-400));
    border-radius: 0.5rem;
    background: rgb(var(--color-surface-200));
    color: rgb(var(--color-on-surface-token));
  }
  .clear-btn {
    position: absolute;
    right: 0.35rem;
    top: 50%;
    transform: translateY(-50%);
    line-height: 1;
    border: none;
    background: transparent;
    color: rgb(var(--color-on-surface-token));
    font-size: 1.25rem;
    padding: 0 0.25rem;
    cursor: pointer;
    opacity: 0.7;
  }
  .clear-btn:hover { opacity: 1; }
</style>
