<script lang="ts">
  import type { PageData } from './$types.js';

  export let data: PageData;

  $: dishes = data.dishes;
  $: parties = data.parties;
</script>

<svelte:head>
  <title>Parties - Dave Menu</title>
  <meta name="description" content="Complete party collection from Dave the Diver" />
</svelte:head>

<div class="container">
  <header>
    <h1>All Parties ({parties.length})</h1>
    <p>Complete party collection from Dave the Diver</p>
  </header>

  <section class="parties">
    <div class="parties-container">
      {#each parties as party}
        <div class="party-card">
          <div class="party-header">
            <h3 class="party-name">{party.name}</h3>
            <div class="party-info">
              <span class="bonus">{party.bonus}× bonus</span>
              <span class="dish-count">{party.dishes.length} dishes</span>
            </div>
          </div>

          {#if party.dishes.length > 0}
            <div class="party-dishes">
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
                    </tr>
                  </thead>
                  <tbody>
                    {#each party.dishes as dishName}
                      {@const dish = dishes.find(d => d.name === dishName)}
                      {#if dish}
                        <tr>
                          <td class="dish-name">{dish.name}</td>
                          <td class="unlock-condition">{dish.unlockCondition || '—'}</td>
                          <td class="dlc">{dish.dlc || '—'}</td>
                          <td class="level">{dish.finalLevel}</td>
                          <td class="taste">{dish.finalTaste}</td>
                          <td class="price">{dish.initialPrice}</td>
                          <td class="price">{dish.finalPrice}</td>
                          <td class="servings">{dish.servings}</td>
                        </tr>
                      {/if}
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          {:else}
            <div class="no-dishes">
              <p>No dishes associated with this party</p>
            </div>
          {/if}
        </div>
      {/each}
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

  .dish-name, .party-name {
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

  .bonus {
    text-align: center;
    font-weight: 600;
    color: rgb(var(--color-error-500));
    font-size: 1rem;
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

  .no-dishes {
    padding: 2rem;
    text-align: center;
    color: rgb(var(--color-on-surface-token) / 0.75);
    font-style: italic;
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

    .dish-name, .party-name {
      min-width: 150px;
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
  }
</style>
