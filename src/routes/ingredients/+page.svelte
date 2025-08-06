<script lang="ts">
  import type { PageData } from './$types.js';

  export let data: PageData;

  $: ingredients = data.ingredients;
</script>

<svelte:head>
  <title>Ingredients - Dave Menu</title>
  <meta name="description" content="Complete ingredient collection from Dave the Diver" />
</svelte:head>

<div class="container">
  <header>
    <h1>All Ingredients ({ingredients.length})</h1>
    <p>Complete ingredient collection from Dave the Diver</p>
  </header>

  <section class="ingredients">
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

  .ingredient-name {
    font-weight: 600;
    color: rgb(var(--color-on-surface-token));
    min-width: 200px;
  }

  .source {
    color: rgb(var(--color-on-surface-token) / 0.6);
    font-size: 0.8rem;
  }

  .type {
    color: rgb(var(--color-secondary-500));
    font-weight: 500;
    font-size: 0.8rem;
  }

  .weight, .max-meats {
    text-align: center;
    font-weight: 600;
  }

  .cost {
    text-align: right;
    font-weight: 600;
    color: rgb(var(--color-secondary-500));
  }

  .drone {
    text-align: center;
    color: rgb(var(--color-secondary-500));
    font-weight: 600;
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

    .ingredient-name {
      min-width: 150px;
    }
  }
</style>
