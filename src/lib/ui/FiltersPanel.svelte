<script lang="ts">
  import SortControl from '$lib/components/SortControl.svelte';

  let { query = $bindable(''), sortKey = $bindable<'name'|'finalPrice'|'finalServings'|'finalProfitPerServing'|'maxProfitPerServing'|'upgradeCost'|'ingredientCount'>('finalProfitPerServing'), sortDir = $bindable<'asc'|'desc'>('desc') } = $props();

  // placeholder toggles - no external effect yet
  let vip = $state(false);
  let night = $state(false);
  let glacial = $state(false);

  const sortOptions = [
    { value: 'name', label: 'Recipe' },
    { value: 'finalPrice', label: 'Final Price' },
    { value: 'finalServings', label: 'Final Servings' },
    { value: 'finalProfitPerServing', label: 'Profit / Serving' },
    { value: 'maxProfitPerServing', label: 'Max Profit / Serving' },
    { value: 'upgradeCost', label: 'Upgrade Cost' },
    { value: 'ingredientCount', label: 'Ingredients' },
  ];
</script>

<div class="space-y-4">
  <div class="space-y-2">
    <label class="text-sm font-semibold" for="filters-search">Search</label>
    <div class="relative">
      <input
        type="search"
        id="filters-search"
        class="search-input w-full"
        placeholder="Search dishes by name, ingredient, DLC, unlock…"
        bind:value={query}
      />
      {#if query}
        <button class="clear-btn" aria-label="Clear search" onclick={() => (query = '')}>×</button>
      {/if}
    </div>
  </div>

  <div class="space-y-2">
    <label class="text-sm font-semibold" for="filters-sort">Sort</label>
    <SortControl
      options={sortOptions}
      column={sortKey as string}
      direction={sortDir as 'asc' | 'desc'}
      on:change={(e) => {
        sortKey = e.detail.column as any;
        sortDir = e.detail.direction as 'asc' | 'desc';
      }}
    />
  </div>

  <fieldset class="space-y-2">
    <legend class="text-sm font-semibold">Filters</legend>
    <label class="flex items-center gap-2 text-sm">
      <input type="checkbox" bind:checked={vip} />
      VIP Bartender
    </label>
    <label class="flex items-center gap-2 text-sm">
      <input type="checkbox" bind:checked={night} />
      Night Dive
    </label>
    <label class="flex items-center gap-2 text-sm">
      <input type="checkbox" bind:checked={glacial} />
      Glacial Area
    </label>
  </fieldset>
</div>

<style>
  .search-input {
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
