<script lang="ts">
  import type { EnrichedDish } from '../types.js';
  import { Data } from '../data/runtime.js';

  export let dish: EnrichedDish;
</script>

<div class="recipe">
  <div class="dish-name">
    <strong>{dish.name}</strong>
  </div>

  <ul class="ingredients-list">
    {#each dish.ingredients as ingredient}
      <li class="ingredient-tag">
        {Data.getIngredientById(ingredient.ingredientId)?.name || 'Unknown'} ×{ingredient.count}
      </li>
    {/each}
  </ul>
</div>

<style>
  .recipe {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .dish-name {
    font-size: 1rem;
    line-height: 1.2;
  }

  .ingredients-list {
    list-style: none;
    padding: 0;
    margin: 0 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .ingredient-tag {
    background: var(--color-bg-2);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.125rem 0.375rem;
    font-size: 0.75rem;
    white-space: nowrap;
  }
</style>
