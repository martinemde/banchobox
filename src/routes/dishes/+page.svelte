<script lang="ts">
  import type { PageData } from './$types.js';

  export let data: PageData;

  $: dishes = data.dishes;
</script>

<svelte:head>
  <title>Dishes - Dave Menu</title>
  <meta name="description" content="Complete dish collection from Dave the Diver" />
</svelte:head>

<div class="container">
  <header>
    <h1>All Dishes ({dishes.length})</h1>
    <p>Complete dish collection from Dave the Diver</p>
  </header>

  <section class="dishes">
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Dish Name</th>
            <th>Unlock Condition</th>
            <th>DLC</th>
            <th>Level</th>
            <th>Taste</th>
            <th>Initial Price</th>
            <th>Final Price</th>
            <th>Servings</th>
            <th>Party Bonuses</th>
            <th>Ingredients</th>
          </tr>
        </thead>
        <tbody>
          {#each dishes as dish}
            <tr>
              <td class="dish-name">{dish.name}</td>
              <td class="unlock-condition">{dish.unlockCondition || '—'}</td>
              <td class="dlc">{dish.dlc || '—'}</td>
              <td class="level">{dish.finalLevel}</td>
              <td class="taste">{dish.finalTaste}</td>
              <td class="price">{dish.initialPrice}</td>
              <td class="price">{dish.finalPrice}</td>
              <td class="servings">{dish.servings}</td>
              <td class="parties-list">
                {#if dish.parties.length > 0}
                  {#each dish.parties as party, i}
                    <span class="party-tag">{party}</span>{#if i < dish.parties.length - 1}, {/if}
                  {/each}
                {:else}
                  —
                {/if}
              </td>
              <td class="ingredients-list">
                {#if dish.ingredients && dish.ingredients.length > 0}
                  <div class="ingredients-container">
                    {#each dish.ingredients as ingredient, i}
                      <span class="ingredient-tag">
                        {ingredient.count}× {ingredient.name}
                      </span>{#if i < dish.ingredients.length - 1}, {/if}
                    {/each}
                  </div>
                {:else}
                  —
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
</div>

<style>
  .container {
    max-width: 1400px;
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

  header p {
    font-size: 1.2rem;
    color: rgb(var(--color-on-surface-token) / 0.75);
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
  }

  td {
    padding: 0.75rem;
    border-bottom: 1px solid rgb(var(--color-surface-300));
    font-size: 0.875rem;
    color: rgb(var(--color-on-surface-token));
  }

  tr:hover {
    background-color: rgb(var(--color-surface-300) / 0.5);
  }

  .dish-name {
    font-weight: 600;
    color: rgb(var(--color-on-surface-token));
    min-width: 200px;
  }

  .unlock-condition {
    color: rgb(var(--color-on-surface-token) / 0.6);
    font-size: 0.8rem;
  }

  .dlc {
    color: rgb(var(--color-tertiary-500));
    font-weight: 500;
    font-size: 0.8rem;
  }

  .level, .taste, .servings {
    text-align: center;
    font-weight: 600;
  }

  .price {
    text-align: right;
    font-weight: 600;
    color: rgb(var(--color-secondary-500));
  }

  .parties-list {
    font-size: 0.875rem;
    color: rgb(var(--color-on-surface-token) / 0.75);
  }

  .party-tag {
    background-color: rgb(var(--color-primary-500) / 0.2);
    color: rgb(var(--color-primary-500));
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    margin-right: 0.25rem;
    font-weight: 500;
  }

  .ingredients-list {
    font-size: 0.875rem;
    color: rgb(var(--color-on-surface-token) / 0.75);
    max-width: 300px;
  }

  .ingredients-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .ingredient-tag {
    background-color: rgb(var(--color-secondary-500) / 0.2);
    color: rgb(var(--color-secondary-500));
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-weight: 500;
    font-size: 0.75rem;
    white-space: nowrap;
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
      min-width: 150px;
    }
  }
</style>
