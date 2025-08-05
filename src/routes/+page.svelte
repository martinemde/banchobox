<script lang="ts">
  import type { PageData } from './$types.js';

  export let data: PageData;

  $: dishes = data.dishes;
  $: ingredients = data.ingredients;
  $: parties = data.parties;

  let activeTab = 'dishes';
</script>

<svelte:head>
  <title>Dave Menu - Dishes, Ingredients & Parties</title>
  <meta name="description" content="Complete dish, ingredient and party collection from Dave the Diver" />
</svelte:head>

<div class="container">
  <header>
    <h1>Dave Menu</h1>
    <p>Complete dish, ingredient and party collection from Dave the Diver</p>
  </header>

  <main>
    <nav class="tabs">
      <button
        class="tab"
        class:active={activeTab === 'dishes'}
        on:click={() => activeTab = 'dishes'}
      >
        Dishes ({dishes.length})
      </button>
      <button
        class="tab"
        class:active={activeTab === 'ingredients'}
        on:click={() => activeTab = 'ingredients'}
      >
        Ingredients ({ingredients.length})
      </button>
      <button
        class="tab"
        class:active={activeTab === 'parties'}
        on:click={() => activeTab = 'parties'}
      >
        Parties ({parties.length})
      </button>
    </nav>

    {#if activeTab === 'dishes'}
      <section class="dishes">
        <h2>All Dishes ({dishes.length})</h2>

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
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    {:else if activeTab === 'ingredients'}
      <section class="ingredients">
        <h2>All Ingredients ({ingredients.length})</h2>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Source</th>
                <th>Type</th>
                <th>Drone</th>
                <th>Weight (kg)</th>
                <th>Max Meats</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {#each ingredients as ingredient}
                <tr>
                  <td class="ingredient-name">{ingredient.name}</td>
                  <td class="source">{ingredient.source || '—'}</td>
                  <td class="type">{ingredient.type || '—'}</td>
                  <td class="drone">{ingredient.drone ? '✓' : '—'}</td>
                  <td class="weight">{ingredient.kg || '—'}</td>
                  <td class="max-meats">{ingredient.maxMeats || '—'}</td>
                  <td class="cost">{ingredient.cost || '—'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    {:else if activeTab === 'parties'}
      <section class="parties">
        <h2>All Parties ({parties.length})</h2>

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
    {/if}
  </main>
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
    color: #2563eb;
    margin-bottom: 0.5rem;
  }

  header p {
    font-size: 1.2rem;
    color: #64748b;
  }

  .tabs {
    display: flex;
    margin-bottom: 2rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .tab {
    background: none;
    border: none;
    padding: 1rem 2rem;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    color: #64748b;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  .tab:hover {
    color: #2563eb;
  }

  .tab.active {
    color: #2563eb;
    border-bottom-color: #2563eb;
  }

  .dishes h2, .ingredients h2, .parties h2 {
    margin-bottom: 1.5rem;
    color: #1e293b;
  }

  .table-container {
    overflow-x: auto;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    background-color: #f8fafc;
    padding: 1rem 0.75rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  td {
    padding: 0.75rem;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.875rem;
  }

  tr:hover {
    background-color: #f9fafb;
  }

  .dish-name, .ingredient-name, .party-name {
    font-weight: 600;
    color: #1f2937;
    min-width: 200px;
  }

  .unlock-condition, .source {
    color: #6b7280;
    font-size: 0.8rem;
  }

  .dlc {
    color: #7c3aed;
    font-weight: 500;
    font-size: 0.8rem;
  }

  .type {
    color: #059669;
    font-weight: 500;
    font-size: 0.8rem;
  }

  .level, .taste, .servings, .weight, .max-meats {
    text-align: center;
    font-weight: 600;
  }

  .price, .cost {
    text-align: right;
    font-weight: 600;
    color: #059669;
  }

  .bonus {
    text-align: center;
    font-weight: 600;
    color: #dc2626;
    font-size: 1rem;
  }

  .drone {
    text-align: center;
    color: #059669;
    font-weight: 600;
  }

  .parties-list {
    font-size: 0.875rem;
    color: #64748b;
  }

  .party-tag {
    background-color: #e0e7ff;
    color: #3b82f6;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    margin-right: 0.25rem;
    font-weight: 500;
  }

  .parties-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .party-card {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    overflow: hidden;
  }

  .party-header {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
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
    color: #64748b;
    font-style: italic;
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }

    h1 {
      font-size: 2rem;
    }

    .tab {
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
    }

    th, td {
      padding: 0.5rem;
      font-size: 0.8rem;
    }

    .dish-name, .ingredient-name, .party-name {
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
