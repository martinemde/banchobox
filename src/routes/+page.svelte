<script lang="ts">
  import type { PageData } from './$types.js';

  export let data: PageData;

  $: dishes = data.dishes;
</script>

<svelte:head>
  <title>Dave Menu - Dishes</title>
  <meta name="description" content="Complete list of dishes from Dave the Diver" />
</svelte:head>

<div class="container">
  <header>
    <h1>Dave Menu</h1>
    <p>Complete dish collection from Dave the Diver</p>
  </header>

  <main>
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
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
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

  .dishes h2 {
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

  .dish-name {
    font-weight: 600;
    color: #1f2937;
    min-width: 200px;
  }

  .unlock-condition {
    color: #6b7280;
    font-size: 0.8rem;
  }

  .dlc {
    color: #7c3aed;
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
    color: #059669;
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
