<script lang="ts">
  import { getIngredientTypeIcon } from '$lib/icons/ingredientType.js';

  let { type, count, size = 16 } = $props<{
    type: string;
    count: number;
    size: number;
  }>();
  let icon = $derived(getIngredientTypeIcon(type));
</script>

<span
  class="inline-flex items-center gap-x-1"
  aria-label={`${type} ×${count}`}
>
  <strong class="tabular-nums">{count}</strong>
  {#if icon}
    {@const Icon = icon}
    <Icon size={size} class="opacity-70" />
  {/if}
</span>
