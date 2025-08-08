<script lang="ts">
  import { Data } from '$lib/data/runtime.js';
  import PartyDish from '$lib/components/PartyDish.svelte';

  // Global sorting state for all party tables
  let sortColumn: string = 'dishName';
  let sortDirection: 'asc' | 'desc' = 'asc';

  // Use the enriched data service (static)
  const enrichedParties = Data.parties;

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
  <title>Parties - Bancho Box</title>
  <meta name="description" content="Complete party collection from Dave the Diver with calculated profit analysis" />
</svelte:head>

<div class="max-w-screen-2xl mx-auto md:p-4">
  <div class="overflow-x-auto rounded-md border border-surface-200-800 bg-surface-100-900">
    <table class="w-full border-collapse">
      <thead class="bg-surface-200-800">
        <tr>
          <th class="cursor-pointer select-none px-3 py-2 text-left font-semibold uppercase text-xs tracking-wide whitespace-nowrap" on:click={() => handleSort('dishName')}>
            <div class="flex items-center justify-between gap-1">
              <span>Dish</span>
              {#if sortColumn === 'dishName'}
                <span class="font-bold text-primary-500">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              {/if}
            </div>
          </th>
          <th class="cursor-pointer select-none px-3 py-2 text-left font-semibold uppercase text-xs tracking-wide whitespace-nowrap" on:click={() => handleSort('partyPrice')}>
            <div class="flex items-center justify-between gap-1">
              <span>Price</span>
              {#if sortColumn === 'partyPrice'}
                <span class="font-bold text-primary-500">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              {/if}
            </div>
          </th>
          <th class="cursor-pointer select-none px-3 py-2 text-left font-semibold uppercase text-xs tracking-wide whitespace-nowrap" on:click={() => handleSort('partyRevenue')}>
            <div class="flex items-center justify-between gap-1">
              <span>Revenue</span>
              {#if sortColumn === 'partyRevenue'}
                <span class="font-bold text-primary-500">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              {/if}
            </div>
          </th>
          <th class="cursor-pointer select-none px-3 py-2 text-left font-semibold uppercase text-xs tracking-wide whitespace-nowrap" on:click={() => handleSort('recipeCost')}>
            <div class="flex items-center justify-between gap-1">
              <span>Recipe Cost</span>
              {#if sortColumn === 'recipeCost'}
                <span class="font-bold text-primary-500">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              {/if}
            </div>
          </th>
          <th class="cursor-pointer select-none px-3 py-2 text-left font-semibold uppercase text-xs tracking-wide whitespace-nowrap" on:click={() => handleSort('profit')}>
            <div class="flex items-center justify-between gap-1">
              <span>Profit</span>
              {#if sortColumn === 'profit'}
                <span class="font-bold text-primary-500">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              {/if}
            </div>
          </th>
          <th class="cursor-pointer select-none px-3 py-2 text-left font-semibold uppercase text-xs tracking-wide whitespace-nowrap" on:click={() => handleSort('profitPerServing')}>
            <div class="flex items-center justify-between gap-1">
              <span>/ Serving</span>
              {#if sortColumn === 'profitPerServing'}
                <span class="font-bold text-primary-500">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              {/if}
            </div>
          </th>
        </tr>
      </thead>
    </table>
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
