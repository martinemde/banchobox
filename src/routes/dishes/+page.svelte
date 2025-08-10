<script lang="ts">
  import Dish from '$lib/components/DishCard.svelte';
  import SortControl from '$lib/components/SortControl.svelte';
  import { dishesStores } from '$lib/stores/dishes';
  import { syncToUrl } from '$lib/stores/urlSync';

  const { query, sortKey, sortDir, visible } = dishesStores;
  syncToUrl('dishes', dishesStores);

  const sortOptions = [
    { value: 'name', label: 'Recipe' },
    { value: 'finalPrice', label: 'Final Price' },
    { value: 'finalServings', label: 'Final Servings' },
    { value: 'baseProfitPerServing', label: 'Profit / Serving' },
    { value: 'maxProfitPerServing', label: 'Max Profit / Serving' },
    { value: 'maxProfitPerDish', label: 'Max Profit / Dish' },
    { value: 'upgradeCost', label: 'Upgrade Cost' },
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
          bind:value={$query}
        />
        {#if $query}
          <button class="clear-btn" aria-label="Clear search" onclick={() => { query.set(''); }}>
            ×
          </button>
        {/if}
      </div>

      <SortControl
        options={sortOptions}
        column={$sortKey}
        direction={$sortDir}
        on:change={(e) => {
          sortKey.set(e.detail.column);
          sortDir.set(e.detail.direction);
        }}
      />
    </div>
    <div class="card-list">
      {#each $visible as dish (dish.id)}
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
