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
    { value: 'finalProfitPerServing', label: 'Profit / Serving' },
    { value: 'maxProfitPerServing', label: 'Max Profit / Serving' },
    { value: 'upgradeCost', label: 'Upgrade Cost' },
    { value: 'ingredientCount', label: 'Ingredients' }
  ];

  let filtersDialogRef: HTMLDialogElement | null = $state(null);
</script>

<svelte:head>
  <title>Dishes - Bancho Box</title>
  <meta name="description" content="Complete dish collection from Dave the Diver with comprehensive profit analysis" />
</svelte:head>

{#snippet ControlsPanel()}
  <div class="controls space-y-3">
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
{/snippet}

<div class="mx-auto max-w-screen-xl px-4 py-6 md:h-[100dvh] md:overflow-hidden">
  <div class="md:grid md:grid-cols-[320px_minmax(0,1fr)] md:gap-6 md:h-full">
    <div class="md:hidden mb-4">
      <button class="btn btn-lg preset-filled w-full" onclick={() => (filtersDialogRef as HTMLDialogElement)?.showModal()}>
        Filters & sort
      </button>
    </div>

    <aside class="hidden md:block md:h-full md:overflow-auto">
      <div class="card variant-glass-surface p-4 border border-white/10 sticky top-0">
        {@render ControlsPanel()}
      </div>
    </aside>

    <section class="dishes md:h-full md:overflow-y-auto">
      <div class="mx-auto md:mx-0 max-w-[400px] w-full">
        <div class="flex flex-col gap-4">
          {#each $visible as dish (dish.id)}
            <Dish {dish} />
          {/each}
        </div>
      </div>
    </section>
  </div>

  <dialog bind:this={filtersDialogRef} class="left-drawer modal">
    <div class="drawer-panel card variant-glass-surface p-4 h-dvh w-[min(92vw,360px)] overflow-auto">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold">Filters & sort</h3>
        <button class="btn btn-sm preset-tonal" onclick={() => (filtersDialogRef as HTMLDialogElement)?.close()}>Close</button>
      </div>
      {@render ControlsPanel()}
    </div>
  </dialog>
</div>

<style>
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
  dialog.left-drawer {
    position: fixed;
    inset: 0;
    margin: 0;
    padding: 0;
    background: transparent;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: stretch;
  }
  dialog.left-drawer::backdrop { background: rgba(0,0,0,0.5); }
  .drawer-panel { margin: 0; height: 100dvh; }
</style>
