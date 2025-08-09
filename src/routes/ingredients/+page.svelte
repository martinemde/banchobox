<script lang="ts">
  import { Data } from '$lib/data/runtime.js';
  import IngredientCard from '$lib/components/Ingredient.svelte';
  import SortControl from '$lib/components/SortControl.svelte';
  import LoadMoreSentinel from '$lib/components/LoadMoreSentinel.svelte';
  import { trackedIngredientIds } from '$lib/stores/tracking.js';

  // Sorting state
  let sortColumn: string = 'name';
  let sortDirection: 'asc' | 'desc' = 'asc';
  let showTrackedOnly: boolean = false;

  // Use the enriched data service
  $: baseIngredients = Data.ingredients;
  $: totalIngredients = Data.getTotalIngredients();

  // Search state (by name only for ingredients page)
  let searchQuery: string = '';
  function normalize(value: unknown): string {
    return (value ?? '').toString().toLowerCase();
  }
  function ingredientMatchesQuery(ingredient: any, query: string): boolean {
    if (!query) return true;
    const q = normalize(query);
    return normalize(ingredient.name).includes(q);
  }

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

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'source', label: 'Source' },
    { value: 'type', label: 'Type' },
    { value: 'drone', label: 'Drone' },
    { value: 'kg', label: 'Weight' },
    { value: 'max_meats', label: 'Meats' },
    { value: 'cost', label: 'Cost' },
    { value: 'costPerKg', label: 'Cost/kg' },
    { value: 'revenuePerKg', label: 'Revenue/kg' },
    { value: 'sumUpgradeCount', label: 'Upgrade Count' },
    { value: 'pricePerIngredient', label: 'Best Dish Price/Ingredient' },
    { value: 'bestDishPrice', label: 'Best Dish Price' },
    { value: 'maxRevenue', label: 'Max Revenue' },
    { value: 'partiesCount', label: 'Parties' }
  ];

  // Get sorted ingredients
  $: enrichedIngredients = sortIngredients(baseIngredients, sortColumn, sortDirection);
  // Apply search and tracked-only filters
  $: visibleIngredients = enrichedIngredients.filter((ing) =>
    ingredientMatchesQuery(ing, searchQuery) && (!showTrackedOnly || $trackedIngredientIds.has(ing.id))
  );

  // Incremental rendering
  let pageSize = 20;
  let renderedCount = pageSize;
  $: renderedIngredients = visibleIngredients.slice(0, renderedCount);
  function loadMore() {
    renderedCount = Math.min(renderedCount + pageSize, visibleIngredients.length);
  }
  // Reset when sort/search filters change
  let lastSignature = '';
  $: {
    const signature = `${searchQuery}|${sortColumn}|${sortDirection}|${showTrackedOnly}`;
    if (signature !== lastSignature) {
      renderedCount = Math.min(pageSize, visibleIngredients.length);
      lastSignature = signature;
    }
  }

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
    <div class="controls p-2">
      <div class="search-wrapper">
        <input
          type="search"
          class="search-input"
          placeholder="Search ingredients by name…"
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

      <div class="flex items-center gap-2 mt-1">
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" bind:checked={showTrackedOnly} />
          <span>Show tracked only</span>
          {#if showTrackedOnly}
            <span class="text-xs opacity-60">{$trackedIngredientIds.size} tracked</span>
          {/if}
        </label>
      </div>
    </div>

    <div class="card-list">
      {#each renderedIngredients as ingredient}
        <IngredientCard {ingredient} />
      {/each}
      {#if renderedCount < visibleIngredients.length}
        <LoadMoreSentinel rootMargin="1200px" on:visible={loadMore} />
      {/if}
    </div>
  </section>
</div>

<style>
  .container {
    max-width: 1800px;
    margin: 0 auto;
    padding: 2rem;
  }

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

    /* no table at this point */
  }
</style>
