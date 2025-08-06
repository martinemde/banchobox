<script lang="ts">
  import { Data } from '$lib/data/runtime.js';
  import Recipe from '$lib/components/Recipe.svelte';

  // Global sorting state for all party tables
  let sortColumn: string = 'dishName';
  let sortDirection: 'asc' | 'desc' = 'asc';

  // Use the enriched data service
  $: enrichedParties = Data.parties;

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

  // Make sorted parties reactive to sort changes
  $: sortedParties = enrichedParties.map(party => {
    const partyDishes = Data.getPartyDishesByPartyId(party.id);
    const sortedDishes = sortPartyDishes(partyDishes, sortColumn, sortDirection);
    return {
      ...party,
      sortedDishes
    };
  });
</script>

<svelte:head>
  <title>Parties - Dave Menu</title>
  <meta name="description" content="Complete party collection from Dave the Diver with calculated profit analysis" />
</svelte:head>

<div class="container">
  <header>
    <h1>Parties</h1>
  </header>

  <section class="parties">
    <div class="parties-container">
      {#each sortedParties as party}
        <div class="party-card">
          <div class="party-header">
            <h3 class="party-name">{party.name} Party</h3>
            <div class="party-info">
              <span class="bonus">{party.bonus}× bonus</span>
              <span class="dish-count">{party.partyDishIds.length} dishes</span>
            </div>
          </div>

          <div class="party-dishes">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th class="sortable" on:click={() => handleSort('dishName')}>
                      <div class="header-content">
                        Dish
                        {#if sortColumn === 'dishName'}
                          <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        {/if}
                      </div>
                    </th>
                    <th class="sortable" on:click={() => handleSort('unlockCondition')}>
                      <div class="header-content">
                        Unlock Condition
                        {#if sortColumn === 'unlockCondition'}
                          <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        {/if}
                      </div>
                    </th>
                    <th class="sortable" on:click={() => handleSort('partyPrice')}>
                      <div class="header-content">
                        Price
                        {#if sortColumn === 'partyPrice'}
                          <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        {/if}
                      </div>
                    </th>
                    <th class="sortable" on:click={() => handleSort('partyRevenue')}>
                      <div class="header-content">
                        Revenue
                        <br>(Price × Servings)
                        {#if sortColumn === 'partyRevenue'}
                          <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        {/if}
                      </div>
                    </th>
                    <th class="sortable" on:click={() => handleSort('recipeCost')}>
                      <div class="header-content">
                        Recipe Cost
                        {#if sortColumn === 'recipeCost'}
                          <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        {/if}
                      </div>
                    </th>
                    <th class="sortable" on:click={() => handleSort('profit')}>
                      <div class="header-content">
                        Profit<br>(Revenue - Recipe Cost)
                        {#if sortColumn === 'profit'}
                          <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        {/if}
                      </div>
                    </th>
                    <th class="sortable" on:click={() => handleSort('profitPerServing')}>
                      <div class="header-content">
                        Profit / Serving
                        {#if sortColumn === 'profitPerServing'}
                          <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        {/if}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {#each party.sortedDishes as partyDish}
                    {@const dish = Data.getDishById(partyDish.dishId)}
                    {#if dish}
                      <tr>
                        <td class="dish-name">
                          <Recipe {dish} />
                        </td>
                        <td class="unlock-condition">{dish.unlock_condition || '—'}</td>
                        <td class="party-price">{Math.round(partyDish.partyPrice)}</td>
                        <td class="party-revenue">{Math.round(partyDish.partyRevenue)}</td>
                        <td class="recipe-cost">{Math.round(dish.recipeCost)}</td>
                        <td class="party-profit">{Math.round(partyDish.profit)}</td>
                        <td class="profit-per-serving">{Math.round(partyDish.profitPerServing)}</td>
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .container {
    max-width: 1600px;
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
    min-width: 1200px; /* Ensure horizontal scroll on small screens */
  }

  th {
    background-color: rgb(var(--color-surface-300));
    padding: 1rem 0.75rem;
    text-align: left;
    font-weight: 600;
    color: rgb(var(--color-on-surface-token));
    border-bottom: 1px solid rgb(var(--color-surface-400));
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
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

  td {
    padding: 0.75rem;
    border-bottom: 1px solid rgb(var(--color-surface-300));
    font-size: 0.875rem;
    color: rgb(var(--color-on-surface-token));
    vertical-align: top;
  }

  tr:hover {
    background-color: rgb(var(--color-surface-300) / 0.5);
  }

  .dish-name {
    font-weight: 600;
    color: rgb(var(--color-on-surface-token));
    min-width: 180px;
  }

  .unlock-condition {
    color: rgb(var(--color-on-surface-token) / 0.6);
    font-size: 0.8rem;
    max-width: 150px;
  }

  .bonus {
    text-align: center;
    font-weight: 600;
    color: rgb(var(--color-primary-600));
    font-size: 0.875rem;
  }

  .party-price, .party-revenue, .recipe-cost {
    text-align: right;
    font-weight: 600;
    color: rgb(var(--color-secondary-500));
    white-space: nowrap;
  }

  .party-revenue {
    color: rgb(var(--color-success-600));
  }

  .recipe-cost {
    color: rgb(var(--color-warning-600));
  }

  .party-profit {
    text-align: right;
    font-weight: 700;
    white-space: nowrap;
  }

  .profit-per-serving {
    text-align: right;
    font-weight: 700;
    white-space: nowrap;
  }



  .parties-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .party-card {
    background: rgb(var(--color-surface-200));
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    overflow: hidden;
  }

  .party-header {
    background: linear-gradient(135deg, rgb(var(--color-primary-500)), rgb(var(--color-primary-600)));
    color: white;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .party-header h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .party-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }

  .party-info .bonus {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-weight: 600;
    font-size: 0.875rem;
    color: white;
  }

  .dish-count {
    font-size: 0.875rem;
    opacity: 0.9;
  }

  .party-dishes {
    padding: 0;
  }

  .party-dishes .table-container {
    box-shadow: none;
    border-radius: 0;
  }



  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }

    h1 {
      font-size: 2rem;
    }

    th, td {
      padding: 0.5rem;
      font-size: 0.8rem;
    }

    .dish-name {
      min-width: 120px;
    }

    .parties-container {
      gap: 1.5rem;
    }

    .party-header {
      padding: 1rem;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .party-header h3 {
      font-size: 1.25rem;
    }

    .party-info {
      align-items: flex-start;
      flex-direction: row;
      gap: 1rem;
    }

    .unlock-condition {
      max-width: 100px;
      font-size: 0.7rem;
    }


  }
</style>
