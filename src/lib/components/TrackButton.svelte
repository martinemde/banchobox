<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let checked: boolean = false;
  export let label: string = 'Track';
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher<{ change: { checked: boolean } }>();

  function toggle() {
    if (disabled) return;
    checked = !checked;
    dispatch('change', { checked });
  }
</script>

<button
  type="button"
  class="btn inline-flex w-full justify-start items-center preset-filled-surface-500"
  aria-pressed={checked}
  disabled={disabled}
  on:click={toggle}
>
  <input
    type="checkbox"
    bind:checked={checked}
    tabindex="-1"
    aria-hidden="true"
    class="checkbox size-4 pointer-events-none"
  />
  <span class="text-sm">{label}</span>
</button>

<style>
</style>
