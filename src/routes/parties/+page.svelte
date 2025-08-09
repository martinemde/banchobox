<script lang="ts">
  import { Data } from '$lib/data/runtime.js';
  import PartyDish from '$lib/components/PartyDish.svelte';
  import SortControl from '$lib/components/SortControl.svelte';

  // Global sorting state for all party tables
  let sortColumn: string = 'dishName';
  let sortDirection: 'asc' | 'desc' = 'asc';

  // Use the enriched data service (static)
  const enrichedParties = Data.parties;

  // Search state (filters party dish list by dish fields)
  let searchQuery: string = '';
  function normalize(value: unknown): string {
    return (value ?? '').toString().toLowerCase();
  }
  function partyDishMatchesQuery(partyDish: any, query: string): boolean {
    if (!query) return true;
    const dish = Data.getDishById(partyDish.dishId);
    if (!dish) return false;
    const q = normalize(query);
    if (normalize(dish.name).includes(q)) return true;
    if (normalize(dish.dlc).includes(q)) return true;
    if (normalize(dish.unlock_condition).includes(q)) return true;
    for (const ingredientLine of dish.ingredients || []) {
      const ingredient = Data.getIngredientById(ingredientLine.ingredientId);
      if (normalize(ingredient?.name).includes(q)) return true;
    }
    return false;
  }

  // Sort function for party dishes using PartyDish entities
  function sortPartyDishes(partyDishes: any[], column: string, direction: 'asc' | 'desc') {
    return [...partyDishes].sort((a, b) => {
      let aVal, bVal;

      const dishA = Data.getDishById(a.dishId);
      const dishB = Data.getDishById(b.dishId);

      if (!dishA || !dishB) return 0;

      // Handle different column types - now using pre-calculated values from PartyDish entities
      switch (column) {
        case 'dishName':
          aVal = dishA.name;
          bVal = dishB.name;
          break;
        case 'unlockCondition':
          aVal = dishA.unlock_condition || '';
          bVal = dishB.unlock_condition || '';
          break;
        case 'partyPrice':
          aVal = a.partyPrice;
          bVal = b.partyPrice;
          break;
        case 'partyRevenue':
          aVal = a.partyRevenue;
          bVal = b.partyRevenue;
          break;
        case 'recipeCost':
          aVal = dishA.recipeCost;
          bVal = dishB.recipeCost;
          break;
        case 'profit':
          aVal = a.profit;
          bVal = b.profit;
          break;
        case 'profitPerServing':
          aVal = a.profitPerServing;
          bVal = b.profitPerServing;
          break;
        default:
          aVal = (a as any)[column] || (dishA as any)[column];
          bVal = (b as any)[column] || (dishB as any)[column];
      }

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

    // Handle column header click - applies to all party tables
  function handleSort(column: string) {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = column === 'dishName' ? 'asc' : 'desc';
    }
  }

  // Make sorted parties reactive to sort and search changes
  $: sortedParties = enrichedParties.map(party => {
    const partyDishes = Data.getPartyDishesByPartyId(party.id);
    const sortedDishes = sortPartyDishes(partyDishes, sortColumn, sortDirection);
    const visibleDishes = (searchQuery && searchQuery.trim().length > 0)
      ? sortedDishes.filter(pd => partyDishMatchesQuery(pd, searchQuery))
      : sortedDishes;
    return {
      ...party,
      sortedDishes: visibleDishes
    };
  });

  const sortOptions = [
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
        placeholder="Search dishes by name, ingredient, DLC, unlock…"
        bind:value={searchQuery}
      />
      {#if searchQuery}
        <button class="clear-btn" aria-label="Clear search" on:click={() => { searchQuery = ''; }}>
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

  <section class="parties">
    <div class="parties-container">
      {#each sortedParties as party}
        <section class="mt-6">
          <header class="flex items-center justify-between px-4 py-3 border-b border-surface-200-800">
            <h3 class="h4 m-0">{party.name} Party</h3>
            <div class="flex items-center gap-2">
              <span class="badge preset-filled-primary-500 text-xs">{party.bonus}× bonus</span>
              <span class="text-sm opacity-80">{party.partyDishIds.length} dishes</span>
            </div>
          </header>

          <div class="flex flex-col gap-4 p-4">
            {#each party.sortedDishes as partyDish}
              {@const dish = Data.getDishById(partyDish.dishId)}
              {#if dish}
                <PartyDish {dish} {partyDish} />
              {/if}
            {/each}
          </div>
        </section>
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
