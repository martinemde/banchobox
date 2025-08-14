<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  type Item = { id: number; name: string; price: number; profit: number };
  let { items = $bindable<Item[]>([]), trackedIds = $bindable<Set<number>>(new Set()) } = $props();

  const dispatch = createEventDispatcher<{ toggleTrack: number }>();
  function emit(id: number) { dispatch('toggleTrack', id); }
</script>

<section class="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
  {#each items as item}
    <article class="card preset-filled-surface-100-900 border border-surface-200-800 p-4">
      <div class="flex items-start gap-3">
        <div class="size-14 rounded-lg bg-surface-100 shrink-0"></div>
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold truncate">{item.name}</h3>
          <div class="mt-1 text-sm opacity-80">
            <span class="mr-4">Price {item.price.toLocaleString()}</span>
            <span>Profit {item.profit.toLocaleString()}</span>
          </div>
          <div class="mt-3 flex items-center gap-2">
            <button class="btn btn-sm preset-ghost px-2" onclick={() => emit(item.id)}>
              {trackedIds.has(item.id) ? 'Tracked' : 'Track'}
            </button>
          </div>
        </div>
      </div>
    </article>
  {/each}
  {#if items.length === 0}
    <div class="opacity-70 text-sm">No results.</div>
  {/if}
</section>
