<script lang="ts">
  import IngredientCard from '$lib/components/IngredientCard.svelte';
  import SortControl from '$lib/components/SortControl.svelte';
  import { trackedIngredientIds } from '$lib/stores/tracking.js';
  import { ingredientsStores } from '$lib/stores/ingredients';
  import { syncToUrl } from '$lib/stores/urlSync';

  const { query, sortKey, sortDir, visible, filters } = ingredientsStores;
  syncToUrl('ingredients', ingredientsStores);

  let showTrackedOnly = $state(false);

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'sell', label: 'Sell' },
    { value: 'kg', label: 'Weight (kg)' },
    { value: 'sellPerKg', label: 'Sell / kg' },
    { value: 'buyJango', label: 'Buy: Jango' },
    { value: 'buyOtto', label: 'Buy: Otto' },
    { value: 'usedForPartiesCount', label: 'Parties Using' }
  ];
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
          placeholder="Search ingredients by name, source, type, time, drone…"
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
        {#each $visible as ingredient (ingredient.id)}
          {#if !showTrackedOnly || $trackedIngredientIds.has(ingredient.id)}
            <IngredientCard {ingredient} />
          {/if}
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
