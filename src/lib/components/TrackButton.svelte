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
  class="btn inline-flex w-full items-center justify-start preset-filled-surface-500"
  aria-pressed={checked}
  {disabled}
  on:click={toggle}
>
  <input
    type="checkbox"
    bind:checked
    tabindex="-1"
    aria-hidden="true"
    class="pointer-events-none checkbox size-4"
  />
  <span class="text-sm">{label}</span>
</button>

<style>
</style>
