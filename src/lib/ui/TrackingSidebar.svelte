<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  let { tracked = $bindable<Array<{ id:number; name:string; profit:number }>>([]) } = $props();
  const dispatch = createEventDispatcher<{ toggleTrack: number }>();
  function emit(id: number) { dispatch('toggleTrack', id); }
</script>

<div class="flex items-center justify-between mb-2">
  <h2 class="text-sm font-semibold">Tracking</h2>
  <a href="/tracking" class="text-primary-600 text-sm hover:underline">Open</a>
  </div>

{#if tracked.length === 0}
  <p class="text-sm opacity-70">Nothing tracked yet.</p>
{:else}
  <ul class="space-y-2">
    {#each tracked as t}
      <li class="p-2 rounded-lg border border-surface-200">
        <div class="text-sm font-medium truncate">{t.name}</div>
        <div class="mt-1 flex items-center justify-between text-xs opacity-70">
          <span>Profit {t.profit.toLocaleString()}</span>
          <button class="underline" onclick={() => emit(t.id)}>Remove</button>
        </div>
      </li>
    {/each}
  </ul>
{/if}
