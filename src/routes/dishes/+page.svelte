<script lang="ts">
  import { Data } from '$lib/data/runtime.js';
  import Recipe from '$lib/components/Recipe.svelte';

  // Sorting state
  let sortColumn: string = 'baseProfitPerServing';
  let sortDirection: 'asc' | 'desc' = 'desc';

  // Use the new enriched data service
  $: baseDishes = Data.getDishesSortedByProfit();
  $: totalDishes = Data.getTotalDishes();

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
      sortDirection = 'desc'; // Default to descending for most columns
    }
  }

  // Get sorted dishes
  $: enrichedDishes = sortDishes(baseDishes, sortColumn, sortDirection);
</script>

<svelte:head>
  <title>Dishes - Dave Menu</title>
  <meta name="description" content="Complete dish collection from Dave the Diver with comprehensive profit analysis" />
</svelte:head>

<div class="container">
  <section class="dishes">
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th rowspan="2" class="sortable" on:click={() => handleSort('name')}>
              <div class="header-content">
                Recipe
                {#if sortColumn === 'name'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th rowspan="2" class="sortable" on:click={() => handleSort('dlc')}>
              <div class="header-content">
                DLC
                {#if sortColumn === 'dlc'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th rowspan="2" class="sortable" on:click={() => handleSort('final_taste')}>
              <div class="header-content">
                Final Taste
                {#if sortColumn === 'final_taste'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th rowspan="2" class="sortable" on:click={() => handleSort('initial_price')}>
              <div class="header-content">
                Initial Price
                {#if sortColumn === 'initial_price'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th rowspan="2" class="sortable" on:click={() => handleSort('final_price')}>
              <div class="header-content">
                Final Price
                {#if sortColumn === 'final_price'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th rowspan="2" class="sortable" on:click={() => handleSort('servings')}>
              <div class="header-content">
                Servings
                {#if sortColumn === 'servings'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th rowspan="2" class="sortable" on:click={() => handleSort('baseRevenue')}>
              <div class="header-content">
                Revenue
                {#if sortColumn === 'baseRevenue'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th rowspan="2" class="sortable" on:click={() => handleSort('upgradeCost')}>
              <div class="header-content">
                Upgrade Cost
                {#if sortColumn === 'upgradeCost'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th rowspan="2" class="sortable" on:click={() => handleSort('upgradeBreakEven')}>
              <div class="header-content">
                Upgrade Break Even
                {#if sortColumn === 'upgradeBreakEven'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th rowspan="2" class="sortable" on:click={() => handleSort('recipeCost')}>
              <div class="header-content">
                Recipe Cost
                {#if sortColumn === 'recipeCost'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th rowspan="2" class="sortable" on:click={() => handleSort('baseProfit')}>
              <div class="header-content">
                Profit
                {#if sortColumn === 'baseProfit'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th rowspan="2" class="sortable" on:click={() => handleSort('baseProfitPerServing')}>
              <div class="header-content">
                Profit/Serving
                {#if sortColumn === 'baseProfitPerServing'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th rowspan="2" class="sortable" on:click={() => handleSort('ingredientCount')}>
              <div class="header-content">
                Ingredients
                {#if sortColumn === 'ingredientCount'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>

    <div class="card-list">
      {#each enrichedDishes as dish}
        <Recipe {dish} />
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

  .table-container {
    overflow-x: auto;
    background: rgb(var(--color-surface-200));
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }
  .image-col {
    width: 64px;
    text-align: center;
  }

  th {
    background-color: rgb(var(--color-surface-300));
    padding: 0.75rem 0.5rem;
    text-align: left;
    font-weight: 600;
    color: rgb(var(--color-on-surface-token));
    border-bottom: 1px solid rgb(var(--color-surface-400));
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
    vertical-align: bottom;
  }

  th.sortable {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease;
  }

  th.sortable:hover {
    background-color: rgb(var(--color-surface-400));
  }

  th.sortable:active {
    background-color: rgb(var(--color-surface-500));
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.3rem;
  }

  .sort-indicator {
    font-size: 0.9rem;
    font-weight: 700;
    color: rgb(var(--color-primary-500));
    opacity: 0.8;
    transition: opacity 0.2s ease;
  }

  th.sortable:hover .sort-indicator {
    opacity: 1;
  }

  th.party-group {
    background-color: rgb(var(--color-primary-500) / 0.8);
    color: white;
    text-align: center;
    border-left: 2px solid rgb(var(--color-primary-600));
    border-right: 2px solid rgb(var(--color-primary-600));
  }

  th.party-subheader {
    background-color: rgb(var(--color-primary-500) / 0.6);
    color: white;
    font-size: 0.75rem;
    padding: 0.5rem 0.4rem;
  }

  th.party-subheader.sortable:hover {
    background-color: rgb(var(--color-primary-500) / 0.8);
  }

  th.party-subheader.sortable:active {
    background-color: rgb(var(--color-primary-500));
  }

  th.party-subheader .sort-indicator {
    color: white;
  }

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

    th {
      padding: 0.4rem 0.3rem;
      font-size: 0.75rem;
    }

    table {
      min-width: 2080px;
    }
  }
</style>
