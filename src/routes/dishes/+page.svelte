<script lang="ts">
  import Dish from '$lib/components/DishCard.svelte';
  import SortControl from '$lib/components/SortControl.svelte';
  import { Data } from '$lib/data/runtime.js';

  // Local indices for efficient lookups
  const ingredientById = new Map(Data.ingredients.map((i) => [i.id, i]));

  // Sorting state
  let sortColumn = $state<string>('baseProfitPerServing');
  let sortDirection = $state<'asc' | 'desc'>('desc');

  // Base dishes sorted by max profit (precomputed)
  const baseDishes = $derived(Data.getDishesSortedByProfit());
  const totalDishes = $derived(Data.getTotalDishes());

  // Search state
  let searchQuery = $state('');

  function normalize(value: unknown): string {
    return (value ?? '').toString().toLowerCase();
  }

  function dishMatchesQuery(dish: any, query: string): boolean {
    if (!query) return true;
    const q = normalize(query);

    // name / dlc / unlock condition
    if (normalize(dish.name).includes(q)) return true;
    if (normalize(dish.dlc).includes(q)) return true;
    if (normalize(dish.unlock).includes(q)) return true;

    // ingredient names
    for (const ingredientLine of dish.ingredients || []) {
      const ingredient = ingredientById.get(ingredientLine.ingredientId);
      if (normalize(ingredient?.name).includes(q)) return true;
    }
    return false;
  }

  // Sort function
  function sortDishes(dishes: any[], column: string, direction: 'asc' | 'desc') {
    return [...dishes].sort((a, b) => {
      let aVal, bVal;

      // All values are now pre-calculated in the enriched data
      aVal = a[column];
      bVal = b[column];

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return direction === 'asc' ? -1 : 1;
      if (bVal == null) return direction === 'asc' ? 1 : -1;

      // Compare values
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return direction === 'asc'
          ? (aVal < bVal ? -1 : aVal > bVal ? 1 : 0)
          : (bVal < aVal ? -1 : bVal > aVal ? 1 : 0);
      }
    });
  }

  // Handle column header click
  function handleSort(column: string) {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      // Match parties page behavior: default ascending for name, descending otherwise
      sortDirection = column === 'name' ? 'asc' : 'desc';
    }
  }

  // Get sorted dishes
  const enrichedDishes = $derived(sortDishes(baseDishes, sortColumn, sortDirection));

  // Apply search filter to visible dishes
  const visibleDishes = $derived((searchQuery && searchQuery.trim().length > 0)
    ? enrichedDishes.filter((dish) => dishMatchesQuery(dish, searchQuery))
    : enrichedDishes);

  // Sort options for SortControl (align with clickable headers)
  const sortOptions = [
    { value: 'name', label: 'Recipe' },
    { value: 'dlc', label: 'DLC' },
    { value: 'finalTaste', label: 'Final Taste' },
    { value: 'finalPrice', label: 'Final Price' },
    { value: 'finalServings', label: 'Final Servings' },
    { value: 'baseRevenue', label: 'Revenue' },
    { value: 'baseProfit', label: 'Recipe Profit' },
    { value: 'baseProfitPerServing', label: 'Profit / Serving' },
    { value: 'maxProfitPerServing', label: 'Max Profit / Serving' },
    { value: 'upgradeCost', label: 'Upgrade Cost' },
    { value: 'recipeCost', label: 'Recipe Cost' },
    { value: 'ingredientCount', label: 'Ingredients' }
  ];
</script>

<svelte:head>
  <title>Dishes - Bancho Box</title>
  <meta name="description" content="Complete dish collection from Dave the Diver with comprehensive profit analysis" />
</svelte:head>

<div class="container">
  <section class="dishes">
    <div class="controls p-2">
      <div class="search-wrapper">
        <input
          type="search"
          class="search-input"
          placeholder="Search dishes by name, ingredient, DLC, unlock…"
          bind:value={searchQuery}
        />
        {#if searchQuery}
          <button class="clear-btn" aria-label="Clear search" onclick={() => { searchQuery = ''; }}>
            ×
          </button>
        {/if}
      </div>

      <SortControl
        options={sortOptions}
        bind:column={sortColumn}
        bind:direction={sortDirection}
        on:change={(e) => {
          sortColumn = e.detail.column;
          sortDirection = e.detail.direction;
        }}
      />
    </div>
    <div class="card-list">
      {#each visibleDishes as dish}
        <Dish {dish} />
      {/each}
    </div>
  </section>
</div>

<style>
  .container {
    max-width: 2000px;
    margin: 0 auto;
    padding: 2rem;
  }

  /* removed unused header/h1 rules */

  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .search-wrapper {
    position: relative;
    max-width: 540px;
  }

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

  /* Cards container */
  .card-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
  }

  @media (max-width: 1200px) {
    .container {
      padding: 1rem;
    }
  }
</style>
