<script lang="ts">
  import { Data } from '$lib/data/runtime.js';
  import IngredientCard from '$lib/components/Ingredient.svelte';

  // Sorting state
  let sortColumn: string = 'name';
  let sortDirection: 'asc' | 'desc' = 'asc';

  // Use the enriched data service
  $: baseIngredients = Data.ingredients;
  $: totalIngredients = Data.getTotalIngredients();

  // Sort function
  function sortIngredients(ingredients: any[], column: string, direction: 'asc' | 'desc') {
    return [...ingredients].sort((a, b) => {
      let aVal, bVal;

      // Handle special calculated columns
      switch (column) {
        case 'costPerKg':
          aVal = calculateCostPerKg(a);
          bVal = calculateCostPerKg(b);
          break;
        case 'revenuePerKg':
          aVal = calculateBestDishRevenuePerKg(a);
          bVal = calculateBestDishRevenuePerKg(b);
          break;
        case 'sumUpgradeCount':
          aVal = calculateSumUpgradeCount(a);
          bVal = calculateSumUpgradeCount(b);
          break;
        case 'pricePerIngredient':
          aVal = calculateBestDishPricePerIngredient(a);
          bVal = calculateBestDishPricePerIngredient(b);
          break;
        case 'bestDishPrice':
          aVal = getBestDishPrice(a);
          bVal = getBestDishPrice(b);
          break;
        case 'maxRevenue':
          aVal = calculateMaxRevenue(a);
          bVal = calculateMaxRevenue(b);
          break;
        case 'partiesCount':
          aVal = getPartiesThatUseIngredient(a).length;
          bVal = getPartiesThatUseIngredient(b).length;
          break;
        case 'bestDishName':
          const bestPartyDishA = a.bestPartyDishId ? Data.getPartyDishById(a.bestPartyDishId) : null;
          const bestPartyDishB = b.bestPartyDishId ? Data.getPartyDishById(b.bestPartyDishId) : null;
          const dishA = bestPartyDishA ? Data.getDishById(bestPartyDishA.dishId) : null;
          const dishB = bestPartyDishB ? Data.getDishById(bestPartyDishB.dishId) : null;
          aVal = dishA?.name || '';
          bVal = dishB?.name || '';
          break;
        default:
          aVal = a[column];
          bVal = b[column];
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

  // Handle column header click
  function handleSort(column: string) {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = column === 'name' ? 'asc' : 'desc'; // Default to ascending for name, descending for others
    }
  }

  // Get sorted ingredients
  $: enrichedIngredients = sortIngredients(baseIngredients, sortColumn, sortDirection);

  // Calculate cost per kg for an ingredient
  function calculateCostPerKg(ingredient: any): number {
    if (!ingredient.cost || !ingredient.kg) return 0;
    return ingredient.cost / ingredient.kg;
  }

  // Calculate best dish revenue per kg using PartyDish entities
  function calculateBestDishRevenuePerKg(ingredient: any): number {
    if (!ingredient.bestPartyDishId || !ingredient.kg) return 0;

    const bestPartyDish = Data.getPartyDishById(ingredient.bestPartyDishId);
    if (!bestPartyDish) return 0;

    return bestPartyDish.partyRevenue / ingredient.kg;
  }

  // Calculate sum of upgrade counts for this ingredient across all dishes
  function calculateSumUpgradeCount(ingredient: any): number {
    return Data.dishes.reduce((total, dish) => {
      const dishIngredient = dish.ingredients.find(ing => ing.ingredientId === ingredient.id);
      return total + (dishIngredient?.upgradeCount || 0);
    }, 0);
  }

  // Calculate best dish price per ingredient (dish price / ingredient count in dish)
  function calculateBestDishPricePerIngredient(ingredient: any): number {
    if (!ingredient.bestPartyDishId) return 0;

    const bestPartyDish = Data.getPartyDishById(ingredient.bestPartyDishId);
    if (!bestPartyDish) return 0;

    const bestDish = Data.getDishById(bestPartyDish.dishId);
    if (!bestDish) return 0;

    const totalIngredientCount = bestDish.ingredients.reduce((sum, ing) => sum + ing.count, 0);
    return totalIngredientCount > 0 ? bestDish.final_price / totalIngredientCount : 0;
  }

  // Get best dish price
  function getBestDishPrice(ingredient: any): number {
    if (!ingredient.bestPartyDishId) return 0;

    const bestPartyDish = Data.getPartyDishById(ingredient.bestPartyDishId);
    if (!bestPartyDish) return 0;

    const bestDish = Data.getDishById(bestPartyDish.dishId);
    return bestDish?.final_price || 0;
  }

  // Calculate max revenue for the ingredient using PartyDish entities
  function calculateMaxRevenue(ingredient: any): number {
    if (!ingredient.bestPartyDishId) return 0;

    const bestPartyDish = Data.getPartyDishById(ingredient.bestPartyDishId);
    if (!bestPartyDish) return 0;

    return bestPartyDish.partyRevenue;
  }

  // Get party names that use this ingredient
  function getPartiesThatUseIngredient(ingredient: any): string[] {
    const partyNames: string[] = ingredient.usedForParties.map((partyId: number) => {
      const party = Data.getPartyById(partyId);
      return party?.name || 'Unknown';
    });
    return [...new Set(partyNames)].sort();
  }
</script>

<svelte:head>
  <title>Ingredients - Bancho Box</title>
  <meta name="description" content="Complete ingredient analysis from Dave the Diver with profitability metrics" />
</svelte:head>

<div class="container">
  <section class="ingredients">
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th class="sortable" on:click={() => handleSort('name')}>
              <div class="header-content">
                Name
                {#if sortColumn === 'name'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th class="sortable" on:click={() => handleSort('source')}>
              <div class="header-content">
                Source
                {#if sortColumn === 'source'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th class="sortable" on:click={() => handleSort('type')}>
              <div class="header-content">
                Type
                {#if sortColumn === 'type'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th class="sortable" on:click={() => handleSort('drone')}>
              <div class="header-content">
                Drone
                {#if sortColumn === 'drone'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th class="sortable" on:click={() => handleSort('kg')}>
              <div class="header-content">
                Weight
                {#if sortColumn === 'kg'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th class="sortable" on:click={() => handleSort('max_meats')}>
              <div class="header-content">
                Meats
                {#if sortColumn === 'max_meats'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th class="sortable" on:click={() => handleSort('cost')}>
              <div class="header-content">
                Cost
                {#if sortColumn === 'cost'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th class="sortable" on:click={() => handleSort('costPerKg')}>
              <div class="header-content">
                Cost/kg
                {#if sortColumn === 'costPerKg'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th class="sortable" on:click={() => handleSort('revenuePerKg')}>
              <div class="header-content">
                Revenue/kg
                {#if sortColumn === 'revenuePerKg'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th class="sortable" on:click={() => handleSort('sumUpgradeCount')}>
              <div class="header-content">
                Upgrade Count
                {#if sortColumn === 'sumUpgradeCount'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th class="sortable" on:click={() => handleSort('pricePerIngredient')}>
              <div class="header-content">
                Best Dish Price/Ingredient
                {#if sortColumn === 'pricePerIngredient'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th class="sortable" on:click={() => handleSort('bestDishPrice')}>
              <div class="header-content">
                Best Dish Price
                {#if sortColumn === 'bestDishPrice'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th class="sortable" on:click={() => handleSort('maxRevenue')}>
              <div class="header-content">
                Max Revenue
                {#if sortColumn === 'maxRevenue'}
                  <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                {/if}
              </div>
            </th>
            <th class="sortable" on:click={() => handleSort('partiesCount')}>
              <div class="header-content">
                Parties
                {#if sortColumn === 'partiesCount'}
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
      {#each enrichedIngredients as ingredient}
        <IngredientCard {ingredient} />
      {/each}
    </div>
  </section>
</div>

<style>
  .container {
    max-width: 1800px;
    margin: 0 auto;
    padding: 2rem;
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
    min-width: 1680px; /* Slightly wider to account for image column */
  }
  /* image column removed in card view */

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

    table {
      min-width: 1480px;
    }
  }
</style>
