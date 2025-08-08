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
  <header>
    <h1>Dishes ({totalDishes})</h1>
  </header>

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
            <th rowspan="2" class="sortable" on:click={() => handleSort('unlock_condition')}>
              <div class="header-content">
                Unlock Condition
                {#if sortColumn === 'unlock_condition'}
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
            <th colspan="4" class="party-group">Party Analysis</th>
            <th rowspan="2" class="sortable" on:click={() => handleSort('final_level')}>
              <div class="header-content">
                Final Level
                {#if sortColumn === 'final_level'}
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
                Base Revenue
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
                Base Profit
                {#if sortColumn === 'baseProfit'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th rowspan="2" class="sortable" on:click={() => handleSort('baseProfitPerServing')}>
              <div class="header-content">
                Base Profit/Serving
                {#if sortColumn === 'baseProfitPerServing'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th rowspan="2" class="sortable" on:click={() => handleSort('ingredientCount')}>
              <div class="header-content">
                Ingredient Count
                {#if sortColumn === 'ingredientCount'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
          </tr>
          <tr>
            <th class="party-subheader sortable" on:click={() => handleSort('bestPartyName')}>
              <div class="header-content">
                Best Party
                {#if sortColumn === 'bestPartyName'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th class="party-subheader sortable" on:click={() => handleSort('bestPartyBonus')}>
              <div class="header-content">
                Bonus
                {#if sortColumn === 'bestPartyBonus'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th class="party-subheader sortable" on:click={() => handleSort('bestPartyPrice')}>
              <div class="header-content">
                Party Price
                {#if sortColumn === 'bestPartyPrice'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th class="party-subheader sortable" on:click={() => handleSort('bestPartyRevenue')}>
              <div class="header-content">
                Party Revenue
                {#if sortColumn === 'bestPartyRevenue'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {#each enrichedDishes as dish}
            <tr>
              <td class="recipe">
                <Recipe {dish} />
              </td>
              <td class="unlock-condition">{dish.unlock_condition || '—'}</td>
              <td class="dlc">{dish.dlc || '—'}</td>

              <!-- Party Analysis Columns -->
              <td class="best-party">
                {dish.bestPartyName || 'No parties'}
              </td>
              <td class="bonus">
                {dish.bestPartyBonus ? `${dish.bestPartyBonus}×` : '—'}
              </td>
              <td class="party-price">
                {dish.bestPartyPrice ? Math.round(dish.bestPartyPrice) : '—'}
              </td>
              <td class="party-revenue">
                {dish.bestPartyRevenue ? Math.round(dish.bestPartyRevenue) : '—'}
              </td>

              <td class="level">{dish.final_level}</td>
              <td class="taste">{dish.final_taste}</td>
              <td class="price">{dish.initial_price}</td>
              <td class="price">{dish.final_price}</td>
              <td class="servings">{dish.servings}</td>
              <td class="revenue">{Math.round(dish.baseRevenue)}</td>
              <td class="upgrade-cost">{Math.round(dish.upgradeCost)}</td>
              <td class="break-even">
                {dish.upgradeCost > 0 ? dish.upgradeBreakEven.toFixed(1) + '×' : '—'}
              </td>
              <td class="cost">{Math.round(dish.recipeCost)}</td>
              <td class="profit {dish.baseProfit > 0 ? 'positive' : 'negative'}">
                {Math.round(dish.baseProfit)}
              </td>
              <td class="profit-per-serving {dish.baseProfitPerServing > 0 ? 'positive' : 'negative'}">
                {Math.round(dish.baseProfitPerServing)}
              </td>
              <td class="ingredient-count">{dish.ingredientCount}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
</div>

<style>
  .container {
    max-width: 2000px;
    margin: 0 auto;
    padding: 2rem;
  }

  header {
    text-align: center;
    margin-bottom: 3rem;
  }

  h1 {
    font-size: 3rem;
    color: rgb(var(--color-primary-500));
    margin-bottom: 0.5rem;
  }



  .table-container {
    overflow-x: auto;
    background: rgb(var(--color-surface-200));
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 2400px; /* Wide table for all columns */
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

  td {
    padding: 0.6rem 0.4rem;
    border-bottom: 1px solid rgb(var(--color-surface-300));
    font-size: 0.8rem;
    color: rgb(var(--color-on-surface-token));
    vertical-align: top;
    white-space: nowrap;
  }

  tr:hover {
    background-color: rgb(var(--color-surface-300) / 0.5);
  }



  .recipe {
    max-width: 200px;
    white-space: normal;
  }



  .unlock-condition {
    color: rgb(var(--color-on-surface-token) / 0.6);
    font-size: 0.75rem;
    max-width: 120px;
    white-space: normal;
  }

  .dlc {
    color: rgb(var(--color-tertiary-500));
    font-weight: 500;
    font-size: 0.75rem;
  }

  .best-party {
    font-weight: 500;
    color: rgb(var(--color-primary-500));
    font-size: 0.75rem;
    background-color: rgb(var(--color-primary-500) / 0.1);
  }

  .bonus {
    text-align: center;
    font-weight: 600;
    color: rgb(var(--color-primary-600));
    font-size: 0.75rem;
    background-color: rgb(var(--color-primary-500) / 0.1);
  }

  .party-price, .party-revenue {
    text-align: right;
    font-weight: 600;
    color: rgb(var(--color-primary-600));
    background-color: rgb(var(--color-primary-500) / 0.1);
  }

  .level, .taste, .servings, .ingredient-count {
    text-align: center;
    font-weight: 600;
  }

  .price, .revenue, .cost, .upgrade-cost {
    text-align: right;
    font-weight: 600;
    color: rgb(var(--color-secondary-500));
  }

  .revenue {
    color: rgb(var(--color-success-600));
  }

  .cost, .upgrade-cost {
    color: rgb(var(--color-warning-600));
  }

  .break-even {
    text-align: right;
    font-weight: 600;
    color: rgb(var(--color-info-600));
    font-size: 0.75rem;
  }

  .profit, .profit-per-serving {
    text-align: right;
    font-weight: 700;
  }

  .profit.positive, .profit-per-serving.positive {
    color: rgb(var(--color-success-500));
  }

  .profit.negative, .profit-per-serving.negative {
    color: rgb(var(--color-error-500));
  }

  @media (max-width: 1200px) {
    .container {
      padding: 1rem;
    }

    h1 {
      font-size: 2rem;
    }

    th, td {
      padding: 0.4rem 0.3rem;
      font-size: 0.75rem;
    }



    .recipe {
      max-width: 160px;
    }

    .unlock-condition {
      max-width: 100px;
    }

    table {
      min-width: 2000px;
    }
  }
</style>
